import express from "express";
const router = express.Router();

// POST /api/threshold
router.post("/", (req, res) => {
  const { value } = req.body;

  if (typeof value !== "number") {
    return res.status(400).json({ error: "value を数値にしてください" });
  }

  if (value >= 100) {
    return res.json({
      ok: true,
      message: "100以上です！🎉",
      returnedValue: 9999
    });
  }

  return res.json({
    ok: false,
    message: "100未満です。",
    returnedValue: 0
  });
});

export default router;
