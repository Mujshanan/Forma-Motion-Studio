# Forma Motion Studio

A new Windows-first, vector-first 2D character animation editor inspired by the workflow of Moho.

> **Early development:** this is an interactive prototype, not a finished animation editor. The visible character and rig overlay are sample UI content. Real rigging and rendered animation export remain planned.

## Current UI prototype

- Dark editor shell with Draw, Rig, Animate, Assets, and Export workspaces.
- Central 16:9 artboard with a sample character illustration.
- Tool rail with Select, Pen, Shape, Bone, and Hand tools.
- Draw vector strokes, select and reposition them, and use Edit points (P) to reshape individual stroke points.
- Auto-restores the latest working document in local browser storage; Open imports a project JSON file and Save downloads a portable project JSON file.
- Project files validate their format, coordinates, and keyframe ranges before opening.
- Rig workspace displays a sample skeleton overlay and basic visibility control.
- Layers, selection inspector, timeline scrubbing, frame stepping, playback, keyframe toggling, and timeline zoom controls.
- Responsive panel sizing and keyboard shortcut labels.

## Goals

- Vector drawing and layer-based artwork
- Timeline, keyframes, and deterministic interpolation
- Character bones, IK, constraints, switch layers, and Smart Bone-like controls
- Scene backgrounds, camera, audio, effects, and export
- A stable Windows desktop workflow with tests and versioned project files

## Requirements

- Node.js 20 or newer recommended
- npm
- Windows, macOS, or Linux for development; Windows is the primary release target

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm test
npm run build
```

The project persistence and point-editing update was authored through the GitHub API. The commands above have **not** been run in a local checkout for this update. Do not treat the branch as build-verified until these commands and a GUI launch are tested. Exporting a rendered animation and native rigging are not implemented.

## Project docs

- `src/engine/project.ts` — versioned JSON project serialization and validation
- `src/engine/project.test.ts` — project round-trip and validation tests
- `src/engine/timeline.ts` — translation keyframe evaluation
- [Development plan](DEVELOPMENT_PLAN.md)
- [Visual design reference](DESIGN_REFERENCE.md)
- [Local AI collaboration prompt](LOCAL_AI_PROMPT.md)

## Architecture

- `electron/` — Electron main process and isolated preload
- `src/App.tsx` — editor workspace UI prototype
- `src/engine/document.ts` — versioned document model and validation
- `src/engine/document.test.ts` — document model unit tests

## Development approach

Work in small feature branches, add tests for domain logic, inspect diffs, and report verification honestly. Keep document, geometry, animation, and rigging logic independent of the UI. Review third-party licenses before reusing code or assets.

## License

See [LICENSE](LICENSE).
