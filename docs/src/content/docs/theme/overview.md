---
title: 主题系统总览
description: '五个运行时原语与 SCSS 令牌双源同步：JS 侧注入 CSS 变量，组件只消费 var()'
---

import { PresetPreview } from '../../components/PresetPreview.astro'

lh-ui 的主题系统是**双源的**，这一点必须先讲清楚：

| 源 | 内容 | 消费方式 |
| --- | --- | --- |
| `styles/theme/common/var.scss` + `var-dark.scss` | CSS 自定义属性（`--lh-*`） | 组件 SCSS 里 `var(--lh-*)`，运行时求值 |
| `styles/theme/common/variables.scss` | SCSS 变量（`$lh-*`） | 编译期烤死成具体值，用于计算（颜色函数、阴影合成等） |
| `src/theme/themes/index.ts` | 5 个预设的 `vars` 映射 | JS 运行时注入 `<style>`（ConfigProvider / ThemeStudio） |

**组件只认 CSS 变量**。JS 侧的主题系统存在的意义是：把一套设计令牌**在运行时**注入到 DOM 的某个子树上，让组件无需重新编译就换肤。

## 两条路径

### 1. 预设主题（开箱即用）

五个内置预设：青花瓷 / 松花绿 / 朱砂 / 水墨 / 藤黄。UI 层用 `buildPresetStyleText(vars)` 生成 `<style>` 文本写入 DOM。

```ts
import { LH_THEME_PRESETS, buildPresetStyleText, LH_PRESET_THEME_STYLE_ID } from '@lh-ui/share/theme'

const preset = LH_THEME_PRESETS[0]                    // 青花瓷
const styleText = buildPresetStyleText(preset.vars)  // 拼成 CSS 文本
// → 注入到 <style id="lh-preset-theme">
```

详见 [主题预设](/theme/presets)。

### 2. 运行时定制（themeVars）

ConfigProvider 接收 `themeVars`，键为**简写**（自动补 `--lh-` 前缀）：

```vue
<lh-config-provider :theme-vars="{ 'primary-color': '#1677ff' }">
  <App />
</lh-config-provider>
```

详见 [运行时定制](/theme/customization)。

## 五个运行时原语

`src/theme/index.ts` 导出（实现在 `src/theme/themes/index.ts`）：

| 原语 | 签名 | 用途 |
| --- | --- | --- |
| `LH_THEME_PRESETS` | `LhThemePreset[]` | 全部预设数组，docs 与 ConfigProvider 遍历它 |
| `registerTheme(preset)` | `(preset: LhThemePreset) => void` | 注册或覆盖预设（同名覆盖，内置预设也可覆盖） |
| `getThemePreset(name)` | `(name: LhThemePresetName) => LhThemePreset \| undefined` | 按名取预设 |
| `getThemeVars(name)` | `(name: LhThemePresetName) => LhThemeVars \| undefined` | 按名取其 vars（未注册返回 `undefined`） |
| `buildPresetStyleText(vars)` | `(vars: Record<string, string>) => string` | 把 vars 拼成可注入的 `<style>` 文本 |

另有对比度计算原语（`verify:theme` 与 ThemeStudio 用）：

| 原语 | 签名 | 用途 |
| --- | --- | --- |
| `getRelativeLuminance(color)` | `(color: string \| undefined) => number \| undefined` | WCAG 相对亮度（非 hex 返回 `undefined`） |
| `getContrastRatio(a, b)` | `(a, b: string \| undefined) => number \| undefined` | WCAG 对比度（1~21） |
| `buildPresetDarkVars(vars)` | `(vars: Record<string, string>) => Record<string, string>` | 由预设 vars 推导暗色块变量 |
| `LH_PRESET_THEME_STYLE_ID` | `'lh-preset-theme'` | 注入元素的固定 id |

## 类型

```ts
export type LhThemePresetName =
  | 'cerblue' | 'songhua' | 'zhusha' | 'shuimo' | 'golden'
  | (string & {})          // ← 开放自定义名称，同时保留字面量自动补全

export interface LhThemePreset {
  name: LhThemePresetName
  label: string            // 中文名称
  labelEn: string          // 英文名称
  description: string      // 主题描述
  vars: Record<string, string>   // CSS 变量映射
}

export type LhThemeVars = Record<string, string>
```

`LhThemePresetName` 末尾的 `(string & {})` 是 TS 技巧：保持前五个字面量的自动补全，同时允许 `registerTheme({ name: 'my-brand', ... })` 传任意字符串。未注册的名字在 `getThemePreset` / `getThemeVars` 中返回 `undefined`。

## 注入约束：只能写 `<style>`，不能写内联 style

这是主题系统**最重要的约束**，踩过一次坑：

```ts
// ✅ 正确：写 <style> 元素，特异性 0,1,0
const el = document.createElement('style')
el.id = LH_PRESET_THEME_STYLE_ID
el.textContent = buildPresetStyleText(vars)
document.head.appendChild(el)

// ❌ 错误：写 documentElement 的内联 style，特异性 1,0,0,0
Object.assign(document.documentElement.style, vars)
```

**为什么**：内联 style 的特异性高于**任何样式表**，会压过 `var-dark.scss` 里整段的暗色变量声明（`[data-theme='dark'], .dark { --lh-*: ... }`），导致暗色模式下配色失真——暗色变量被内联的明色值盖死。

`buildPresetStyleText` 生成的文本结构：

```css
:root {
  --lh-primary-color: #2B5FA6;
  /* ...预设的全部 vars */
}

[data-theme='dark'],
.dark {
  --lh-primary-color-bg: color-mix(in srgb, var(--lh-primary-color) 25%, transparent);
  --lh-selected-color: color-mix(in srgb, var(--lh-primary-color) 40%, #fff);
  /* 深主色预设额外提亮主色 */
}
```

暗色块在 `:root` 块**之后**、同特异性下后者胜——所以浅主色预设在 `:root` 里声明的 `--lh-selected-color` 明色值不会泄漏进暗色。暗色块的内容由 `buildPresetDarkVars` 推导。

## buildPresetDarkVars 的暗色推导

三个规则：

1. **无条件重定义两个变量**（用 `var()` 引用，在应用元素上求值，跟随当前主色）：
   - `--lh-primary-color-bg: color-mix(in srgb, var(--lh-primary-color) 25%, transparent)`
   - `--lh-selected-color: color-mix(in srgb, var(--lh-primary-color) 40%, #fff)`

2. **深主色提亮**：若 `--lh-primary-color` 相对暗色页面底 `#1A1A2E`（`DARK_PAGE_BG`）对比度 < 3（`DARK_PRIMARY_CONTRAST_THRESHOLD`），判定为深主色，额外提亮：
   - `--lh-primary-color: color-mix(in srgb, <字面值> 55%, #fff)` —— **直接代入字面值**，因为 `color-mix(var(--lh-primary-color) …)` 会形成 CSS 自引用循环
   - `--lh-primary-color-hover: color-mix(in srgb, var(--lh-primary-color) 70%, #fff)`
   - `--lh-primary-color-active: color-mix(in srgb, var(--lh-primary-color) 85%, #000)`
   - `--lh-color-on-primary: #101410`（`INK_ON_LIGHTENED_PRIMARY`）—— 提亮后白字对比度反而不足 3:1，改墨字

3. 对比度计算用 `getContrastRatio(getRelativeLuminance(primary), getRelativeLuminance(DARK_PAGE_BG))`。非 hex 值（含 `var()` 的动态值）返回 `undefined`，按「无法判定」处理——所以预设 vars 里的主色必须是字面 hex。

## 双源同步

**改内置主题的主色时，两边要同步改**：

1. `src/theme/themes/index.ts` 里预设的 `vars['--lh-primary-color']`（JS 运行时注入用）
2. `styles/theme/common/variables.scss` 里的 `$lh-primary-color`（组件 SCSS 计算用）

`tests/unit/theme.spec.ts` 有一致性回归，跑 `pnpm test` 会拦不同步。

## 主题不能做什么

- **不能改控件高度**：高度令牌 `--lh-control-height-*` 尚未建立（各控件高度不统一，记录在「高度令牌专项」待后续 changeset）。
- **不能改组件结构**：主题只换令牌值，布局与 DOM 结构不变。
- **花纹是独立系统**：见 [国风花纹](/theme/patterns)。

## 预设预览

<PresetPreview />

## 相关文档

- [主题预设](/theme/presets) —— 5 个内置预设详解
- [设计令牌](/theme/tokens) —— 185 明色 + 118 暗色全表
- [运行时定制](/theme/customization) —— themeVars / componentTheme / patternComponents
- [暗色模式](/theme/dark-mode) —— 机制与编译期烤死陷阱
- [国风花纹](/theme/patterns) —— 6 种内置纹理
