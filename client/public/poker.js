
let balance = 1000;
let gameState = {};

function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
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

function renderCards(containerId, cards, show = true) {
  const suitsClass = { "♠": "", "♥": "heart", "♦": "diamond", "♣": "" };
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
      div.textContent = "??";
    }
    el.appendChild(div);
  });
}

function getAutoBetAmount(hand) {
  // 簡易判定：ペアなら200、AかKがあれば150、それ以外100
  let [r1, r2] = hand.map(card => card.slice(0, -1));
  if (r1 === r2) return 200;
  if (["A", "K"].includes(r1) || ["A", "K"].includes(r2)) return 150;
  return 100;
}

// function startNewGame() {
//   const deck = createDeck();
//   // 4人分の手札
//   const players = [
//     { name: "あなた", hand: drawCards(deck, 2), bet: 0 },
//     { name: "相手A", hand: drawCards(deck, 2), bet: 100 },
//     { name: "相手B", hand: drawCards(deck, 2), bet: 100 },
//     { name: "相手C", hand: drawCards(deck, 2), bet: 100 }
//   ];
//   const allBoard = drawCards(deck, 5);
//   // プリフロップ時点で他プレイヤーのベットをpotに加算
//   let pot = players[1].bet + players[2].bet + players[3].bet;
//   gameState = {
//     stage: "preflop",
//     turn: "player",
//     pot: pot,
//     playerBet: 0,
//     players,
//     allBoard,
//     board: [],
//   };
//   document.getElementById("judge").textContent = "";
//   document.getElementById("gameover").textContent = "";
//   document.getElementById("dealBtn").disabled = true; // 配るボタンは1回だけ
//   updateUI();
// }

function startNewGame() {
  const deck = createDeck();
  const players = [
    { name: "あなた", hand: drawCards(deck, 2), bet: 0, folded: false, acted: false },
    { name: "相手A", hand: drawCards(deck, 2), bet: 0, folded: false, acted: false },
    { name: "相手B", hand: drawCards(deck, 2), bet: 0, folded: false, acted: false },
    { name: "相手C", hand: drawCards(deck, 2), bet: 0, folded: false, acted: false }
  ];
  const allBoard = drawCards(deck, 5);
  let pot = 0;
  const currentTurn = Math.floor(Math.random() * 4);
  gameState = {
    stage: "preflop",
    pot: pot,
    playerBet: 0,
    players,
    allBoard,
    board: [],
    currentTurn,
    actionLog: [`${players[currentTurn].name}の番です`],
    roundActions: 0
  };
  document.getElementById("judge").textContent = "";
  document.getElementById("gameover").textContent = "";
  document.getElementById("dealBtn").disabled = true;
  document.getElementById("restartBtn").style.display = "none";
  updateUI();
  handleTurn();
}

function handleTurn() {
  const turn = gameState.currentTurn;
  const player = gameState.players[turn];
  if (player.folded || player.acted) {
    nextTurn();
    return;
  }
  if (turn === 0) {
    // あなたの番
    updateUI();
    // ボタン有効化
    document.querySelectorAll(".action-btns button").forEach(btn => {
      if (["betBtn", "raiseBtn", "callBtn", "checkBtn", "foldBtn"].includes(btn.id)) {
        btn.disabled = false;
      }
    });
  } else {
    setTimeout(() => {
      let action = "call";
      let bet = getAutoBetAmount(player.hand);
      if (Math.random() < 0.1) {
        action = "fold";
        player.folded = true;
        gameState.actionLog.push(`${player.name}はフォールドしました`);
      } else if (Math.random() < 0.2) {
        action = "raise";
        bet += 50;
        player.bet += bet;
        gameState.pot += bet;
        gameState.actionLog.push(`${player.name}が${bet}円レイズしました`);
      } else {
        action = "call";
        player.bet += bet;
        gameState.pot += bet;
        gameState.actionLog.push(`${player.name}が${bet}円コールしました`);
      }
      player.acted = true;
      gameState.roundActions++;
      updateUI();
      nextTurn();
    }, 1200);
  }
}

// function playerAction(action) {
//   const bet = Number(document.getElementById("bet").value);
//   if (["bet", "raise"].includes(action)) {
//     if (bet < 1 || bet > balance) {
//       alert("ベット額が不正です");
//       return;
//     }
//     gameState.pot += bet;
//     gameState.playerBet = (gameState.playerBet || 0) + bet;
//     balance -= bet;
//     gameState.players[0].bet = bet; // 自分のベット額
//   }
//   if (action === "fold") {
//     gameState.stage = "showdown";
//     sendShowdown("fold");
//     return;
//   }
//   // 他プレイヤーは手札でベット額を決定
//   if (["bet", "raise"].includes(action)) {
//     for (let i = 1; i < 4; i++) {
//       const autoBet = getAutoBetAmount(gameState.players[i].hand);
//       gameState.pot += autoBet;
//       gameState.players[i].bet = autoBet;
//     }
//   }
//   nextStage();
// }

function playerAction(action) {
  const bet = Number(document.getElementById("bet").value);
  if (["bet", "raise"].includes(action)) {
    if (bet < 1 || bet > balance) {
      alert("ベット額が不正です");
      return;
    }
    gameState.pot += bet;
    gameState.playerBet = (gameState.playerBet || 0) + bet;
    balance -= bet;
    gameState.players[0].bet += bet;
    gameState.actionLog.push(`あなたが${bet}円${action === "bet" ? "ベット" : "レイズ"}しました`);
  }
  if (action === "call") {
    let callBet = 100; // 仮のコール額
    gameState.pot += callBet;
    balance -= callBet;
    gameState.players[0].bet += callBet;
    gameState.actionLog.push("あなたがコールしました");
  }
  if (action === "check") {
    gameState.actionLog.push("あなたがチェックしました");
  }
  if (action === "fold") {
    gameState.players[0].folded = true;
    gameState.actionLog.push("あなたはフォールドしました");
    gameState.stage = "showdown";
    sendShowdown("fold");
    document.getElementById("restartBtn").style.display = "inline-block";
    updateUI();
    return;
  }
  gameState.players[0].acted = true;
  gameState.roundActions++;
  updateUI();
  nextTurn();
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

// function updateUI() {
//   // 4人分の手札を表示
//   for (let i = 0; i < 4; i++) {
//     const show = (i === 0) || (gameState.stage === "showdown");
//     renderCards(`player${i+1}Cards`, (gameState.players && gameState.players[i]?.hand) || [], show);
//     const bet = (gameState.players && gameState.players[i]?.bet) ? gameState.players[i].bet : 0;
//     document.getElementById(`player${i+1}Bet`).textContent = `ベット額：${bet}`;
//   }
//   renderCards("boardCards", gameState.board || [], true);
//   document.getElementById("stage").textContent = gameState.actionLog.slice(-3).join(" / ");

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
//   // 配るボタンは1回だけ
//   document.getElementById("dealBtn").disabled = true;
//   // 「次へ」ボタンはショーダウン後のみ有効
//   document.getElementById("nextBtn").disabled = !(gameState.stage === "showdown" && balance > 0);

//   // アクションボタンはショーダウン時と残高0円時は無効
//   const disableAll = gameState.stage === "showdown" || balance <= 0;
//   document.querySelectorAll(".action-btns button").forEach(btn => {
//     if (btn.id !== "nextBtn" && btn.id !== "dealBtn") {
//       btn.disabled = disableAll;
//     }
//   });

//   if (balance <= 0) {
//     document.getElementById("gameover").textContent = "お金がなくなりました。";
//     document.getElementById("restartBtn").style.display = "inline-block";
//   } else {
//     document.getElementById("gameover").textContent = "";
//     document.getElementById("restartBtn").style.display = "none";
//   }
// }

function updateUI() {
  // 4人分の手札を表示
  for (let i = 0; i < 4; i++) {
    const show = (i === 0) || (gameState.stage === "showdown");
    renderCards(`player${i+1}Cards`, (gameState.players && gameState.players[i]?.hand) || [], show);
    const bet = (gameState.players && gameState.players[i]?.bet) ? gameState.players[i].bet : 0;
    document.getElementById(`player${i+1}Bet`).textContent = `ベット額：${bet}`;
  }
  renderCards("boardCards", gameState.board || [], true);

  // 進行状況（プリフロップなど）
  document.getElementById("stage").textContent = {
    preflop: "プリフロップ",
    flop: "フロップ",
    turn: "ターン",
    river: "リバー",
    showdown: "ショーダウン"
  }[gameState.stage] || "";

  // アクション履歴（ターンやベット内容）
  if (document.getElementById("actionLog")) {
    document.getElementById("actionLog").textContent = gameState.actionLog.slice(-3).join(" / ");
  }

  document.getElementById("balance").textContent = balance;
  document.getElementById("pot").textContent = gameState.pot || 0;

  // ボタン制御
  document.getElementById("dealBtn").disabled = true;
  document.getElementById("nextBtn").disabled = !(gameState.stage === "showdown" && balance > 0);

  const disableAll = gameState.stage === "showdown" || balance <= 0;
  document.querySelectorAll(".action-btns button").forEach(btn => {
    if (btn.id !== "nextBtn" && btn.id !== "dealBtn") {
      btn.disabled = disableAll;
    }
  });

  if (balance <= 0) {
    document.getElementById("gameover").textContent = "お金がなくなりました。";
    document.getElementById("restartBtn").style.display = "inline-block";
  } else {
    document.getElementById("gameover").textContent = "";
    document.getElementById("restartBtn").style.display = "none";
  }
}

function nextTurn() {
  // 全員アクション済み or フォールドで残り1人なら次のラウンドへ
  const alive = gameState.players.filter(p => !p.folded);
  if (alive.length === 1) {
    // 残り1人なら即ショーダウン
    gameState.stage = "showdown";
    sendShowdown();
    updateUI();
    return;
  }
  if (gameState.roundActions >= alive.length) {
    // ラウンド進行
    nextStage();
    // 各プレイヤーのactedをリセット
    gameState.players.forEach(p => p.acted = false);
    gameState.roundActions = 0;
    // 新しいラウンドの最初のプレイヤーを決定
    gameState.currentTurn = gameState.players.findIndex(p => !p.folded);
    gameState.actionLog.push(`${gameState.players[gameState.currentTurn].name}の番です`);
    updateUI();
    handleTurn();
    return;
  }
  // 次のプレイヤーへ
  let next = (gameState.currentTurn + 1) % 4;
  while (gameState.players[next].folded || gameState.players[next].acted) {
    next = (next + 1) % 4;
  }
  gameState.currentTurn = next;
  gameState.actionLog.push(`${gameState.players[next].name}の番です`);
  updateUI();
  handleTurn();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dealBtn").style.display = "none";
  // スタートボタンを追加
  if (!document.getElementById("startBtn")) {
    const btn = document.createElement("button");
    btn.id = "startBtn";
    btn.textContent = "スタート";
    btn.style.position = "absolute";
    btn.style.left = "50%";
    btn.style.top = "40px";
    btn.style.transform = "translateX(-50%)";
    btn.style.zIndex = "1000";
    btn.onclick = startNewGame;
    document.querySelector(".table-bg").appendChild(btn);
  }
  document.getElementById("betBtn").onclick = () => playerAction("bet");
  document.getElementById("raiseBtn").onclick = () => playerAction("raise");
  document.getElementById("callBtn").onclick = () => playerAction("call");
  document.getElementById("checkBtn").onclick = () => playerAction("check");
  document.getElementById("foldBtn").onclick = () => playerAction("fold");
  document.getElementById("nextBtn").onclick = startNewGame;
  document.getElementById("restartBtn").onclick = function() {
    balance = 1000;
    startNewGame();
  };
  document.getElementById("ruleBtn").onclick = function() {
    const box = document.getElementById("ruleBox");
    box.style.display = (box.style.display === "none" ? "block" : "none");
    this.textContent = (box.style.display === "none" ? "ルール確認" : "ルールを閉じる");
  };
  document.getElementById("dealBtn").disabled = true;
  document.getElementById("restartBtn").style.display = "none";
});


function sendShowdown(action = "bet") {
  fetch("http://localhost:3001/api/poker/result", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      players: gameState.players,
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
    if (balance > 0) {
      document.getElementById("nextBtn").disabled = false;
    }
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
  document.getElementById("nextBtn").onclick = startNewGame;
  document.getElementById("restartBtn").onclick = function() {
    balance = 1000;
    startNewGame();
  };
  document.getElementById("ruleBtn").onclick = function() {
    const box = document.getElementById("ruleBox");
    box.style.display = (box.style.display === "none" ? "block" : "none");
    this.textContent = (box.style.display === "none" ? "ルール確認" : "ルールを閉じる");
  };
  // 最初は配るボタンだけ有効
  document.getElementById("dealBtn").disabled = false;
});