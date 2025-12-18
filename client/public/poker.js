
let balance = 5000;
let gameState = {};
let startBtn = null;
let raiseInput = null;

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
    roundActions: 0,
    lastBet: 0 // 直前のベット額
  };
  document.getElementById("judge").textContent = "";
  document.getElementById("gameover").textContent = "";
  document.getElementById("dealBtn").disabled = true;
  document.getElementById("restartBtn").style.display = "none";
  if (startBtn) startBtn.style.display = "none";
  if (raiseInput) raiseInput.style.display = "none";
  updateUI();
  handleTurn();
}

function handleTurn() {
  if (gameState.stage === "showdown") return;

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
    // レイズ入力欄を非表示
    if (raiseInput) raiseInput.style.display = "none";
  } else {
    setTimeout(() => {
      if (gameState.stage === "showdown") return;

      let action = "call";
      // 直前のベット額
      let lastBet = gameState.lastBet || 100;
      if (Math.random() < 0.1) {
        action = "fold";
        player.folded = true;
        gameState.actionLog.push(`${player.name}はフォールドしました`);
      } else if (Math.random() < 0.2) {
        action = "raise";
        // レイズは前のベット+50円
        let raiseAmount = lastBet + 50;
        player.bet += raiseAmount;
        gameState.pot += raiseAmount;
        gameState.lastBet = raiseAmount;
        gameState.actionLog.push(`${player.name}が${raiseAmount}円レイズしました`);
      } else {
        action = "call";
        // コールは直前のベット額に合わせる
        player.bet += lastBet;
        gameState.pot += lastBet;
        gameState.actionLog.push(`${player.name}が${lastBet}円コールしました`);
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
  let bet = Number(document.getElementById("bet").value);
  if (action === "raise") {
    // レイズ時はraiseInputの値を加算
    if (raiseInput) {
      const plus = Number(raiseInput.value);
      if (isNaN(plus) || plus < 1) {
        alert("レイズ額を正しく入力してください");
        return;
      }
      bet = (gameState.lastBet || 100) + plus;
    }
  }
  if (["bet", "raise"].includes(action)) {
    if (bet < 1 || bet > balance) {
      alert("ベット額が不正です");
      return;
    }
    gameState.pot += bet;
    gameState.playerBet = (gameState.playerBet || 0) + bet;
    balance -= bet;
    gameState.players[0].bet += bet;
    gameState.lastBet = bet;
    gameState.actionLog.push(`あなたが${bet}円${action === "bet" ? "ベット" : "レイズ"}しました`);
  }
  if (action === "call") {
    // コールは直前のベット額に合わせる
    let callAmount = gameState.lastBet || 100;
    if (callAmount > balance) callAmount = balance;
    gameState.pot += callAmount;
    balance -= callAmount;
    gameState.players[0].bet += callAmount;
    gameState.actionLog.push(`あなたが${callAmount}円コールしました`);
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
    if (raiseInput) raiseInput.style.display = "none";
    return;
  }
  gameState.players[0].acted = true;
  gameState.roundActions++;
  updateUI();
  if (raiseInput) raiseInput.style.display = "none";
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

  // ベットボタンの表示制御
  const betBtn = document.getElementById("betBtn");
  if (betBtn) {
    // 自分が最初の順番の時だけ表示
    if (gameState.stage === "preflop" && gameState.roundActions === 0 && gameState.currentTurn === 0) {
      betBtn.style.display = "inline-block";
    } else {
      betBtn.style.display = "none";
    }
  }

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

document.getElementById("betBtn").onclick = () => {
  playerAction("bet");
  document.getElementById("betBtn").style.display = "none";
};

function nextTurn() {
  if (gameState.stage === "showdown") return;

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
    // 新しいラウンドの最初のプレイヤーを決定（前回の最初の人の次から）
    let next = gameState.currentTurn;
    do {
      next = (next + 1) % 4;
    } while (gameState.players[next].folded);
    gameState.currentTurn = next;
    gameState.actionLog.push(`${gameState.players[gameState.currentTurn].name}の番です`);
    updateUI();
    if (gameState.stage === "showdown") return;

    handleTurn();
    return;
  }
  // 次のプレイヤーへ（時計回り）
  let next = gameState.currentTurn;
  do {
    next = (next + 1) % 4;
  } while (gameState.players[next].folded || gameState.players[next].acted);
  gameState.currentTurn = next;
  gameState.actionLog.push(`${gameState.players[next].name}の番です`);
  updateUI();
  if (gameState.stage === "showdown") return;

  handleTurn();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dealBtn").style.display = "none";
  // スタートボタンを追加
  if (!document.getElementById("startBtn")) {
    startBtn = document.createElement("button");
    startBtn.id = "startBtn";
    startBtn.textContent = "スタート";
    startBtn.style.position = "absolute";
    startBtn.style.left = "50%";
    startBtn.style.top = "40px";
    startBtn.style.transform = "translateX(-50%)";
    startBtn.style.zIndex = "1000";
    startBtn.style.padding = "18px 60px";
    startBtn.style.fontSize = "1.5em";
    startBtn.style.background = "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)";
    startBtn.style.color = "#fff";
    startBtn.style.border = "none";
    startBtn.style.borderRadius = "14px";
    startBtn.style.boxShadow = "0 4px 16px #185a9d44";
    startBtn.style.fontWeight = "bold";
    startBtn.style.letterSpacing = "2px";
    startBtn.style.cursor = "pointer";
    startBtn.onmouseover = () => startBtn.style.background = "linear-gradient(90deg, #185a9d 0%, #43cea2 100%)";
    startBtn.onmouseout = () => startBtn.style.background = "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)";
    startBtn.onclick = startNewGame;
    document.querySelector(".table-bg").appendChild(startBtn);
  } else {
    startBtn = document.getElementById("startBtn");
  }

  // レイズ入力欄を追加
  if (!document.getElementById("raiseInput")) {
    raiseInput = document.createElement("input");
    raiseInput.type = "number";
    raiseInput.id = "raiseInput";
    raiseInput.min = "1";
    raiseInput.value = "50";
    raiseInput.placeholder = "レイズ追加額";
    raiseInput.style.position = "absolute";
    raiseInput.style.left = "50%";
    raiseInput.style.bottom = "60px";
    raiseInput.style.transform = "translateX(-50%)";
    raiseInput.style.zIndex = "1001";
    raiseInput.style.display = "none";
    document.querySelector(".table-bg").appendChild(raiseInput);
  } else {
    raiseInput = document.getElementById("raiseInput");
  }

  document.getElementById("betBtn").onclick = () => playerAction("bet");
  document.getElementById("raiseBtn").onclick = () => {
    if (raiseInput) {
      raiseInput.style.display = "inline-block";
      raiseInput.focus();
    }
  };
  document.getElementById("callBtn").onclick = () => playerAction("call");
  document.getElementById("checkBtn").onclick = () => playerAction("check");
  document.getElementById("foldBtn").onclick = () => playerAction("fold");
  document.getElementById("nextBtn").onclick = startNewGame;
  document.getElementById("restartBtn").onclick = function() {
    balance = 1000;
    if (startBtn) startBtn.style.display = "inline-block";
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
    if (json.result === "win") balance += gameState.pot;
    // if (json.result === "win") balance = json.balance;
    // if (json.result === "lose") balance = json.balance;
    updateUI();
    if (balance > 0) {
      document.getElementById("nextBtn").disabled = false;
    }
    if (balance <= 0) {
      document.getElementById("gameover").textContent = "お金がなくなりました。";
    }

    gameState.pot = 0;
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
    balance = 5000;
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