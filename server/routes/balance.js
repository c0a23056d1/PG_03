import express from "express";
const router = express.Router();

router.post("/update", (req, res) => {
  const { balance, amount } = req.body;

  const newBalance = balance + amount;

  res.json({
    newBalance
  });
});

export default router;