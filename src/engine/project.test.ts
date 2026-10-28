import { describe, expect, it } from "vitest";
import { createProject, parseProject } from "./project";

const sample = [{
  id: "path-1", name: "Stroke 1", points: [{ x: 12, y: 24 }, { x: 30, y: 40 }],
  stroke: "#a9f16c", strokeWidth: 8, keyframes: { 1: { x: 0, y: 0 }, 12: { x: 25, y: -5 } }
}];

describe("Forma project files", () => {
  it("round-trips artwork, keyframes, and current frame", () => {
    const saved = createProject(sample, 12, "Test");
    const loaded = parseProject(JSON.stringify(saved));
    expect(loaded.artwork).toEqual(sample);
    expect(loaded.frame).toBe(12);
    expect(loaded.name).toBe("Test");
  });

  it("rejects invalid JSON and unsupported formats", () => {
    expect(() => parseProject("{")).toThrow("not valid JSON");
    expect(() => parseProject(JSON.stringify({ format: "other", version: 1, artwork: [], frame: 1 }))).toThrow("Unsupported");
  });

  it("rejects non-finite coordinates and out-of-range keyframes", () => {
    const badPoint = createProject(sample, 1);
    badPoint.artwork[0].points[0].x = Number.NaN;
    expect(() => parseProject(JSON.stringify(badPoint))).toThrow("Invalid point");
    const badKey = createProject(sample, 1);
    badKey.artwork[0].keyframes[121] = { x: 0, y: 0 };
    expect(() => parseProject(JSON.stringify(badKey))).toThrow("Invalid keyframe");
  });

  it("copies data so editing the source does not mutate the serialized project", () => {
    const saved = createProject(sample, 1);
    sample[0].points[0].x = 999;
    expect(saved.artwork[0].points[0].x).toBe(12);
    sample[0].points[0].x = 12;
  });
});
