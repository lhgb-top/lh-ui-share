---
title: Runtime Customization
description: 'themeVars shorthand prefix completion, componentTheme per-component overrides, patternComponents pattern whitelist'
---

Runtime customization is the core capability of the lh-ui theme system: change component appearance at runtime **without recompiling styles**. Three APIs, each governing one layer.

## 1. themeVars — global token overrides

ConfigProvider accepts `themeVars`, whose keys are **shorthands**:

```vue
<lh-config-provider
  :theme-vars="{
    'primary-color': '#1677ff',
    'border-radius-base': '8px',
  }"
>
  <App />
</lh-config-provider>
```

### Shorthand prefix completion

`'primary-color'` is auto-completed to `--lh-primary-color`. This completion is done by [toCssVarName](/reference/utils#the-cssvars-trio) and is **idempotent** (keys that already carry the prefix are returned as-is, never turning into `--lh---lh-...`).

You can also write the full name directly:

```ts
{ '--lh-primary-color': '#1677ff' }   // equivalent
```

The underlying implementation is `cssVars(themeVars)`, which turns the key-value pairs into a CSS-variable object that can be bound directly to `:style`.

### The scope is a DOM subtree

CSS variables cascade naturally: ConfigProvider injects the variables into the wrapper element, so **only its descendant components see the new values**. This lets you do localized re-skinning:

```vue
<lh-config-provider :theme-vars="brandVars">
  <Header />
</lh-config-provider>

<lh-config-provider :theme-vars="neutralVars">
  <Content />
</lh-config-provider>
```

### What the docs site exports is the same thing

The `:root { --lh-*: ... }` text exported by the docs theme-customization page and `themeVars` are **the same thing** written to a file — you can paste it straight into your project entry:

```css
/* Project entry */
:root {
  --lh-primary-color: #2B5FA6;
  --lh-primary-color-hover: #3D72BC;
  /* ... */
}
```

## 2. componentTheme — per-component overrides

`themeVars` is global; sometimes you only want to change one component's tokens (for example, the radius of all buttons, while leaving other components alone).

```vue
<lh-config-provider
  :component-theme="{
    button: { 'border-radius': '20px' },
    input: { 'control-height-medium': '40px' },
  }"
>
  <App />
</lh-config-provider>
```

The key is the component name (the directory name under `styles/`), and the value is that component's scoped `themeVars`. At injection the variables carry the component prefix for scoping, affecting only the specified component. The key names must match the token names exactly (`control-height-medium` → `--lh-control-height-medium`) — `input`'s default step is medium, and a `control-height` without a step suffix is consumed by no component.

**Note**: component-level tokens depend on that component's SCSS consuming the corresponding token via `var(--lh-<name>-*)` — not every component has tokenized every style point; what you can change is governed by that component's behavior in the [Design Tokens](/theme/tokens) table.

## 3. patternComponents — the pattern whitelist

Traditional Chinese patterns (see [Traditional Chinese Patterns](/theme/patterns)) are **not enabled** by default. When enabled they affect the background, which not every component suits (printing plum blossoms on a table background would be chaotic).

`patternComponents` controls which components get the pattern:

```vue
<lh-config-provider
  :pattern-components="['card', 'dialog', 'drawer']"
  pattern="plum"
>
  <App />
</lh-config-provider>
```

Only components in the whitelist carry the pattern. See each UI library's ConfigProvider docs for the exact prop names.

## 4. Stacking presets with customization

The three can be stacked, with the priority "descendants override ancestors, the specific overrides the global":

```vue
<lh-config-provider
  theme="cerblue"
  :theme-vars="{ 'border-radius-base': '4px' }"
>
  <!-- Apply the cerblue porcelain preset first, then fine-tune the radius with themeVars -->
  <App />
</lh-config-provider>
```

## 5. Dark mode and customization

The customized `themeVars` only affect the light/dark state of the subtree they are injected on:

```vue
<!-- This block is forced into dark mode -->
<div data-theme="dark">
  <lh-button>Dark button</lh-button>
</div>
```

- The dark switch is the `[data-theme='dark']` attribute or the `.dark` class (the selectors in `var-dark.scss`).
- **Do not put `themeVars` on `documentElement`'s inline style** — inline style has higher specificity than the entire dark variable block in `var-dark.scss`, which distorts the dark-mode palette (see [the injection constraint in the theme overview](/theme/overview#injection-constraint-only-write-style-never-inline-style)).

## 6. What cannot be changed at runtime

| What you want to change | Can you? | Alternative |
| --- | --- | --- |
| Primary color, text color, radius, spacing, and other tokens | ✅ `themeVars` | — |
| A single component's tokens | ✅ `componentTheme` | — |
| Patterns | ✅ `pattern` + `patternComponents` | — |
| Component heights (input 37px, etc.) | ⚠️ Limited | Height tokens are not unified yet; see [known gaps](/theme/tokens#known-token-gaps) |
| Component DOM structure / class names | ❌ | Use [pt pass-through](/core/pt) or slots |
| Shadow elevation composition | ❌ Compile time | Override the `$lh-*` SCSS variables and recompile |
| Animation curves | ✅ `--lh-animation-timing-function` | — |

## Example: a complete theme configuration

```vue
<template>
  <lh-config-provider
    theme="songhua"
    :theme-vars="{
      'border-radius-base': '8px',
      'font-size-base': '15px',
    }"
    :component-theme="{
      button: { 'border-radius': '999px' },
    }"
    :pattern-components="['card', 'dialog']"
  >
    <App />
  </lh-config-provider>
</template>
```

## Notes

- **Do not double-prefix shorthand keys**: write `'primary-color'`, not `'--lh-primary-color'` (idempotent as it is, but sticking to shorthands is cleaner).
- **Scope leakage**: `themeVars` only affects descendant components; conversely, an **ancestor** ConfigProvider's variables are overridden by a descendant's (CSS cascade rules).
- **Injection location**: ConfigProvider injects into the wrapper element (not `documentElement`), keeping it removable and localizable.
- **SSR**: what gets injected is plain CSS variables; server-side rendering outputs an inline style, and it stays consistent after client hydration.

## Related docs

- [Theme System Overview](/theme/overview)
- [Theme Presets](/theme/presets)
- [Design Tokens](/theme/tokens)
- [Traditional Chinese Patterns](/theme/patterns)
- [cssVars utilities](/reference/utils#the-cssvars-trio)
