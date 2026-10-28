# Forma Motion Studio

A new Windows-first, vector-first 2D character animation editor inspired by the workflow of Moho.

> **Early development:** the repository contains an Electron + React + TypeScript scaffold and the first interactive editor UI milestone. The visible character, layers, and rig overlay are sample UI content. This is not yet a finished animation editor; native drawing paths, real rigging, animation evaluation, save/open, and export are still planned.

## Current UI prototype

- Dark editor shell with Draw, Rig, Animate, Assets, and Export workspaces.
- Central 16:9 artboard with a sample character illustration.
- Tool rail with Select, Pen, Shape, Bone, and Hand tools.
- Click the canvas with Pen or Shape selected to add prototype marks.
- Rig workspace displays a sample skeleton overlay and selected-bone properties.
- Layers, Style, timeline scrubbing, frame stepping, zoom controls, and a placeholder export panel.
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

The GitHub API was used to author this UI update; the commands above have **not** been run in a local checkout for this update. Do not treat the UI prototype as build-verified until these commands and a GUI launch are tested.

## Project docs

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
