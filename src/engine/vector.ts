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
