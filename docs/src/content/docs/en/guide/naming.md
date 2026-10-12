---
title: Naming conventions
description: 'The top.lhgb reverse-DNS root, the four LH / Lh / lh / lh- prefix tiers, and three registered exemptions'
---

# Naming conventions

The whole family shares one naming convention, aligned with the plus repo's
`docs/project/development-guide.md`.

## Reverse-DNS root

**`top.lhgb`** (`www.lhgb.top` reversed) is the naming root of every lh-ui repository.

- **JS / npm side**: package names keep the `@lh-ui/*` scope — npm package names cannot contain
  dots, so `top.lhgb` cannot be a package name directly. The reverse-DNS name lives at the
  **metadata level**: `package.json`'s `homepage` / `repository` / `author` all use `lhgb.top`.
- **Native side**: `lh-ui-android` / `lh-ui-ios` / `lh-ui-harmony` / `lh-ui-c` use the
  `top.lhgb.*` form for their applicationId / bundleId / package (not in this repo).

## The four LH prefix tiers

**Any non-third-party symbol must carry the `LH` prefix.** Follow this when adding constants / types
/ interfaces — do not leave it for a later cleanup pass:

| Tier | Shape | Examples |
| --- | --- | --- |
| Constants | `LH_XXX` (upper snake) | `LH_SIZE_DEFAULT`, `LH_LANGUAGE_DEFAULT`, `LH_THEME_PRESETS` |
| Types / interfaces | `LhXxx` (PascalCase) | `LhThemePreset`, `LhSxProps`, `LhVirtualRange` |
| Module-level singletons / lowercase objects | `lhXxx` (camelCase) | `lhlocale` |
| BEM class names / component `name` | `lh-xxx` / `LhXxx` | `.lh-button--primary`, `name: 'LhButton'` |

Constants follow the structure **`LH_<Module>_<Concept>`**, with default-value constants suffixed by
`DEFAULT`:

- `LH_DRAWER_DIRECTION_DEFAULT` (not `LH_DEFAULT_DRAWER_DIRECTION`)
- `LH_DROPDOWN_PLACEMENT_DEFAULT`, `LH_POPCONFIRM_TYPE_DEFAULT`

Consistent with the existing `LH_SIZE_DEFAULT` / `LH_LANGUAGE_DEFAULT`.

## Registered exemptions

Established by convention, not forced to take the prefix. **Register the reason here before changing
any of them:**

| Symbol | Reason |
| --- | --- |
| locale exports `zhCN` / `enUS` | standard locale naming, and re-exported as a public API by `@lh-ui/vue3` / `@lh-ui/vue2` / uniapp — renaming would break too much |
| the **string value** of theme preset names (`name: 'cerblue'` etc.) | this is the configuration value users write in ConfigProvider's `theme`; changing it breaks every downstream configuration. The corresponding **TS identifier** still takes the prefix (`LhCerblue`) |
| exported symbols of third-party dependencies (utilities brought in alongside `deepMerge`) | not enforced |

## The 0.4.0 rename

Before 0.4.0 this repo had not caught up with the family prefix convention; this release closes the
gap on its own side. Everything is an identifier-level mechanical replacement; the migration table is
in the [0.4.0 migration guide](/guide/migration-04).
