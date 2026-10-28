export type VectorPoint = { x: number; y: number };
export type ShapeTool = "rect" | "ellipse" | "line";

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

export type SvgExportPath = { points: VectorPoint[]; stroke: string; strokeWidth: number };

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Serialize editable point paths as a standalone SVG document. */
export function exportSvg(paths: SvgExportPath[], width = 1920, height = 1080): string {
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 1920;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 1080;
  const shapes = paths.map(path => {
    const points = path.points.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y))
      .map(p => `${p.x},${p.y}`).join(" ");
    const stroke = escapeXml(path.stroke);
    const strokeWidth = Number.isFinite(path.strokeWidth) && path.strokeWidth > 0 ? path.strokeWidth : 1;
    return `  <polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}">\\n${shapes}\\n</svg>\\n`;
}
