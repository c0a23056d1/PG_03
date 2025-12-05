let balance = 1000;
let gameState = {};

function createDeck() {
  const suits = ["S", "H", "D", "C"];
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const deck = [];
  for (const s of suits) for (const r of ranks) deck.push(r + s);
  return deck;
}

function drawCards(deck, n) {
  const cards = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * deck.length);
    cards.push(deck.splice(idx, 1)[0]);
  }
  return cards;
}

// function renderCards(containerId, cards) {
//   const suitsClass = { "S": "", "H": "heart", "D": "diamond", "C": "" };
//   const el = document.getElementById(containerId);
//   el.innerHTML = "";
//   cards.forEach(card => {
//     let suit = card.slice(-1);
//     let rank = card.slice(0, -1);
//     let div = document.createElement("div");
//     div.className = "card " + (suitsClass[suit] || "");
//     div.textContent = rank + suit;
//     el.appendChild(div);
//   });
// }

function renderCards(containerId, cards, show = true) {
  const suitsClass = { "S": "", "H": "heart", "D": "diamond", "C": "" };
  const el = document.getElementById(containerId);
  el.innerHTML = "";
  cards.forEach(card => {
    let suit = card.slice(-1);
    let rank = card.slice(0, -1);
    let div = document.createElement("div");
    if (show) {
      div.className = "card " + (suitsClass[suit] || "");
      div.textContent = rank + suit;
    } else {
      div.className = "card back";
      div.textContent = "??"; // トランプ裏面風
    }
    el.appendChild(div);
  });
}



// function updateUI() {
//   renderCards("playerCards", gameState.playerHand || []);
//   renderCards("opponentCards", gameState.opponentHand || []);
//   renderCards("boardCards", gameState.board || []);
//   document.getElementById("balance").textContent = balance;
//   document.getElementById("pot").textContent = gameState.pot || 0;
//   document.getElementById("stage").textContent = {
//     preflop: "プリフロップ",
//     flop: "フロップ",
//     turn: "ターン",
//     river: "リバー",
//     showdown: "ショーダウン"
//   }[gameState.stage] || "";
//   // ボタン制御
//   const disableAll = gameState.stage === "showdown" || balance <= 0;
//   document.querySelectorAll(".action-btns button").forEach(btn => {
//     btn.disabled = disableAll;
//   });
//   document.getElementById("dealBtn").disabled = false;
//   document.getElementById("nextBtn").disabled = !(["flop", "turn", "river"].includes(gameState.stage));
// }

function updateUI() {
  renderCards("playerCards", gameState.playerHand || [], true);
  // 相手のカードはショーダウン以外は裏面
  const showOpponent = gameState.stage === "showdown";
  renderCards("opponentCards", gameState.opponentHand || [], showOpponent);
  renderCards("boardCards", gameState.board || [], true);

  document.getElementById("balance").textContent = balance;
  document.getElementById("pot").textContent = gameState.pot || 0;
  document.getElementById("stage").textContent = {
    preflop: "プリフロップ",
    flop: "フロップ",
    turn: "ターン",
    river: "リバー",
    showdown: "ショーダウン"
  }[gameState.stage] || "";

  // ボタン制御
  const disableAll = gameState.stage === "showdown" || balance <= 0;
  document.querySelectorAll(".action-btns button").forEach(btn => {
    btn.disabled = disableAll;
  });
  document.getElementById("dealBtn").disabled = false;
  document.getElementById("nextBtn").disabled = !(["flop", "turn", "river"].includes(gameState.stage));
}



function startNewGame() {
  const deck = createDeck();
  const playerHand = drawCards(deck, 2);
  const opponentHand = drawCards(deck, 2);
  const allBoard = drawCards(deck, 5);
  gameState = {
    stage: "preflop",
    turn: "player",
    pot: 0,
    playerBet: 0,
    opponentBet: 0,
    playerHand,
    opponentHand,
    allBoard,
    board: [],
  };
  document.getElementById("judge").textContent = "";
  document.getElementById("gameover").textContent = "";
  updateUI();
}

function nextStage() {
  if (gameState.stage === "preflop") {
    gameState.stage = "flop";
    gameState.board = gameState.allBoard.slice(0, 3);
  } else if (gameState.stage === "flop") {
    gameState.stage = "turn";
    gameState.board = gameState.allBoard.slice(0, 4);
  } else if (gameState.stage === "turn") {
    gameState.stage = "river";
    gameState.board = gameState.allBoard.slice(0, 5);
  } else if (gameState.stage === "river") {
    gameState.stage = "showdown";
    sendShowdown();
    return;
  }
  updateUI();
}

function playerAction(action) {
  const bet = Number(document.getElementById("bet").value);
  if (["bet", "raise"].includes(action)) {
    if (bet < 1 || bet > balance) {
      alert("ベット額が不正です");
      return;
    }
    gameState.pot += bet;
    gameState.playerBet += bet;
    balance -= bet;
  }
  if (action === "fold") {
    gameState.stage = "showdown";
    sendShowdown("fold");
    return;
  }
  // 相手は自動でコール（サンプル）
  if (["bet", "raise"].includes(action)) {
    gameState.pot += bet;
    gameState.opponentBet += bet;
  }
  nextStage();
}

function sendShowdown(action = "bet") {
  fetch("http://localhost:3001/api/poker/result", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      players: [
        { name: "あなた", hand: gameState.playerHand },
        { name: "相手", hand: gameState.opponentHand }
      ],
      board: gameState.allBoard,
      bet: gameState.pot,
      balance,
      action
    })
  })
  .then(res => res.json())
  .then(json => {
    document.getElementById("judge").textContent = json.message;
    if (json.result === "win") balance = json.balance;
    if (json.result === "lose") balance = json.balance;
    updateUI();
    if (balance <= 0) {
      document.getElementById("gameover").textContent = "お金がなくなりました。";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dealBtn").onclick = startNewGame;
  document.getElementById("betBtn").onclick = () => playerAction("bet");
  document.getElementById("raiseBtn").onclick = () => playerAction("raise");
  document.getElementById("callBtn").onclick = () => playerAction("call");
  document.getElementById("checkBtn").onclick = () => playerAction("check");
  document.getElementById("foldBtn").onclick = () => playerAction("fold");
  document.getElementById("nextBtn").onclick = nextStage;
  document.getElementById("ruleBtn").onclick = function() {
    const box = document.getElementById("ruleBox");
    box.style.display = (box.style.display === "none" ? "block" : "none");
    this.textContent = (box.style.display === "none" ? "ルール確認" : "ルールを閉じる");
  };
  startNewGame();
});