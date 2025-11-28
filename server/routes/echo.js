import express from "express";
const router = express.Router();

// POST /api/echo
router.post("/", (req, res) => {
  const { text } = req.body;

  res.json({
    message: "サーバーからの返答です！",
    received: text,
    time: new Date().toISOString()
  });
});

export default router;
