import express from "express";
import cors from "cors";

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

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
