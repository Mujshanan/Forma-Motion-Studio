import { describe, expect, it } from "vitest";
import { createShapePoints, exportSvg } from "./vector";

describe("createShapePoints", () => {
  it("creates a line from the exact endpoints", () => {
    expect(createShapePoints("line", { x: 2, y: 3 }, { x: 8, y: 9 })).toEqual([
      { x: 2, y: 3 }, { x: 8, y: 9 }
    ]);
  });

  it("normalizes rectangle corners and closes the path", () => {
    const points = createShapePoints("rect", { x: 10, y: 20 }, { x: 2, y: 4 });
    expect(points).toEqual([
      { x: 2, y: 4 }, { x: 10, y: 4 }, { x: 10, y: 20 },
      { x: 2, y: 20 }, { x: 2, y: 4 }
    ]);
  });

  it("creates a closed ellipse with the requested segment count", () => {
    const points = createShapePoints("ellipse", { x: 0, y: 0 }, { x: 20, y: 10 }, 16);
    expect(points).toHaveLength(17);
    expect(points[0].x).toBeCloseTo(points[16].x);
    expect(points[0].y).toBeCloseTo(points[16].y);
    expect(points.every(point => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
  });

  it("supports degenerate drags without producing invalid coordinates", () => {
    for (const tool of ["rect", "ellipse", "line"] as const) {
      expect(createShapePoints(tool, { x: 4, y: 4 }, { x: 4, y: 4 })
        .every(point => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
    }
  });
});

describe("exportSvg", () => {
  it("exports standalone SVG with paths and stroke styling", () => {
    const svg = exportSvg([{ points: [{ x: 1, y: 2 }, { x: 30, y: 40 }], stroke: "#a9f16c", strokeWidth: 4 }]);
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('points="1,2 30,40"');
    expect(svg).toContain('stroke="#a9f16c" stroke-width="4"');
    expect(svg).toContain('</svg>');
  });

  it("escapes XML attributes and falls back for invalid dimensions", () => {
    const svg = exportSvg([{ points: [{ x: 1, y: 2 }], stroke: '" onload="alert(1)', strokeWidth: 0 }], Number.NaN, -1);
    expect(svg).toContain('width="1920" height="1080"');
    expect(svg).toContain('&quot; onload=&quot;alert(1)');
    expect(svg).toContain('stroke-width="1"');
  });
});
