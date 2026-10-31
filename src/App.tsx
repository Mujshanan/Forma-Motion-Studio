import { useState } from "react";

type Workspace = "Animate" | "Draw" | "Build";
type Panel = "Properties" | "Layers" | "Rig";

const toolGroups = [
  { label: "EDIT", items: [{ name: "Select", key: "V", glyph: "↖" }, { name: "Move", key: "M", glyph: "✥" }, { name: "Rotate", key: "R", glyph: "⟳" }, { name: "Edit points", key: "P", glyph: "✣" }] },
  { label: "CREATE", items: [{ name: "Pencil", key: "B", glyph: "✎" }, { name: "Line", key: "L", glyph: "╱" }, { name: "Rectangle", key: "U", glyph: "□" }, { name: "Ellipse", key: "O", glyph: "◯" }, { name: "Bone", key: "A", glyph: "⌁" }, { name: "Pan", key: "H", glyph: "✋" }] }
];

export default function App() {
  const [workspace, setWorkspace] = useState<Workspace>("Animate");
  const [tool, setTool] = useState("Select");
  const [panel, setPanel] = useState<Panel>("Properties");
  const [zoom, setZoom] = useState(100);
  const [frame, setFrame] = useState(1);
  const [playing, setPlaying] = useState(false);

  return <main className="studio-shell">
    <header className="studio-topbar">
      <div className="topbar-left">
        <div className="studio-brand"><span className="brand-glyph">F</span><span>Forma Motion Studio</span><span className="chevron">⌄</span></div>
        <nav className="menu-items" aria-label="Application menu"><button>File</button><button>Edit</button><button>View</button><button>Help</button></nav>
        <div className="project-tabs"><div className="project-tab active"><span className="file-dot" />UI Preview</div></div>
      </div>
      <div className="mode-switch" role="group" aria-label="Workspace">
        {(["Animate", "Draw", "Build"] as Workspace[]).map(mode => <button key={mode} className={workspace === mode ? "mode-button active" : "mode-button"} onClick={() => setWorkspace(mode)}><span className="mode-dot" />{mode}</button>)}
      </div>
      <div className="topbar-right"><span className="topbar-separator" /><span className="save-button">UI-only build</span><span className="export-button">Preview</span></div>
    </header>

    <div className="studio-workspace">
      <aside className="left-tools">
        <div className="tools-caption">TOOLS</div>
        {toolGroups.map(group => <section className="tool-group" key={group.label}><div className="tool-group-label">{group.label}</div>{group.items.map(item => <button key={item.name} className={tool === item.name ? "studio-tool active" : "studio-tool"} onClick={() => setTool(item.name)} title={item.name + " (" + item.key + ")"}><span className="tool-icon">{item.glyph}</span><span>{item.name}</span><kbd>{item.key}</kbd></button>)}</section>)}
        <div className="tool-spacer" />
        <div className="zoom-control"><span>ZOOM</span><div><button onClick={() => setZoom(v => Math.max(25, v - 25))}>−</button><b>{zoom}%</b><button onClick={() => setZoom(v => Math.min(200, v + 25))}>＋</button></div><button className="fit-button" onClick={() => setZoom(100)}>Fit canvas</button></div>
      </aside>

      <section className="editor-center">
        <div className="canvas-header"><div><span className="crumb">{workspace.toUpperCase()}</span><span className="crumb-slash">/</span><strong>{workspace === "Build" ? "Figure setup" : workspace === "Draw" ? "Vector artwork" : "Scene 01"}</strong></div><div className="canvas-header-right"><span>1920 × 1080</span><span className="tiny-separator" /><span>24 FPS</span><span className="tiny-separator" /><span>{zoom}%</span></div></div>
        <div className="stage-wrap"><div className="stage-board">
          <div className="stage-grid" /><div className="stage-safe" />
          <svg className="character-art" viewBox="0 0 1920 1080" role="img" aria-label="Sample character illustration">
            <g stroke="#252832" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round">
              <path d="M840 550 Q780 585 770 740 L800 778 L855 665 L900 600Z" fill="#e4b18c"/>
              <path d="M1080 550 Q1140 585 1150 740 L1120 778 L1065 665 L1020 600Z" fill="#e4b18c"/>
              <path d="M850 505 Q960 465 1070 505 L1100 745 Q960 795 820 745Z" fill="#8d82dc"/>
              <path d="M865 735 L1055 735 L1070 920 L1000 920 L960 805 L920 920 L850 920Z" fill="#40566d"/>
              <path d="M850 920 L925 920 L915 958 L825 958 Q808 944 850 920Z" fill="#e9eaf0"/>
              <path d="M1000 920 L1070 920 Q1110 944 1090 958 L995 958Z" fill="#e9eaf0"/>
              <path d="M875 300 Q875 235 960 235 Q1045 235 1045 300 L1035 415 Q1015 475 960 475 Q905 475 885 415Z" fill="#e4b18c"/>
              <path d="M875 325 Q825 260 895 215 Q960 175 1025 215 Q1080 255 1045 330 L1022 290 L992 273 Q945 303 890 292Z" fill="#2c2932"/>
              <path d="M905 345 Q925 332 940 345 M980 345 Q997 332 1015 345" fill="none" strokeWidth="8"/>
              <path d="M940 390 Q960 402 980 390" fill="none" strokeWidth="6"/>
            </g>
          </svg>
          <div className="artboard-label">ARTBOARD 01 <span>1920 × 1080</span></div><div className="canvas-coordinates">UI PREVIEW · {tool.toUpperCase()}</div>
        </div><div className="stage-status"><span><i className="status-light" /> UI PREVIEW</span><span>{workspace.toUpperCase()} WORKSPACE</span><span>FRAME {String(frame).padStart(3, "0")}</span></div></div>

        <section className="timeline">
          <div className="timeline-top"><div className="timeline-title"><span className="panel-overline">ANIMATION</span><strong>Timeline</strong><span className="timeline-subtitle">Scene 01</span></div><div className="transport"><button onClick={() => setFrame(1)}>|◀</button><button onClick={() => setFrame(v => Math.max(1, v - 1))}>◀</button><button className="transport-play" onClick={() => setPlaying(v => !v)}>{playing ? "Ⅱ" : "▶"}</button><button onClick={() => setFrame(v => Math.min(120, v + 1))}>▶</button><button onClick={() => setFrame(120)}>▶|</button><span className="frame-counter">FRAME <b>{String(frame).padStart(3, "0")}</b></span></div><span className="timeline-add">UI PREVIEW</span></div>
          <div className="timeline-ruler"><div className="ruler-track-label">TRACKS</div><div className="ruler-numbers">{Array.from({ length: 12 }, (_, i) => <span key={i}>{i * 10 + 1}</span>)}</div></div>
          <div className="timeline-lane"><div className="lane-name"><span className="layer-swatch" />Character</div><div className="lane-cells">{Array.from({ length: 120 }, (_, i) => <button key={i} className={i + 1 === frame ? "frame-cell current" : "frame-cell"} onClick={() => setFrame(i + 1)} title={"Frame " + (i + 1)} />)}</div></div>
          <div className="timeline-footer"><span>24 FPS</span><span>{((frame - 1) / 24).toFixed(2)} s</span><span>UI preview only</span><span className="status-fill" /><button onClick={() => setFrame(1)}>Go to start ↑</button></div>
        </section>
      </section>

      <aside className="right-inspector">
        <div className="inspector-tabs">{(["Properties", "Layers", "Rig"] as Panel[]).map(tab => <button key={tab} className={panel === tab ? "inspector-tab active" : "inspector-tab"} onClick={() => setPanel(tab)}>{tab}</button>)}</div>
        {panel === "Properties" && <><div className="inspector-heading"><div><span className="panel-overline">SELECTION</span><h2>Properties</h2></div></div><div className="selection-card"><div className="selection-avatar">♙</div><div><strong>Sample character</strong><span>Static UI illustration</span></div><span className="selection-live" /></div><div className="property-section"><div className="property-heading">TRANSFORM <span>⌄</span></div><div className="property-line"><span>Position X</span><button>960 px</button></div><div className="property-line"><span>Position Y</span><button>540 px</button></div><div className="property-line"><span>Scale</span><button>100%</button></div></div><div className="property-section"><div className="property-heading">APPEARANCE <span>⌄</span></div><div className="property-line"><span>Fill</span><button>Sample</button></div><div className="property-line"><span>Stroke</span><button>10 px</button></div></div><div className="inspector-hint"><span>ⓘ</span><p>This diagnostic build displays the editor interface only. Editing and project features are temporarily disabled.</p></div></>}
        {panel === "Layers" && <><div className="inspector-heading"><div><span className="panel-overline">SCENE CONTENTS</span><h2>Layers</h2></div></div><div className="layer-tree">{["Character", "Background"].map((name, i) => <div key={name} className="layer-tree-row"><span className="tree-caret">{i === 0 ? "⌄" : ""}</span><span className={"tree-icon " + (name === "Background" ? "background-icon" : "")}>{name === "Background" ? "▱" : "♙"}</span><span>{name}</span><span className="tree-eye">◉</span></div>)}</div></>}
        {panel === "Rig" && <><div className="inspector-heading"><div><span className="panel-overline">CHARACTER SETUP</span><h2>Rig</h2></div></div><div className="rig-summary"><span className="rig-symbol">⌁</span><div><strong>Character skeleton</strong><span>Illustration preview only</span></div></div><div className="inspector-hint"><span>ⓘ</span><p>Rigging is disabled in this diagnostic UI build.</p></div></>}
        <div className="inspector-bottom"><span><i className="status-light" /> UI PREVIEW</span><span>DIAGNOSTIC</span></div>
      </aside>
    </div>
    <footer className="bottom-status"><span><i className="status-light" /> READY</span><span>{workspace.toUpperCase()} WORKSPACE</span><span>{tool.toUpperCase()}</span><span>FRAME {String(frame).padStart(3, "0")}</span><span className="status-fill" /><span>FORMA MOTION STUDIO · UI ONLY</span></footer>
  </main>;
}
