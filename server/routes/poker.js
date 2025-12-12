import express from "express";
import pkg from "pokersolver";
const { Hand } = pkg;
const router = express.Router();

/**
 * 受け取るデータ例:
 * {
 *   "players": [
 *     { "name": "あなた", "hand": ["AS", "KH"] },
 *     { "name": "相手", "hand": ["9C", "9D"] }
 *   ],
 *   "board": ["2H", "5S", "9H", "JC", "QD"],
 *   "bet": 100,
 *   "balance": 1000,
 *   "action": "bet" // "bet", "raise", "call", "check", "fold"
 * }
 */

router.post("/result", (req, res) => {
  const { players, board, bet, balance, action } = req.body;

  let result = "";
  let message = "";
  let newBalance = balance;

  // フォールド処理
  if (action === "fold") {
    result = "lose";
    message = "フォールドしました。あなたの負けです。";
    newBalance -= bet;
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

  // 役判定
  const hands = players.map(p => Hand.solve([...(p.hand || []), ...(board || [])]));
  const winners = Hand.winners(hands);
  const winnerIndexes = hands.map((h, i) => winners.includes(h) ? i : -1).filter(i => i !== -1);
  const winnerNames = winnerIndexes.map(i => players[i].name);

  // 勝敗判定
  if (winners.length > 1) {
    result = "draw";
    message = `引き分けです（${winnerNames.join("・")}）`;
  } else {
    result = "win";
    message = `${winnerNames[0]}が勝利！（${winners[0].descr}）`;
    // あなたが勝者なら残高増、そうでなければ減
    if (winnerNames.includes("あなた")) {
      newBalance += bet;
    } else {
      newBalance -= bet;
    }
  }

  res.json({
    result,
    message,
    winnerNames,
    balance: newBalance,
    players: players.map((p, i) => ({
      name: p.name,
      hand: p.hand,
      bestHand: hands[i].cards.map(c => c.value + c.suit),
      handType: hands[i].descr
    })),
    board
  });
});

export default router;