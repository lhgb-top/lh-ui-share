---
title: Style injection per port
description: 'share provides only style content; each UI library chooses how to inject it — why the two ports differ by design'
---

# Style injection per port

**share provides only style content** (SCSS source + tokens); **the injection method is each UI
library's own choice.** The two ports use different strategies, and that is a design decision rather
than a flaw. Neither port may keep a local copy of component scss to work around it (red line 2).

## The two ports side by side

| | lh-ui-plus (Vue3) | lh-ui-vue2 |
| --- | --- | --- |
| Library-entry injection | full side-effect: `src/index.ts` imports `@lh-ui/share/styles/<name>` per component, so importing the library yields all styles | none; users import on demand: `@lh-ui/vue2/theme.css` + `@lh-ui/vue2/style/<name>` |
| Style artifacts | `es\|lib/<name>/style/index.css` + `es/<name>/style/index.scss` (scss source shipped with the output, `@use` rewritten to bare specifiers) | `es\|lib/components/<name>/style/index.css` (css only) |
| Theme artifacts | `theme/index.css` + `dist/index.css` (theme + full) | `dist/theme/index.css` (light) + `dist/theme/index-dark.css` (dark) |
| On-demand subpaths | `./style/*` → `es/*/style/index.scss`; `./style-css/*` → `es/*/style/index.css` | `./style/*` → `es/components/*/style/index.css`; `./theme.css`, `./theme-dark.css` |
| Build scripts | `lh-ui-plus/scripts/build-styles.mjs` (component list scanned from `packages/components`) | `lh-ui-vue2/scripts/build-styles.mjs` (scanned from `src/components`; components without a share style source are skipped automatically) |

## Why the two ports differ

- **The Vue3 port** targets the majority case of "import the library and it just works": the vite
  ecosystem is friendly to side-effect style injection, full injection spares users the cost of
  configuring on-demand loading, and tree-shaking never applies to styles anyway — full is simply
  less hassle.
- **The Vue2 port** targets older projects and bundle-size-sensitive scenarios: in the webpack 4 era
  side-effect injection was easy to misconfigure, while the on-demand import form (two imports) is
  more predictable and lets users import only light or only dark.

## Coverage when adding a component

When a component is added, **both ports' build scripts pick it up automatically** (each scans its own
component directory), but `styles/` in share must contain the matching `<name>/index.scss` —
otherwise that component has no style artifact on one of the ports (a **silent skip**, no error).
This is a direct consequence of the "single source of styles" red line: create the styles in share
first, then create the component in each port.

## Cross-port transition class names: three mixins unify them

Vue2 transition class names are `-enter` / `-leave`; Vue3 / React use `-enter-from` / `-leave-from`
(`-leave-to` is the same on both). Hand-writing both sets inevitably drifts, so always `@include`:

```scss
@use '@lh-ui/share/styles/theme/common/transition' as *;

.lh-dialog-fade {
  @include lh-enter-both;          // -enter + -enter-from (Vue3)
  @include lh-leave-both;          // -leave + -leave-from
  @include lh-transition-ends;     // -enter-to + -leave-to (same on both ports)
}
```

Pass a second argument when the state needs to live on a **descendant node**:

```scss
@include lh-transition-ends('.lh-drawer-fade', '.lh-drawer__panel--right');
```

Component styles **must not hand-write duplicate transition class names**.

## Injection constraint for theme customization output

`buildPresetStyleText(vars)` produces injectable `<style>` text (`:root` + the dark block). When the
UI layer adopts it, **write a `<style>` element only — never an inline style on `documentElement`**:

> An inline style has higher specificity than the entire dark-variable block in `var-dark.scss`,
> which distorts dark-mode colors.

See [Theme customization](/theme/customization).
