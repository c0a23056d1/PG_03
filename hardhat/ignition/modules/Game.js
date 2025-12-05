const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("GameModule", (m) => {
  const game = m.contract("Game");
  return { game };
});