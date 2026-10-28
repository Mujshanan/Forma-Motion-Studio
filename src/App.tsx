import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { evaluateTranslation } from "./engine/timeline";
import type { TranslationPose } from "./engine/timeline";

type Workspace = "Animate" | "Draw" | "Build";
type Tool = "select" | "move" | "rotate" | "draw" | "bone" | "hand";
type Point = { x: number; y: number };

type ArtworkPath = {
  id: string; name: string; points: Point[]; stroke: string; strokeWidth: number;
  keyframes: Record<number, TranslationPose>;
};
type Snapshot = ArtworkPath[];

const FPS = 24;
const DURATION = 120;
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
const clone = (items: Snapshot): Snapshot => items.map(item => ({ ...item, points: item.points.map(p => ({...p})), keyframes: {...item.keyframes} }));
function pathBounds(points: Point[]) {
  const xs=points.map(p=>p.x), ys=points.map(p=>p.y);
  return {x:Math.min(...xs),y:Math.min(...ys),width:Math.max(1,Math.max(...xs)-Math.min(...xs)),height:Math.max(1,Math.max(...ys)-Math.min(...ys))};
}

export default function App() {
  const [workspace, setWorkspace] = useState<Workspace>("Animate");
  const [tool, setTool] = useState<Tool>("select");
  const [frame, setFrame] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [panel, setPanel] = useState("Properties");
  const [selectedLayer, setSelectedLayer] = useState("Character");
  const [showBones, setShowBones] = useState(true);
  const [artwork, setArtwork] = useState<Snapshot>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [undoStack, setUndoStack] = useState<Snapshot[]>([]);
  const [redoStack, setRedoStack] = useState<Snapshot[]>([]);
  const [draftPoints, setDraftPoints] = useState<Point[]>([]);
  const [drag, setDrag] = useState<{id:string; start:Point; origin:TranslationPose} | null>(null);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const playRef = useRef<number | null>(null);
  const selected = artwork.find(item=>item.id===selectedId) ?? null;
  const pushArtwork = useCallback((next: Snapshot) => {
    setUndoStack(stack=>[...stack.slice(-39),clone(artwork)]);
    setRedoStack([]);
    setArtwork(next);
    setSaved(false);
  },[artwork]);

  const setMode = (mode: Workspace) => {
    setWorkspace(mode);
    setTool(mode === "Build" ? "bone" : mode === "Draw" ? "draw" : "select");
    setPanel(mode === "Build" ? "Rig" : mode === "Draw" ? "Properties" : "Properties");
  };
  const pointFromEvent = (event: ReactPointerEvent<SVGSVGElement>): Point => {
    const svg=svgRef.current;
    if (!svg) return {x:0,y:0};
    const p=svg.createSVGPoint(); p.x=event.clientX; p.y=event.clientY;
    const matrix=svg.getScreenCTM();
    if (!matrix) return {x:0,y:0};
    const local=p.matrixTransform(matrix.inverse());
    return {x:local.x,y:local.y};
  };
  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (tool==="hand") return;
    const target=event.target as Element;
    const markNode=target.closest("[data-mark-id]");
    const markId=markNode?.getAttribute("data-mark-id");
    const point=pointFromEvent(event);
    if (tool==="draw") {
      event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
      setSelectedId(null); setDraftPoints([point]); return;
    }
    if ((tool==="select" || tool==="move") && markId) {
      event.stopPropagation(); setSelectedId(markId);
      const item=artwork.find(p=>p.id===markId);
      if(item){ const origin=evaluateTranslation(item.keyframes,frame); setUndoStack(stack=>[...stack.slice(-39),clone(artwork)]); setRedoStack([]); setDrag({id:markId,start:point,origin}); event.currentTarget.setPointerCapture(event.pointerId); }
    } else if (tool==="select") setSelectedId(null);
  };
  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const point=pointFromEvent(event);
    if (draftPoints.length) {
      const last=draftPoints[draftPoints.length-1];
      if(Math.hypot(point.x-last.x,point.y-last.y)>3) setDraftPoints(prev=>[...prev,point]);
    }
    if(drag){
      const dx=point.x-drag.start.x,dy=point.y-drag.start.y;
      setArtwork(items=>items.map(item=>item.id!==drag.id?item:{...item,keyframes:{...item.keyframes,[frame]:{x:drag.origin.x+dx,y:drag.origin.y+dy}}}));
      setSaved(false);
    }
  };
  const onPointerUp = () => {
    if(draftPoints.length){
      const points=draftPoints.length>1?draftPoints:[{x:draftPoints[0].x-1,y:draftPoints[0].y-1},{x:draftPoints[0].x+1,y:draftPoints[0].y+1}];
      const item:ArtworkPath={id:crypto.randomUUID(),name:`Stroke ${artwork.length+1}`,points,stroke:"#a9f16c",strokeWidth:8,keyframes:{1:{x:0,y:0}}};
      pushArtwork([...artwork,item]); setSelectedId(item.id); setDraftPoints([]);
    }
    setDrag(null);
  };
  const undo = () => { if(!undoStack.length)return; setRedoStack(s=>[...s,clone(artwork)]); setArtwork(undoStack[undoStack.length-1]); setUndoStack(s=>s.slice(0,-1));setSaved(false); };
  const redo = () => { if(!redoStack.length)return; setUndoStack(s=>[...s,clone(artwork)]);setArtwork(redoStack[redoStack.length-1]);setRedoStack(s=>s.slice(0,-1));setSaved(false); };
  const deleteSelected = useCallback(() => {
    if(!selectedId)return;
    pushArtwork(artwork.filter(item=>item.id!==selectedId));setSelectedId(null);
  },[artwork,pushArtwork,selectedId]);
  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)return;
    if(event.key==="Delete"||event.key==="Backspace"){event.preventDefault();deleteSelected();}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="z"){event.preventDefault();event.shiftKey?redo():undo();}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="y"){event.preventDefault();redo();}
    const keys:Record<string,Tool>={v:"select",m:"move",r:"rotate",b:"draw",a:"bone",h:"hand"};
    if(keys[event.key.toLowerCase()])setTool(keys[event.key.toLowerCase()]);
  };
  const toggleKeyframe = () => {
    if(!selected)return;
    const next=clone(artwork),item=next.find(p=>p.id===selectedId);
    if(!item)return;
    if(item.keyframes[frame] && Object.keys(item.keyframes).length>1) delete item.keyframes[frame];
    else item.keyframes[frame]=poseAt(item,frame);
    pushArtwork(next);
  };
  useEffect(()=>{
    if(!playing)return;
    playRef.current=window.setInterval(()=>setFrame(f=>f>=DURATION?1:f+1),1000/FPS);
    return ()=>{if(playRef.current!==null)window.clearInterval(playRef.current);};
  },[playing]);
  useEffect(()=>{if(frame>DURATION)setFrame(DURATION);},[frame]);
  const currentPose=selected?evaluateTranslation(selected.keyframes,frame):{x:0,y:0};
  const hasKeyframe=Boolean(selected?.keyframes[frame]);

  return <main className="studio-shell" tabIndex={0} onKeyDown={onKeyDown}>
    <header className="studio-topbar">
      <div className="topbar-left">
        <button className="studio-brand" title="Forma Motion Studio menu"><span className="brand-glyph">F</span><span>Forma Motion Studio</span><span className="chevron">⌄</span></button>
        <nav className="menu-items" aria-label="Application menu"><button onClick={()=>{setArtwork([]);setSelectedId(null);setFrame(1);setSaved(false);}}>File</button><button onClick={undo}>Edit</button><button onClick={()=>setZoom(100)}>View</button><button onClick={()=>setPlaying(p=>!p)}>Animation</button><button>Help</button></nav>
        <button className="home-button" title="Project home" onClick={() => setPanel("Projects")}>⌂</button>
        <div className="project-tabs"><button className="project-tab active"><span className="file-dot" />Untitled Project <span className="unsaved-dot">{saved?"":"●"}</span></button><button className="new-project" title="Clear artwork" onClick={() => { if(confirm("Clear all drawn artwork?")){pushArtwork([]);setSelectedId(null);} }}>＋</button></div>
      </div>
      <div className="mode-switch" role="group" aria-label="Workspace">
        {(["Animate", "Draw", "Build"] as Workspace[]).map((mode, i) => <button key={mode} className={workspace === mode ? "mode-button active" : "mode-button"} onClick={() => setMode(mode)} aria-pressed={workspace === mode}><span className="mode-dot" /> <span className="mode-icon">{["◷", "✎", "⌁"][i]}</span>{mode}</button>)}
      </div>
      <div className="topbar-right">
        <button className="chrome-icon" title="Undo (Ctrl+Z)" onClick={undo} disabled={!undoStack.length}>↶</button><button className="chrome-icon" title="Redo (Ctrl+Y)" onClick={redo} disabled={!redoStack.length}>↷</button>
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
            <svg ref={svgRef} className="character-art" viewBox="0 0 1920 1080" role="img" aria-label="Character and vector artwork canvas"
              style={{transform:`scale(${zoom/100})`,touchAction:"none",cursor:tool==="draw"?"crosshair":tool==="hand"?"grab":"default"}}
              onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
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
              {showBones && workspace === "Build" && <g stroke="#a9f16c" strokeWidth="7" fill="#202229" strokeLinecap="round" pointerEvents="none"><path d="M960 470 L960 600 L960 770 L910 920 M960 770 L1010 920 M960 600 L850 640 M960 600 L1070 640" fill="none"/>{[[960,470],[960,600],[960,770],[910,920],[1010,920],[850,640],[1070,640]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="13" />)}</g>}
              {artwork.map(item=>{const pose=poseAt(item,frame),bounds=pathBounds(item.points);return <g key={item.id} data-mark-id={item.id} transform={`translate(${pose.x} ${pose.y})`} style={{cursor:tool==="select"||tool==="move"?"move":"inherit"}}><polyline points={item.points.map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke={item.stroke} strokeWidth={item.strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /><polyline points={item.points.map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke="transparent" strokeWidth="28" vectorEffect="non-scaling-stroke" />{selectedId===item.id&&<g pointerEvents="none"><rect x={bounds.x-12} y={bounds.y-12} width={bounds.width+24} height={bounds.height+24} fill="none" stroke="#a9f16c" strokeWidth="3" strokeDasharray="10 8"/><circle cx={bounds.x+bounds.width+12} cy={bounds.y+bounds.height+12} r="9" fill="#a9f16c" stroke="#1d1f26" strokeWidth="3"/></g>}</g>;})}
              {draftPoints.length>0&&<polyline points={draftPoints.map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke="#a9f16c" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />}
            </svg>
            <div className="artboard-label">ARTBOARD 01 <span>1920 × 1080</span></div><div className="canvas-coordinates">{selected?selected.name:"X 960 · Y 540"}</div>
          </div>
          <div className="stage-status"><span><i className="status-light" /> {tool.toUpperCase()} TOOL</span><span>{workspace === "Build" ? "7 JOINTS · 6 LINKS" : workspace === "Draw" ? "VECTOR EDITOR" : "SCENE 01"}</span><span>FRAME {String(frame).padStart(3,"0")}</span></div>
        </div>

        <section className="timeline">
          <div className="timeline-top"><div className="timeline-title"><span className="panel-overline">ANIMATION</span><strong>Timeline</strong><span className="timeline-subtitle">Scene 01</span></div><div className="transport"><button title="Go to first frame" onClick={() => setFrame(1)}>|◀</button><button title="Previous frame" onClick={() => setFrame(Math.max(1, frame - 1))}>◀</button><button className="transport-play" title={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)}>{playing ? "Ⅱ" : "▶"}</button><button title="Next frame" onClick={() => setFrame(Math.min(DURATION,frame + 1))}>▶</button><button title="Last frame" onClick={() => setFrame(DURATION)}>▶|</button><span className="frame-counter">FRAME <b>{String(frame).padStart(3,"0")}</b></span></div><button className="timeline-add" onClick={toggleKeyframe} disabled={!selected}>◇ Keyframe</button></div>
          <div className="timeline-ruler"><div className="ruler-track-label">TRACKS</div><div className="ruler-numbers" style={{gridTemplateColumns:`repeat(${Math.ceil(DURATION/6)},minmax(0,1fr))`}}>{Array.from({length:Math.ceil(DURATION/6)},(_,i)=><button key={i} onClick={()=>setFrame(Math.min(DURATION,i*6+1))}>{i*6+1}</button>)}</div></div>
          <div className="timeline-lane"><div className="lane-name"><button title="Toggle visibility">◉</button><span className="layer-swatch" />{selected?.name??selectedLayer}</div><div className="lane-cells" style={{gridTemplateColumns:`repeat(${DURATION},minmax(0,1fr))`,minWidth:`${timelineZoom*100}%`}}>{Array.from({length:DURATION},(_,i)=>{const f=i+1;const key=selected?.keyframes[f];return <button key={f} className={f===frame?"frame-cell current":key?"frame-cell keyframe":"frame-cell"} onClick={()=>setFrame(f)} title={`Frame ${f}`} />;})}</div></div>
          <div className="timeline-footer"><span>{FPS} FPS</span><span>{((frame-1)/FPS).toFixed(2)} s</span><span>{artwork.length} vector path(s)</span><button onClick={()=>setTimelineZoom(z=>Math.min(4,z*1.25))}>＋</button><button onClick={()=>setTimelineZoom(z=>Math.max(.5,z/1.25))}>−</button><button onClick={() => setFrame(1)}>Go to start ↑</button></div>
        </section>
      </section>

      <aside className="right-inspector">
        <div className="inspector-tabs">{["Properties","Layers","Rig"].map(tab=><button key={tab} className={panel===tab?"inspector-tab active":"inspector-tab"} onClick={()=>setPanel(tab)}>{tab}</button>)}</div>
        {panel === "Properties" && <><div className="inspector-heading"><div><span className="panel-overline">SELECTION</span><h2>Properties</h2></div><button className="small-icon-button" onClick={deleteSelected}>⌫</button></div><div className="selection-card"><div className="selection-avatar">♙</div><div><strong>{selected?.name??selectedLayer}</strong><span>{selected?"Editable vector path":"Sample character · Scene 01"}</span></div><span className="selection-live" /></div>{selected&&<><div className="property-section"><div className="property-heading">TRANSFORM <span>⌄</span></div><div className="property-line"><span>Position X</span><button>{Math.round(currentPose.x)} px</button></div><div className="property-line"><span>Position Y</span><button>{Math.round(currentPose.y)} px</button></div><div className="property-line"><span>Points</span><button>{selected.points.length}</button></div><div className="property-line"><span>Keyframes</span><button>{Object.keys(selected.keyframes).length}</button></div></div><div className="property-section"><div className="property-heading">STROKE <span>⌄</span></div><div className="property-line"><span>Width</span><button>{selected.strokeWidth} px</button></div><div className="swatch-row"><span>Color</span>{["#a9f16c","#ff8f70","#8d82dc","#f0eef8"].map(c=><button key={c} style={{background:c}} onClick={()=>pushArtwork(artwork.map(item=>item.id===selected.id?{...item,stroke:c}:item))} aria-label={"Stroke "+c}/>)}</div></div><button className="wide-action" onClick={deleteSelected}>Delete selected path</button></>}<div className="inspector-hint"><span>ⓘ</span><p>{selected?"Drag the path to pose it. Add a keyframe to animate its position.":"Choose Draw and drag on the artboard to create a vector stroke."}</p></div></>}
        {panel === "Layers" && <><div className="inspector-heading"><div><span className="panel-overline">SCENE CONTENTS</span><h2>Layers</h2></div><button className="small-icon-button" onClick={()=>setSelectedLayer("New Layer")}>＋</button></div><div className="layer-tree">{["Character",...artwork.map(item=>item.name),"Background"].map((name,i)=><button key={name} className={(selected?.name===name||selectedLayer===name)?"layer-tree-row selected":"layer-tree-row"} onClick={()=>{const item=artwork.find(p=>p.name===name);setSelectedId(item?.id??null);setSelectedLayer(name);setPanel("Properties");}}><span className="tree-caret">{i===0?"⌄":""}</span><span className={"tree-icon "+(name==="Background"?"background-icon":"")}>{name==="Background"?"▱":i===0?"♙":"◇"}</span><span>{name}</span><span className="tree-eye">◉</span></button>)}</div><div className="layer-actions"><button onClick={()=>setTool("draw")}>＋ Draw path</button><button onClick={deleteSelected}>⌫ Delete</button></div></>}
        {panel === "Rig" && <><div className="inspector-heading"><div><span className="panel-overline">CHARACTER SETUP</span><h2>Rig</h2></div><button className="small-icon-button" onClick={()=>setShowBones(!showBones)}>{showBones?"◉":"⊘"}</button></div><div className="rig-summary"><span className="rig-symbol">⌁</span><div><strong>Character skeleton</strong><span>7 joints · 6 links (prototype)</span></div></div><div className="property-section"><div className="property-heading">DISPLAY <span>⌄</span></div><label className="toggle-row"><span>Show bones</span><input type="checkbox" checked={showBones} onChange={e=>setShowBones(e.target.checked)} /></label></div><button className="wide-action" onClick={()=>setWorkspace("Build")}>Open Build workspace ↗</button></>}
        {panel === "Projects" && <div className="utility-panel"><span className="utility-icon">⌂</span><h2>Project home</h2><p>Project file persistence is not implemented yet.</p><button onClick={()=>setPanel("Properties")}>Return to editor</button></div>}
        {panel === "Export" && <div className="utility-panel"><span className="utility-icon">⇧</span><h2>Export animation</h2><p>Rendering and file export are not implemented yet.</p><button onClick={()=>setPanel("Properties")}>Back to properties</button></div>}
        <div className="inspector-bottom"><span><i className="status-light" /> {saved?"Saved (session only)":"Unsaved session"}</span><span>v0.1.0</span></div>
      </aside>
    </div>
    <footer className="bottom-status"><span><i className="status-light" /> READY</span><span>{workspace.toUpperCase()} WORKSPACE</span><span>{tool.toUpperCase()}</span><span>FRAME {String(frame).padStart(3,"0")}</span><span className="status-fill" /><span>FORMA MOTION STUDIO</span></footer>
  </main>;
}
