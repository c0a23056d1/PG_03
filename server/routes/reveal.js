import express from "express";
const router = express.Router();

// 仮のrevealエンドポイント（今はダミー）
router.post("/", (req, res) => {
  res.json({
    message: "reveal api is working (dummy)",
    received: req.body
  });
});

export default router;