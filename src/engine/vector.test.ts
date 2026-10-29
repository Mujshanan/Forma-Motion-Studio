import { describe, expect, it } from "vitest";
import { createShapePoints, exportSvg, moveBezierHandle } from "./vector";

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

describe("cubic Bézier geometry", () => {
  it("creates a cubic path from sampled pointer points", async () => {
    const { createSmoothBezier, bezierPathToSvgD } = await import("./vector");
    const commands = createSmoothBezier([{ x: 0, y: 0 }, { x: 10, y: 20 }, { x: 20, y: 0 }]);
    expect(commands[0]).toEqual({ type: "M", x: 0, y: 0 });
    expect(commands.filter(command => command.type === "C")).toHaveLength(2);
    expect(bezierPathToSvgD(commands)).toContain("C ");
  });

  it("filters invalid samples and safely handles empty or single-point input", async () => {
    const { createSmoothBezier } = await import("./vector");
    expect(createSmoothBezier([])).toEqual([]);
    expect(createSmoothBezier([{ x: 2, y: 3 }])).toEqual([{ type: "M", x: 2, y: 3 }]);
    expect(createSmoothBezier([{ x: 0, y: 0 }, { x: Number.NaN, y: 1 }, { x: 5, y: 5 }]))
      .toHaveLength(2);
  });

  it("exports cubic paths as SVG path elements rather than flattened polylines", () => {
    const svg = exportSvg([{
      points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
      commands: [{ type: "M", x: 0, y: 0 }, { type: "C", x1: 2, y1: 0, x2: 8, y2: 10, x: 10, y: 10 }],
      stroke: "#000", strokeWidth: 2
    }]);
    expect(svg).toContain('<path d="M 0 0 C 2 0 8 10 10 10"');
    expect(svg).not.toContain("<polyline");
  });
});

describe("Bézier handle editing", () => {
  const path = [
    { type: "M" as const, x: 0, y: 0 },
    { type: "C" as const, x1: 10, y1: 0, x2: 20, y2: 10, x: 30, y: 10 },
    { type: "C" as const, x1: 40, y1: 10, x2: 50, y2: 20, x: 60, y: 20 }
  ];

  it("moves a control handle without changing anchors or the other handles", () => {
    expect(moveBezierHandle(path, 1, "control1", { x: 12, y: 4 })).toEqual([
      path[0], { ...path[1], x1: 12, y1: 4 }, path[2]
    ]);
  });

  it("moves an anchor and its adjacent handles together", () => {
    expect(moveBezierHandle(path, 1, "anchor", { x: 35, y: 15 })).toEqual([
      path[0],
      { ...path[1], x2: 25, y2: 15, x: 35, y: 15 },
      { ...path[2], x1: 45, y1: 15 }
    ]);
  });

  it("ignores invalid handle edits", () => {
    expect(moveBezierHandle(path, 99, "anchor", { x: 1, y: 1 })).toBe(path);
    expect(moveBezierHandle(path, 1, "control2", { x: Number.NaN, y: 1 })).toBe(path);
  });
});
