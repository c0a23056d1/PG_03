import express from "express";
import pkg from "pokersolver";
const { Hand } = pkg;
const router = express.Router();


router.post("/result", (req, res) => {
  const { players, board, bet, balance, action } = req.body;

  let message = "";
  let newBalance = balance;

  // フォールド処理
  if (action === "fold") {
    const result = "lose";
    message = "フォールドしました。あなたの負けです。";
    return res.json({
      result,
      message,
      balance: newBalance,
      players,
      board
    });
  }

  // 重複チェック
  const allCards = [...board];
  players.forEach(p => allCards.push(...p.hand));
  const cardSet = new Set(allCards);
  if (allCards.length !== cardSet.size) {
    return res.status(400).json({
      result: "error",
      message: "同じカードが複数選択されています。"
    });
  }

  // フォールドしていないプレイヤーのみで役判定
  const activePlayers = players.filter(p => !p.folded);
  const hands = activePlayers.map(p => Hand.solve([...(p.hand || []), ...(board || [])]));
  const winners = Hand.winners(hands);
  const winnerIndexes = hands.map((h, i) => winners.includes(h) ? i : -1).filter(i => i !== -1);
  const winnerNames = winnerIndexes.map(i => activePlayers[i].name);

  let result;
  if (winnerNames.length > 1) {
    result = "draw";
    message = `引き分けです（${winnerNames.join("・")}）`;
  } else if (winnerNames.includes("あなた")) {
    result = "win";
    message = `${winnerNames[0]}が勝利！（${winners[0].descr}）`;
  } else {
    result = "lose";
    message = `${winnerNames[0]}が勝利！（${winners[0].descr}）`;
  }

  res.json({
    result,
    message,
    winnerNames,
    balance: newBalance,
    players: players.map((p, i) => ({
      name: p.name,
      hand: p.hand,
      bestHand: !p.folded
        ? Hand.solve([...(p.hand || []), ...(board || [])]).cards.map(c => c.value + c.suit)
        : [],
      handType: !p.folded
        ? Hand.solve([...(p.hand || []), ...(board || [])]).descr
        : "フォールド"
    })),
    board
  });
});

export default router;