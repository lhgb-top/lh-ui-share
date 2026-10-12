---
title: Traditional Chinese Patterns
description: 'Six inline SVG patterns — willow / cloud / water / snow / plum / bamboo — and the apply-pattern mixin'
---

Traditional Chinese style is not decoration for lh-ui — it is one of its design propositions. `styles/theme/common/patterns.scss` provides six traditional motifs, injected as an optional background layer.

## The six patterns

| Pattern | CSS variable | Description |
| --- | --- | --- |
| Willow | `--lh-pattern-willow` | Slender willow leaves, evenly spaced, dancing in the wind |
| Cloud | `--lh-pattern-cloud` | Auspicious clouds unfurling, meandering and flowing |
| Water | `--lh-pattern-water` | Rippling water, layer upon layer |
| Snow | `--lh-pattern-snow` | Six-pointed snowflakes with finely branching arms |
| Plum | `--lh-pattern-plum` | Five petals spreading, stamens distinct |
| Bamboo | `--lh-pattern-bamboo` | Lanceolate bamboo leaves, clear midribs, artfully scattered |

All are inlined as `data:image/svg+xml` (**no external resources**, no network dependency, no CORS issues), and are `!default` so users can override them. There is also `--lh-pattern-none: none` (explicitly no pattern).

## Enabling patterns

Patterns are **disabled by default** (`--lh-bg-pattern: none`). Three ways to enable them:

### 1. Write it directly in a component / page

```scss
.my-card {
  --lh-bg-pattern: var(--lh-pattern-plum);
}
```

### 2. ConfigProvider's themeVars

```vue
<lh-config-provider :theme-vars="{ 'bg-pattern': 'var(--lh-pattern-plum)' }">
  <App />
</lh-config-provider>
```

The shorthand `'bg-pattern'` is auto-completed to `--lh-bg-pattern`.

### 3. The pattern prop + whitelist

```vue
<lh-config-provider
  pattern="plum"
  :pattern-components="['card', 'dialog', 'drawer']"
>
  <App />
</lh-config-provider>
```

Patterns affect the background, which not every component suits (printing plum blossoms on a table background would be chaotic). The `patternComponents` whitelist controls which components get them. See [Runtime Customization](/theme/customization#3-patterncomponents--the-pattern-whitelist).

## Control tokens

```scss
:root {
  --lh-bg-pattern: none;                                     // disabled by default
  --lh-bg-pattern-repeat: repeat;                            // tiling mode
  --lh-bg-pattern-size: 40px;                                // unit size (40px by default fits the button height so motifs are not cut off)
  --lh-bg-pattern-opacity: 0.15;                             // opacity
  --lh-bg-pattern-color: var(--lh-decoration-color, rgba(184, 134, 11, 0.12));  // color
  --lh-bg-pattern-blend: soft-light;                         // blend mode
}
```

All are `!default` and overridable. The two most-used knobs:

- **`--lh-bg-pattern-size`**: 40px is the size at which "one complete motif fits within the button height"; for large block backgrounds you can go to 80px+ so the motifs breathe.
- **`--lh-bg-pattern-opacity`**: 0.15 is the default for "present but not loud"; if you want a stronger traditional atmosphere, take it to 0.25.

## The apply-pattern mixin

```scss
// styles/theme/common/patterns.scss
@mixin apply-pattern {
  background-image: var(--lh-bg-pattern);              // /* no-fallback */
  background-repeat: var(--lh-bg-pattern-repeat);      // /* no-fallback */
  background-size: var(--lh-bg-pattern-size);          // /* no-fallback */
  background-blend-mode: var(--lh-bg-pattern-blend, normal);  // has a fallback
  @content;
}
```

Components `@include` it to gain the pattern background capability:

```scss
@use 'theme/common/patterns' as *;

.lh-card--patterned {
  @include apply-pattern;
}
```

**Why the first three have no fallback**: patterns are disabled by default, and these three tokens are supplied by the user / ConfigProvider; when absent there is simply no pattern (the fallback for `background-image: none` is provided by the token's own default value). Hardcoding a fallback would make "no pattern configured" and "pattern explicitly turned off" indistinguishable.

## Patterns and dark mode

The pattern's `--lh-bg-pattern-color` references `--lh-decoration-color` (the decoration color) by default, which has a dark override in `var-dark.scss` — so the pattern color adjusts automatically with dark mode.

If you customize the pattern color, remember to adjust it for dark mode too:

```scss
[data-theme='dark'],
.dark {
  --lh-bg-pattern-color: rgba(255, 255, 255, 0.08);
}
```

## Notes

- **Being off by default is intentional**: patterns are atmosphere, not information — turning them on by default would pollute every user's interface. Businesses wanting global patterns enable them in their own ConfigProvider.
- **Size of the inline SVG**: the six motifs are all simplified paths, a few hundred bytes each; inlining them into CSS generates no extra requests.
- **`!default` overrides**: to swap in your own motifs, override `--lh-pattern-plum: url('data:image/svg+xml,...')` in your project, or set `--lh-bg-pattern` directly.
- **Printing**: patterns may not appear when printed (browsers' handling of `background-image` in print), so the content layer must not rely on patterns to convey information.

## Related docs

- [Theme System Overview](/theme/overview)
- [Runtime Customization](/theme/customization)
- [Design Tokens](/theme/tokens)
- [Style Sources](/reference/styles)
