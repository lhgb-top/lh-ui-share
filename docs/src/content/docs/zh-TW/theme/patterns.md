---
title: 國風花紋
description: '柳葉 / 雲紋 / 水波 / 雪花 / 梅花 / 竹葉六種內聯 SVG 花紋與 apply-pattern mixin'
---

國風不是 lh-ui 的裝飾，是它的設計主張之一。`styles/theme/common/patterns.scss` 提供六種傳統紋樣，作為可選的背景層注入。

## 六種花紋

| 花紋 | CSS 變數 | 描述 |
| --- | --- | --- |
| 柳葉紋 | `--lh-pattern-willow` | 細長柳葉，疏密有致，隨風輕舞 |
| 雲紋 | `--lh-pattern-cloud` | 祥雲舒展，蜿蜒流轉 |
| 水波紋 | `--lh-pattern-water` | 漣漪微動，層層疊疊 |
| 雪花紋 | `--lh-pattern-snow` | 六角雪花，細枝分岔 |
| 梅花紋 | `--lh-pattern-plum` | 五瓣舒展，蕊心分明 |
| 竹葉紋 | `--lh-pattern-bamboo` | 披針形竹葉，中脈清晰，錯落有致 |

全部以 `data:image/svg+xml` **內聯**（不引外部資源，無網路依賴、無 CORS 問題），`!default` 可被使用者覆蓋。另有 `--lh-pattern-none: none`（顯式無花紋）。

## 啟用花紋

花紋**預設不啟用**（`--lh-bg-pattern: none`）。三種啟用方式：

### 1. 元件 / 頁面內直接寫

```scss
.my-card {
  --lh-bg-pattern: var(--lh-pattern-plum);
}
```

### 2. ConfigProvider 的 themeVars

```vue
<lh-config-provider :theme-vars="{ 'bg-pattern': 'var(--lh-pattern-plum)' }">
  <App />
</lh-config-provider>
```

簡寫 `'bg-pattern'` 自動補成 `--lh-bg-pattern`。

### 3. pattern prop + 白名單

```vue
<lh-config-provider
  pattern="plum"
  :pattern-components="['card', 'dialog', 'drawer']"
>
  <App />
</lh-config-provider>
```

花紋會影響背景，不是所有元件都適合（表格背景上印梅花會很亂）。`patternComponents` 白名單控制只給哪些元件加。詳見 [執行時客製](/theme/customization#三patterncomponents--花紋白名單)。

## 控制令牌

```scss
:root {
  --lh-bg-pattern: none;                                     // 預設不啟用
  --lh-bg-pattern-repeat: repeat;                            // 平鋪方式
  --lh-bg-pattern-size: 40px;                                // 單元尺寸（預設 40px 適配按鈕高度，避免圖案被截斷）
  --lh-bg-pattern-opacity: 0.15;                             // 不透明度
  --lh-bg-pattern-color: var(--lh-decoration-color, rgba(184, 134, 11, 0.12));  // 顏色
  --lh-bg-pattern-blend: soft-light;                         // 混合模式
}
```

全部 `!default` 可覆蓋。最常用的兩個旋鈕：

- **`--lh-bg-pattern-size`**：40px 是「按鈕高度內能放下一個完整紋樣」的尺寸；大區塊背景可以調到 80px+ 讓紋樣舒展。
- **`--lh-bg-pattern-opacity`**：0.15 是「存在但不搶眼」的預設值；需要更明顯的國風氛圍可以到 0.25。

## apply-pattern mixin

```scss
// styles/theme/common/patterns.scss
@mixin apply-pattern {
  background-image: var(--lh-bg-pattern);              // /* no-fallback */
  background-repeat: var(--lh-bg-pattern-repeat);      // /* no-fallback */
  background-size: var(--lh-bg-pattern-size);          // /* no-fallback */
  background-blend-mode: var(--lh-bg-pattern-blend, normal);  // 有 fallback
  @content;
}
```

元件裡 `@include` 它即獲得花紋背景能力：

```scss
@use 'theme/common/patterns' as *;

.lh-card--patterned {
  @include apply-pattern;
}
```

**為什麼前三個不寫 fallback**：花紋預設不啟用，這三個令牌由使用者 / ConfigProvider 傳入；缺省即無花紋（`background-image: none` 的回落由令牌自身的預設值提供），寫死 fallback 反而會讓「未設定花紋」與「顯式關閉花紋」無法區分。

## 花紋與暗色

花紋的 `--lh-bg-pattern-color` 預設引用 `--lh-decoration-color`（裝飾色），後者在 `var-dark.scss` 裡有暗色覆蓋——所以花紋顏色會跟隨暗色自動調整。

如果客製花紋顏色，記得暗色下也調一下：

```scss
[data-theme='dark'],
.dark {
  --lh-bg-pattern-color: rgba(255, 255, 255, 0.08);
}
```

## 注意事項

- **預設關閉是刻意的**：花紋是氛圍而非資訊，預設開著會汙染所有使用者的介面。想要全域花紋的業務自己在 ConfigProvider 開。
- **內聯 SVG 的體積**：六個紋樣都是精簡路徑，單個幾百位元組，內聯進 CSS 不產生額外請求。
- **`!default` 覆蓋**：想換自己的紋樣，在專案裡 `--lh-pattern-plum: url('data:image/svg+xml,...')` 覆蓋即可，或直接設 `--lh-bg-pattern`。
- **列印場景**：花紋在列印時可能不顯示（瀏覽器對 `background-image` 的列印處理），內容層不要依賴花紋傳達資訊。

## 相關文件

- [主題系統總覽](/theme/overview)
- [執行時客製](/theme/customization)
- [設計令牌](/theme/tokens)
- [樣式源](/reference/styles)
