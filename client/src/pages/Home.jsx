import React from "react";

export default function Home() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Poker 系ゲーム - ゲーム選択</h1>
      <p>遊びたいゲームを選んでください。</p>

      <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
        <div style={{
          flex: "1 1 300px",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 20,
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
        }}>
          <h2>ポーカー</h2>
          <p>ブロックチェーンで安全性を検証するポーカーゲーム。</p>
          <button style={{ marginTop: 12 }} onClick={() => alert("ポーカー画面へ（未実装）")}>遊ぶ</button>
        </div>

        <div style={{
          flex: "1 1 300px",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 20,
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
        }}>
          <h2>ブラックジャック</h2>
          <p>ブラックジャック（安全性検証用モード）。</p>
          <button style={{ marginTop: 12 }} onClick={() => alert("ブラックジャック画面へ（未実装）")}>遊ぶ</button>
        </div>
      </div>

      <section style={{ marginTop: 32 }}>
        <h3>開発メモ</h3>
        <ul>
          <li>各「遊ぶ」ボタンはルーティング先に繋いでください（React Router 推奨）。</li>
          <li>ウォレット接続やサーバー連携はここから呼ぶと良いです。</li>
        </ul>
      </section>
    </main>
  );
}