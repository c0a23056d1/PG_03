import express from "express";
import cors from "cors";

// ルートのimport
import blackjackRouter from "./routes/blackjack.js";
import thresholdRouter from "./routes/threshold.js";
import echoRouter from "./routes/echo.js";
import balanceRouter from "./routes/balance.js";
import pokerRouter from "./routes/poker.js"; // ← 追加

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// テスト用
app.get("/api/test", (req, res) => {
  res.json({ message: "🎉 Server is running correctly!" });
});

// ルート追加
app.use("/api/blackjack", blackjackRouter);
app.use("/api/threshold", thresholdRouter);
app.use("/api/echo", echoRouter);
app.use("/api/balance", balanceRouter);
app.use("/api/poker", pokerRouter); // ← 追加

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});