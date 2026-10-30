import type { BezierCommand } from "./vector";
import type { TranslationPose } from "./timeline";

export type ProjectPoint = { x: number; y: number };
export type ProjectPath = {
  id: string;
  name: string;
  points: ProjectPoint[];
  /** Optional cubic path geometry; absent in legacy v1 documents. */
  pathCommands?: BezierCommand[];
  stroke: string;
  strokeWidth: number;
  keyframes: Record<number, TranslationPose>;
};
export type FormaProject = {
  format: "forma-motion-studio";
  version: 1;
  name: string;
  savedAt: string;
  frame: number;
  fps: number;
  duration: number;
  artwork: ProjectPath[];
};

const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

function validateCommands(commands: unknown, name: string): asserts commands is BezierCommand[] {
  if (!Array.isArray(commands) || commands.length === 0) throw new Error(`Invalid Bézier path in "${name}".`);
  for (const command of commands) {
    if (!command || typeof command !== "object" || !["M", "L", "C", "Z"].includes((command as {type?: string}).type ?? "")) {
      throw new Error(`Invalid Bézier command in "${name}".`);
    }
    const c = command as Record<string, unknown>;
    const required = c.type === "Z" ? [] : c.type === "C" ? ["x1", "y1", "x2", "y2", "x", "y"] : ["x", "y"];
    if (required.some(key => !finite(c[key]))) throw new Error(`Invalid Bézier coordinates in "${name}".`);
  }
  if (commands[0].type !== "M") throw new Error(`Bézier path "${name}" must start with a move command.`);
}

export function createProject(artwork: ProjectPath[], frame: number, name = "Untitled Project"): FormaProject {
  return {
    format: "forma-motion-studio", version: 1, name, savedAt: new Date().toISOString(),
    frame: Math.max(1, Math.floor(frame)), fps: 24, duration: 120,
    artwork: artwork.map(path => ({
      ...path,
      points: path.points.map(point => ({ x: point.x, y: point.y })),
      ...(path.pathCommands ? { pathCommands: path.pathCommands.map(command => ({ ...command })) } : {}),
      keyframes: Object.fromEntries(Object.entries(path.keyframes).map(([key, pose]) => [key, { x: pose.x, y: pose.y }]))
    }))
  };
}

export function parseProject(input: string): FormaProject {
  let value: unknown;
  try { value = JSON.parse(input); } catch { throw new Error("This file is not valid JSON."); }
  if (!value || typeof value !== "object") throw new Error("Invalid Forma project.");
  const project = value as Partial<FormaProject>;
  if (project.format !== "forma-motion-studio" || project.version !== 1 || !Array.isArray(project.artwork)) {
    throw new Error("Unsupported project format or version.");
  }
  if (!finite(project.frame) || project.frame < 1 || project.frame > 120) throw new Error("Project frame is out of range.");
  const artwork = project.artwork.map((candidate, index) => {
    if (!candidate || typeof candidate !== "object") throw new Error(`Invalid artwork path at index ${index}.`);
    const path = candidate as ProjectPath;
    if (typeof path.id !== "string" || typeof path.name !== "string" || typeof path.stroke !== "string" ||
        !finite(path.strokeWidth) || path.strokeWidth <= 0 || !Array.isArray(path.points) || !path.points.length ||
        !path.keyframes || typeof path.keyframes !== "object") throw new Error(`Invalid artwork path at index ${index}.`);
    for (const point of path.points) {
      if (!point || !finite(point.x) || !finite(point.y)) throw new Error(`Invalid point in path "${path.name}".`);
    }
    if (path.pathCommands !== undefined) validateCommands(path.pathCommands, path.name);
    for (const [frame, pose] of Object.entries(path.keyframes)) {
      const n = Number(frame);
      if (!Number.isInteger(n) || n < 1 || n > 120 || !pose || !finite(pose.x) || !finite(pose.y)) {
        throw new Error(`Invalid keyframe in path "${path.name}".`);
      }
    }
    return {
      id: path.id, name: path.name, stroke: path.stroke, strokeWidth: path.strokeWidth,
      points: path.points.map(point => ({ x: point.x, y: point.y })),
      ...(path.pathCommands ? { pathCommands: path.pathCommands.map(command => ({ ...command })) } : {}),
      keyframes: Object.fromEntries(Object.entries(path.keyframes).map(([frame, pose]) => [frame, { x: pose.x, y: pose.y }]))
    };
  });
  return { format: "forma-motion-studio", version: 1, name: typeof project.name === "string" ? project.name : "Untitled Project",
    savedAt: typeof project.savedAt === "string" ? project.savedAt : "", frame: Math.floor(project.frame), fps: 24, duration: 120, artwork };
}
