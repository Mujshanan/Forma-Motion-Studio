export type Point = { x: number; y: number };

export type VectorPath = {
  id: string;
  name: string;
  points: Point[];
  closed: boolean;
  fill: string | null;
  stroke: string;
  strokeWidth: number;
};

export type SceneLayer = {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  paths: VectorPath[];
};

export type AnimationDocument = {
  schemaVersion: 1;
  name: string;
  width: number;
  height: number;
  fps: number;
  durationFrames: number;
  layers: SceneLayer[];
};

export function createEmptyDocument(name = "Untitled Project"): AnimationDocument {
  return {
    schemaVersion: 1,
    name,
    width: 1920,
    height: 1080,
    fps: 24,
    durationFrames: 240,
    layers: [
      {
        id: "layer-character",
        name: "Character",
        visible: true,
        locked: false,
        paths: []
      }
    ]
  };
}

export function validateDocument(value: unknown): value is AnimationDocument {
  if (!value || typeof value !== "object") return false;
  const doc = value as Partial<AnimationDocument>;
  return doc.schemaVersion === 1
    && typeof doc.name === "string"
    && Number.isInteger(doc.width) && (doc.width ?? 0) > 0
    && Number.isInteger(doc.height) && (doc.height ?? 0) > 0
    && Number.isInteger(doc.fps) && (doc.fps ?? 0) > 0
    && Number.isInteger(doc.durationFrames) && (doc.durationFrames ?? 0) > 0
    && Array.isArray(doc.layers);
}