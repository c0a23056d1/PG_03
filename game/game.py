try:
    from .deck import Deck
    from .player import Player
    from .hand_rank import evaluate_5cards, get_hand_name
except ImportError:
    from deck import Deck
    from player import Player
    from hand_rank import evaluate_5cards, get_hand_name

class PokerGame:
    def __init__(self, player_data):
        self.players = [Player(name, is_human, chips) for name, is_human, chips in player_data]
        self.community_cards = []
        self.pot = 0
        self.current_bet = 0
        self.min_raise = 10
    
    def reset_game(self):
        """新しいゲームの準備"""
        self.deck = Deck()
        self.deck.shuffle()
        self.pot = 0
        self.current_bet = 0
        self.community_cards = []
        
        for player in self.players:
            player.hand = []
            player.in_game = True
            player.current_bet = 0
    
    def deal_hands(self, num_cards=2):
        """プレイヤーにカードを配る"""
        for player in self.players:
            player.receive_cards(self.deck.deal(num_cards))
    
    def deal_community_cards(self, num_cards):
        """コミュニティカードを配る"""
        self.community_cards.extend(self.deck.deal(num_cards))
    
    def show_hands(self):
        """手札を表示"""
        print("\n" + "="*50)
        print("【 手札 】")
        for player in self.players:
            if player.is_human or not player.in_game:
                print(f"{player.name}: {player.hand} (チップ: {player.chips})")
        
        if self.community_cards:
            print(f"\nコミュニティカード: {self.community_cards}")
        print("="*50)

    def betting_round(self, round_name=""):
        """ベッティングラウンド（CUI用）"""
        if round_name:
            print(f"\n{'='*50}")
            print(f"【 {round_name} 】")
            print(f"{'='*50}")
        
        print(f"💰 現在のポット: {self.pot}")
        
        active_players = [p for p in self.players if p.in_game]
        if len(active_players) <= 1:
            return
        
        for player in self.players:
            if not player.in_game or player.chips == 0:
                continue
            
            print(f"\n--- {player.name} のターン ---")
            print(f"💵 所持チップ: {player.chips}")
            print(f"📊 現在のベット: {player.current_bet}")
            print(f"🎯 コールに必要な額: {self.current_bet - player.current_bet}")
            
            action, amount = player.choose_action(self.current_bet, self.min_raise)
            
            if action == "fold":
                print(f"👋 {player.name} はフォールドしました")
            elif action == "check":
                print(f"✓ {player.name} はチェックしました")
            elif action == "call":
                actual_amount = player.bet(amount)
                self.pot += actual_amount
                print(f"📞 {player.name} は {actual_amount} チップでコールしました")
            elif action == "bet":
                actual_amount = player.bet(amount)
                self.pot += actual_amount
                self.current_bet = player.current_bet
                print(f"💰 {player.name} は {actual_amount} チップをベットしました")
            elif action == "raise":
                actual_amount = player.bet(amount)
                self.pot += actual_amount
                self.current_bet = player.current_bet
                print(f"⬆️ {player.name} は {actual_amount} チップをレイズしました")
        
        print(f"\n💵 現在のポット総額: {self.pot}")
        
        for player in self.players:
            player.reset_bet()
        self.current_bet = 0

    def determine_winner(self):
        """勝者を決定"""
        print("\n" + "="*50)
        print("【 ショーダウン - 役判定 】")
        print("="*50)
        
        scores = []
        for player in self.players:
            if not player.in_game:
                print(f"❌ {player.name}: フォールド")
                continue

            all_cards = player.hand + self.community_cards
            score = evaluate_5cards(all_cards)
            hand_name = get_hand_name(score[0])
            scores.append((player, score, hand_name))
            
            if player.is_human:
                print(f"👤 {player.name}: {player.hand} + {self.community_cards}")
            else:
                print(f"🤖 {player.name}: {player.hand} + {self.community_cards}")
            print(f"   → 役: {hand_name}")

        if not scores:
            print("\n全員がフォールドしました")
            return None

        winner_data = max(scores, key=lambda x: x[1])
        winner = winner_data[0]
        winner.chips += self.pot
        
        print(f"\n{'='*50}")
        print(f"🎉 勝者: {winner.name}")
        print(f"🏆 役: {winner_data[2]}")
        print(f"💰 獲得チップ: {self.pot}")
        print(f"💵 現在の所持チップ: {winner.chips}")
        print(f"{'='*50}")
        
        return winner

    def play_round(self):
        """1ゲームをプレイ（CUI用）"""
        self.reset_game()
        
        self.deal_hands(2)
        self.show_hands()
        self.betting_round("プリフロップ")
        
        if len([p for p in self.players if p.in_game]) > 1:
            self.deal_community_cards(3)
            self.show_hands()
            self.betting_round("フロップ")
        
        if len([p for p in self.players if p.in_game]) > 1:
            self.deal_community_cards(1)
            self.show_hands()
            self.betting_round("ターン")
        
        if len([p for p in self.players if p.in_game]) > 1:
            self.deal_community_cards(1)
            self.show_hands()
            self.betting_round("リバー")
        
        winner = self.determine_winner()
        
        print("\n" + "="*50)
        print("【 最終チップ数 】")
        for player in self.players:
            print(f"{player.name}: {player.chips} チップ")
        print("="*50)
        
        return winner


if __name__ == "__main__":
    print("="*50)
    print("🃏 テキサスホールデム ポーカー 🃏")
    print("="*50)
    
    game = PokerGame([
        ("You", True, 1000),
        ("CPU1", False, 1000),
        ("CPU2", False, 1000)
    ])
    
    while True:
        game.play_round()
        
        broke_players = [p for p in game.players if p.chips <= 0]
        if broke_players:
            print("\n💥 チップが尽きたプレイヤー:")
            for player in broke_players:
                print(f"  {player.name}")
            break
        
        continue_game = input("\n次のゲームを続けますか? (y/n): ")
        if continue_game.lower() != 'y':
            break
    
    print("\n" + "="*50)
    print("ゲーム終了！ お疲れ様でした！")
    print("="*50)