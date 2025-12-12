import React from "react";

export default function Home() {
  return (
    <div className="hero">
      <iframe
        className="hero-iframe"
        title="poker-loop"
        src="https://www.youtube.com/embed/9uZ8CCa0t4Y?autoplay=1&mute=1&controls=0&loop=1&playlist=9uZ8CCa0t4Y&rel=0&modestbranding=1"
        frameBorder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        aria-hidden="true"
      />

      <div className="hero-overlay">
        <main className="main-container">
          <header className="home-header">
            <h1 className="page-title" data-text="GAME SELECT">ゲーム選択</h1>
            <p className="page-sub">下のカードを選んでゲームを開始してください。</p>
          </header>

          <div className="game-grid" role="list">
            <article className="card" role="listitem" aria-labelledby="poker-title">
              <div className="card-body">
                <h2 id="poker-title" className="card-title">
                  <span className="badge">HOT</span> ポーカー
                </h2>
                <p className="card-desc">自分の実力と運を信じよう</p>
              </div>
              <div className="card-actions">
                <a className="card-btn" href="/poker" role="button" aria-label="ポーカーをプレイ">
                  PLAY POKER
                </a>
              </div>
            </article>

            <article className="card" role="listitem" aria-labelledby="bj-title">
              <div className="card-body">
                <h2 id="bj-title" className="card-title">
                  <span className="badge alt">NEW</span> ブラックジャック
                </h2>
                <p className="card-desc">シンプルでテンポの良い対戦。高度な読みあいを制するのは？！</p>
              </div>
              <div className="card-actions">
                <a className="card-btn outline" href="test_blackjack.html" role="button" aria-label="ブラックジャックをプレイ">
                  PLAY BJ
                </a>
              </div>
            </article>
          </div>

          <section className="memo" aria-hidden="true">{/* デザイン枠のみ */}</section>
        </main>
      </div>
    </div>
  );
}