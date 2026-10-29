export type VectorPoint = { x: number; y: number };
export type ShapeTool = "rect" | "ellipse" | "line";

/** SVG path commands retained as editable geometry instead of flattening curves to polylines. */
export type BezierCommand =
  | { type: "M"; x: number; y: number }
  | { type: "L"; x: number; y: number }
  | { type: "C"; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { type: "Z" };


export type BezierEditHandle = "anchor" | "control1" | "control2";

/** Move an anchor or cubic handle without regenerating the path from sampled points. */
export function moveBezierHandle(
  commands: BezierCommand[],
  commandIndex: number,
  handle: BezierEditHandle,
  point: VectorPoint
): BezierCommand[] {
  if (!Number.isInteger(commandIndex) || commandIndex < 0 || commandIndex >= commands.length ||
      !Number.isFinite(point.x) || !Number.isFinite(point.y)) return commands;
  const target = commands[commandIndex];
  if (!target || target.type === "Z") return commands;
  const next = commands.map(command => ({ ...command })) as BezierCommand[];

  if (handle === "control1" || handle === "control2") {
    if (target.type !== "C") return commands;
    next[commandIndex] = handle === "control1"
      ? { ...target, x1: point.x, y1: point.y }
      : { ...target, x2: point.x, y2: point.y };
    return next;
  }

  const dx = point.x - target.x;
  const dy = point.y - target.y;
  const moved = next[commandIndex];
  if (moved.type === "M" || moved.type === "L") {
    next[commandIndex] = { ...moved, x: point.x, y: point.y };
  } else if (moved.type === "C") {
    next[commandIndex] = { ...moved, x: point.x, y: point.y, x2: moved.x2 + dx, y2: moved.y2 + dy };
  }

  // The outgoing handle of the next cubic is attached to this anchor.
  for (let i = commandIndex + 1; i < next.length; i += 1) {
    const command = next[i];
    if (command.type === "Z") continue;
    if (command.type === "C") {
      next[i] = { ...command, x1: command.x1 + dx, y1: command.y1 + dy };
      break;
    }
    if (command.type === "M" || command.type === "L") break;
  }
  return next;
}

const isFinitePoint = (point: VectorPoint) => Number.isFinite(point.x) && Number.isFinite(point.y);

/**
 * Convert sampled pointer input to a smooth cubic Bézier path using Catmull–Rom-style
 * tangents. Original samples are retained separately for Forma's existing point-edit UI.
 */
export function createSmoothBezier(points: VectorPoint[], tension = 1): BezierCommand[] {
  const valid = points.filter(isFinitePoint);
  if (valid.length === 0) return [];
  if (valid.length === 1) return [{ type: "M", ...valid[0] }];
  const safeTension = Number.isFinite(tension) ? Math.max(0, Math.min(2, tension)) : 1;
  const commands: BezierCommand[] = [{ type: "M", ...valid[0] }];
  for (let i = 0; i < valid.length - 1; i += 1) {
    const p0 = valid[Math.max(0, i - 1)];
    const p1 = valid[i];
    const p2 = valid[i + 1];
    const p3 = valid[Math.min(valid.length - 1, i + 2)];
    const scale = safeTension / 6;
    commands.push({
      type: "C",
      x1: p1.x + (p2.x - p0.x) * scale,
      y1: p1.y + (p2.y - p0.y) * scale,
      x2: p2.x - (p3.x - p1.x) * scale,
      y2: p2.y - (p3.y - p1.y) * scale,
      x: p2.x,
      y: p2.y
    });
  }
  return commands;
}

/** Produce a stable SVG d attribute from validated path commands. */
export function bezierPathToSvgD(commands: BezierCommand[]): string {
  return commands.map(command => {
    if (command.type === "Z") return "Z";
    if (!Number.isFinite(command.x) || !Number.isFinite(command.y)) return "";
    if (command.type === "M" || command.type === "L") return `${command.type} ${command.x} ${command.y}`;
    if (![command.x1, command.y1, command.x2, command.y2].every(Number.isFinite)) return "";
    return `C ${command.x1} ${command.y1} ${command.x2} ${command.y2} ${command.x} ${command.y}`;
  }).filter(Boolean).join(" ");
}

/** Return editable polyline points for a primitive, in canvas coordinates. */
export function createShapePoints(tool: ShapeTool, start: VectorPoint, end: VectorPoint, ellipseSegments = 32): VectorPoint[] {
  const left = Math.min(start.x, end.x);
  const right = Math.max(start.x, end.x);
  const top = Math.min(start.y, end.y);
  const bottom = Math.max(start.y, end.y);

  if (tool === "line") return [{ ...start }, { ...end }];
  if (tool === "rect") {
    return [
      { x: left, y: top }, { x: right, y: top },
      { x: right, y: bottom }, { x: left, y: bottom },
      { x: left, y: top }
    ];
  }

  const count = Math.max(8, Math.floor(ellipseSegments));
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  const rx = (right - left) / 2;
  const ry = (bottom - top) / 2;
  return Array.from({ length: count + 1 }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
  });
}

export type SvgExportPath = { points: VectorPoint[]; commands?: BezierCommand[]; stroke: string; strokeWidth: number };

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Serialize editable point and cubic Bézier paths as a standalone SVG document. */
export function exportSvg(paths: SvgExportPath[], width = 1920, height = 1080): string {
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 1920;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 1080;
  const shapes = paths.map(path => {
    const points = path.points.filter(isFinitePoint).map(p => `${p.x},${p.y}`).join(" ");
    const d = path.commands ? bezierPathToSvgD(path.commands) : "";
    const stroke = escapeXml(path.stroke);
    const strokeWidth = Number.isFinite(path.strokeWidth) && path.strokeWidth > 0 ? path.strokeWidth : 1;
    return path.commands
      ? `  <path d="${escapeXml(d)}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`
      : `  <polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}">\n${shapes}\n</svg>\n`;
}
