import { describe, expect, it } from "vitest";
import { evaluateTranslation } from "./timeline";

describe("timeline translation evaluation", () => {
  it("returns zero when no keyframes exist", () => {
    expect(evaluateTranslation({}, 12)).toEqual({ x: 0, y: 0 });
  });

  it("holds the nearest endpoint outside the keyed range", () => {
    const keys = { 5: { x: 10, y: 20 }, 15: { x: 30, y: 40 } };
    expect(evaluateTranslation(keys, 1)).toEqual({ x: 10, y: 20 });
    expect(evaluateTranslation(keys, 20)).toEqual({ x: 30, y: 40 });
  });

  it("linearly interpolates between keyframes", () => {
    const keys = { 1: { x: 0, y: 0 }, 11: { x: 100, y: 50 } };
    expect(evaluateTranslation(keys, 6)).toEqual({ x: 50, y: 25 });
  });

  it("returns the exact keyed pose on a keyframe", () => {
    const keys = { 1: { x: 0, y: 0 }, 12: { x: -24, y: 8 } };
    expect(evaluateTranslation(keys, 12)).toEqual({ x: -24, y: 8 });
  });
});
