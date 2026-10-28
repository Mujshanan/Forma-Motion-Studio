# Forma Motion Studio — Visual Design Reference

Use the user-provided character/rigging images and the StykAnimate-App interface as design references. Recreate the useful layout principles independently; do not copy StykAnimate source code or assets into this repository.

## StykAnimate-inspired editor chrome

Reference: https://github.com/filippocalippo/StykAnimate-App

The current UI pass adapts these high-level interaction patterns:
- A single top band containing the app menu, project tab, workspace switcher, undo/redo, save, and export actions.
- Three primary editing modes: Animate, Draw, and Build (rigging).
- A narrow vertical tool strip on the left.
- A central scene/artboard with compact scene metadata and zoom information.
- A timeline docked below the artboard, with transport controls, frame numbers, and layer tracks.
- A right inspector with Properties, Layers, and Rig tabs.
- Compact, muted editor chrome with a lime accent, subtle separators, and clear active states.

This is an independent implementation in Forma's React UI, not copied StykAnimate code. StykAnimate's repository declares GPL-3.0-or-later; copying its implementation would require a deliberate license decision for this project. Keep Forma's existing licensing unless the project owner explicitly chooses otherwise.

## Character design sheet

The character reference shows a turnaround and reusable asset sheet: front/side/back/three-quarter views, separate torso/head/hair/arm/leg artwork, facial expression variants, hand poses, and a compact color palette.

Product implications:
- Support reusable artwork groups and named character parts.
- Organize switchable eyes, mouths, hands, and character views.
- Provide layer visibility/order and a character/asset panel.
- Keep the same artwork model when moving between drawing, rigging, and animation.

## Rigging canvas

The rigging reference shows a dark charcoal interface, large central artboard, a compact vertical tool palette, minimal top bar with frame and zoom information, a bottom contextual status bar, and visible bones/joints over the character. A selected bone should have a clear selection state and nearby angle/rotation readout.

## Visual rules

- Keep the artwork dominant; avoid oversized sidebars and generic dashboard styling.
- Make selected, hovered, locked, hidden, and active states easy to distinguish.
- Use consistent tool icons, discoverable labels, and keyboard shortcut hints.
- Plan for dockable/collapsible panels, but prioritize canvas space first.
- Preserve keyboard accessibility and responsive layout.

## Connected workspaces

1. Draw — vector paths, fills, strokes, layers, character parts.
2. Rig / Build — bones, joints, hierarchy, constraints, binding.
3. Animate — timeline, keyframes, pose controls, playback.
4. Character/Assets — turnarounds, body parts, expressions, hand switches, palettes.
5. Export — render range, dimensions, frame rate, output and progress.

## Implementation order

1. Establish the editor chrome and central artboard.
2. Implement interactive SVG drawing and selection.
3. Add selection handles and transforms.
4. Add bone segments, joints, selection, and angle display.
5. Implement a functional timeline and deterministic frame evaluation.
6. Add character-part and switch-layer management.
7. Refine docking, shortcuts, accessibility, and export.

The current screen is a UI prototype. Most controls are visual scaffolding and do not yet implement real project persistence, vector editing, rigging, animation evaluation, or export.
