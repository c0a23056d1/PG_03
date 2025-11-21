from deck import Deck
from player import Player
from hand_rank import evaluate_5cards

class PokerGame:
    def __init__(self, player_data):
        # player_data: [("You", True), ("CPU", False)]
        self.players = [Player(name, is_human) for name, is_human in player_data]
        self.deck = Deck()
        self.deck.shuffle()
    
    def deal_hands(self, num_cards=2):
        for player in self.players:
            player.receive_cards(self.deck.deal(num_cards))
    
    def show_hands(self):
        print("\n--- 手札 ---")
        for player in self.players:
            print(player.name, ":", player.hand)

    def player_actions(self):
        print("\n--- 行動フェーズ ---")
        for player in self.players:
            action = player.choose_action()
            print(f"{player.name} の行動: {action}")

    # ランクの強さ
    rank_strength = {
        '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8,
        '10': 9, 'J': 10, 'Q': 11, 'K': 12, 'A': 13
    }

    def evaluate_card(self, card):
        rank = card[:-1]  # "A♠" → "A"
        return self.rank_strength[rank]

    def determine_winner(self):
        print("\n--- 判定 ---")
        scores = []
        for player in self.players:
            if not player.in_game:
                continue

            cards = player.hand + ["2♠", "5♦", "9♥"]
            score = evaluate_5cards(cards)
            scores.append((player.name, score))

        winner = max(scores, key=lambda x: x[1])
        return winner


if __name__ == "__main__":
    game = PokerGame([
        ("You", True),
        ("CPU", False)
    ])

    game.deal_hands()
    game.show_hands()

    # 行動フェーズ
    game.player_actions()

    winner = game.determine_winner()
    print("勝者:", winner)
