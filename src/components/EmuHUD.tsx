import React from "react";

export function EmuHUD(props: {
  romName: string;
  sha1: string;
  status: string;
  onExit: () => void;
  onSaveState: (slot: number) => void;
  onLoadState: (slot: number) => void;
  onQuickSave: () => void;
  onQuickLoad: () => void;
}) {
  return (
    <div style={styles.wrap}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {props.romName}
        </div>
        <div style={{ fontSize: 12, color: "#666" }}>{props.sha1.slice(0, 8)}…</div>
        <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>{props.status}</div>
      </div>

      <div style={styles.actions}>
        <button style={styles.btn} onClick={props.onQuickSave}>Quick Save</button>
        <button style={styles.btn} onClick={props.onQuickLoad}>Quick Load</button>

        <div style={{ width: 1, background: "#e5e5e5", margin: "0 8px" }} />

        {[1,2,3].map((slot) => (
          <div key={slot} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#666" }}>Slot {slot}</span>
            <button style={styles.btnSmall} onClick={() => props.onSaveState(slot)}>Save</button>
            <button style={styles.btnSmall} onClick={() => props.onLoadState(slot)}>Load</button>
          </div>
        ))}

        <div style={{ width: 1, background: "#e5e5e5", margin: "0 8px" }} />
        <button style={styles.btnDanger} onClick={props.onExit}>Quitter</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: 12, border: "1px solid #e5e5e5", borderRadius: 12, background: "#fff" },
  actions: { display: "flex", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center", gap: 8 },
  btn: { padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer" },
  btnSmall: { padding: "6px 8px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 12 },
  btnDanger: { padding: "8px 10px", borderRadius: 10, border: "1px solid #f0c", background: "#fff", cursor: "pointer" }
};
