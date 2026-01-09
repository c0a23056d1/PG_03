import express from "express";
import { initBlockchain, startGame, drawCard, getHands, stand } from "../services/blockchain.js";

const router = express.Router();

// ブロックチェーン初期化フラグ
let bcInitialized = false;

/**
 * ゲーム初期化エンドポイント
 * クライアント側で新しいゲームを開始する際に呼ぶ
 */
router.post("/start", async (req, res) => {
  try {
    // 初回のみ初期化
    if (!bcInitialized) {
      const initialized = await initBlockchain();
      if (!initialized) {
        return res.status(500).json({ 
          success: false, 
          message: "ブロックチェーン接続失敗" 
        });
      }
      bcInitialized = true;
    }

    const result = await startGame(req.body.playerAddress || "0x0");
    res.json({
      success: result.success,
      message: result.success ? "ゲーム開始" : result.error
    });
  } catch (error) {
    console.error("Error in /start:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * カードを1枚引く（ブロックチェーン）
 */
router.post("/draw", async (req, res) => {
  try {
    if (!bcInitialized) {
      const initialized = await initBlockchain();
      if (!initialized) return res.status(500).json({ success: false, message: "ブロックチェーン接続失敗" });
      bcInitialized = true;
    }

    const result = await drawCard(req.body.playerAddress || "0x0");
    const hands = await getHands(req.body.playerAddress || "0x0");
    res.json({ ...result, ...hands });
  } catch (error) {
    console.error("Error in /draw:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * スタンドして勝敗確定（ブロックチェーン）
 */
router.post("/stand", async (req, res) => {
  try {
    if (!bcInitialized) {
      const initialized = await initBlockchain();
      if (!initialized) return res.status(500).json({ success: false, message: "ブロックチェーン接続失敗" });
      bcInitialized = true;
    }

    const result = await stand(req.body.playerAddress || "0x0");
    const hands = await getHands(req.body.playerAddress || "0x0");
    res.json({ ...result, ...hands });
  } catch (error) {
    console.error("Error in /stand:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 旧互換性: 勝敗判定エンドポイント
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