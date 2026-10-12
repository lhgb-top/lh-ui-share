---
"@lh-ui/share": minor
---

命名规范收敛：非第三方公共符号补齐 `LH` 前缀（breaking rename）

与 plus 仓 `docs/project/development-guide.md` 的家族命名规范对齐：反域名根 `top.lhgb`，
JS / npm 端包名维持 `@lh-ui/*`（npm 不允许点号），非第三方符号必须带 `LH` 前缀。
share 仓此前未跟进，本次补齐自己这一侧。规范已写入本仓 `AGENTS.md`「命名规范」小节。

**类型 / 接口（`LhXxx`）**

- `ThemePreset` → `LhThemePreset`、`ThemePresetName` → `LhThemePresetName`、
  `ThemeVars` → `LhThemeVars`（`src/theme/types.ts`）
- `SxProps` → `LhSxProps`（`core/shared/sx`，下游 plus / vue2 / uniapp 大量引用）
- `DOMRectLike` → `LhDOMRectLike`、`ComputePositionOptions` → `LhComputePositionOptions`、
  `PopperPosition` → `LhPopperPosition`（`core/shared/popper`）
- `PtAttrs` → `LhPtAttrs`、`SanitizeNumberOptions` → `LhSanitizeNumberOptions`、
  `VirtualRange` → `LhVirtualRange`、`AxisRange` → `LhAxisRange`（`core/shared`）
- `LocalePath` → `LhLocalePath`（`locales`）、`Leaves` → `LhLeaves`、
  `LocaleOptions` → `LhLocaleOptions`（`types/locale`）

**常量（`LH_<模块>_<概念>`，默认值以 `DEFAULT` 作后缀）**

- `DEFAULT_THEME` → `LH_THEME_DEFAULT`（`core/config`）
- `DEFAULT_DRAWER_DIRECTION` → `LH_DRAWER_DIRECTION_DEFAULT`、
  `DEFAULT_DRAWER_SIZE` → `LH_DRAWER_SIZE_DEFAULT`（`core/drawer`）
- `DEFAULT_DROPDOWN_PLACEMENT` → `LH_DROPDOWN_PLACEMENT_DEFAULT`、
  `DROPDOWN_TRIGGERS` → `LH_DROPDOWN_TRIGGERS`（`core/dropdown`）
- `DEFAULT_POPCONFIRM_TYPE` → `LH_POPCONFIRM_TYPE_DEFAULT`、
  `DEFAULT_POPCONFIRM_PLACEMENT` → `LH_POPCONFIRM_PLACEMENT_DEFAULT`（`core/popconfirm`）
- `POPOVER_TRIGGERS` → `LH_POPOVER_TRIGGERS`、
  `DEFAULT_POPOVER_PLACEMENT` → `LH_POPOVER_PLACEMENT_DEFAULT`（`core/popover`）
- `THEME_PRESETS` → `LH_THEME_PRESETS`、
  `PRESET_THEME_STYLE_ID` → `LH_PRESET_THEME_STYLE_ID`、
  预设对象 `cerblue` / `songhua` / `zhusha` / `shuimo` / `golden` →
  `LhCerblue` / `LhSonghua` / `LhZhusha` / `LhShuimo` / `LhGolden`（`theme`）

**不改（豁免，理由见 AGENTS.md「命名规范 · 豁免登记」）**

- 语言包导出 `zhCN` / `enUS`——标准 locale 命名，且是三个 UI 库的公开 API。
- 主题预设名的**字符串值**（`name: 'cerblue'` 等）——用户在 ConfigProvider `theme`
  里写的配置值，改了破坏全部下游用户配置；只有 TS 标识符加前缀。
- 函数名（`getThemeVars` / `sxToStyle` 等）——本次只收敛常量 / 类型 / 接口 / 类。

**迁移**：全是标识符级机械替换。各 UI 库（plus / vue2 / uniapp）已同步改名，本地联动
即时生效；独立用户请按上方映射改 import。
