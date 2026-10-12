---
title: Introduction
description: 'What @lh-ui/share is, what problem it solves, and where it sits in the lh-ui family'
---

# Introduction

**`@lh-ui/share` is the single framework-agnostic shared layer of the lh-ui component family.**

It extracts "the half of a component library that does not depend on any framework" into its own
repository: class-name computation, state machines, accessibility attribute packs, the positioning
engine, virtual scrolling, theme tokens, internationalized messages, and component style sources.
The UI libraries of each framework (lh-ui-plus / lh-ui-vue2 / lh-ui-react / lh-ui-uniapp) consume
this package as an npm dependency when published; for local development inside the family, editing
this repo's source takes effect immediately in every UI library — no build step, no release.

## Why this layer exists

Only a small part of a component library's logic genuinely depends on framework reactivity:

- Whether a class name should be present is a pure computation of `(size, disabled) => string`.
- Which way a dropdown panel should flip is geometry.
- Which rows a list should render is an index-range computation.
- The label of a "Confirm" button is a language-pack lookup.

By distilling these into pure functions, the four framework ports **never have to write, get wrong,
and fix them separately**. The framework layer is left with exactly one job: bind the pure
functions' output to templates and feed user input back into them.

## What is in this repository

| Layer | Contents | Count |
| --- | --- | --- |
| `src/core/<component>/` | Component pure functions (`logic.ts` / `types.ts`), zero framework imports | 56 components |
| `src/core/shared/` | Cross-component shared kernel (popper / virtual / sx / keyboard / focus-trap …) | 12 modules |
| `src/theme/` | Theme TS side: types + 5 presets + runtime primitives | — |
| `styles/` | The **single source** of component BEM styles + `theme/common/*.scss` tokens | 58 style suites |
| `src/locales/` | Internationalization (LhLocale is a pure event emitter) + 6-language skeleton | — |
| `src/constants/` `src/types/` `src/utils/` | Constants / types / pure utilities (incl. createNamespace) | — |

> **Counting convention**: `core` holds 56 component directories while `styles` ships 58 suites —
> `layout` / `tree-select` have style sources but their logic lives entirely in the UI layer
> (layout containers, framework-side glue of the tree selector), and `config` is named
> `config-provider` in the styles directory. See [Package structure](/guide/structure).

## Design principles

1. **Zero framework dependency**: `src/` forbids `import 'vue' | 'react' | '@dcloudio/*'`, enforced
   by a CI grep gate. The package is bundled with `external: []` — fully dependency-free.
2. **Single source of styles**: `styles/` is the only source of component BEM styles for the whole
   family; no UI library may keep a local copy of component scss. Cross-framework transition
   class-name differences are unified by three mixins in `transition.scss`.
3. **A single copy of unit tests**: core tests live only in this repo's `tests/unit/`; the three
   libraries share that result instead of copying it.
4. **Reactivity belongs to the UI layer**: core only produces data; subscriptions and reactive
   wiring are each UI library's job. This is why LhLocale is a plain emitter, relying on an
   incrementing `version` so each port re-renders with its own mechanism.
5. **Light and dark on equal footing**: every component supports both light and dark by default.
   Components may only consume tokens via `var(--lh-*, fallback)`; dark completeness is guarded by
   item 7 of `verify:styles`.

## What it is not

- **Not a UI library**: this package renders nothing and has no component runtime. For components
  you can use directly, install one of the framework ports — `@lh-ui/vue3`, `@lh-ui/vue2`, etc.
- **Depends on no UI library and no framework**: it is the bottom layer — depended upon, never
  depending.
- **Not responsible for the deployment step**: theme customization produces `<style>` text and CSS
  variables; how they get injected into the DOM is decided by each port's ConfigProvider.

## Family layout

```
lh-ui/
├── lh-ui-share/      ← this repo: framework-agnostic shared layer (core / theme / styles / locales)
├── lh-ui-plus/       Vue3 port (full side-effect style injection)
├── lh-ui-vue2/       Vue2 port (on-demand theme.css + style/<name>)
├── lh-ui-react/      React port
├── lh-ui-uniapp/     uniapp port
├── docs/             family documentation site (another repo)
└── native/           native ports (android / ios / harmony; applicationId uses top.lhgb.*)
```

The release order is a hard constraint: **share is released first, UI libraries follow**. Change
share → write a changeset → release → each library runs `pnpm up @lh-ui/share` and regresses.

## Next steps

- [Getting started](/guide/getting-started) — install, import styles, run your first pure function
- [Package entry points and subpaths](/guide/exports) — how to pick from the 77 export keys
- [Consuming from each framework](/guide/consumption) — wiring samples for Vue3 / Vue2 / React / uniapp
