---
title: 0.4.0 迁移指南
description: LH 前缀改名映射表 —— 类型、常量、预设标识符的机械替换清单
---

# 0.4.0 迁移指南

0.4.0 把本仓的非第三方公共符号统一补上 `LH` 前缀，与 plus 仓
`docs/project/development-guide.md` 的家族命名规范对齐（背景见[命名约定](/guide/naming)）。

**全部是标识符级机械替换**，行为不变、导出路径不变。各 UI 库（plus / vue2 / uniapp）
已同步改名；独立用户请按下方映射改 import。

## 类型 / 接口：`LhXxx`

| 旧 | 新 | 所属 |
| --- | --- | --- |
| `ThemePreset` | `LhThemePreset` | `theme` |
| `ThemePresetName` | `LhThemePresetName` | `theme` |
| `ThemeVars` | `LhThemeVars` | `theme` |
| `SxProps` | `LhSxProps` | `core/shared/sx` |
| `DOMRectLike` | `LhDOMRectLike` | `core/shared/popper` |
| `ComputePositionOptions` | `LhComputePositionOptions` | `core/shared/popper` |
| `PopperPosition` | `LhPopperPosition` | `core/shared/popper` |
| `PtAttrs` | `LhPtAttrs` | `core/shared/pt` |
| `SanitizeNumberOptions` | `LhSanitizeNumberOptions` | `core/shared/sanitize` |
| `VirtualRange` | `LhVirtualRange` | `core/shared/virtual` |
| `AxisRange` | `LhAxisRange` | `core/shared` |
| `LocalePath` | `LhLocalePath` | `locales` |
| `Leaves` | `LhLeaves` | `types/locale` |
| `LocaleOptions` | `LhLocaleOptions` | `types/locale` |

## 常量：`LH_<模块>_<概念>`

| 旧 | 新 | 所属 |
| --- | --- | --- |
| `DEFAULT_THEME` | `LH_THEME_DEFAULT` | `core/config` |
| `DEFAULT_DRAWER_DIRECTION` | `LH_DRAWER_DIRECTION_DEFAULT` | `core/drawer` |
| `DEFAULT_DRAWER_SIZE` | `LH_DRAWER_SIZE_DEFAULT` | `core/drawer` |
| `DEFAULT_DROPDOWN_PLACEMENT` | `LH_DROPDOWN_PLACEMENT_DEFAULT` | `core/dropdown` |
| `DROPDOWN_TRIGGERS` | `LH_DROPDOWN_TRIGGERS` | `core/dropdown` |
| `DEFAULT_POPCONFIRM_TYPE` | `LH_POPCONFIRM_TYPE_DEFAULT` | `core/popconfirm` |
| `DEFAULT_POPCONFIRM_PLACEMENT` | `LH_POPCONFIRM_PLACEMENT_DEFAULT` | `core/popconfirm` |
| `POPOVER_TRIGGERS` | `LH_POPOVER_TRIGGERS` | `core/popover` |
| `DEFAULT_POPOVER_PLACEMENT` | `LH_POPOVER_PLACEMENT_DEFAULT` | `core/popover` |
| `THEME_PRESETS` | `LH_THEME_PRESETS` | `theme` |
| `PRESET_THEME_STYLE_ID` | `LH_PRESET_THEME_STYLE_ID` | `theme` |

注意默认值常量是 **`LH_<模块>_<概念>_DEFAULT`**（DEFAULT 在**后**），
不是 `LH_DEFAULT_<...>`。

## 主题预设对象：小写 → `LhXxx`

| 旧 | 新 |
| --- | --- |
| `cerblue` | `LhCerblue` |
| `songhua` | `LhSonghua` |
| `zhusha` | `LhZhusha` |
| `shuimo` | `LhShuimo` |
| `golden` | `LhGolden` |

## 不改（豁免）

以下符号**保持原名**，迁移时不要动它们：

| 符号 | 理由 |
| --- | --- |
| `zhCN` / `enUS` | 标准 locale 命名，且是三个 UI 库的公开 API 再导出 |
| 预设名的**字符串值**（`name: 'cerblue'` 等） | 用户在 ConfigProvider `theme` 里写的配置值，改了破坏全部下游配置 |
| 函数名（`getThemeVars` / `sxToStyle` 等） | 本次只收敛常量 / 类型 / 接口 / 类 |

```ts
// ✅ 迁移后
import { LH_THEME_PRESETS, LhCerblue, getThemeVars } from '@lh-ui/share/theme'
import type { LhThemePreset, LhSxProps } from '@lh-ui/share/core/shared/sx'

const preset: LhThemePreset = LhCerblue
getThemeVars('cerblue')          // 字符串值不变
```

## 一键替换示例

```ts
// before
import { THEME_PRESETS, PRESET_THEME_STYLE_ID } from '@lh-ui/share/theme'
import type { SxProps, ThemeVars } from '@lh-ui/share'

// after
import { LH_THEME_PRESETS, LH_PRESET_THEME_STYLE_ID } from '@lh-ui/share/theme'
import type { LhSxProps, LhThemeVars } from '@lh-ui/share'
```

## 本次发版的其他内容

除改名外，0.4.0 还包含这些待发布 changeset：

- **本地联动与样式治理**（minor）——家族布局 alias 机制、`verify:styles` 六项校验落地
- **三仓审计修复**（minor）
- **date-picker 循环依赖拆除**（patch）——`formatDate` / `parseDate` 下沉到
  `core/shared/date`，`logic ↔ adapter` 二元环拆为单向
- **divider 边框样式与单测**（patch）
- **表单控件居中修复**（patch）
- **steps 标题换行与折行**（patch）
- **hairline 标记规则废止**（patch）——uniapp v3 px 直出，新增 1px 边框不再需要
  `/* hairline */` 标记（历史 65 处标记保留为普通注释）
- **文档站**（minor）——就是你现在看的这个站
