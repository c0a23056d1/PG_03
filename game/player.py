class Player:
    def __init__(self, name, is_human=False, chips=100):
        self.name = name
        self.hand = []
        self.is_human = is_human
        self.in_game = True
        self.chips = chips

    def receive_cards(self, cards):
        self.hand.extend(cards)
    
    def fold(self):
        self.in_game = False
        self.hand = []

    def choose_action(self):
        if self.is_human:
            print(f"\n{self.name} の手札: {self.hand}")
            action = input("行動を選んでください (bet / fold / check): ")

            while action not in ["bet", "fold", "check"]:
                action = input("無効な入力です。bet / fold / check で入力してください: ")

            if action == "fold":
                self.fold()

            return action

        else:
            import random
            action = random.choice(["bet", "fold", "check"])
            if action == "fold":
                self.fold()
            return action
