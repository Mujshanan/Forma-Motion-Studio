import { useState } from "react";

type Tool = "select" | "draw" | "bone";
const tools: { id: Tool; label: string; shortcut: string }[] = [
  { id: "select", label: "Select", shortcut: "V" },
  { id: "draw", label: "Draw", shortcut: "B" },
  { id: "bone", label: "Bone", shortcut: "A" }
];

export default function App() {
  const [tool, setTool] = useState<Tool>("select");
  const [frame, setFrame] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [activePanel, setActivePanel] = useState("Layers");

  return (
    <main className="app-shell">
      <header className="titlebar">
        <div className="brand-mark">F</div>
        <div className="brand-copy">
          <strong>FORMA <span>MOTION STUDIO</span></strong>
          <small>Untitled Project</small>
        </div>
        <nav className="main-menu" aria-label="Main menu">
          <button>File</button><button>Edit</button><button>Draw</button><button>Animation</button><button>View</button><button>Help</button>
        </nav>
        <div className="titlebar-right"><span className="status-dot" /> All changes local <button className="primary-button">Export</button></div>
      </header>

      <div className="workspace">
        <aside className="tool-rail" aria-label="Tools">
          <div className="rail-label">TOOLS</div>
          {tools.map((item) => (
            <button key={item.id} className={tool === item.id ? "tool-button selected" : "tool-button"} onClick={() => setTool(item.id)} title={item.label + " (" + item.shortcut + ")"} aria-pressed={tool === item.id}>
              <span className={"tool-glyph glyph-" + item.id}>{item.id === "select" ? "↖" : item.id === "draw" ? "✎" : "⌁"}</span>
              <span>{item.label}</span><kbd>{item.shortcut}</kbd>
            </button>
          ))}
          <div className="rail-divider" />
          <button className="tool-button" title="Hand tool"><span className="tool-glyph">✋</span><span>Hand</span><kbd>H</kbd></button>
          <button className="tool-button" title="Shape tool"><span className="tool-glyph">◇</span><span>Shape</span><kbd>U</kbd></button>
        </aside>

        <section className="center-column">
          <div className="document-tabs"><div className="doc-tab active"><span className="tab-dot" /> Untitled Project <span className="unsaved">*</span></div><div className="document-actions"><button title="Fit canvas">Fit</button><button title="Zoom out">−</button><span>100%</span><button title="Zoom in">+</button></div></div>
          <div className="canvas-stage">
            <div className="canvas-toolbar"><span className="context-label">{tool === "select" ? "SELECT TOOL" : tool === "draw" ? "FREEHAND DRAW" : "BONE TOOL"}</span><span>Canvas · 1920 × 1080</span><span>100%</span></div>
            <div className="canvas-area">
              <div className="canvas-board">
                <div className="canvas-safe-area" />
                <div className="welcome-art" aria-label="Empty canvas">
                  <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
                  <div className="art-shape shape-circle" /><div className="art-shape shape-square" /><div className="art-shape shape-triangle" />
                  <div className="art-center">F</div>
                </div>
                <div className="canvas-empty-copy"><strong>Your next scene starts here.</strong><span>Choose Draw to create artwork, or import an image to get started.</span><button className="canvas-cta" onClick={() => setTool("draw")}>Start drawing <span>↗</span></button></div>
                <div className="canvas-coordinates">X 960 · Y 540</div>
              </div>
            </div>
          </div>

          <section className="timeline-panel">
            <div className="panel-heading timeline-heading"><div><span className="panel-kicker">ANIMATION</span><h2>Timeline</h2></div><div className="timeline-controls"><button onClick={() => setFrame(Math.max(1, frame - 1))} aria-label="Previous frame">◀</button><button className={playing ? "play-button active" : "play-button"} onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause playback" : "Play"}>{playing ? "Ⅱ" : "▶"}</button><button onClick={() => setFrame(frame + 1)} aria-label="Next frame">▶</button><span className="frame-readout">FRAME <b>{String(frame).padStart(3, "0")}</b></span></div></div>
            <div className="timeline-ruler"><span>0</span>{Array.from({ length: 11 }, (_, i) => <span key={i}>{i * 6 + 6}</span>)}</div>
            <div className="timeline-track"><div className="track-name"><span className="track-eye">◉</span> Character</div><div className="track-cells">{Array.from({ length: 66 }, (_, i) => <button key={i} className={i + 1 === frame ? "track-cell current" : i % 6 === 0 ? "track-cell major" : "track-cell"} onClick={() => setFrame(i + 1)} aria-label={"Go to frame " + (i + 1)} />)}</div><div className="playhead" style={{ left: `calc(156px + (100% - 156px) * ${(frame - 1) / 66})` }} /></div>
            <div className="timeline-footer"><span>24 FPS</span><span>0.0 s</span><span>● No keyframes yet</span><button onClick={() => setFrame(1)}>Go to start ↤</button></div>
          </section>
        </section>

        <aside className="inspector">
          <div className="inspector-tabs">{["Layers", "Rig", "Style"].map((panel) => <button key={panel} onClick={() => setActivePanel(panel)} className={activePanel === panel ? "inspector-tab active" : "inspector-tab"}>{panel}</button>)}</div>
          {activePanel === "Layers" && <><div className="panel-heading"><div><span className="panel-kicker">SCENE</span><h2>Layers</h2></div><button className="icon-button" title="Add layer">＋</button></div><div className="layer-list"><div className="layer-row selected"><span>⌄</span><span className="layer-icon">▱</span><span>Character</span><span className="layer-eye">◉</span></div><div className="layer-empty">Your artwork layers will appear here.</div></div></>}
          {activePanel === "Rig" && <><div className="panel-heading"><div><span className="panel-kicker">CHARACTER</span><h2>Rig Setup</h2></div></div><div className="inspector-empty"><span className="empty-icon">⌁</span><strong>No bones yet</strong><p>Choose the Bone tool to begin building a character rig.</p><button onClick={() => setTool("bone")}>Select Bone tool</button></div></>}
          {activePanel === "Style" && <><div className="panel-heading"><div><span className="panel-kicker">APPEARANCE</span><h2>Style</h2></div></div><div className="inspector-empty"><span className="empty-icon">◈</span><strong>Nothing selected</strong><p>Select an artwork element to edit its fill and stroke.</p></div></>}
          <div className="properties-section"><div className="section-title">PROJECT SETTINGS <span>⌄</span></div><div className="property-row"><span>Width</span><strong>1920 px</strong></div><div className="property-row"><span>Height</span><strong>1080 px</strong></div><div className="property-row"><span>Frame rate</span><strong>24 fps</strong></div></div>
          <div className="inspector-bottom"><span className="status-dot" /> Editor preview <span>v0.1.0</span></div>
        </aside>
      </div>
      <footer className="statusbar"><span><span className="status-dot" /> READY</span><span>{tool.toUpperCase()} TOOL</span><span>FRAME {String(frame).padStart(3, "0")}</span><span className="statusbar-spacer" /><span>FORMA MOTION STUDIO · EARLY DEVELOPMENT</span></footer>
    </main>
  );
}