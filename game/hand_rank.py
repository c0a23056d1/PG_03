from collections import Counter

rank_order = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
}

hand_names = {
    9: "ロイヤルフラッシュ",
    8: "ストレートフラッシュ",
    7: "フォーカード",
    6: "フルハウス",
    5: "フラッシュ",
    4: "ストレート",
    3: "スリーカード",
    2: "ツーペア",
    1: "ワンペア",
    0: "ハイカード"
}

def get_hand_name(rank):
    return hand_names.get(rank, "不明")

def card_rank(card):
    return rank_order[card[:-1]]  # "A♠" → "A"

def is_straight(ranks):
    ranks = sorted(set(ranks))
    if len(ranks) != 5:
        return False
    return ranks[-1] - ranks[0] == 4

def is_flush(suits):
    return len(set(suits)) == 1

def evaluate_5cards(cards):
    ranks = [card_rank(c) for c in cards]
    suits = [c[-1] for c in cards]
    counter = Counter(ranks)
    cnt = sorted(counter.values(), reverse=True)

    straight = is_straight(ranks)
    flush = is_flush(suits)

    if straight and flush and max(ranks) == 14:
        return (9, max(ranks))  #ロイヤルフラッシュ
    
    if straight and flush:
        return (8, max(ranks)) #ストレートフラッシュ
    
    if cnt == [4, 1]:
        four = counter.most_common(1)[0][0]
        return (7, four) #フォーカード
    
    if cnt == [3, 2]:
        three = counter.most_common(1)[0][0]
        return (6, three) #フルハウス
    
    if flush:
        return (5, sorted(ranks, reverse=True)) #フラッシュ
    
    if straight:
        return (4, max(ranks)) #ストレート
    
    if cnt == [3, 1, 1]:
        three = counter.most_common(1)[0][0]
        return (3, three) #スリーカード
    
    if cnt == [2, 2, 1]:
        pairs = [ranks for rank, c in counter.items() if c == 2]
        return (2, sorted(pairs, reverse=True)) #ツーペア
    
    if cnt == [2, 1, 1, 1]:
        pair = counter.most_common(1)[0][0]
        return (1, pair) #ワンペア
    
    return (0, sorted(ranks, reverse=True)) #ハイカード