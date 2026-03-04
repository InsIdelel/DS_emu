/* =============================================
   DS VAULT — MAIN STYLES
   Aesthetic: Dark retro-futuristic, CRT terminal
============================================= */

:root {
  --bg: #08090d;
  --bg2: #0e1018;
  --bg3: #141720;
  --surface: #1a1e2e;
  --surface2: #232840;
  --border: #2a3050;
  --border2: #3a4570;
  --accent: #00e5ff;
  --accent2: #ff3d71;
  --accent3: #a259ff;
  --text: #c8d0e8;
  --text2: #7880a0;
  --text3: #454d6a;
  --glow: rgba(0,229,255,0.15);
  --glow2: rgba(0,229,255,0.05);
  --font-mono: 'Share Tech Mono', monospace;
  --font-display: 'Orbitron', sans-serif;
  --font-body: 'Rajdhani', sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--text); font-family: var(--font-body); font-size: 16px; min-height: 100vh; overflow-x: hidden; position: relative; }

.scanlines { position: fixed; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px); pointer-events: none; z-index: 1000; }
.noise { position: fixed; inset: 0; opacity: 0.025; pointer-events: none; z-index: 999; }

/* HEADER */
.header { position: sticky; top: 0; z-index: 100; background: rgba(8,9,13,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
.header-inner { max-width: 1400px; margin: 0 auto; padding: 0 2rem; height: 64px; display: flex; align-items: center; gap: 2rem; }
.logo { display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-display); font-size: 1.25rem; font-weight: 900; letter-spacing: 0.1em; flex-shrink: 0; }
.logo-icon { color: var(--accent); font-size: 1.5rem; animation: pulse-glow 3s ease-in-out infinite; }
@keyframes pulse-glow { 0%,100% { text-shadow: 0 0 8px var(--accent), 0 0 20px var(--accent); } 50% { text-shadow: 0 0 4px var(--accent); } }

.nav { display: flex; gap: 0.25rem; margin-left: auto; }
.nav-item { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.1em; padding: 0.4rem 1rem; border: 1px solid transparent; color: var(--text2); cursor: pointer; transition: all 0.2s; border-radius: 2px; }
.nav-item:hover, .nav-item.active { color: var(--accent); border-color: var(--accent); background: var(--glow2); }
.header-stats { font-family: var(--font-mono); font-size: 0.7rem; color: var(--text3); flex-shrink: 0; display: flex; gap: 0.5rem; align-items: center; }
.sep { color: var(--border2); }

/* MAIN */
.main { max-width: 1400px; margin: 0 auto; padding: 0 2rem 4rem; }

/* HERO */
.hero { display: flex; align-items: center; justify-content: space-between; padding: 4rem 0 3rem; gap: 2rem; }
.hero-text h1 { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 900; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 1rem; }
.hero-text p { color: var(--text2); font-size: 1.1rem; font-weight: 300; letter-spacing: 0.05em; }
.accent { color: var(--accent); }

/* DS Visual */
.ds-visual { flex-shrink: 0; width: 160px; filter: drop-shadow(0 0 30px rgba(0,229,255,0.2)); animation: float 4s ease-in-out infinite; }
@keyframes float { 0%,100% { transform: translateY(0px) rotate(-3deg); } 50% { transform: translateY(-12px) rotate(-3deg); } }
.ds-top { background: linear-gradient(160deg, #1e2235 0%, #141725 100%); border-radius: 10px 10px 4px 4px; padding: 12px; border: 1px solid var(--border2); height: 90px; display: flex; align-items: center; justify-content: center; }
.ds-screen-top { background: #000; border-radius: 4px; width: 120px; height: 65px; position: relative; overflow: hidden; border: 1px solid #333; }
.ds-screen-glow { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,229,255,0.15), rgba(162,89,255,0.1)); animation: screen-flicker 4s ease-in-out infinite; }
@keyframes screen-flicker { 0%,100% { opacity: 1; } 92% { opacity: 1; } 93% { opacity: 0.7; } 94% { opacity: 1; } }
.ds-hinge { height: 8px; background: #0e1018; border-left: 1px solid var(--border2); border-right: 1px solid var(--border2); }
.ds-bottom { background: linear-gradient(160deg, #1a1e30 0%, #111520 100%); border-radius: 4px 4px 14px 14px; padding: 8px 12px 12px; border: 1px solid var(--border2); border-top: none; }
.ds-screen-bottom { background: #000; border-radius: 3px; height: 55px; margin-bottom: 8px; border: 1px solid #333; }
.ds-buttons { display: flex; justify-content: space-between; align-items: center; }
.ds-dpad { width: 32px; height: 32px; background: linear-gradient(135deg, #2a2f45, #1e2235); border-radius: 2px; border: 1px solid var(--border2); }
.ds-abxy { display: grid; grid-template-areas: ". x ." "y . a" ". b ."; gap: 2px; font-family: var(--font-mono); font-size: 0.5rem; }
.btn-a { grid-area: a; color: var(--accent2); }
.btn-b { grid-area: b; color: #ffcc00; }
.btn-x { grid-area: x; color: var(--accent); }
.btn-y { grid-area: y; color: #66ff88; }

/* UPLOAD ZONE */
.upload-zone { border: 2px dashed var(--border2); border-radius: 8px; background: var(--bg2); margin-bottom: 2rem; transition: all 0.3s; animation: fadeIn 0.3s ease; }
.upload-zone.drag-over { border-color: var(--accent); background: var(--glow2); box-shadow: 0 0 30px var(--glow); }
.upload-inner { padding: 3rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
.upload-icon { font-size: 2.5rem; color: var(--accent); line-height: 1; }
.upload-title { font-size: 1.1rem; font-weight: 700; letter-spacing: 0.05em; }
.upload-sub { color: var(--text2); font-size: 0.9rem; }

/* TOOLBAR */
.toolbar { display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; }
.search-wrap { flex: 1; position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 1rem; color: var(--text3); font-size: 1.1rem; pointer-events: none; }
.search-input { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 0.65rem 1rem 0.65rem 2.5rem; color: var(--text); font-family: var(--font-mono); font-size: 0.85rem; outline: none; transition: border-color 0.2s; }
.search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--glow2); }
.search-input::placeholder { color: var(--text3); }
.sort-select { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 0.65rem 1rem; color: var(--text); font-family: var(--font-mono); font-size: 0.8rem; outline: none; cursor: pointer; }
.btn-clear { background: transparent; border: 1px solid var(--border); border-radius: 4px; padding: 0.65rem 1rem; color: var(--text3); font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
.btn-clear:hover { border-color: var(--accent2); color: var(--accent2); }

/* GAME GRID */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; }
.empty-state { grid-column: 1/-1; text-align: center; padding: 6rem 2rem; color: var(--text3); font-family: var(--font-mono); font-size: 0.9rem; line-height: 2; }
.empty-icon { font-size: 3rem; color: var(--border2); margin-bottom: 1rem; display: block; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* GAME CARD */
.game-card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; overflow: hidden; cursor: default; transition: all 0.25s; position: relative; animation: fadeIn 0.3s ease; }
.game-card:hover { border-color: var(--accent); transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,229,255,0.12), 0 0 0 1px rgba(0,229,255,0.1); }
.game-card-cover { height: 130px; background: linear-gradient(135deg, var(--bg3) 0%, var(--surface2) 100%); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.game-card-cover::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, var(--surface) 0%, transparent 40%); }
.cover-icon { font-size: 3rem; color: var(--border2); z-index: 1; }
.game-card-info { padding: 0.85rem 1rem; }
.game-card-title { font-family: var(--font-body); font-weight: 700; font-size: 0.95rem; line-height: 1.3; margin-bottom: 0.35rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.game-card-meta { font-family: var(--font-mono); font-size: 0.68rem; color: var(--text3); display: flex; justify-content: space-between; margin-bottom: 0.6rem; }
.game-card-actions { display: flex; gap: 0.5rem; }
.card-btn { flex: 1; padding: 0.45rem; border-radius: 3px; border: 1px solid var(--border2); background: transparent; color: var(--text2); font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s; text-align: center; }
.card-btn.primary { background: var(--accent); border-color: var(--accent); color: var(--bg); font-weight: 700; }
.card-btn.primary:hover { filter: brightness(1.2); }
.card-btn:not(.primary):hover { border-color: var(--accent); color: var(--accent); }
.save-badge { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); border: 1px solid var(--accent3); border-radius: 20px; padding: 2px 8px; font-family: var(--font-mono); font-size: 0.6rem; color: var(--accent3); z-index: 2; }

/* BUTTONS */
.btn-primary { background: var(--accent); border: none; border-radius: 4px; padding: 0.7rem 1.5rem; color: var(--bg); font-family: var(--font-display); font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { filter: brightness(1.15); box-shadow: 0 0 20px var(--glow); }
.btn-secondary { background: transparent; border: 1px solid var(--border2); border-radius: 4px; padding: 0.6rem 1.2rem; color: var(--text); font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s; }
.btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
.btn-danger { background: var(--accent2); border: none; border-radius: 4px; padding: 0.6rem 1.2rem; color: #fff; font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadeIn 0.2s ease; }
.modal { background: var(--bg2); border: 1px solid var(--border2); border-radius: 8px; width: 100%; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 30px 80px rgba(0,0,0,0.5); }
.modal-sm { max-width: 380px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); }
.modal-header h2 { font-family: var(--font-display); font-size: 0.85rem; letter-spacing: 0.12em; color: var(--accent); }
.modal-close { background: none; border: none; color: var(--text3); cursor: pointer; font-size: 1rem; transition: color 0.2s; padding: 0.25rem; }
.modal-close:hover { color: var(--accent2); }
.modal-body { padding: 1.25rem 1.5rem; overflow-y: auto; flex: 1; }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; gap: 0.75rem; justify-content: flex-end; }
.empty-modal { color: var(--text3); font-family: var(--font-mono); font-size: 0.82rem; text-align: center; padding: 2rem; }

/* SAVE ITEMS */
.save-item { display: flex; align-items: center; gap: 1rem; padding: 0.85rem; border: 1px solid var(--border); border-radius: 6px; margin-bottom: 0.5rem; background: var(--surface); transition: border-color 0.2s; }
.save-item:hover { border-color: var(--border2); }
.save-item-icon { font-size: 1.5rem; flex-shrink: 0; }
.save-item-info { flex: 1; }
.save-item-name { font-weight: 700; font-size: 0.9rem; margin-bottom: 0.2rem; }
.save-item-meta { font-family: var(--font-mono); font-size: 0.68rem; color: var(--text3); }
.save-item-actions { display: flex; gap: 0.5rem; }
.save-action-btn { background: transparent; border: 1px solid var(--border2); border-radius: 3px; padding: 0.3rem 0.6rem; color: var(--text2); font-family: var(--font-mono); font-size: 0.65rem; cursor: pointer; transition: all 0.2s; }
.save-action-btn:hover { border-color: var(--accent); color: var(--accent); }
.save-action-btn.danger:hover { border-color: var(--accent2); color: var(--accent2); }

/* TOAST */
.toast { position: fixed; bottom: 2rem; right: 2rem; background: var(--surface2); border: 1px solid var(--accent); border-radius: 6px; padding: 0.85rem 1.25rem; font-family: var(--font-mono); font-size: 0.8rem; color: var(--text); box-shadow: 0 8px 30px rgba(0,0,0,0.4); z-index: 9999; transform: translateY(100px); opacity: 0; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-width: 320px; pointer-events: none; }
.toast.show { transform: translateY(0); opacity: 1; }
.toast.error { border-color: var(--accent2); }

@media (max-width: 768px) {
  .hero { flex-direction: column; padding: 2rem 0; }
  .ds-visual { display: none; }
  .header-stats { display: none; }
  .grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
  .toolbar { flex-wrap: wrap; }
}
