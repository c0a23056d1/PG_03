const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Game Contract", function () {
  it("Should play a full game loop (Player vs Dealer)", async function () {
    const Game = await ethers.getContractFactory("Game");
    const game = await Game.deploy();
    await game.waitForDeployment();

    console.log("--- Game Start ---");
    await game.startGame();

    // プレイヤーが2枚引く
    await game.drawCard();
    await game.drawCard();

    // 手札を確認
    const myHand = await game.getMyHand();
    console.log(`Player Hand: ${myHand.length} cards`);

    // 勝負する (Stand)
    console.log("Player stands. Dealer turn...");
    const tx = await game.stand();
    const receipt = await tx.wait();

    // 結果イベントを探す
    const resultEvent = receipt.logs.find(log => log.fragment && log.fragment.name === 'GameResult');
    
    if (resultEvent) {
        const result = resultEvent.args[1];
        const pScore = resultEvent.args[2];
        const dScore = resultEvent.args[3];
        
        console.log(`\n=== GAME RESULT ===`);
        console.log(`Result: ${result}`);
        console.log(`Player Score: ${pScore}`);
        console.log(`Dealer Score: ${dScore}`);
        
        // 結果が正しく入っているかチェック
        expect(result).to.be.oneOf(["Win", "Lose", "Draw", "Lose (Bust)", "Win (Dealer Bust)"]);
    }
  });
});