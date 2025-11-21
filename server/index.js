// server/index.js

import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ★テスト用：サーバーが動いているか確認するエンドポイント
app.get("/api/test", (req, res) => {
  res.json({ message: "🎉 Server is running correctly!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
