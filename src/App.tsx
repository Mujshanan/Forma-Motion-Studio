import { useState } from "react";
import type { MouseEvent } from "react";

type Workspace = "Animate" | "Draw" | "Build";
type Tool = "select" | "move" | "rotate" | "draw" | "bone" | "hand";
type Mark = { id: number; x: number; y: number };

const toolGroups: { label: string; items: { id: Tool; name: string; key: string; glyph: string }[] }[] = [
  { label: "EDIT", items: [
    { id: "select", name: "Select", key: "V", glyph: "↖" },
    { id: "move", name: "Move", key: "M", glyph: "✥" },
    { id: "rotate", name: "Rotate", key: "R", glyph: "⟳" }
  ]},
  { label: "CREATE", items: [
    { id: "draw", name: "Draw", key: "B", glyph: "✎" },
    { id: "bone", name: "Bone", key: "A", glyph: "⌁" },
    { id: "hand", name: "Pan", key: "H", glyph: "✋" }
  ]}
];

export default function App() {
  const [workspace, setWorkspace] = useState<Workspace>("Animate");
  const [tool, setTool] = useState<Tool>("select");
  const [frame, setFrame] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [panel, setPanel] = useState("Properties");
  const [selectedLayer, setSelectedLayer] = useState("Character");
  const [showBones, setShowBones] = useState(true);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [saved, setSaved] = useState(false);

  const setMode = (mode: Workspace) => {
    setWorkspace(mode);
    setTool(mode === "Build" ? "bone" : mode === "Draw" ? "draw" : "select");
    setPanel(mode === "Build" ? "Rig" : mode === "Draw" ? "Style" : "Properties");
  };
  const onCanvasClick = (event: MouseEvent<SVGSVGElement>) => {
    if (tool !== "draw") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setMarks(items => [...items, {
      id: Date.now(),
      x: ((event.clientX - rect.left) / rect.width) * 1920,
      y: ((event.clientY - rect.top) / rect.height) * 1080
    }]);
    setSaved(false);
  };

  return <main className="studio-shell">
    <header className="studio-topbar">
      <div className="topbar-left">
        <button className="studio-brand" title="Forma Motion Studio menu"><span className="brand-glyph">F</span><span>Forma Motion Studio</span><span className="chevron">⌄</span></button>
        <nav className="menu-items" aria-label="Application menu">
          <button>File</button><button>Edit</button><button>View</button><button>Animation</button><button>Help</button>
        </nav>
        <button className="home-button" title="Project home" onClick={() => setPanel("Projects")}>⌂</button>
        <div className="project-tabs"><button className="project-tab active"><span className="file-dot" />Untitled Project <span className="unsaved-dot">●</span></button><button className="new-project" title="New project" onClick={() => { setMarks([]); setFrame(1); setSaved(false); }}>＋</button></div>
      </div>
      <div className="mode-switch" role="group" aria-label="Workspace">
        {(["Animate", "Draw", "Build"] as Workspace[]).map((mode, i) => <button key={mode} className={workspace === mode ? "mode-button active" : "mode-button"} onClick={() => setMode(mode)} aria-pressed={workspace === mode}><span className="mode-dot" /> <span className="mode-icon">{["◷", "✎", "⌁"][i]}</span>{mode}</button>)}
      </div>
      <div className="topbar-right">
        <button className="chrome-icon" title="Undo" onClick={() => setMarks(items => items.slice(0, -1))}>↶</button><button className="chrome-icon" title="Redo" onClick={() => setSaved(false)}>↷</button>
        <span className="topbar-separator" /><button className="save-button" onClick={() => setSaved(true)}>{saved ? "✓ Saved" : "Save"}</button><button className="export-button" onClick={() => setPanel("Export")}>Export ↗</button>
      </div>
    </header>

    <div className="studio-workspace">
      <aside className="left-tools">
        <div className="tools-caption">TOOLS</div>
        {toolGroups.map(group => <section className="tool-group" key={group.label}><div className="tool-group-label">{group.label}</div>{group.items.map(item => <button key={item.id} className={tool === item.id ? "studio-tool active" : "studio-tool"} onClick={() => setTool(item.id)} title={item.name + " (" + item.key + ")"} aria-pressed={tool === item.id}><span className="tool-icon">{item.glyph}</span><span>{item.name}</span><kbd>{item.key}</kbd></button>)}</section>)}
        <div className="tool-spacer" />
        <div className="zoom-control"><span>ZOOM</span><div><button onClick={() => setZoom(Math.max(25, zoom - 25))}>−</button><b>{zoom}%</b><button onClick={() => setZoom(Math.min(200, zoom + 25))}>＋</button></div><button className="fit-button" onClick={() => setZoom(100)}>Fit canvas</button></div>
      </aside>

      <section className="editor-center">
        <div className="canvas-header"><div><span className="crumb">{workspace.toUpperCase()}</span><span className="crumb-slash">/</span><strong>{workspace === "Build" ? "Figure setup" : workspace === "Draw" ? "Vector artwork" : "Scene 01"}</strong></div><div className="canvas-header-right"><span>1920 × 1080</span><span className="tiny-separator" /><span>24 FPS</span><span className="tiny-separator" /><span>{zoom}%</span></div></div>
        <div className="stage-wrap">
          <div className="stage-board">
            <div className="stage-grid" />
            <div className="stage-safe" />
            <svg className="character-art" viewBox="0 0 1920 1080" role="img" aria-label="Sample character artwork" onClick={onCanvasClick}>
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
                <ellipse cx="925" cy="370" rx="11" ry="16" fill="#252832" stroke="none"/><ellipse cx="1000" cy="370" rx="11" ry="16" fill="#252832" stroke="none"/>
                <path d="M940 420 Q960 434 980 420" fill="none" strokeWidth="7"/>
                <path d="M930 480 L960 515 L990 480" fill="#f0eef8" strokeWidth="7"/>
              </g>
              {showBones && workspace === "Build" && <g stroke="#a9f16c" strokeWidth="7" fill="#202229" strokeLinecap="round"><path d="M960 470 L960 600 L960 770 L910 920 M960 770 L1010 920 M960 600 L850 640 M960 600 L1070 640" fill="none"/>{[[960,470],[960,600],[960,770],[910,920],[1010,920],[850,640],[1070,640]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="13" />)}</g>}
              {marks.map(mark => <g key={mark.id}><path d={`M ${mark.x-45} ${mark.y+24} Q ${mark.x} ${mark.y-44} ${mark.x+45} ${mark.y+12}`} fill="none" stroke="#a9f16c" strokeWidth="8" strokeLinecap="round"/><circle cx={mark.x} cy={mark.y} r="7" fill="#a9f16c"/></g>)}
            </svg>
            <div className="artboard-label">ARTBOARD 01 <span>1920 × 1080</span></div><div className="canvas-coordinates">X 960 · Y 540</div>
          </div>
          <div className="stage-status"><span><i className="status-light" /> {tool.toUpperCase()} TOOL</span><span>{workspace === "Build" ? "7 JOINTS · 6 LINKS" : workspace === "Draw" ? "VECTOR EDITOR" : "SCENE 01"}</span><span>FRAME {String(frame).padStart(3,"0")}</span></div>
        </div>

        <section className="timeline">
          <div className="timeline-top"><div className="timeline-title"><span className="panel-overline">ANIMATION</span><strong>Timeline</strong><span className="timeline-subtitle">Scene 01</span></div><div className="transport"><button title="Go to first frame" onClick={() => setFrame(1)}>|◀</button><button title="Previous frame" onClick={() => setFrame(Math.max(1, frame - 1))}>◀</button><button className="transport-play" title={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)}>{playing ? "Ⅱ" : "▶"}</button><button title="Next frame" onClick={() => setFrame(frame + 1)}>▶</button><button title="Last frame" onClick={() => setFrame(66)}>▶|</button><span className="frame-counter">FRAME <b>{String(frame).padStart(3,"0")}</b></span></div><button className="timeline-add" title="Add track" onClick={() => setSelectedLayer("New Layer")}>＋ Track</button></div>
          <div className="timeline-ruler"><div className="ruler-track-label">TRACKS</div><div className="ruler-numbers">{Array.from({length:12},(_,i)=><span key={i}>{i*6+1}</span>)}</div></div>
          <div className="timeline-lane"><div className="lane-name"><button title="Toggle visibility">◉</button><span className="layer-swatch" />{selectedLayer}</div><div className="lane-cells">{Array.from({length:66},(_,i)=><button key={i} className={i+1===frame?"frame-cell current":i%6===0?"frame-cell keyframe":"frame-cell"} onClick={()=>setFrame(i+1)} title={"Frame "+(i+1)} />)}</div></div>
          <div className="timeline-footer"><span>24 FPS</span><span>{((frame-1)/24).toFixed(2)} s</span><span>{marks.length} drawing mark(s)</span><button onClick={() => setFrame(1)}>Go to start ↑</button></div>
        </section>
      </section>

      <aside className="right-inspector">
        <div className="inspector-tabs">{["Properties","Layers","Rig"].map(tab=><button key={tab} className={panel===tab?"inspector-tab active":"inspector-tab"} onClick={()=>setPanel(tab)}>{tab}</button>)}</div>
        {panel === "Properties" && <><div className="inspector-heading"><div><span className="panel-overline">SELECTION</span><h2>Properties</h2></div><button className="small-icon-button">⋯</button></div><div className="selection-card"><div className="selection-avatar">♙</div><div><strong>{selectedLayer}</strong><span>Vector group · Scene 01</span></div><span className="selection-live" /></div><div className="property-section"><div className="property-heading">TRANSFORM <span>⌄</span></div>{[["Position X","960 px"],["Position Y","540 px"],["Rotation","0.0°"],["Scale","100%"]].map(([k,v])=><div className="property-line" key={k}><span>{k}</span><button>{v}</button></div>)}</div><div className="property-section"><div className="property-heading">APPEARANCE <span>⌄</span></div><div className="property-line"><span>Opacity</span><button>100%</button></div><div className="property-line"><span>Blend mode</span><button>Normal⌄</button></div><div className="swatch-row"><span>Fill</span>{["#8d82dc","#a9f16c","#e4b18c","#40566d"].map(c=><button key={c} style={{background:c}} aria-label={"Fill "+c} />)}</div></div><div className="inspector-hint"><span>ⓘ</span><p>Select an artwork item to edit its transform and appearance.</p></div></>}
        {panel === "Layers" && <><div className="inspector-heading"><div><span className="panel-overline">SCENE CONTENTS</span><h2>Layers</h2></div><button className="small-icon-button" onClick={()=>setSelectedLayer("New Layer")}>＋</button></div><div className="layer-tree">{["Character","Head","Body","Arms","Legs","Background"].map((name,i)=><button key={name} className={selectedLayer===name?"layer-tree-row selected":"layer-tree-row"} onClick={()=>setSelectedLayer(name)}><span className="tree-caret">{i===0?"⌄":""}</span><span className={"tree-icon "+(i===5?"background-icon":"")}>{i===5?"▱":i===0?"♙":"◇"}</span><span>{name}</span><span className="tree-eye">◉</span></button>)}</div><div className="layer-actions"><button onClick={()=>setSelectedLayer("New Layer")}>＋ New layer</button><button onClick={()=>setSelectedLayer("Group")}>▤ Group</button></div></>}
        {panel === "Rig" && <><div className="inspector-heading"><div><span className="panel-overline">CHARACTER SETUP</span><h2>Rig</h2></div><button className="small-icon-button" onClick={()=>setShowBones(!showBones)}>{showBones?"◉":"⊘"}</button></div><div className="rig-summary"><span className="rig-symbol">⌁</span><div><strong>Character skeleton</strong><span>7 joints · 6 links</span></div></div><div className="property-section"><div className="property-heading">SELECTED BONE <span>⌄</span></div><div className="property-line"><span>Bone</span><button>Spine⌄</button></div><div className="property-line"><span>Rotation</span><button>0.0°</button></div><div className="property-line"><span>Length</span><button>170 px</button></div><label className="toggle-row"><span>Show bones</span><input type="checkbox" checked={showBones} onChange={e=>setShowBones(e.target.checked)} /></label></div><button className="wide-action" onClick={()=>setWorkspace("Build")}>Open Build workspace ↗</button></>}
        {panel === "Projects" && <div className="utility-panel"><span className="utility-icon">⌂</span><h2>Project home</h2><p>Start a character animation or return to the current scene.</p><button onClick={()=>setPanel("Properties")}>Return to editor</button></div>}
        {panel === "Export" && <div className="utility-panel"><span className="utility-icon">⇧</span><h2>Export animation</h2><p>Export settings will be connected after rendering and file output are implemented.</p><button onClick={()=>setPanel("Properties")}>Back to properties</button></div>}
        <div className="inspector-bottom"><span><i className="status-light" /> Local project</span><span>v0.1.0</span></div>
      </aside>
    </div>
    <footer className="bottom-status"><span><i className="status-light" /> READY</span><span>{workspace.toUpperCase()} WORKSPACE</span><span>{tool.toUpperCase()}</span><span>FRAME {String(frame).padStart(3,"0")}</span><span className="status-fill" /><span>FORMA MOTION STUDIO</span></footer>
  </main>;
}
