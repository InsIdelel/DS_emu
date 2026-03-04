import React, { useState } from "react";
import { LibraryPage } from "../pages/LibraryPage";
import { PlayerPage } from "../pages/PlayerPage";

export type Route =
  | { name: "library" }
  | { name: "player"; sha1: string };

export function App() {
  const [route, setRoute] = useState<Route>({ name: "library" });

  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
          <h1 style={styles.h1}>DS Web Emu</h1>
          <span style={styles.badge}>melonds-wasm adapter + shell</span>
        </div>
        <nav style={{ display: "flex", gap: 10 }}>
          <button style={styles.btn} onClick={() => setRoute({ name: "library" })} disabled={route.name==="library"}>
            Bibliothèque
          </button>
          {route.name === "player" && (
            <button style={styles.btn} onClick={() => setRoute({ name: "library" })}>
              Quitter
            </button>
          )}
        </nav>
      </header>

      <main style={styles.main}>
        {route.name === "library" && (
          <LibraryPage onPlay={(sha1) => setRoute({ name: "player", sha1 })} />
        )}
        {route.name === "player" && (
          <PlayerPage sha1={route.sha1} onExit={() => setRoute({ name: "library" })} />
        )}
      </main>

      <footer style={styles.footer}>
        <small>
          Tout est local (IndexedDB). Le core WASM n’est pas inclus : copiez a.out.js/a.out.wasm dans <code>public/cores/melonds/</code>.
        </small>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: { fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", maxWidth: 1100, margin: "0 auto", padding: 16, color: "#111" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: 12, border: "1px solid #e5e5e5", borderRadius: 12 },
  h1: { margin: 0, fontSize: 22 },
  badge: { fontSize: 12, border: "1px solid #e5e5e5", borderRadius: 999, padding: "4px 10px", background: "#fafafa" },
  main: { paddingTop: 16 },
  footer: { marginTop: 18, paddingTop: 12, borderTop: "1px solid #eee" },
  btn: { padding: "8px 12px", borderRadius: 10, border: "1px solid #e5e5e5", background: "#fff", cursor: "pointer" }
};
