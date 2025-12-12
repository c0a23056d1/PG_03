import React from "react";

export default function Header() {
  return (
    <header style={{ padding: 12, borderBottom: "1px solid #eee", marginBottom: 8 }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><strong>PokerLab</strong></div>
      </nav>
    </header>
  );
}