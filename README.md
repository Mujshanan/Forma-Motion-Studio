# Forma Motion Studio

A new Windows-first, vector-first 2D character animation editor inspired by the workflow of Moho.

> **Early development:** this repository now contains an initial Electron + React + TypeScript scaffold. The current UI is a workspace prototype, not a finished animation editor. Drawing, rigging, animation evaluation, save/open, and export are planned features, not yet complete.

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

These commands are provided by the scaffold but have not yet been verified in a local runtime for this initial commit.

## Project docs

- [Development plan](DEVELOPMENT_PLAN.md)
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
