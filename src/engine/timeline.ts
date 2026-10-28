export type TranslationPose = { x: number; y: number };
export type TranslationKeyframes = Record<number, TranslationPose>;

/** Evaluate translation keys at a frame using linear interpolation between surrounding keys. */
export function evaluateTranslation(keys: TranslationKeyframes, frame: number): TranslationPose {
  const frames = Object.keys(keys).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!frames.length) return { x: 0, y: 0 };

  let before = frames[0];
  let after = frames[frames.length - 1];
  for (const key of frames) {
    if (key <= frame) before = key;
    if (key >= frame) { after = key; break; }
  }

  const a = keys[before];
  const b = keys[after];
  if (before === after) return { ...a };
  const t = (frame - before) / (after - before);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
