---
title: 執行時客製
description: 'themeVars 簡寫補前綴、componentTheme 按元件覆蓋、patternComponents 花紋白名單'
---

執行時客製是 lh-ui 主題系統的核心能力：**不重新編譯樣式**，在執行時改變元件外觀。三條 API 各管一層。

## 一、themeVars —— 全域令牌覆蓋

ConfigProvider 接收 `themeVars`，鍵為**簡寫**：

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

### 簡寫補前綴

`'primary-color'` 會自動補成 `--lh-primary-color`。這個補全由 [toCssVarName](/reference/utils#cssvars-三件套) 完成，且是**冪等**的（已帶前綴的鍵原樣傳回，不會變成 `--lh---lh-...`）。

也可以直接寫全名：

```ts
{ '--lh-primary-color': '#1677ff' }   // 等價
```

底層實作是 `cssVars(themeVars)`，把鍵值對轉成可直接綁 `:style` 的 CSS 變數物件。

### 作用域是 DOM 子樹

CSS 變數天然級聯：ConfigProvider 把變數注入到包裹元素，**只有其後代元件消費到新值**。這讓你能做局部換膚：

```vue
<lh-config-provider :theme-vars="brandVars">
  <Header />
</lh-config-provider>

<lh-config-provider :theme-vars="neutralVars">
  <Content />
</lh-config-provider>
```

### docs 站匯出的就是同一份

docs 主題客製頁匯出的 `:root { --lh-*: ... }` 文字與 `themeVars` 是**同一個東西**落成檔案——可以直接貼到專案入口：

```css
/* 專案入口 */
:root {
  --lh-primary-color: #2B4C7C;
  --lh-primary-color-hover: #3D649E;
  /* ... */
}
```

## 二、componentTheme —— 按元件覆蓋

`themeVars` 是全域的；有時候你只想改一個元件的令牌（比如所有按鈕的圓角，但保留其他元件的）。

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

key 是元件名（`styles/` 下的目錄名），value 是該元件作用域內的 `themeVars`。注入時變數帶元件前綴作用域，只影響指定元件。鍵名必須與令牌名一致（`control-height-medium` → `--lh-control-height-medium`）——`input` 的預設檔是 medium，不寫檔位後綴的 `control-height` 沒有元件消費。

**注意**：元件級令牌依賴該元件 SCSS 裡用 `var(--lh-<name>-*)` 消費了對應令牌——不是所有元件都把全部樣式點令牌化，能改什麼以 [設計令牌](/theme/tokens) 表裡該元件的行為準。

## 三、patternComponents —— 花紋白名單

國風花紋（見 [國風花紋](/theme/patterns)）預設**不啟用**。開啟時它會影響背景，不是所有元件都適合（表格的背景上印梅花會很亂）。

`patternComponents` 控制哪些元件套用花紋：

```vue
<lh-config-provider
  :pattern-components="['card', 'dialog', 'drawer']"
  pattern="plum"
>
  <App />
</lh-config-provider>
```

只有白名單裡的元件會帶花紋。具體的 props 名以各 UI 庫 ConfigProvider 文件為準。

## 四、預設 + 客製疊加

三者可以疊加，優先級是「後代覆蓋祖先、具體覆蓋全域」：

```vue
<lh-config-provider
  theme="cerblue"
  :theme-vars="{ 'border-radius-base': '4px' }"
>
  <!-- 先套用青花瓷預設，再用 themeVars 微調圓角 -->
  <App />
</lh-config-provider>
```

## 五、暗色與客製的關係

客製的 `themeVars` 注入在哪個元素上，就只影響那個子樹的明暗：

```vue
<!-- 這個區塊強制暗色 -->
<div data-theme="dark">
  <lh-button>暗色按钮</lh-button>
</div>
```

- 暗色開關是 `[data-theme='dark']` 或 `.dark` 類（`var-dark.scss` 的選擇器）。
- **不要把 `themeVars` 寫到 `documentElement` 的內聯 style 上**——內聯 style 特異性高於 `var-dark.scss` 的整段暗色變數，會導致暗色模式配色失真（詳見 [主題總覽的注入約束](/theme/overview#注入約束只能寫-style不能寫內聯-style)）。

## 六、不能在執行時改的東西

| 想改的 | 能不能 | 替代方案 |
| --- | --- | --- |
| 主色、文字色、圓角、間距等令牌 | ✅ `themeVars` | — |
| 單個元件的令牌 | ✅ `componentTheme` | — |
| 花紋 | ✅ `pattern` + `patternComponents` | — |
| 元件高度（input 37px 等） | ⚠️ 有限 | 高度令牌尚未統一，見[已知缺口](/theme/tokens#已知的令牌缺口) |
| 元件 DOM 結構 / 類別名 | ❌ | 用 [pt 透傳](/core/pt) 或插槽 |
| 陰影的層級合成 | ❌ 編譯期 | 覆蓋 `$lh-*` SCSS 變數重編譯 |
| 動畫曲線 | ✅ `--lh-animation-timing-function` | — |

## 範例：完整的主題設定

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

## 注意事項

- **簡寫鍵不要重複帶前綴**：`'primary-color'` 而非 `'--lh-primary-color'`（雖然冪等，但統一用簡寫更清爽）。
- **作用域洩漏**：`themeVars` 只影響後代元件；反過來，**祖先** ConfigProvider 的變數會被後代的覆蓋（CSS 級聯規則）。
- **注入位置**：ConfigProvider 注入到包裹元素（不是 `documentElement`），保證可移除、可局部化。
- **SSR**：注入的是普通 CSS 變數，伺服器端渲染輸出 inline style，用戶端注水後一致。

## 相關文件

- [主題系統總覽](/theme/overview)
- [主題預設](/theme/presets)
- [設計令牌](/theme/tokens)
- [國風花紋](/theme/patterns)
- [cssVars 工具函式](/reference/utils#cssvars-三件套)
