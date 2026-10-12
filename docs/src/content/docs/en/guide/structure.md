---
title: Package structure
description: 'Directory responsibilities of src / styles / tests / scripts, and the two component counts 56 and 58'
---

# Package structure

## Source side

```
lh-ui-share/
├── src/
│   ├── core/                  component pure-function layer (zero framework imports, CI grep gate)
│   │   ├── <component>/       the logic.ts / types.ts / index.ts triplet
│   │   └── shared/            cross-component kernel (12 modules, normalized to <name>/index.ts)
│   ├── theme/                 theme TS side: types + 5 presets + runtime primitives
│   ├── constants/             LH_* constants (LH_SIZE_DEFAULT / LH_LANGUAGE_DEFAULT …)
│   ├── locales/               LhLocale (pure emitter) + lang/ six-language skeleton
│   ├── types/                 public types (locale / components)
│   ├── utils/                 pure utilities (createNamespace / deepMerge …)
│   └── index.ts               full aggregation entry
├── styles/                    the single source of component BEM styles
│   ├── <component>/index.scss 58 component style suites
│   └── theme/
│       ├── common/
│       │   ├── var.scss       light tokens (:root, 185 --lh-* variables)
│       │   ├── var-dark.scss  dark overrides ([data-theme='dark'], .dark, 118 entries)
│       │   ├── variables.scss 183 $lh-* SCSS variables (!default)
│       │   ├── patterns.scss  6 traditional-pattern mixins
│       │   ├── transition.scss three transition class-name mixins (unify both ports)
│       │   └── a11y.scss      accessibility helper styles
│       └── index.scss         theme aggregation
│   └── index.scss             full aggregation (tokens + all components; script-generated, do not hand-edit)
├── tests/unit/                the single copy of core unit tests (shared by three libraries)
├── scripts/                   build and verification scripts
├── docs/                      this documentation site (Astro Starlight)
└── .changeset/                pending changesets
```

## Directory responsibilities

| Directory | Responsibility | Red line |
| --- | --- | --- |
| `src/core/<name>/` | component pure functions: class names / state machines / aria attribute packs | no `import 'vue' \| 'react' \| '@dcloudio/*'` |
| `src/core/shared/` | cross-component kernel, reused directly by every port | same; normalized to `<name>/index.ts` |
| `styles/` | the **single source** of component BEM styles | never copy styles into a UI library to hand-edit; class names are `lh-*`; colors are always `var(--lh-*, fallback)` |
| `tests/unit/` | the **single copy** of core unit tests | UI libraries must not duplicate it |
| `scripts/` | extract-from-plus (one-time) / build-styles / verify-* / release | — |

## Component counts: 56 or 58

Both numbers are correct — they count different things:

| Convention | Number | Source |
| --- | --- | --- |
| core pure-function components | **56** | component directories under `src/core/` (excluding `shared/`) |
| component style suites | **58** | component directories under `styles/` (excluding `theme/`) |

The difference comes down to these three:

| Name | core | styles | Reason |
| --- | --- | --- | --- |
| `layout` | — | ✅ | layout container; logic lives entirely in the UI layer (reactive breakpoint wiring for row/col) |
| `tree-select` | — | ✅ | selector glue is on the framework side; tree data logic reuses `core/tree` |
| `config` ↔ `config-provider` | `config` | `config-provider` | the same thing under two directory names |

## Build output

`pnpm build` produces four directories, and `files` publishes exactly those four:

| Output | Structure | Notes |
| --- | --- | --- |
| `es/` | preserveModules mirror of `src/` | ESM; subpaths allow per-file on-demand loading |
| `lib/` | same | CJS (the `require` condition) |
| `dist/` | `dist/theme/*.css` `dist/styles/index.css` | aggregated style artifacts |
| `styles/` | published as-is | **SCSS source** for projects to compile themselves |

The output stays **zero-dependency**: `verify:dts` scans `es/**/*.d.ts` and fails on any framework import.

## What a single component's output looks like (button example)

```
es/button/
├── index.d.ts        types
├── index.js          ESM
├── logic.d.ts
├── logic.js
├── types.d.ts
└── style/
    ├── index.css     compiled component styles (plus-port shape)
    └── index.scss    source (@use rewritten to bare specifiers, shipped with the output)
```

`lib/button/` is isomorphic. Each UI library then wraps it once more as
`es/components/<name>/style/index.css` (the vue2 port ships css only, no scss).
