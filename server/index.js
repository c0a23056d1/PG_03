import express from "express";
import cors from "cors";

// ルートのimport
import blackjackRouter from "./routes/blackjack.js";
import thresholdRouter from "./routes/threshold.js";
import echoRouter from "./routes/echo.js";
import balanceRouter from "./routes/balance.js";
import pokerRouter from "./routes/poker.js"; // ← 追加

import echoRoute from "./routes/echo.js";
import gameRoute from "./routes/game.js";
import revealRoute from "./routes/reveal.js";
import thresholdRoute from "./routes/threshold.js";
import blackjackRoute from "./routes/blackjack.js";
import pokerRoute from "./routes/poker.js";
import balanceRoute from "./routes/balance.js";

const app = express();
const PORT = 3001;

// ✅ これがないと req.body は常に undefined になる
app.use(cors());
app.use(express.json());

app.use("/api/echo", echoRoute);
app.use("/api/game", gameRoute);
app.use("/api/reveal", revealRoute);
app.use("/api/threshold", thresholdRoute);

app.use("/api/blackjack", blackjackRoute);
app.use("/api/poker", pokerRoute);
app.use("/api/balance", balanceRoute);

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