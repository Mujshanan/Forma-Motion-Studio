import { describe, expect, it } from "vitest";
import { createEmptyDocument, validateDocument } from "./document";

describe("animation document", () => {
  it("creates a usable empty document with one layer", () => {
    const document = createEmptyDocument();
    expect(document.schemaVersion).toBe(1);
    expect(document.width).toBe(1920);
    expect(document.height).toBe(1080);
    expect(document.fps).toBe(24);
    expect(document.layers).toHaveLength(1);
  });

  it("accepts a document created by the factory", () => {
    expect(validateDocument(createEmptyDocument("Test Scene"))).toBe(true);
  });

  it("rejects unknown schema versions and invalid dimensions", () => {
    expect(validateDocument({ ...createEmptyDocument(), schemaVersion: 99 })).toBe(false);
    expect(validateDocument({ ...createEmptyDocument(), width: 0 })).toBe(false);
    expect(validateDocument(null)).toBe(false);
  });
});