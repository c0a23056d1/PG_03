import random

class Deck:
    def __init__(self):
        suits = ["♠", "♣", "♥", "♦"]
        ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
        self.cards = [rank + suit for rank in ranks for suit in suits]

    def shuffle(self):
        random.shuffle(self.cards)

    def deal(self, num):
        dealt = self.cards[:num]
        self.cards = self.cards[num:]
        return dealt
