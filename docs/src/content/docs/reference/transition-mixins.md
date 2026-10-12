---
title: transition-mixins —— 跨端过渡类名
description: 'lh-enter-both / lh-leave-both / lh-transition-ends 三个 mixin 收编 Vue2 与 Vue3/React 的过渡类名差异'
---

`styles/theme/common/transition.scss` 是跨端过渡类名的**单源**。它解决的是一个真实的痛点：

Vue2 的过渡类名是 `<name>-enter` / `<name>-leave`（进入 / 离开的**起始态**），Vue3 与 React 改成了 `<name>-enter-from` / `<name>-leave-from`。两端是同一语义（「进入起始态」/「离开起始态」），只是名字不同。以前 16 个组件逐文件手写双份选择器，改一处漏一处。

## 三个 mixin

| Mixin | 参数 | 生成的类名 | 用途 |
| --- | --- | --- | --- |
| `lh-enter-both` | `$selector`（必填）、`$child`（可选） | `#{$selector}-enter`、`#{$selector}-enter-from` | 进入起始态双写 |
| `lh-leave-both` | `$selector`、`$child`? | `#{$selector}-leave`、`#{$selector}-leave-from` | 离开起始态双写 |
| `lh-transition-ends` | `$selector`、`$child`? | `#{$selector}-enter`、`#{$selector}-enter-from`、`#{$selector}-leave-to` | 过渡起止态（进入起始双写 + 两端同名的离开结束态） |

三个都通过 `@content` 接收样式块。

### `$child` 参数

需要把过渡状态挂在**后代节点**上时传第二个参数，生成的选择器带 ` #{$child}` 后缀：

```scss
// 不传 $child：状态挂在选择器自身
@include lh-enter-both('.lh-backtop-fade') { ... }
// → .lh-backtop-fade-enter, .lh-backtop-fade-enter-from { ... }

// 传 $child：状态挂在内部面板上
@include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') { ... }
// → .lh-drawer-fade-enter .lh-drawer__panel--right,
//   .lh-drawer-fade-enter-from .lh-drawer__panel--right { ... }
```

## 为什么是这三个

- `-enter-to` / `-leave-to` **两端同名**，无需双写。
- 需要双写的只有**成对的起始态**：`-enter` / `-enter-from` 与 `-leave` / `-leave-from`。
- `lh-transition-ends` 是「进入起点与离开终点同体」的常见场景（淡入淡出：透明度 0 → 1 → 0），一个 mixin 同时覆盖进入起始态双写 + 离开结束态。

## 使用示例

### 常规过渡（backtop 淡入淡出）

```scss
.lh-backtop-fade {
  @include lh-transition-ends('.lh-backtop-fade') {
    opacity: 0;
  }
}
```

编译结果：

```scss
.lh-backtop-fade-enter,
.lh-backtop-fade-enter-from,
.lh-backtop-fade-leave-to {
  opacity: 0;
}
```

### 只有进入起始态（dialog 淡入，结束态不需要）

```scss
.lh-dialog-fade {
  @include lh-enter-both('.lh-dialog-fade') {
    opacity: 0;
    transform: scale(0.9);
  }
}
```

### 状态挂在内部面板（drawer 滑入）

```scss
.lh-drawer-fade {
  @include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') {
    transform: translateX(100%);
  }
}
```

Vue3 的 `<transition name="lh-drawer-fade">` 会在 enter 阶段给**根元素**加 `lh-drawer-fade-enter-from`，选择器后代匹配到面板，面板做位移——根元素本身不动，避免 teleport 根节点的 transform 影响定位。

## 在组件里怎么用

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

UI 层（Vue3）：

```vue
<transition name="lh-drawer-fade">
  <div v-if="visible" class="lh-drawer">...</div>
</transition>
```

UI 层（Vue2）：

```vue
<transition name="lh-drawer-fade">
  <div v-show="visible" class="lh-drawer">...</div>
</transition>
```

**两端用同一个 `name`**，样式里 mixin 生成的双份选择器各自命中本端的类名。这就是「注入分散、内容单源」在过渡类名上的落地。

## 注意事项

- **组件样式禁止再手写双份过渡类名**，一律 `@include`（[红线 2](/development/contribution#六条红线)）。`verify:styles` 第 5 项（过渡类名单源）会扫描裸写的 `-enter-from` / `-leave-from` 字面量。
- **`@use` 路径**：`@use 'theme/common/transition' as *;`（各组件 scss 的相对路径或构建期的 bare specifier 由 [注入策略](/guide/injection) 决定）。
- **React 场景**：React 版用 headless 过渡（状态驱动 className），mixin 生成的 `-enter-from` 类名同样适用。
- **`$child` 后缀是后代选择器**：不是 `&` 拼接，生成的选择器是 `.parent-enter .child`，依赖根元素带过渡类名。

## 相关文档

- [注入策略](/guide/injection) —— 两端样式产物差异
- [暗色模式](/theme/dark-mode) —— 令牌的运行时 vs 编译期
- [样式源](/reference/styles) —— `styles/` 目录与 BEM 约定
