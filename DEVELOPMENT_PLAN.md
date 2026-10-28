# Forma Motion Studio — Development Plan

## Product goal

Build a Windows-first, vector-first 2D character animation editor inspired by the workflow of Moho. The project is an independent implementation; references to other applications describe workflows, not permission to copy their code or assets.

## Guiding principles

- Deliver a small, runnable vertical slice before expanding the feature list.
- Keep animation, geometry, document, and rigging logic independent of React and Electron.
- Make animation evaluation deterministic: the same document and frame must produce the same pose.
- All meaningful edits should eventually use commands so they can be undone and redone.
- Version the native project format and validate documents when opening them.
- Add tests alongside domain features, not after them.
- Keep Electron's renderer isolated; do not enable Node integration in the renderer.
- Use feature branches and reviewable pull requests. Never claim a build or test passed unless it was actually run.

## Proposed stack

- Electron for the Windows desktop shell.
- React + TypeScript + Vite for the editor UI.
- SVG/Canvas behind a renderer abstraction for vector artwork and viewport interaction.
- Vitest for unit tests.
- Electron packaging configuration to be added after the first runnable vertical slice.

## Milestones

### M0 — Project foundation
- [x] Initial Electron/React/TypeScript scaffold.
- [x] Initial dark editor workspace shell.
- [x] Versioned document model factory and validation.
- [x] Initial document-model unit tests.
- [ ] Install dependencies and run build/tests on a developer machine.
- [ ] Add Windows packaging and a real application icon.
- [ ] Add CI for typecheck, tests, and renderer build.

### M1 — Document and drawing
- Native project save/open with schema version and safe validation.
- Viewport pan/zoom, grid, canvas bounds, selection and transform handles.
- Bezier paths, anchor/handle editing, fill, stroke, grouping, layers.
- Undo/redo command stack, autosave and recovery.
- Acceptance: draw a simple vector character, save, close, reopen, and recover the same artwork.

### M2 — Timeline and keyframes
- Timeline with layers, frame ruler, current-frame indicator, playback controls.
- Keyframes for position, rotation, scale, opacity, and supported vector properties.
- Linear, stepped, and Bezier interpolation.
- Frame rate, duration, looping, copy/paste keys, onion skin.
- Acceptance: animate an object between two poses and scrub/play the result deterministically.

### M3 — Character rigging
- Bone hierarchy and bone editing.
- Bind artwork to bones, parent transforms, constraints, inverse kinematics.
- Weighting and mesh deformation after stable transform-based rigs.
- Acceptance: a multi-part character can bend an arm and leg with predictable results.

### M4 — Smart controls and cutout animation
- Switch layers for eyes, mouth shapes, hands, and character views.
- Smart Bone-like controls and corrective poses.
- Reusable actions, cycles, and animation clips.
- Acceptance: one controller can drive a tested corrective pose without breaking the base rig.

### M5 — Scene production and export
- Backgrounds, camera framing, audio scrubbing, and scene management.
- Masks and a compositing/effect stack.
- PNG sequence and spritesheet export first; video encoding after that pipeline is reliable.
- Progress, cancellation, clear errors, and deterministic frame rendering.
- Acceptance: export a short scene and compare selected rendered frames with expected output.

### M6 — Release quality
- Dockable/collapsible panels and saved workspace layouts.
- Performance profiling, large-scene tests, regression suite.
- Windows installer, icon, version display, update-check design, documentation, and sample projects.
- Accessibility, keyboard shortcuts, and crash-safe project recovery.

## First vertical slice

Prioritize this sequence:
1. Create and validate a document.
2. Draw one vector path on the canvas.
3. Select and transform it.
4. Add a keyframe at frame 1 and another at frame 24.
5. Scrub between frames and see deterministic interpolation.
6. Save/reopen the project.
7. Export a PNG sequence.

Do not start advanced Smart Bones, mesh deformation, or effects before the document, command, and evaluation foundations are stable.

## Open-source references

- Synfig: vector animation, tweening, linked parameters, and bones — https://github.com/synfig/synfig
- OpenToonz: production animation workflow, scene management, compositing — https://github.com/opentoonz/opentoonz
- Tahoma2D: OpenToonz-derived production workflow — https://github.com/tahoma2d/tahoma2d
- Pencil2D: simple frame-by-frame drawing workflow — https://github.com/pencil2d/pencil
- SkelForm: skeletal 2D animation concepts — https://skelform.org/
- Blender: Grease Pencil and animation editor interaction patterns — https://github.com/blender/blender

Before reusing any third-party code, verify the exact repository license, file-level notices, dependency licenses, and obligations. Prefer learning from behavior and implementing independently unless code reuse has been explicitly reviewed.

## Working agreement

For every task:
1. Inspect the current code and related tests before editing.
2. State a short plan and list the files likely to change.
3. Implement one coherent feature, avoiding unrelated refactors.
4. Add or update tests for behavior changes.
5. Run the relevant tests and build if the environment permits.
6. Report exact commands and outcomes; clearly label anything not run.
7. Summarize changed files, known limitations, and the next smallest step.