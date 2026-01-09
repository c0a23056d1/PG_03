# PG_03
# ブロックチェーン統合ブラックジャックゲーム

Ethereum (Hardhat) ブロックチェーン上で動作するブラックジャックゲームです。

## 🎯 実装完了機能

### ✅ ブロックチェーン
- **スマートコントラクト** ([Game.sol](hardhat/contracts/Game.sol))
  - デッキの初期化とシャッフル
  - カード配布（プレイヤー・ディーラー）
  - スコア計算（Ace=1or11、絵札=10）
  - 勝敗判定（バースト、ディーラーバースト、Win/Lose/Draw）
  - イベント発行（CardDrawn, GameResult）

### ✅ バックエンド
- **ブロックチェーンサービス** ([blockchain.js](server/services/blockchain.js))
  - ethers.js によるコントラクト接続
  - ゲーム開始、カード引き、スタンド機能
  - 手札取得とスコア計算
  
- **REST API** ([blackjack.js](server/routes/blackjack.js))
  - `POST /api/blackjack/start` - ゲーム開始
  - `POST /api/blackjack/draw` - カードを引く
  - `POST /api/blackjack/stand` - スタンド（勝負）
  - `GET /api/blackjack/hand` - 現在の手札取得

### ✅ フロントエンド
- **ブラックジャックUI** ([blackjack.html](client/public/blackjack.html))
  - APIサーバー経由でブロックチェーンと連携
  - リアルタイムカード表示
  - スコア計算と勝敗表示
  - 所持金管理

## 🚀 起動方法

### 1. Hardhatローカルネットワーク起動
```bash
cd hardhat
npx hardhat node
```

### 2. スマートコントラクトのデプロイ（別ターミナル）
```bash
cd hardhat
npx hardhat ignition deploy ignition/modules/Game.js --network localhost
```

デプロイされたアドレスを確認:
```
GameModule#Game - 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 3. APIサーバー起動
```bash
cd server
npm run dev
```

サーバー起動時にブロックチェーンに自動接続:
```
✅ Blockchain connection initialized
📍 Contract address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
🚀 Server is running at http://localhost:3001
```

### 4. フロントエンド起動
```bash
cd client
python3 -m http.server 8000 --directory public
```

または
```bash
cd client/public
python3 -m http.server 8000
```

### 5. ブラウザでアクセス
```
http://localhost:8000/blackjack.html
```

## 🧪 APIテスト

統合テストスクリプトを実行:
```bash
./test_integration.sh
```

手動でAPIをテスト:
```bash
# ゲーム開始
curl -X POST http://localhost:3001/api/blackjack/start -H "Content-Type: application/json"

# カードを引く
curl -X POST http://localhost:3001/api/blackjack/draw -H "Content-Type: application/json"

# スタンド（勝負）
curl -X POST http://localhost:3001/api/blackjack/stand -H "Content-Type: application/json"

# 手札を取得
curl http://localhost:3001/api/blackjack/hand
```

## 📁 プロジェクト構造

```
PG_03/
├── hardhat/                    # ブロックチェーン（Hardhat）
│   ├── contracts/
│   │   └── Game.sol           # スマートコントラクト
│   ├── ignition/modules/
│   │   └── Game.js            # デプロイスクリプト
│   └── hardhat.config.js
│
├── server/                     # APIサーバー（Node.js + Express）
│   ├── index.js               # サーバーエントリーポイント
│   ├── services/
│   │   └── blockchain.js      # ブロックチェーン接続サービス
│   └── routes/
│       └── blackjack.js       # ブラックジャックAPI
│
├── client/                     # フロントエンド
│   └── public/
│       ├── blackjack.html     # ゲーム画面
│       ├── blackjack.js       # ゲームロジック（API連携）
│       └── blackjack.css      # スタイル
│
└── test_integration.sh         # 統合テストスクリプト
```

## 🎮 ゲームの流れ

1. **ゲーム開始** → スマートコントラクトでデッキをシャッフル
2. **カード配布** → プレイヤーとディーラーに2枚ずつ
3. **プレイヤーの選択**
   - Hit: カードをもう1枚引く
   - Stand: 勝負する
4. **ディーラーのターン** → 17点以上になるまで自動でカードを引く
5. **勝敗判定** → ブロックチェーン上で記録

## 🔧 技術スタック

- **ブロックチェーン**: Ethereum (Hardhat), Solidity 0.8.28
- **バックエンド**: Node.js, Express.js, ethers.js v6
- **フロントエンド**: HTML, CSS, JavaScript (Vanilla)
- **開発ツール**: nodemon, Hardhat Ignition

## 📝 注意事項

- ローカルテスト用のため、Hardhatのデフォルトアカウントを使用
- 本番環境では絶対に使用しないこと
- ブロックチェーンは起動のたびにリセットされる（再デプロイが必要）

## 🔗 エンドポイント

- **Hardhat Node**: http://127.0.0.1:8545/
- **API Server**: http://localhost:3001
- **Frontend**: http://localhost:8000

## ✅ 統合状態

| コンポーネント | 状態 | 説明 |
|--------------|------|------|
| スマートコントラクト | ✅ | デプロイ済み、動作確認済み |
| ブロックチェーン接続 | ✅ | ethers.js で接続成功 |
| APIサーバー | ✅ | 全エンドポイント実装済み |
| フロントエンド | ✅ | API経由でブロックチェーン連携 |
| 統合テスト | ✅ | 全機能動作確認済み |

---

**🎉 全ての未実装部分が完成しました！**
