from game.deck import Deck
from game.blackjack.player import Player
from game.blackjack.dealer import Dealer

class BlackjackGame:
    def __init__(self):
        self.deck = Deck()
        self.deck.shuffle()
        self.player = Player("You")
        self.dealer = Dealer()
    
    def start(self):
    # --- 初期ドロー ---
        for _ in range(2):
            self.player.receive_card(self.deck.deal(1)[0])
            self.dealer.receive_card(self.deck.deal(1)[0])
        
        print("\n--- ゲーム開始！ ---")
        self.player.show_hand()
        self.dealer.show_initial_hand()

        # --- プレイヤーターン ---
        while True:
            if self.player.calculate_score() > 21:
                print("バースト！あなたの負け！")
                return

            choice = input("\nカードを引きますか？ (y/n): ")
            if choice.lower() == "y":
                self.player.receive_card(self.deck.deal(1)[0])
                self.player.show_hand()
            else:
                break

        # --- ディーラーターン ---
        print("\n--- ディーラーのターン ---")
        self.dealer.show_full_hand()

        while self.dealer.calculate_score() < 17:
            print("ディーラーがカードを引きます...")
            self.dealer.receive_card(self.deck.deal(1)[0])
            self.dealer.show_full_hand()

        # --- 勝敗判定 ---
        p = self.player.calculate_score()
        d = self.dealer.calculate_score()

        print("\n--- 最終結果 ---")
        self.player.show_hand()
        self.dealer.show_full_hand()

        if p > 21:
            print("あなたの負け！")
        elif d > 21:
            print("ディーラーがバースト！あなたの勝ち！")
        elif p > d:
            print("あなたの勝ち！")
        elif p < d:
            print("あなたの負け！")
        else:
            print("引き分け！")



if __name__ == "__main__":
    game = BlackjackGame()
    game.start()