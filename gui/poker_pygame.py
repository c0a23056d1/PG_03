import pygame
import sys
import os

# パスを追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from game.game import PokerGame
from game.hand_rank import evaluate_5cards, get_hand_name

# 色定義
GREEN = (34, 139, 34)
DARK_GREEN = (0, 100, 0)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
YELLOW = (255, 255, 0)
RED = (255, 0, 0)
BLUE = (100, 149, 237)
GRAY = (128, 128, 128)

class PokerPygame:
    def __init__(self):
        pygame.init()
        self.width = 1200
        self.height = 800
        self.screen = pygame.display.set_mode((self.width, self.height))
        pygame.display.set_caption("Texas Hold'em Poker")
        
        # 日本語フォント対応
        try:
            # システムフォントから日本語対応フォントを探す
            japanese_fonts = [
                "notosanscjk",
                "notosansjp",
                "takao",
                "ipaexgothic",
                "ipagothic",
                "vlgothic",
            ]
            
            font_name = None
            for font in japanese_fonts:
                if pygame.font.match_font(font):
                    font_name = pygame.font.match_font(font)
                    break
            
            if font_name:
                self.font_large = pygame.font.Font(font_name, 48)
                self.font_medium = pygame.font.Font(font_name, 36)
                self.font_small = pygame.font.Font(font_name, 28)
            else:
                # フォントが見つからない場合はデフォルト
                self.font_large = pygame.font.Font(None, 48)
                self.font_medium = pygame.font.Font(None, 36)
                self.font_small = pygame.font.Font(None, 28)
        except:
            # エラーの場合はデフォルトフォント
            self.font_large = pygame.font.Font(None, 48)
            self.font_medium = pygame.font.Font(None, 36)
            self.font_small = pygame.font.Font(None, 28)
        
        # ゲーム初期化
        self.game = PokerGame([
            ("You", True, 1000),
            ("CPU1", False, 1000),
            ("CPU2", False, 1000)
        ])
        
        self.phase = "start"
        self.message = "Click Start Game"
        self.bet_input = ""
        self.waiting_for_cpu = False
        
        # ボタン定義
        self.buttons = {
            'start': pygame.Rect(500, 650, 200, 60),
            'check': pygame.Rect(200, 700, 150, 50),
            'call': pygame.Rect(370, 700, 150, 50),
            'fold': pygame.Rect(540, 700, 150, 50),
            'bet': pygame.Rect(710, 700, 150, 50),
            'raise': pygame.Rect(880, 700, 150, 50),
        }
        
        self.bet_input_rect = pygame.Rect(500, 600, 200, 40)
    
    def draw_text(self, text, pos, color=WHITE, font=None):
        """テキストを描画"""
        if font is None:
            font = self.font_small
        try:
            text_surface = font.render(str(text), True, color)
        except:
            # 絵文字などが描画できない場合は英語版にフォールバック
            text_surface = pygame.font.Font(None, 28).render(str(text), True, color)
        self.screen.blit(text_surface, pos)
    
    def draw_button(self, rect, text, color=BLUE, text_color=WHITE):
        """ボタンを描画"""
        pygame.draw.rect(self.screen, color, rect, border_radius=10)
        pygame.draw.rect(self.screen, WHITE, rect, 2, border_radius=10)
        
        try:
            text_surface = self.font_small.render(text, True, text_color)
        except:
            text_surface = pygame.font.Font(None, 28).render(text, True, text_color)
        text_rect = text_surface.get_rect(center=rect.center)
        self.screen.blit(text_surface, text_rect)
    
    def draw_card(self, card, x, y):
        """カードを描画"""
        card_rect = pygame.Rect(x, y, 60, 90)
        pygame.draw.rect(self.screen, WHITE, card_rect, border_radius=5)
        pygame.draw.rect(self.screen, BLACK, card_rect, 2, border_radius=5)
        
        # ハート・ダイヤは赤、スペード・クラブは黒
        if 'H' in card or 'D' in card or '♥' in card or '♦' in card:
            color = RED
        else:
            color = BLACK
        
        text = self.font_medium.render(card, True, color)
        text_rect = text.get_rect(center=card_rect.center)
        self.screen.blit(text, text_rect)
    
    def draw_hidden_card(self, x, y):
        """裏向きのカードを描画"""
        card_rect = pygame.Rect(x, y, 60, 90)
        pygame.draw.rect(self.screen, BLUE, card_rect, border_radius=5)
        pygame.draw.rect(self.screen, WHITE, card_rect, 2, border_radius=5)
        
        text = self.font_large.render("?", True, WHITE)
        text_rect = text.get_rect(center=card_rect.center)
        self.screen.blit(text, text_rect)
    
    def draw_player(self, player, x, y, show_cards=False):
        """プレイヤー情報を描画"""
        bg_rect = pygame.Rect(x, y, 300, 150)
        color = DARK_GREEN if player.in_game else GRAY
        pygame.draw.rect(self.screen, color, bg_rect, border_radius=10)
        pygame.draw.rect(self.screen, WHITE, bg_rect, 2, border_radius=10)
        
        # プレイヤー名
        icon = "[P]" if player.is_human else "[CPU]"
        self.draw_text(f"{icon} {player.name}", (x + 10, y + 10), YELLOW, self.font_medium)
        
        # チップ
        self.draw_text(f"Chips: {player.chips}", (x + 10, y + 50), WHITE)
        
        # ベット額
        self.draw_text(f"Bet: {player.current_bet}", (x + 10, y + 80), WHITE)
        
        # ステータス
        if not player.in_game:
            self.draw_text("FOLD", (x + 10, y + 110), RED)
        elif player.chips == 0:
            self.draw_text("ALL-IN", (x + 10, y + 110), YELLOW)
        else:
            self.draw_text("ACTIVE", (x + 10, y + 110), WHITE)
        
        # カード
        if player.hand:
            for i, card in enumerate(player.hand):
                if show_cards or player.is_human:
                    self.draw_card(card, x + 320 + i * 70, y + 30)
                else:
                    self.draw_hidden_card(x + 320 + i * 70, y + 30)
    
    def draw_community_cards(self):
        """コミュニティカードを描画"""
        if self.game.community_cards:
            self.draw_text("Community Cards", (450, 200), YELLOW, self.font_medium)
            for i, card in enumerate(self.game.community_cards):
                self.draw_card(card, 400 + i * 80, 250)
    
    def draw_pot(self):
        """ポット情報を描画"""
        pot_text = f"POT: {self.game.pot}"
        self.draw_text(pot_text, (520, 150), YELLOW, self.font_large)
    
    def draw_game(self):
        """ゲーム画面を描画"""
        self.screen.fill(GREEN)
        
        self.draw_text("Texas Hold'em Poker", (350, 20), YELLOW, self.font_large)
        
        if self.phase == "start":
            self.draw_text("Click Start Game Button", (420, 300), WHITE, self.font_medium)
            self.draw_button(self.buttons['start'], "START GAME", BLUE)
        
        elif self.phase == "betting":
            self.draw_pot()
            self.draw_community_cards()
            
            self.draw_player(self.game.players[0], 50, 400)
            self.draw_player(self.game.players[1], 450, 50)
            self.draw_player(self.game.players[2], 850, 400)
            
            self.draw_text(self.message, (50, 370), YELLOW, self.font_small)
            
            if not self.waiting_for_cpu:
                player = self.game.players[0]
                call_amount = self.game.current_bet - player.current_bet
                
                if call_amount <= 0:
                    self.draw_button(self.buttons['check'], "CHECK", BLUE)
                    self.draw_button(self.buttons['bet'], "BET", (255, 165, 0))
                    self.draw_button(self.buttons['fold'], "FOLD", RED)
                else:
                    self.draw_button(self.buttons['call'], f"CALL ({call_amount})", BLUE)
                    self.draw_button(self.buttons['raise'], "RAISE", (138, 43, 226))
                    self.draw_button(self.buttons['fold'], "FOLD", RED)
                
                pygame.draw.rect(self.screen, WHITE, self.bet_input_rect)
                pygame.draw.rect(self.screen, BLACK, self.bet_input_rect, 2)
                self.draw_text(f"Amount: {self.bet_input}", (510, 610), BLACK)
        
        elif self.phase == "showdown":
            self.draw_pot()
            self.draw_community_cards()
            
            self.draw_player(self.game.players[0], 50, 400, show_cards=True)
            self.draw_player(self.game.players[1], 450, 50, show_cards=True)
            self.draw_player(self.game.players[2], 850, 400, show_cards=True)
            
            self.draw_text(self.message, (200, 370), YELLOW, self.font_small)
            self.draw_button(self.buttons['start'], "NEW GAME", BLUE)
        
        pygame.display.flip()
    
    def handle_click(self, pos):
        """クリックイベント処理"""
        if self.phase == "start":
            if self.buttons['start'].collidepoint(pos):
                self.start_game()
        
        elif self.phase == "betting" and not self.waiting_for_cpu:
            player = self.game.players[0]
            call_amount = self.game.current_bet - player.current_bet
            
            if call_amount <= 0:
                if self.buttons['check'].collidepoint(pos):
                    self.player_action("check", 0)
                elif self.buttons['bet'].collidepoint(pos):
                    try:
                        amount = int(self.bet_input) if self.bet_input else self.game.min_raise
                        self.player_action("bet", amount)
                    except ValueError:
                        self.message = "ERROR: Enter number"
                elif self.buttons['fold'].collidepoint(pos):
                    self.player_action("fold", 0)
            else:
                if self.buttons['call'].collidepoint(pos):
                    self.player_action("call", call_amount)
                elif self.buttons['raise'].collidepoint(pos):
                    try:
                        raise_amount = int(self.bet_input) if self.bet_input else self.game.min_raise
                        total = call_amount + raise_amount
                        self.player_action("raise", total)
                    except ValueError:
                        self.message = "ERROR: Enter number"
                elif self.buttons['fold'].collidepoint(pos):
                    self.player_action("fold", 0)
        
        elif self.phase == "showdown":
            if self.buttons['start'].collidepoint(pos):
                self.start_game()
    
    def start_game(self):
        """ゲーム開始"""
        self.game.reset_game()
        self.game.deal_hands(2)
        self.phase = "betting"
        self.message = "Pre-Flop - Your Turn"
        self.bet_input = ""
    
    def player_action(self, action, amount):
        """プレイヤーのアクション"""
        player = self.game.players[0]
        
        if action == "fold":
            player.fold()
            self.message = "You FOLDED"
        elif action == "check":
            self.message = "You CHECKED"
        elif action == "call":
            actual_amount = player.bet(min(amount, player.chips))
            self.game.pot += actual_amount
            self.message = f"You CALLED {actual_amount}"
        elif action == "bet":
            if amount < self.game.min_raise:
                self.message = f"ERROR: Min bet is {self.game.min_raise}"
                return
            actual_amount = player.bet(amount)
            self.game.pot += actual_amount
            self.game.current_bet = player.current_bet
            self.message = f"You BET {actual_amount}"
        elif action == "raise":
            if amount - (self.game.current_bet - player.current_bet) < self.game.min_raise:
                self.message = f"ERROR: Min raise is {self.game.min_raise}"
                return
            actual_amount = player.bet(amount)
            self.game.pot += actual_amount
            self.game.current_bet = player.current_bet
            self.message = f"You RAISED {actual_amount}"
        
        self.bet_input = ""
        self.waiting_for_cpu = True
        pygame.time.set_timer(pygame.USEREVENT, 1000)
    
    def cpu_turn(self):
        """CPUのターン"""
        for player in self.game.players[1:]:
            if not player.in_game or player.chips == 0:
                continue
            
            action, amount = player.choose_action(self.game.current_bet, self.game.min_raise)
            
            if action == "fold":
                self.message = f"{player.name} FOLDED"
            elif action == "check":
                self.message = f"{player.name} CHECKED"
            elif action == "call":
                actual_amount = player.bet(amount)
                self.game.pot += actual_amount
                self.message = f"{player.name} CALLED {actual_amount}"
            elif action == "bet":
                actual_amount = player.bet(amount)
                self.game.pot += actual_amount
                self.game.current_bet = player.current_bet
                self.message = f"{player.name} BET {actual_amount}"
            elif action == "raise":
                actual_amount = player.bet(amount)
                self.game.pot += actual_amount
                self.game.current_bet = player.current_bet
                self.message = f"{player.name} RAISED {actual_amount}"
            
            pygame.time.wait(1000)
            self.draw_game()
        
        self.check_round_end()
    
    def check_round_end(self):
        """ラウンド終了チェック"""
        active_players = [p for p in self.game.players if p.in_game]
        
        if len(active_players) <= 1:
            self.show_winner()
            return
        
        for player in self.game.players:
            player.reset_bet()
        self.game.current_bet = 0
        
        if len(self.game.community_cards) == 0:
            self.game.deal_community_cards(3)
            self.message = "FLOP - Your Turn"
        elif len(self.game.community_cards) == 3:
            self.game.deal_community_cards(1)
            self.message = "TURN - Your Turn"
        elif len(self.game.community_cards) == 4:
            self.game.deal_community_cards(1)
            self.message = "RIVER - Your Turn"
        else:
            self.show_winner()
            return
        
        self.waiting_for_cpu = False
    
    def show_winner(self):
        """勝者を表示"""
        scores = []
        for player in self.game.players:
            if not player.in_game:
                continue
            all_cards = player.hand + self.game.community_cards
            score = evaluate_5cards(all_cards)
            hand_name = get_hand_name(score[0])
            scores.append((player, score, hand_name))
        
        if scores:
            winner_data = max(scores, key=lambda x: x[1])
            winner = winner_data[0]
            winner.chips += self.game.pot
            self.message = f"WINNER: {winner.name} | Hand: {winner_data[2]} | Won: {self.game.pot}"
        else:
            self.message = "All players folded"
        
        self.phase = "showdown"
        self.waiting_for_cpu = False
    
    def run(self):
        """メインループ"""
        clock = pygame.time.Clock()
        running = True
        
        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    self.handle_click(event.pos)
                
                elif event.type == pygame.KEYDOWN:
                    if self.phase == "betting" and not self.waiting_for_cpu:
                        if event.key == pygame.K_BACKSPACE:
                            self.bet_input = self.bet_input[:-1]
                        elif event.unicode.isdigit():
                            self.bet_input += event.unicode
                
                elif event.type == pygame.USEREVENT:
                    pygame.time.set_timer(pygame.USEREVENT, 0)
                    self.cpu_turn()
            
            self.draw_game()
            clock.tick(30)
        
        pygame.quit()


if __name__ == "__main__":
    game = PokerPygame()
    game.run()