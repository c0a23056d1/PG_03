const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("GameModule", (m) => {
  // Gameという名前のコントラクトをデプロイする設定
  const game = m.contract("Game");

  return { game };
});