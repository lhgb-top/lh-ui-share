---
title: transition-mixins —— 跨端過渡類別名
description: 'lh-enter-both / lh-leave-both / lh-transition-ends 三個 mixin 收編 Vue2 與 Vue3/React 的過渡類別名差異'
---

`styles/theme/common/transition.scss` 是跨端過渡類別名的**單源**。它解決的是一個真實的痛點：

Vue2 的過渡類別名是 `<name>-enter` / `<name>-leave`（進入 / 離開的**起始態**），Vue3 與 React 改成了 `<name>-enter-from` / `<name>-leave-from`。兩端是同一語義（「進入起始態」/「離開起始態」），只是名字不同。以前 16 個元件逐檔案手寫雙份選擇器，改一處漏一處。

## 三個 mixin

| Mixin | 參數 | 生成的類別名 | 用途 |
| --- | --- | --- | --- |
| `lh-enter-both` | `$selector`（必填）、`$child`（可選） | `#{$selector}-enter`、`#{$selector}-enter-from` | 進入起始態雙寫 |
| `lh-leave-both` | `$selector`、`$child`? | `#{$selector}-leave`、`#{$selector}-leave-from` | 離開起始態雙寫 |
| `lh-transition-ends` | `$selector`、`$child`? | `#{$selector}-enter`、`#{$selector}-enter-from`、`#{$selector}-leave-to` | 過渡起止態（進入起始雙寫 + 兩端同名的離開結束態） |

三個都透過 `@content` 接收樣式塊。

### `$child` 參數

需要把過渡狀態掛在**後代節點**上時傳第二個參數，生成的選擇器帶 ` #{$child}` 後綴：

```scss
// 不傳 $child：狀態掛在選擇器自身
@include lh-enter-both('.lh-backtop-fade') { ... }
// → .lh-backtop-fade-enter, .lh-backtop-fade-enter-from { ... }

// 傳 $child：狀態掛在內部面板上
@include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') { ... }
// → .lh-drawer-fade-enter .lh-drawer__panel--right,
//   .lh-drawer-fade-enter-from .lh-drawer__panel--right { ... }
```

## 為什麼是這三個

- `-enter-to` / `-leave-to` **兩端同名**，無需雙寫。
- 需要雙寫的只有**成對的起始態**：`-enter` / `-enter-from` 與 `-leave` / `-leave-from`。
- `lh-transition-ends` 是「進入起點與離開終點同體」的常見場景（淡入淡出：透明度 0 → 1 → 0），一個 mixin 同時覆蓋進入起始態雙寫 + 離開結束態。

## 使用範例

### 常規過渡（backtop 淡入淡出）

```scss
.lh-backtop-fade {
  @include lh-transition-ends('.lh-backtop-fade') {
    opacity: 0;
  }
}
```

編譯結果：

```scss
.lh-backtop-fade-enter,
.lh-backtop-fade-enter-from,
.lh-backtop-fade-leave-to {
  opacity: 0;
}
```

### 只有進入起始態（dialog 淡入，結束態不需要）

```scss
.lh-dialog-fade {
  @include lh-enter-both('.lh-dialog-fade') {
    opacity: 0;
    transform: scale(0.9);
  }
}
```

### 狀態掛在內部面板（drawer 滑入）

```scss
.lh-drawer-fade {
  @include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') {
    transform: translateX(100%);
  }
}
```

Vue3 的 `<transition name="lh-drawer-fade">` 會在 enter 階段給**根元素**加 `lh-drawer-fade-enter-from`，選擇器後代匹配到面板，面板做位移——根元素本身不動，避免 teleport 根節點的 transform 影響定位。

## 在元件裡怎麼用

```scss
// styles/drawer/index.scss
@use 'theme/common/transition' as *;

.lh-drawer-fade {
  @include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') {
    transform: translateX(100%);
  }
  @include lh-leave-both('.lh-drawer-fade', '.lh-drawer__panel--right') {
    transform: translateX(100%);
  }
}
```

UI 層（Vue3）：

```vue
<transition name="lh-drawer-fade">
  <div v-if="visible" class="lh-drawer">...</div>
</transition>
```

UI 層（Vue2）：

```vue
<transition name="lh-drawer-fade">
  <div v-show="visible" class="lh-drawer">...</div>
</transition>
```

**兩端用同一個 `name`**，樣式裡 mixin 生成的雙份選擇器各自命中本端的類別名。這就是「注入分散、內容單源」在過渡類別名上的落地。

## 注意事項

- **元件樣式禁止再手寫雙份過渡類別名**，一律 `@include`（[紅線 2](/development/contribution#六條紅線)）。`verify:styles` 第 5 項（過渡類別名單源）會掃描裸寫的 `-enter-from` / `-leave-from` 字面量。
- **`@use` 路徑**：`@use 'theme/common/transition' as *;`（各元件 scss 的相對路徑或構建期的 bare specifier 由 [注入策略](/guide/injection) 決定）。
- **React 場景**：React 版用 headless 過渡（狀態驅動 className），mixin 生成的 `-enter-from` 類別名同樣適用。
- **`$child` 後綴是後代選擇器**：不是 `&` 拼接，生成的選擇器是 `.parent-enter .child`，依賴根元素帶過渡類別名。

## 相關文件

- [注入策略](/guide/injection) —— 兩端樣式產物差異
- [暗色模式](/theme/dark-mode) —— 令牌的執行時 vs 編譯期
- [樣式源](/reference/styles) —— `styles/` 目錄與 BEM 約定
