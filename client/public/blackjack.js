let deck = [];
let playerHand = [];
let dealerHand = [];
let playerTurn = true;
let gameOver = false;
let balance = 1000;
let bet = 50;

function createDeck() {
  const suits = ["♠", "♣", "♥", "♦"];
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  let deck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push(rank + suit);
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function calcTotal(hand) {
  let total = 0;
  for (let card of hand) {
    let rank = card.slice(0, -1);
    if (rank === "A") total += 1;
    else if (["J", "Q", "K"].includes(rank)) total += 10;
    else total += parseInt(rank);
  }
  return total;
}

function renderCards(containerId, hand, hideSecond = false) {
  const suits = { "♠": "", "♣": "", "♥": "heart", "♦": "diamond" };
  const el = document.getElementById(containerId);
  el.innerHTML = "";
  hand.forEach((card, idx) => {
    let div = document.createElement("div");
    if (hideSecond && idx === 1) {
      div.className = "card";
      div.textContent = "??";
    } else {
      let suit = card.slice(-1);
      let rank = card.slice(0, -1);
      div.className = "card " + (suits[suit] || "");
      div.textContent = rank + suit;
    }
    el.appendChild(div);
  });
}

function updateMoneyDisplay() {
  document.getElementById("balance").textContent = balance;
  document.getElementById("bet").value = bet;
}

function startGame() {
  document.getElementById("gameover").textContent = "";
  document.getElementById("resetBtn").style.display = "none";
  document.getElementById("apiResult").style.display = "none";
  
  // ブロックチェーン初期化呼び出し
  fetch("http://localhost:3001/api/blackjack/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerAddress: "0x0" })
  })
  .then(res => res.json())
  .then(json => {
    console.log("ブロックチェーン初期化:", json);
  })
  .catch(err => console.error("ブロックチェーン初期化エラー:", err));
  
  if (balance <= 0) {
    document.getElementById("hitBtn").disabled = true;
    document.getElementById("standBtn").disabled = true;
    document.getElementById("restartBtn").style.display = "none";
    document.getElementById("gameover").textContent = "お金がなくなりました。";
    document.getElementById("resetBtn").style.display = "";
    renderCards("playerCards", []);
    renderCards("dealerCards", []);
    document.getElementById("playerTotal").textContent = "?";
    document.getElementById("dealerTotal").textContent = "?";
    document.getElementById("judge").textContent = "";
    return;
  }
  bet = parseInt(document.getElementById("bet").value) || 1;
  if (bet > balance) bet = balance;
  if (bet < 1) bet = 1;
  document.getElementById("bet").value = bet;
  updateMoneyDisplay();
  deck = createDeck();
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];
  playerTurn = true;
  gameOver = false;
  document.getElementById("judge").textContent = "";
  document.getElementById("judge").className = "result-msg";
  document.getElementById("hitBtn").disabled = false;
  document.getElementById("standBtn").disabled = false;
  document.getElementById("restartBtn").style.display = "none";
  renderCards("playerCards", playerHand);
  renderCards("dealerCards", dealerHand, true);
  document.getElementById("playerTotal").textContent = calcTotal(playerHand);
  document.getElementById("dealerTotal").textContent = "?";
}

function playerHit() {
  if (!playerTurn || gameOver) return;
  playerHand.push(deck.pop());
  renderCards("playerCards", playerHand);
  const total = calcTotal(playerHand);
  document.getElementById("playerTotal").textContent = total;
  if (total > 21) {
    endGame("burst");
  }
}

function playerStand() {
  if (!playerTurn || gameOver) return;
  playerTurn = false;
  dealerTurn();
}

function dealerTurn() {
  renderCards("dealerCards", dealerHand, false);
  let total = calcTotal(dealerHand);
  document.getElementById("dealerTotal").textContent = total;
  while (total < 17) {
    dealerHand.push(deck.pop());
    renderCards("dealerCards", dealerHand, false);
    total = calcTotal(dealerHand);
    document.getElementById("dealerTotal").textContent = total;
  }
  setTimeout(() => endGame(), 500);
}

// ★API通信でサーバーに送信し、返却値で所持金や勝敗を更新
function endGame(burst) {
  gameOver = true;
  document.getElementById("hitBtn").disabled = true;
  document.getElementById("standBtn").disabled = true;
  document.getElementById("restartBtn").style.display = "";
  renderCards("dealerCards", dealerHand, false);
  const playerTotal = calcTotal(playerHand);
  const dealerTotal = calcTotal(dealerHand);
  document.getElementById("playerTotal").textContent = playerTotal;
  document.getElementById("dealerTotal").textContent = dealerTotal;
  const judge = document.getElementById("judge");

  // サーバーに送信するデータ
  const data = {
    playerTotal,
    dealerTotal,
    bet,
    balance
  };

  fetch("http://localhost:3001/api/blackjack/result", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(json => {
    // サーバー返却値で所持金を更新
    if (typeof json.balance === "number") {
      balance = json.balance;
      updateMoneyDisplay();
    }
    // サーバー返却メッセージをそのまま表示
    judge.textContent = json.message || "";
    judge.className = "result-msg " + (json.result || "");

    // サーバー返却値を下部に表示（デバッグ用）
    // document.getElementById("apiResult").style.display = "";
    // document.getElementById("apiResult").textContent = JSON.stringify(json, null, 2);

    // 所持金が0円以下になったらゲームオーバー
    if (balance <= 0) {
      document.getElementById("hitBtn").disabled = true;
      document.getElementById("standBtn").disabled = true;
      document.getElementById("restartBtn").style.display = "none";
      document.getElementById("gameover").textContent = "お金がなくなりました。";
      document.getElementById("resetBtn").style.display = "";
    }
  })
  .catch(() => {
    judge.textContent = "サーバーに接続できません";
    judge.className = "result-msg lose";
    document.getElementById("apiResult").style.display = "";
    document.getElementById("apiResult").textContent = "サーバーに接続できません";
  });
}

document.getElementById("bet").addEventListener("input", function() {
  let v = parseInt(this.value) || 1;
  if (v > balance) this.value = balance;
  if (v < 1) this.value = 1;
  bet = parseInt(this.value);
});

function resetGame() {
  balance = 1000;
  bet = 50;
  updateMoneyDisplay();
  document.getElementById("gameover").textContent = "";
  document.getElementById("resetBtn").style.display = "none";
  startGame();
}

// blackjack.jsの一番下などに追加
document.getElementById("ruleBtn").onclick = function() {
  const box = document.getElementById("ruleBox");
  box.style.display = (box.style.display === "none" ? "block" : "none");
  this.textContent = (box.style.display === "none" ? "ルール確認" : "ルールを閉じる");
};

updateMoneyDisplay();
startGame();