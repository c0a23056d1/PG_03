import requests

class BlackjackAPI:
    def __init__(self, server_url="http://localhost:3001"):
        self.url = server_url + "/api/blackjack/result"

    def send_result(self, player_total, dealer_total, bet, balance):
        data = {
            "playerTotal": player_total,
            "dealerTotal": dealer_total,
            "bet": bet,
            "balance": balance
        }

        try:
            response = requests.post(self.url, json=data, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print("API通信エラー:", e)
            return None

if __name__ == "__main__":
    api = BlackjackAPI()
    result = api.send_result(
        player_total=18,
        dealer_total=20,
        bet=50,
        balance=1000
    )
    print("サーバーからの結果:", result)