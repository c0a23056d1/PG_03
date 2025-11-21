import React from "react";

export default function Header() {
  return (
    <header style={{ padding: 12, borderBottom: "1px solid #eee", marginBottom: 8 }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><strong>PokerLab</strong></div>
        <div>
          <a href="/" style={{ marginRight: 12 }}>Home</a>
          <a href="/docs">Docs</a>
        </div>
      </nav>
    </header>
  );
}