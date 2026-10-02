# @lh-ui/share

> The single **framework-agnostic shared layer** of the lh-ui family: core pure functions / theme / constants / locales / types / utils / component style sources.

English | [中文](./README.md)

Each framework UI layer (lh-ui-vue2 / lh-ui-react / lh-ui-uniapp) consumes this package as an npm dependency. **This package depends on no UI library and no framework** — the `vite` build sets `external: []`, and `verify:dts` scans the emitted `.d.ts`, failing on any `vue` / `react` / `@dcloudio/*` or stale-alias import.

## Features

- **Framework-agnostic component logic**: pure functions for 56 components (a `logic.ts` / `types.ts` / `index.ts` triple per component) + 5 shared kernels (`sx` / `pt` / `popper` / `focus-trap` / `types`). State in, classNames/styles out — no side effects, directly unit-testable.
- **Single source of truth for styles**: `styles/` is the only home for every component's BEM styles; transition classes are **dual-written** (`-enter` alongside `-enter-from`) so they serve Vue2 / Vue3 / React at once.
- **Chinese-style theme system**: SCSS tokens (`variables.scss`, all `!default` and overridable) + 5 preset themes (Ceramic Blue / Pine Green / Vermilion / Ink Wash / Golden Autumn) + dark mode + 6 built-in patterns (willow / cloud / water / snow / plum / bamboo).
- **Pure-emitter i18n**: `LhLocale` contains no framework reactivity — it drives updates via a monotonically increasing `version` and `subscribe`, letting each framework wire it up itself.
- **Consumer-friendly artifacts**: dual ESM (`es/`) + CJS (`lib/`) output, `preserveModules` mirroring the `src/` layout so subpath imports tree-shake naturally; declaration files are emitted by `tsc` in the same mirrored structure.

## Installation

```bash
pnpm add @lh-ui/share
```

## Usage

> Prefer **subpath imports** (clearer layering and better tree-shaking); the root entry `@lh-ui/share` is a convenience aggregation only.

### Core — component pure functions

Take button as an example: pass in the state collected on the framework side, get back BEM classNames and inline styles.

```ts
import { getClassNames, getSize, isClickable, getStyle } from '@lh-ui/share/core/button'

const classes = getClassNames({
  type: 'primary',
  size: getSize(props.size, configProvider.size), // precedence: props > ConfigProvider > default medium
  loading: false,
  disabled: false,
  plain: false,
  block: false,
  round: true,
  circle: false,
})
// => ['lh-button', 'lh-button--primary', 'lh-button--medium', 'lh-button--round', ...]

isClickable({ loading, disabled }) // => whether it can be clicked
getStyle()                          // => {} (CSS variables are defined globally on :root, no need to repeat on the button)
```

Types come from the same directory: `import type { LhButtonState } from '@lh-ui/share/core/button'`.

### Shared kernels

```ts
// sx: Tailwind-style spacing shorthand → inline styles (numeric spacing is multiplied by 8px)
import { sxToStyle } from '@lh-ui/share/core/shared/sx'
sxToStyle({ mt: 2, px: 4, display: 'flex' }) // => { marginTop: '16px', paddingLeft: '32px', paddingRight: '32px', display: 'flex' }

// pt: merges pass-through attributes for internal elements (class accepts string / array / object)
import { mergePt } from '@lh-ui/share/core/shared/pt'
mergePt({ class: 'extra', style: { color: 'red' } }, 'lh-button__text')

// popper: positioning engine — takes plain rect literals, never touches the DOM, fully unit-testable
import { computePosition } from '@lh-ui/share/core/shared/popper'
computePosition(triggerRect, popperRect, viewportRect, { placement: 'bottom-start', gap: 8, flip: true, shift: true })
// => { top, left, placement, arrowOffset }; supports 12 placements, primary-axis flip, cross-axis shift

// focus-trap: focus management for overlays such as Dialog / Drawer
import { focusFirst, trapTabKey, setInertOutside } from '@lh-ui/share/core/shared/focus-trap'
```

### Theme

The TS side provides 5 presets (primary-color recoloring):

```ts
import { THEME_PRESETS, getThemeVars, getThemePreset } from '@lh-ui/share/theme'

THEME_PRESETS // [{ name: 'cerblue', label: '青花瓷', labelEn: 'Ceramic Blue', ... }, ...]
getThemeVars('zhusha') // => { '--lh-primary-color': '#B23A3A', ... }
```

| Preset | Name | Primary |
| --- | --- | --- |
| `cerblue` | Ceramic Blue | `#2B4C7C` |
| `songhua` | Pine Green | `#5B8C5A` |
| `zhusha` | Vermilion | `#B23A3A` |
| `shuimo` | Ink Wash | `#2C2C2C` |
| `golden` | Golden Autumn | `#B8860B` |

The CSS side imports the tokens (`styles/theme/` is the SCSS source, `dist/theme/` the build output):

```ts
// All tokens (light + dark + patterns in one file)
import '@lh-ui/share/theme.css'

// Dark only (compiles standalone, import on demand)
import '@lh-ui/share/theme-dark.css'

// Full styles (theme + all components)
import '@lh-ui/share/styles.css'
```

Dark mode is toggled by a selector — either one works:

```html
<html data-theme="dark"></html>
<!-- or -->
<div class="dark"></div>
```

Patterns (Chinese-style background textures): import `theme.css` first, then set the pattern variable —

```css
:root {
  --lh-bg-pattern: var(--lh-pattern-willow); /* willow / cloud / water / snow / plum / bamboo */
}
```

You can also pass `bg-pattern` through a ConfigProvider's `themeVars`. If you `@use` the SCSS source yourself, every token is `!default`, so you can override with `@use '...' with ($lh-primary: ...)`.

### Locales — internationalization

```ts
import { lhlocale, zhCN, enUS } from '@lh-ui/share/locales'

lhlocale.use({ locale: 'en-US', messages: enUS }) // switch and register the pack
lhlocale.t('input.placeholder')                    // => 'Please input'
lhlocale.setLocale('zh-CN')                        // switch back (takes effect immediately if the pack is registered)
lhlocale.add('xx-XX', customMessages)              // register only, without switching
```

Framework wiring: `LhLocale` is a pure emitter — drive updates off the version number.

```ts
// Vue2 / Vue3
const version = ref(lhlocale.version)
const unsubscribe = lhlocale.subscribe((v) => (version.value = v))
onUnmounted(unsubscribe)

// React
useSyncExternalStore(lhlocale.subscribe, () => lhlocale.version)
```

> **Note**: `t()` only resolves a dot path to a string — it does **not** interpolate `{name}` placeholders. When nothing is found it returns `fallback` (or the path itself if omitted). The complete packs are currently `zh-CN` and `en-US`; ja-JP / ko-KR / de-DE / fr-FR are English-fallback skeletons.

### Utils — utilities

```ts
import { createNamespace, cssVars, toCssVarName, stripCssVarName } from '@lh-ui/share/utils'

const ns = createNamespace('button')
ns.b()          // 'lh-button'
ns.e('text')    // 'lh-button__text'
ns.m('primary') // 'lh-button--primary'
ns.em('text', 'disabled') // 'lh-button__text--disabled'
ns.is('loading', true)    // 'is-loading' (returns '' for false/undefined)

cssVars({ 'primary-color': '#2B4C7C' }) // => { '--lh-primary-color': '#2B4C7C' }
toCssVarName('primary-color')            // => '--lh-primary-color' (idempotent — passes through if already prefixed)
stripCssVarName('--lh-primary-color')    // => 'primary-color'
```

Also available: `debounce` / `throttle` / `deepMerge` / `generateId` / `isEmpty` / `getScrollbarWidth` and other helpers (DOM-touching ones like `generateId` require a browser environment).

### Constants

```ts
import { LH_TYPES_CONST, LH_SIZE_CONST, LH_SIZE_DEFAULT, LH_LANGUAGE_CONST, LH_LANGUAGE_DEFAULT } from '@lh-ui/share/constants'
LH_TYPES_CONST    // { success, warning, error, info, danger }
LH_SIZE_CONST     // { small, medium, large, mini, old: 'x-large' } (old is the elderly-accessible size)
LH_LANGUAGE_CONST // { zhCN: 'zh-CN', enUS: 'en-US' }
```

### Styles — component styles

```ts
// Per-component styles (raw SCSS source — consumers need an SCSS compilation pipeline)
import '@lh-ui/share/styles/button'
import '@lh-ui/share/styles/dialog'

// Or import the full compiled bundle at once
import '@lh-ui/share/styles.css'
```

Class names follow BEM `lh-*`, and colors always use the `var(--lh-*, <fallback>)` form — no hardcoded color values.

## Subpath exports

| Subpath | Contents |
| --- | --- |
| `.` | Root aggregation entry (all sublayers) |
| `./core` / `./core/*` | Component pure functions; `./core/button` etc. match by directory |
| `./constants` | Constants |
| `./locales` | i18n (`lhlocale` + language packs + types) |
| `./theme` | Theme presets and types |
| `./types` | Types only (no runtime output) |
| `./utils` | Utility functions |
| `./theme.css` | `dist/theme/index.css` (light + dark + patterns) |
| `./theme-dark.css` | `dist/theme/index-dark.css` (dark only) |
| `./styles/*` | `styles/*/index.scss` (**raw SCSS source**) |
| `./styles.css` | `dist/styles/index.css` (theme + all components, compiled) |

## Directory layout

```
src/core/<name>/    Component pure-function triple: logic.ts / types.ts / index.ts
src/core/shared/    Shared kernels: sx / pt / popper / focus-trap / types
src/theme/          Theme TS side (types + 5 presets)
src/constants/      Constants
src/locales/        Language packs (LhLocale is a pure emitter)
src/types/ src/utils/  Types / pure utilities
styles/             The single source for component BEM styles: <name>/index.scss + theme/common/*.scss (tokens)
tests/unit/         The single copy of core unit tests (shared by the three libraries, never duplicated)
scripts/            build-styles / normalize-styles / verify-dts / extract-from-plus
```

## Commands

| Task | Command |
| --- | --- |
| Build (es/lib, preserveModules mirrored structure) | `pnpm build` |
| Style artifacts (dist/theme + dist/styles) | `pnpm build:styles` |
| Declaration files (tsc, mirrored output) | `pnpm build:dts` |
| Verify dts (mirror completeness + no framework imports) | `pnpm verify:dts` |
| Unit tests | `pnpm test` |
| Lint / types | `pnpm lint` / `pnpm typecheck` |

CI runs, in order: `lint → typecheck → test → build → build:styles → build:dts → verify:dts`. Testing, building and other verification steps are **run manually by the user**; after delivery, only the command list is provided.

## Boundaries and contributing

- No `import 'vue' | 'react' | '@dcloudio/*'` or any framework API inside `src/`; reactive wiring belongs to each UI layer.
- `styles/` is the single source of component styles: never copy styles into a UI library to hand-edit them; every style change happens in this repository.
- The single copy of core unit tests lives here; UI libraries must not duplicate it.
- Release order: **share is published first, UI libraries follow** — a share change → changeset → publish → each library runs `pnpm up @lh-ui/share` and regresses.

Full conventions in [AGENTS.md](./AGENTS.md).
