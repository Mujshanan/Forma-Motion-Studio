# Suika drawing-engine integration

## Decision

Forma will use [Suika](https://github.com/F-star/suika) as its primary vector drawing and path-editing engine. Forma remains responsible for animation, timeline evaluation, rigging, scene composition, and project-level persistence.

Suika is an MIT-licensed TypeScript monorepo. Its core package is private and depends on workspace packages `@suika/common`, `@suika/geo`, and `@suika/pathkit`. It cannot be integrated reliably by adding `@suika/core` as an ordinary npm dependency or by copying only its pen tool.

## Integration phases

1. **Vendor/build boundary:** pin an upstream Suika commit, bring in the core package and its required workspace packages, preserve upstream MIT notices, and record the BSD-3-Clause license for PathKit. Avoid unrelated Suika apps and backend packages.
2. **Canvas mount:** mount one Suika editor instance in Forma's Draw workspace. Do not keep two competing drawing canvases or undo histories.
3. **Document adapter:** translate between Suika's path/shape representation and Forma's project model. Keep stable artwork IDs and layers; retain Forma keyframes separately from static path geometry. Extend the project schema with a versioned migration before storing richer path commands.
4. **Animation boundary:** evaluate Forma's frame pose and apply it to the corresponding Suika artwork at render time. Editing geometry must not silently bake animation translations into path coordinates.
5. **Verification:** add adapter round-trip tests, verify old v1 Forma projects still open, run `npm test` and `npm run build`, then smoke-test pen placement, Bézier handles, node editing, selection, save/reopen, and animated transforms in Electron.

## Compatibility constraints

- Existing Forma v1 artwork stores only point arrays, stroke settings, and translation keyframes. It cannot losslessly represent cubic Bézier paths.
- Do not convert Suika Bézier paths to sampled polylines as the canonical save format; that would lose editable handles.
- Keep the current point-array model as a legacy import path while adding a new versioned path-command model.
- Keep project autosave and undo/redo coherent with the single drawing engine. Avoid duplicating Suika's path-editing history in Forma.
- Do not copy code from GPL-licensed drawing applications into this MIT repository.

## Current status

This document records the integration contract and work sequence. It does **not** mean Suika has been vendored or mounted yet. The next code change should add the pinned upstream source/build boundary; only after that should the React canvas be replaced.
