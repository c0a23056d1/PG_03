import { ethers } from "ethers";

// ハードハットローカルノードに接続
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Game コントラクトの ABI
const GAME_ABI = [
  "function startGame() public",
  "function drawCard() public",
  "function stand() public",
  "function getMyHand() public view returns (uint8[])",
  "function getDealerHand() public view returns (uint8[])",
  "function calculateScore(uint8[] memory hand) private pure returns (uint256)",
  "event GameResult(address player, string result, uint256 playerScore, uint256 dealerScore)",
  "event CardDrawn(address player, uint8 cardValue, string suit, string rank)"
];

// デプロイされたコントラクトアドレスを環境変数 or デプロイ記録から読み込む
import fs from "fs";
import path from "path";

let GAME_ADDRESS = process.env.GAME_ADDRESS || "";
try {
  if (!GAME_ADDRESS) {
    const deployedPath = path.resolve(process.cwd(), "../hardhat/ignition/deployments/chain-31337/deployed_addresses.json");
    const json = JSON.parse(fs.readFileSync(deployedPath, "utf-8"));
    GAME_ADDRESS = json["GameModule#Game"] || GAME_ADDRESS;
  }
} catch (_) {
  // 読み込み失敗時は既知のデフォルトアドレスを利用（初回デプロイ想定）
  GAME_ADDRESS = GAME_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
}

// ハードハット のデフォルトアカウント（秘密鍵）
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb476cadccddbc13461a93120ba45";

let signer = null;
let gameContract = null;

/**
 * ブロックチェーン接続を初期化
 */
export async function initBlockchain() {
  try {
    signer = new ethers.Wallet(PRIVATE_KEY, provider);
    gameContract = new ethers.Contract(GAME_ADDRESS, GAME_ABI, signer);
    console.log("✅ Blockchain connected:", GAME_ADDRESS);
    return true;
  } catch (error) {
    console.error("❌ Blockchain connection failed:", error.message);
    return false;
  }
}

/**
 * ゲーム開始（デッキを初期化・シャッフル）
 */
export async function startGame(playerAddress) {
  try {
    const tx = await gameContract.startGame();
    await tx.wait();
    console.log("🎮 Game started for", playerAddress);
    return { success: true };
  } catch (error) {
    console.error("❌ startGame error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * カードを引く
 */
export async function drawCard(playerAddress) {
  try {
    const tx = await gameContract.drawCard();
    const receipt = await tx.wait();
    
    // イベントログからカード情報を取得
    const iface = new ethers.Interface(GAME_ABI);
    let cardInfo = null;
    
    if (receipt.logs && receipt.logs.length > 0) {
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === "CardDrawn") {
            cardInfo = {
              cardValue: parsed.args[1],
              suit: parsed.args[2],
              rank: parsed.args[3]
            };
            break;
          }
        } catch (e) {
          // ログ解析失敗、続ける
        }
      }
    }
    
    console.log("🎴 Card drawn:", cardInfo);
    return { success: true, card: cardInfo };
  } catch (error) {
    console.error("❌ drawCard error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * プレイヤーとディーラーの手札を取得
 */
export async function getHands(playerAddress) {
  try {
    const playerHand = await gameContract.getMyHand();
    const dealerHand = await gameContract.getDealerHand();
    
    return {
      success: true,
      playerHand: playerHand.map(c => parseInt(c)),
      dealerHand: dealerHand.map(c => parseInt(c))
    };
  } catch (error) {
    console.error("❌ getHands error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * スタンド（勝負）
 */
export async function stand(playerAddress) {
  try {
    const tx = await gameContract.stand();
    const receipt = await tx.wait();
    
    // イベントから結果を取得
    const iface = new ethers.Interface(GAME_ABI);
    let gameResult = null;
    
    if (receipt.logs && receipt.logs.length > 0) {
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === "GameResult") {
            gameResult = {
              result: parsed.args[1],
              playerScore: parseInt(parsed.args[2]),
              dealerScore: parseInt(parsed.args[3])
            };
            break;
          }
        } catch (e) {
          // ログ解析失敗、続ける
        }
      }
    }
    
    console.log("🏁 Game result:", gameResult);
    return { success: true, result: gameResult };
  } catch (error) {
    console.error("❌ stand error:", error.message);
    return { success: false, error: error.message };
  }
}
