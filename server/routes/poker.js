

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

  // 他アクションは現状ベットと同じ扱い（拡張可能）
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

  if (winners.length > 1) {
    result = "draw";
    message = `引き分けです（${hands[0].descr} vs ${hands[1].descr}）`;
  } else {
    const winnerIdx = hands.findIndex(h => h === winners[0]);
    if (winnerIdx === 0) {
      result = "win";
      message = `あなたの勝ち！（${hands[0].descr}）`;
      newBalance += bet;
    } else {
      result = "lose";
      message = `あなたの負け…（${hands[1].descr}）`;
      newBalance -= bet;
    }
  }

  res.json({
    result,
    message,
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