import express from "express";
const router = express.Router();

/**
 * UI側から送られてくる例：
 * {
 *   "playerRank": 7,  // (例) 7=フルハウス
 *   "dealerRank": 3,
 *   "bet": 100,
 *   "balance": 500
 * }
 */

router.post("/result", (req, res) => {
  const { playerRank, dealerRank, bet, balance } = req.body;

  let result = "";
  let newBalance = balance;

  if (playerRank > dealerRank) {
    result = "win";
    newBalance += bet;
  } else if (playerRank < dealerRank) {
    result = "lose";
    newBalance -= bet;
  } else {
    result = "draw";
  }

  res.json({
    result,
    message: `ポーカー結果: ${result}`,
    balance: newBalance
  });
});

export default router;
