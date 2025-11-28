class Dealer:
    def __init__(self):
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
    
    def show_initial_hand(self):
        """2枚目のカードを隠す"""
        print(f"ディーラーの手札: [{self.hand[0]}, ???]")

    def show_full_hand(self):
        print(f"ディーラーの手札: {self.hand} | 合計: {self.calculate_score()}")
