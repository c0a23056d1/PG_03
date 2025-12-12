class Player:
    def __init__(self, name, is_human=False, chips=1000):
        self.name = name
        self.hand = []
        self.is_human = is_human
        self.in_game = True
        self.chips = chips
        self.current_bet = 0

    def receive_cards(self, cards):
        self.hand.extend(cards)
    
    def fold(self):
        self.in_game = False
        self.hand = []

    def bet(self, amount):
        """ベットを行う"""
        if amount > self.chips:
            amount = self.chips
        self.chips -= amount
        self.current_bet += amount
        return amount
    
    def reset_bet(self):
        """ベット額をリセット"""
        self.current_bet = 0

    def choose_action(self, current_bet, min_raise=10):
        """アクションを選択"""
        if self.is_human:
            print(f"\n{self.name} の手札: {self.hand}")
            print(f"所持チップ: {self.chips}")
            print(f"現在のベット: {self.current_bet}")
            print(f"場のベット: {current_bet}")
            call_amount = current_bet - self.current_bet
            print(f"必要なコール額: {call_amount}")
            
            # 選択肢を判定
            if call_amount <= 0:
                # ベット額が揃っている、または先頭プレイヤー
                print("\n選択肢: check / bet / fold")
                action = input("行動を選んでください: ").lower()
                while action not in ["check", "bet", "fold"]:
                    action = input("無効な入力です。check / bet / fold で入力してください: ").lower()
            else:
                # コールが必要
                print("\n選択肢: call / raise / fold")
                action = input("行動を選んでください: ").lower()
                while action not in ["call", "raise", "fold"]:
                    action = input("無効な入力です。call / raise / fold で入力してください: ").lower()

            if action == "fold":
                self.fold()
                return action, 0
            
            elif action == "bet" or action == "raise":
                while True:
                    try:
                        if action == "raise":
                            # レイズの場合はコール額+レイズ額
                            print(f"💡 レイズ額を入力してください（コール{call_amount} + レイズ額）")
                            raise_amount = int(input(f"レイズ額を入力してください (最低{min_raise}): "))
                            if raise_amount < min_raise:
                                print(f"❌ 最低レイズ額は{min_raise}です")
                                continue
                            total_amount = call_amount + raise_amount
                        else:
                            # ベットの場合
                            total_amount = int(input(f"ベット額を入力してください (最低{min_raise}): "))
                            if total_amount < min_raise:
                                print(f"❌ 最低ベット額は{min_raise}です")
                                continue
                        
                        if total_amount > self.chips:
                            print(f"❌ 所持チップが不足しています（所持: {self.chips}）")
                            print(f"💡 オールインする場合は {self.chips} と入力してください")
                        else:
                            return action, total_amount
                    except ValueError:
                        print("❌ 数値を入力してください")
            
            elif action == "call":
                return action, min(call_amount, self.chips)
            
            elif action == "check":
                return action, 0

        else:
            # CPUのアクション
            import random
            
            call_amount = current_bet - self.current_bet
            
            # チップが少ない場合は慎重に
            if self.chips < min_raise * 2:
                if call_amount > self.chips // 2:
                    return "fold", 0
            
            if call_amount <= 0:
                # ベット額が揃っている
                action = random.choices(
                    ["check", "bet", "fold"],
                    weights=[60, 30, 10]
                )[0]
            else:
                # コールが必要
                if call_amount > self.chips:
                    # チップ不足の場合はフォールドかオールイン
                    action = random.choices(
                        ["call", "fold"],
                        weights=[30, 70]
                    )[0]
                else:
                    action = random.choices(
                        ["call", "raise", "fold"],
                        weights=[50, 30, 20]
                    )[0]
            
            if action == "fold":
                self.fold()
                return action, 0
            elif action == "bet":
                amount = random.randint(min_raise, min(self.chips, min_raise * 5))
                return action, amount
            elif action == "raise":
                raise_amount = random.randint(min_raise, min(self.chips - call_amount, min_raise * 3))
                total_amount = call_amount + raise_amount
                return action, min(total_amount, self.chips)
            elif action == "call":
                return action, min(call_amount, self.chips)
            elif action == "check":
                return action, 0
            
            return "fold", 0