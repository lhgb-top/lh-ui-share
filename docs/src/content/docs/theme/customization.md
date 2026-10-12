---
title: 运行时定制
description: 'themeVars 简写补前缀、componentTheme 按组件覆盖、patternComponents 花纹白名单'
---

运行时定制是 lh-ui 主题系统的核心能力：**不重新编译样式**，在运行时改变组件外观。三条 API 各管一层。

## 一、themeVars —— 全局令牌覆盖

ConfigProvider 接收 `themeVars`，键为**简写**：

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

### 简写补前缀

`'primary-color'` 会自动补成 `--lh-primary-color`。这个补全由 [toCssVarName](/reference/utils#cssvars-三件套) 完成，且是**幂等**的（已带前缀的键原样返回，不会变成 `--lh---lh-...`）。

也可以直接写全名：

```ts
{ '--lh-primary-color': '#1677ff' }   // 等价
```

底层实现是 `cssVars(themeVars)`，把键值对转成可直接绑 `:style` 的 CSS 变量对象。

### 作用域是 DOM 子树

CSS 变量天然级联：ConfigProvider 把变量注入到包裹元素，**只有其后代组件消费到新值**。这让你能做局部换肤：

```vue
<lh-config-provider :theme-vars="brandVars">
  <Header />
</lh-config-provider>

<lh-config-provider :theme-vars="neutralVars">
  <Content />
</lh-config-provider>
```

### docs 站导出的就是同一份

docs 主题定制页导出的 `:root { --lh-*: ... }` 文本与 `themeVars` 是**同一个东西**落成文件——可以直接粘到项目入口：

```css
/* 项目入口 */
:root {
  --lh-primary-color: #2B5FA6;
  --lh-primary-color-hover: #3D72BC;
  /* ... */
}
```

## 二、componentTheme —— 按组件覆盖

`themeVars` 是全局的；有些时候你只想改一个组件的令牌（比如所有按钮的圆角，但保留其他组件的）。

```vue
<lh-config-provider
  :component-theme="{
    button: { 'border-radius': '20px' },
    input: { 'control-height': '40px' },
  }"
>
  <App />
</lh-config-provider>
```

key 是组件名（`styles/` 下的目录名），value 是该组件作用域内的 `themeVars`。注入时变量带组件前缀作用域，只影响指定组件。

**注意**：组件级令牌依赖该组件 SCSS 里用 `var(--lh-<name>-*)` 消费了对应令牌——不是所有组件都把全部样式点令牌化，能改什么以 [设计令牌](/theme/tokens) 表里该组件的行为准。

## 三、patternComponents —— 花纹白名单

国风花纹（见 [国风花纹](/theme/patterns)）默认**不启用**。开启时它会影响背景，不是所有组件都适合（表格的背景上印梅花会很乱）。

`patternComponents` 控制哪些组件应用花纹：

```vue
<lh-config-provider
  :pattern-components="['card', 'dialog', 'drawer']"
  pattern="plum"
>
  <App />
</lh-config-provider>
```

只有白名单里的组件会带花纹。具体的 props 名以各 UI 库 ConfigProvider 文档为准。

## 四、预设 + 定制叠加

三者可以叠加，优先级是「后代覆盖祖先、具体覆盖全局」：

```vue
<lh-config-provider
  theme="cerblue"
  :theme-vars="{ 'border-radius-base': '4px' }"
>
  <!-- 先应用青花瓷预设，再用 themeVars 微调圆角 -->
  <App />
</lh-config-provider>
```

## 五、暗色与定制的关系

定制的 `themeVars` 注入在哪个元素上，就只影响那个子树的明暗：

```vue
<!-- 这个区块强制暗色 -->
<div data-theme="dark">
  <lh-button>暗色按钮</lh-button>
</div>
```

- 暗色开关是 `[data-theme='dark']` 或 `.dark` 类（`var-dark.scss` 的选择器）。
- **不要把 `themeVars` 写到 `documentElement` 的内联 style 上**——内联 style 特异性高于 `var-dark.scss` 的整段暗色变量，会导致暗色模式配色失真（详见 [主题总览的注入约束](/theme/overview#注入约束只能写-style不能写内联-style)）。

## 六、不能在运行时改的东西

| 想改的 | 能不能 | 替代方案 |
| --- | --- | --- |
| 主色、文字色、圆角、间距等令牌 | ✅ `themeVars` | — |
| 单个组件的令牌 | ✅ `componentTheme` | — |
| 花纹 | ✅ `pattern` + `patternComponents` | — |
| 组件高度（input 37px 等） | ⚠️ 有限 | 高度令牌尚未统一，见[已知缺口](/theme/tokens#已知的令牌缺口) |
| 组件 DOM 结构 / 类名 | ❌ | 用 [pt 透传](/core/pt) 或插槽 |
| 阴影的层级合成 | ❌ 编译期 | 覆盖 `$lh-*` SCSS 变量重编译 |
| 动画曲线 | ✅ `--lh-animation-timing-function` | — |

## 示例：完整的主题配置

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

## 注意事项

- **简写键不要重复带前缀**：`'primary-color'` 而非 `'--lh-primary-color'`（虽然幂等，但统一用简写更清爽）。
- **作用域泄漏**：`themeVars` 只影响后代组件；反过来，**祖先** ConfigProvider 的变量会被后代的覆盖（CSS 级联规则）。
- **注入位置**：ConfigProvider 注入到包裹元素（不是 `documentElement`），保证可移除、可局部化。
- **SSR**：注入的是普通 CSS 变量，服务端渲染输出 inline style，客户端注水后一致。

## 相关文档

- [主题系统总览](/theme/overview)
- [主题预设](/theme/presets)
- [设计令牌](/theme/tokens)
- [国风花纹](/theme/patterns)
- [cssVars 工具函数](/reference/utils#cssvars-三件套)
