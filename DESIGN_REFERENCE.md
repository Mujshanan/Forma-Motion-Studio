# Forma Motion Studio — Visual Design Reference

Use the two user-provided images as visual and workflow references.

## Character design sheet

The first reference shows a character turnaround and reusable asset sheet: front/side/back/three-quarter views, separate torso/head/hair/arm/leg artwork, facial expression variants, hand poses, and a compact color palette.

Product implications:
- Support reusable artwork groups and named character parts.
- Organize switchable eyes, mouths, hands, and character views.
- Provide layer visibility/order and a character/asset panel.
- Keep the same artwork model when moving between drawing, rigging, and animation.

## Rigging canvas

The second reference shows the intended rig workspace: dark charcoal interface, large central artboard, generous surrounding workspace, a compact floating vertical tool palette, minimal top bar with frame and zoom information, a bottom contextual status bar, and bones/joints drawn visibly over the character. A selected bone should have a clear selection state and nearby angle/rotation readout.

## Visual rules

- Dark neutral chrome, subtle separators, compact typography, restrained accent color.
- Keep the artwork dominant; avoid oversized sidebars and generic dashboard styling.
- Make selected, hovered, locked, hidden, and active states easy to distinguish.
- Use simple consistent tool icons, discoverable labels, and keyboard shortcuts.
- Plan for dockable/collapsible panels, but prioritize canvas space in the first implementation.

## Connected workspaces

1. Draw — vector paths, fills, strokes, layers, character parts.
2. Rig — bones, joints, hierarchy, constraints, binding.
3. Animate — timeline, keyframes, pose controls, playback.
4. Character/Assets — turnarounds, body parts, expressions, hand switches, palettes.
5. Export — render range, dimensions, frame rate, output and progress.

## Implementation order

1. Match the dark workspace and central artboard layout.
2. Implement interactive SVG drawing and selection.
3. Add selection handles and transforms.
4. Add bone segments, joints, selection, and angle display.
5. Add timeline and frame scrubbing.
6. Add character-part and switch-layer management.
7. Refine docking, shortcuts, and accessibility.

These are design goals, not claims that the features already exist. Treat the references as inspiration, not assets to bundle or copy into the application.