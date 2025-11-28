import express from "express";
const router = express.Router();

/**
 * 送られてくるデータの例：
 * {
 *   "playerTotal": 18,
 *   "dealerTotal": 20,
 *   "bet": 50,
 *   "balance": 1000
 * }
 */

router.post("/result", (req, res) => {
  const { playerTotal, dealerTotal, bet, balance } = req.body;

  let result = "";
  let newBalance = balance;

  if (playerTotal > 21) {
    result = "burst";
    newBalance -= bet;
  } else if (dealerTotal > 21) {
    result = "win";
    newBalance += bet;
  } else if (playerTotal > dealerTotal) {
    result = "win";
    newBalance += bet;
  } else if (playerTotal < dealerTotal) {
    result = "lose";
    newBalance -= bet;
  } else if (playerTotal == 21){
        result = "win";
        newBalance += bet;
        message = "ブラックジャック！あなたの勝ちです！";
  } else {
    result = "draw";
  }

  res.json({
    result,
    message: `あなたは${result === "win" ? "勝ち" : result === "lose" ? "負け" : result === "burst" ? "バースト" : "引き分け"}です`,
    balance: newBalance
  });
});

export default router;