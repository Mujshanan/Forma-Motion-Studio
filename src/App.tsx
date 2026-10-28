import { useState } from "react";

type Tool = "select" | "draw" | "bone" | "hand" | "shape";
type Workspace = "Draw" | "Rig" | "Animate" | "Assets" | "Export";
type Mark = { id: number; x: number; y: number };

const tools: { id: Tool; label: string; shortcut: string; glyph: string }[] = [
  { id: "select", label: "Select", shortcut: "V", glyph: "↖" },
  { id: "draw", label: "Pen", shortcut: "B", glyph: "✎" },
  { id: "shape", label: "Shape", shortcut: "U", glyph: "◇" },
  { id: "bone", label: "Bone", shortcut: "A", glyph: "⌁" },
  { id: "hand", label: "Hand", shortcut: "H", glyph: "✋" }
];
const workspaces: Workspace[] = ["Draw", "Rig", "Animate", "Assets", "Export"];

export default function App() {
  const [tool, setTool] = useState<Tool>("select");
  const [workspace, setWorkspace] = useState<Workspace>("Draw");
  const [frame, setFrame] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [activePanel, setActivePanel] = useState("Layers");
  const [zoom, setZoom] = useState(100);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [selectedLayer, setSelectedLayer] = useState("Character");
  const [showBones, setShowBones] = useState(true);

  const chooseWorkspace = (next: Workspace) => {
    setWorkspace(next);
    if (next === "Rig") { setTool("bone"); setActivePanel("Rig"); }
    else if (next === "Animate") setActivePanel("Rig");
    else if (next === "Assets") setActivePanel("Layers");
    else if (next === "Draw") { setTool("select"); setActivePanel("Layers"); }
    else setActivePanel("Style");
  };

  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (tool !== "draw" && tool !== "shape") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 1920;
    const y = ((event.clientY - rect.top) / rect.height) * 1080;
    setMarks(current => [...current, { id: Date.now(), x, y }]);
  };

  return (
    <main className="app-shell">
      <header className="titlebar">
        <div className="brand-mark">F</div>
        <div className="brand-copy"><strong>FORMA <span>MOTION STUDIO</span></strong><small>Untitled Project · Local draft</small></div>
        <nav className="main-menu" aria-label="Main menu">
          <button onClick={() => window.alert("Project file actions are coming in a later milestone.")}>File</button>
          <button onClick={() => setActivePanel("Style")}>Edit</button>
          <button onClick={() => chooseWorkspace("Draw")}>Draw</button>
          <button onClick={() => chooseWorkspace("Animate")}>Animation</button>
          <button onClick={() => setZoom(100)}>View</button>
          <button onClick={() => window.alert("Forma Motion Studio · UI prototype")}>Help</button>
        </nav>
        <div className="titlebar-right"><span className="status-dot" /> Local preview <button className="primary-button" onClick={() => chooseWorkspace("Export")}>Export ↗</button></div>
      </header>

      <nav className="workspace-switcher" aria-label="Editor workspace">
        {workspaces.map((item, index) => <button key={item} className={workspace === item ? "workspace-tab active" : "workspace-tab"} onClick={() => chooseWorkspace(item)}><span>{["◫", "⌁", "◷", "▧", "⇧"][index]}</span>{item}</button>)}
        <span className="workspace-hint">CHARACTER ANIMATION WORKFLOW</span>
      </nav>

      <div className="workspace">
        <aside className="tool-rail" aria-label="Tools">
          <div className="rail-label">TOOLS</div>
          {tools.map(item => <button key={item.id} className={tool === item.id ? "tool-button selected" : "tool-button"} onClick={() => setTool(item.id)} title={item.label + " (" + item.shortcut + ")"} aria-pressed={tool === item.id}><span className={"tool-glyph glyph-" + item.id}>{item.glyph}</span><span>{item.label}</span><kbd>{item.shortcut}</kbd></button>)}
          <div className="rail-divider" />
          <button className="tool-button" onClick={() => setShowBones(!showBones)} aria-pressed={showBones}><span className="tool-glyph">◎</span><span>{showBones ? "Hide rig" : "Show rig"}</span></button>
          <div className="rail-bottom"><span className="rail-label">VIEW</span><button className="rail-mini" onClick={() => setZoom(Math.max(25, zoom - 25))}>−</button><span>{zoom}%</span><button className="rail-mini" onClick={() => setZoom(Math.min(200, zoom + 25))}>＋</button></div>
        </aside>

        <section className="center-column">
          <div className="document-tabs"><div className="doc-tab active"><span className="tab-dot" /> Untitled Project <span className="unsaved">●</span></div><div className="document-actions"><button onClick={() => setZoom(100)}>Fit</button><button onClick={() => setZoom(Math.max(25, zoom - 25))} aria-label="Zoom out">−</button><span>{zoom}%</span><button onClick={() => setZoom(Math.min(200, zoom + 25))} aria-label="Zoom in">＋</button></div></div>
          <div className="canvas-stage">
            <div className="canvas-toolbar"><span className="context-label">{workspace.toUpperCase()} / {tool.toUpperCase()}</span><span>Scene 01 · 1920 × 1080</span><span>{zoom}%</span></div>
            <div className="canvas-area">
              <div className="canvas-board">
                <div className="canvas-safe-area" />
                <svg className="character-canvas" viewBox="0 0 1920 1080" role="img" aria-label="Editable sample character on the animation artboard" onClick={handleCanvasClick}>
                  <defs><linearGradient id="shirt" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#b9a7ff"/><stop offset="100%" stopColor="#8271d7"/></linearGradient></defs>
                  <g className="sample-character" stroke="#20232b" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round">
                    <path d="M840 565 Q770 610 760 770 L790 800 L850 690 L900 610Z" fill="#d8a17f"/>
                    <path d="M1080 565 Q1150 610 1160 770 L1130 800 L1070 690 L1020 610Z" fill="#d8a17f"/>
                    <path d="M850 520 Q960 480 1070 520 L1110 760 Q960 815 810 760Z" fill="url(#shirt)"/>
                    <path d="M875 750 L1045 750 L1070 940 L1000 940 L960 810 L920 940 L850 940Z" fill="#3e5268"/>
                    <path d="M850 940 L925 940 L915 978 L820 978 Q810 960 850 940Z" fill="#e9eaf0"/>
                    <path d="M1000 940 L1070 940 Q1110 960 1090 978 L995 978Z" fill="#e9eaf0"/>
                    <path d="M870 310 Q870 245 960 245 Q1050 245 1050 310 L1040 430 Q1020 490 960 490 Q900 490 880 430Z" fill="#d8a17f"/>
                    <path d="M870 330 Q830 265 895 225 Q960 180 1025 225 Q1080 265 1050 340 L1025 300 L995 280 Q945 315 890 300Z" fill="#302b34"/>
                    <path d="M905 360 Q925 345 940 360" fill="none"/><path d="M980 360 Q995 345 1015 360" fill="none"/>
                    <ellipse cx="925" cy="380" rx="12" ry="18" fill="#24262d" stroke="none"/><ellipse cx="1000" cy="380" rx="12" ry="18" fill="#24262d" stroke="none"/>
                    <path d="M940 430 Q960 445 980 430" fill="none" strokeWidth="8"/>
                    <path d="M930 495 L960 535 L990 495" fill="#e9eaf0" strokeWidth="8"/>
                  </g>
                  {showBones && workspace === "Rig" && <g className="rig-overlay" stroke="#a9f16c" strokeWidth="7" fill="#20232b"><path d="M960 480 L960 610 L960 780 L910 940 M960 780 L1010 940 M960 610 L850 650 M960 610 L1070 650" fill="none"/>{[[960,480],[960,610],[960,780],[910,940],[1010,940],[850,650],[1070,650]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="13" />)}</g>}
                  {marks.map(mark => <g key={mark.id}><circle cx={mark.x} cy={mark.y} r="28" fill={tool === "shape" ? "#a9f16c" : "none"} stroke="#a9f16c" strokeWidth="8"/>{tool === "draw" && <path d={`M ${mark.x-42} ${mark.y+28} Q ${mark.x} ${mark.y-40} ${mark.x+42} ${mark.y+12}`} fill="none" stroke="#a9f16c" strokeWidth="8" strokeLinecap="round"/>}</g>)}
                </svg>
                <div className="canvas-corner-label">ARTBOARD 01 <span>1920 × 1080</span></div>
                <div className="canvas-coordinates">X 960 · Y 540</div>
              </div>
            </div>
          </div>

          <section className="timeline-panel">
            <div className="panel-heading timeline-heading"><div><span className="panel-kicker">{workspace === "Rig" ? "SKELETON" : "ANIMATION"}</span><h2>{workspace === "Rig" ? "Rig timeline" : "Timeline"}</h2></div><div className="timeline-controls"><button onClick={() => setFrame(Math.max(1, frame - 1))} aria-label="Previous frame">◀</button><button className={playing ? "play-button active" : "play-button"} onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause playback" : "Play"}>{playing ? "Ⅱ" : "▶"}</button><button onClick={() => setFrame(frame + 1)} aria-label="Next frame">▶</button><span className="frame-readout">FRAME <b>{String(frame).padStart(3, "0")}</b></span></div></div>
            <div className="timeline-ruler"><span>0</span>{Array.from({ length: 11 }, (_, i) => <span key={i}>{i * 6 + 6}</span>)}</div>
            <div className="timeline-track"><div className="track-name"><span className="track-eye">◉</span>{selectedLayer}</div><div className="track-cells">{Array.from({ length: 66 }, (_, i) => <button key={i} className={i + 1 === frame ? "track-cell current" : i % 6 === 0 ? "track-cell major" : "track-cell"} onClick={() => setFrame(i + 1)} aria-label={"Go to frame " + (i + 1)} />)}</div><div className="playhead" style={{ left: `calc(156px + (100% - 156px) * ${(frame - 1) / 66})` }} /></div>
            <div className="timeline-footer"><span>24 FPS</span><span>{((frame - 1) / 24).toFixed(2)} s</span><span>● {marks.length ? marks.length + " canvas mark(s)" : "Sample character · no keyframes"}</span><button onClick={() => setFrame(1)}>Go to start ↤</button></div>
          </section>
        </section>

        <aside className="inspector">
          <div className="inspector-tabs">{["Layers", "Rig", "Style"].map(panel => <button key={panel} onClick={() => setActivePanel(panel)} className={activePanel === panel ? "inspector-tab active" : "inspector-tab"}>{panel}</button>)}</div>
          {activePanel === "Layers" && <><div className="panel-heading"><div><span className="panel-kicker">SCENE CONTENTS</span><h2>Layers</h2></div><button className="icon-button" title="Add layer" onClick={() => { setSelectedLayer("New Layer"); setActivePanel("Style"); }}>＋</button></div><div className="layer-list">{["Character", "  Head", "  Body", "  Arms", "  Legs", "Background"].map((layer, i) => <button key={layer} onClick={() => setSelectedLayer(layer.trim())} className={selectedLayer === layer.trim() ? "layer-row selected" : "layer-row"}><span>{i === 0 ? "⌄" : "·"}</span><span className="layer-icon">{i === 5 ? "▱" : i === 0 ? "♙" : "◇"}</span><span>{layer}</span><span className="layer-eye">◉</span></button>)}</div><div className="layer-note">Sample layers are placeholders for the first UI milestone.</div></>}
          {activePanel === "Rig" && <><div className="panel-heading"><div><span className="panel-kicker">CHARACTER</span><h2>Rig Setup</h2></div></div><div className="rig-card"><span className="rig-icon">⌁</span><div><strong>{showBones ? "Skeleton overlay visible" : "Skeleton overlay hidden"}</strong><p>7 sample joints · 6 links</p></div><button onClick={() => setShowBones(!showBones)}>{showBones ? "Hide" : "Show"}</button></div><div className="properties-section"><div className="section-title">SELECTED BONE <span>⌄</span></div><div className="property-row"><span>Bone</span><strong>Spine</strong></div><div className="property-row"><span>Rotation</span><strong>0.0°</strong></div><div className="property-row"><span>Length</span><strong>170 px</strong></div></div></>}
          {activePanel === "Style" && <><div className="panel-heading"><div><span className="panel-kicker">APPEARANCE</span><h2>Style</h2></div></div><div className="properties-section"><div className="section-title">FILL COLOR</div><div className="swatches"><button style={{background:"#b9a7ff"}} aria-label="Lavender fill"/><button style={{background:"#a9f16c"}} aria-label="Lime fill"/><button style={{background:"#f4b47a"}} aria-label="Peach fill"/><button style={{background:"#3e5268"}} aria-label="Blue fill"/></div><div className="property-row"><span>Selected layer</span><strong>{selectedLayer}</strong></div><div className="property-row"><span>Stroke</span><strong>6 px</strong></div></div><div className="inspector-empty"><span className="empty-icon">◈</span><strong>Style controls preview</strong><p>Color swatches are visual controls for the next implementation pass.</p></div></>}
          {workspace === "Assets" && <div className="asset-preview"><strong>Character library</strong><div className="asset-thumb">♙</div><span>Turnarounds · Expressions · Hand poses</span></div>}
          {workspace === "Export" && <div className="export-preview"><span className="empty-icon">⇧</span><strong>Export scene</strong><p>Output options will be enabled after animation and rendering are implemented.</p><button onClick={() => chooseWorkspace("Animate")}>Back to animation</button></div>}
          <div className="properties-section"><div className="section-title">PROJECT SETTINGS <span>⌄</span></div><div className="property-row"><span>Width</span><strong>1920 px</strong></div><div className="property-row"><span>Height</span><strong>1080 px</strong></div><div className="property-row"><span>Frame rate</span><strong>24 fps</strong></div></div>
          <div className="inspector-bottom"><span className="status-dot" /> UI prototype <span>v0.1.0</span></div>
        </aside>
      </div>
      <footer className="statusbar"><span><span className="status-dot" /> READY</span><span>{workspace.toUpperCase()} WORKSPACE</span><span>{tool.toUpperCase()} TOOL</span><span>FRAME {String(frame).padStart(3, "0")}</span><span className="statusbar-spacer" /><span>FORMA MOTION STUDIO · UI MILESTONE</span></footer>
    </main>
  );
}
