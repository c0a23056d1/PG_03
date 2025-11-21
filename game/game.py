# from deck import Deck
# from player import Player
# from hand_rank import evaluate_5cards, get_hand_name

# class PokerGame:
#     def __init__(self, player_data):
#         # player_data: [("You", True), ("CPU", False)]
#         self.players = [Player(name, is_human) for name, is_human in player_data]
#         self.deck = Deck()
#         self.deck.shuffle()
#         self.pot = 0
#         self.current_bet = 0
    
#     def deal_hands(self, num_cards=2):
#         for player in self.players:
#             player.receive_cards(self.deck.deal(num_cards))
    
#     def show_hands(self):
#         print("\n--- 手札 ---")
#         for player in self.players:
#             if player.is_human or not player.in_game:
#                 print(f"{player.name}: {player.hand} (チップ: {player.chips})")

#     def betting_round(self):
#         print("\n--- ベッティングラウンド ---")
#         print(f"現在のポット: {self.pot}")
        
#         for player in self.players:
#             if not player.in_game:
#                 continue
            
#             action, amount = player.choose_action(self.current_bet)
            
#             if action == "fold":
#                 print(f"{player.name} はフォールドしました")
#             elif action == "check":
#                 print(f"{player.name} はチェックしました")
#             elif action == "call":
#                 actual_amount = player.bet(amount)
#                 self.pot += actual_amount
#                 print(f"{player.name} は {actual_amount} チップでコールしました")
#             elif action == "bet" or action == "raise":
#                 actual_amount = player.bet(amount)
#                 self.pot += actual_amount
#                 self.current_bet = player.current_bet
#                 print(f"{player.name} は {actual_amount} チップを{'ベット' if action == 'bet' else 'レイズ'}しました")

#     # ランクの強さ
#     rank_strength = {
#         '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8,
#         '10': 9, 'J': 10, 'Q': 11, 'K': 12, 'A': 13
#     }

#     def evaluate_card(self, card):
#         rank = card[:-1]  # "A♠" → "A"
#         return self.rank_strength[rank]

#     def determine_winner(self):
#         print("\n--- 判定 ---")
#         scores = []
#         for player in self.players:
#             if not player.in_game:
#                 continue

#             cards = player.hand + ["2♠", "5♦", "9♥"]
#             score = evaluate_5cards(cards)
#             hand_name = get_hand_name(score[0])
#             scores.append((player, score, hand_name))
#             print(f"{player.name}: {player.hand} → {hand_name}")

#         if not scores:
#             return None

#         winner_data = max(scores, key=lambda x: x[1])
#         winner = winner_data[0]
#         winner.chips += self.pot
        
#         print(f"\n🎉 勝者: {winner.name} ({winner_data[2]})")
#         print(f"獲得チップ: {self.pot}")
#         print(f"現在の所持チップ: {winner.chips}")
        
#         return winner


# if __name__ == "__main__":
#     game = PokerGame([
#         ("You", True),
#         ("CPU", False)
#     ])

#     game.deal_hands()
#     game.show_hands()

#     # ベッティングラウンド
#     game.betting_round()

#     winner = game.determine_winner()
    
#     print("\n--- 最終チップ数 ---")
#     for player in game.players:
#         print(f"{player.name}: {player.chips} チップ")


from deck import Deck
from player import Player
from hand_rank import evaluate_5cards, get_hand_name

class PokerGame:
    def __init__(self, player_data):
        self.players = [Player(name, is_human, chips=1000) for name, is_human, chips in player_data]
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
        """ベッティングラウンド"""
        if round_name:
            print(f"\n{'='*50}")
            print(f"【 {round_name} 】")
            print(f"{'='*50}")
        
        print(f"💰 現在のポット: {self.pot}")
        
        active_players = [p for p in self.players if p.in_game]
        if len(active_players) <= 1:
            return
        
        # 全員がベット額を揃えるまで繰り返す
        max_rounds = 10  # 無限ループ防止
        for round_num in range(max_rounds):
            all_bets_equal = True
            
            for player in self.players:
                if not player.in_game or player.chips == 0:
                    continue
                
                # 現在のベット額が揃っているかチェック
                if player.current_bet < self.current_bet:
                    all_bets_equal = False
                
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
                    if player.chips == 0:
                        print(f"🔥 {player.name} はオールインしました！")
                    
                elif action == "bet":
                    actual_amount = player.bet(amount)
                    self.pot += actual_amount
                    self.current_bet = player.current_bet
                    print(f"💰 {player.name} は {actual_amount} チップをベットしました")
                    all_bets_equal = False
                    if player.chips == 0:
                        print(f"🔥 {player.name} はオールインしました！")
                    
                elif action == "raise":
                    actual_amount = player.bet(amount)
                    self.pot += actual_amount
                    self.current_bet = player.current_bet
                    print(f"⬆️ {player.name} は {actual_amount} チップをレイズしました")
                    all_bets_equal = False
                    if player.chips == 0:
                        print(f"🔥 {player.name} はオールインしました！")
            
            # 全員のベットが揃ったら終了
            active_players = [p for p in self.players if p.in_game and p.chips > 0]
            if all_bets_equal or len(active_players) <= 1:
                break
        
        print(f"\n💵 現在のポット総額: {self.pot}")
        
        # ラウンド終了後、全員のベット額をリセット
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

            # 手札 + コミュニティカードで最強の5枚を評価
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
        """1ゲームをプレイ"""
        self.reset_game()
        
        # プリフロップ - カードを配る
        self.deal_hands(2)
        self.show_hands()
        self.betting_round("プリフロップ")
        
        # フロップ - 3枚のコミュニティカード
        if len([p for p in self.players if p.in_game]) > 1:
            self.deal_community_cards(3)
            self.show_hands()
            self.betting_round("フロップ")
        
        # ターン - 4枚目のコミュニティカード
        if len([p for p in self.players if p.in_game]) > 1:
            self.deal_community_cards(1)
            self.show_hands()
            self.betting_round("ターン")
        
        # リバー - 5枚目のコミュニティカード
        if len([p for p in self.players if p.in_game]) > 1:
            self.deal_community_cards(1)
            self.show_hands()
            self.betting_round("リバー")
        
        # 勝者決定
        winner = self.determine_winner()
        
        # 最終チップ数
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
        
        # チップが0のプレイヤーをチェック
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