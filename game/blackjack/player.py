class Player:
    def __init__(self, name):
        self.name = name
        self.hand = []
    
    def receive_card(self, card):
        self.hand.append(card)
    
    def calculate_score(self):
        score = 0
        for card in self.hand:
            rank = card[:-1]
            if rank in ['J', 'Q', 'K']:
                score += 10  
            elif rank == 'A':
                score += 1
            else:
                score += int(rank)
        return score
    
    def show_hand(self):
        print(f"{self.name} の手札: {self.hand} | 合計: {self.calculate_score()}")
            