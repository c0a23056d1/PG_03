import React from "react";

export default function Home() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>ゲーム選択</h1>
      <p>プレイしたいゲームを選んでください。</p>

      <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
        <article style={{
          flex: "1 1 300px",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 20,
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
        }}>
          <h2>ポーカー</h2>
          <p>ブロックチェーン検証用のポーカー（画面は別ページ）。</p>
          <a href="/poker" style={{ display: "inline-block", marginTop: 12 }}>ポーカーへ</a>
        </article>

        <article style={{
          flex: "1 1 300px",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 20,
          boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
        }}>
          <h2>ブラックジャック</h2>
          <p>ブラックジャック（画面は別ページ）。</p>
          <a href="/blackjack" style={{ display: "inline-block", marginTop: 12 }}>ブラックジャックへ</a>
        </article>
      </div>

      <section style={{ marginTop: 32 }}>
        <h3>メモ</h3>
        <ul>
          <li>ここではゲームの要素は扱いません。各ゲームは /poker や /blackjack に実装する。</li>
          <li>アプリ内遷移に React Router を使う場合は &lt;Link to="/poker"&gt; 等に置き換える。</li>
        </ul>
      </section>
    </main>
  );
}