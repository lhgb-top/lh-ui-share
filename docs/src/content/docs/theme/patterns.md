---
title: 国风花纹
description: '柳叶 / 云纹 / 水波 / 雪花 / 梅花 / 竹叶六种内联 SVG 花纹与 apply-pattern mixin'
---

国风不是 lh-ui 的装饰，是它的设计主张之一。`styles/theme/common/patterns.scss` 提供六种传统纹样，作为可选的背景层注入。

## 六种花纹

| 花纹 | CSS 变量 | 描述 |
| --- | --- | --- |
| 柳叶纹 | `--lh-pattern-willow` | 细长柳叶，疏密有致，随风轻舞 |
| 云纹 | `--lh-pattern-cloud` | 祥云舒展，蜿蜒流转 |
| 水波纹 | `--lh-pattern-water` | 涟漪微动，层层叠叠 |
| 雪花纹 | `--lh-pattern-snow` | 六角雪花，细枝分岔 |
| 梅花纹 | `--lh-pattern-plum` | 五瓣舒展，蕊心分明 |
| 竹叶纹 | `--lh-pattern-bamboo` | 披针形竹叶，中脉清晰，错落有致 |

全部以 `data:image/svg+xml` **内联**（不引外部资源，无网络依赖、无 CORS 问题），`!default` 可被用户覆盖。另有 `--lh-pattern-none: none`（显式无花纹）。

## 启用花纹

花纹**默认不启用**（`--lh-bg-pattern: none`）。三种启用方式：

### 1. 组件 / 页面内直接写

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

简写 `'bg-pattern'` 自动补成 `--lh-bg-pattern`。

### 3. pattern prop + 白名单

```vue
<lh-config-provider
  pattern="plum"
  :pattern-components="['card', 'dialog', 'drawer']"
>
  <App />
</lh-config-provider>
```

花纹会影响背景，不是所有组件都适合（表格背景上印梅花会很乱）。`patternComponents` 白名单控制只给哪些组件加。详见 [运行时定制](/theme/customization#三-patterncomponents-花纹白名单)。

## 控制令牌

```scss
:root {
  --lh-bg-pattern: none;                                     // 默认不启用
  --lh-bg-pattern-repeat: repeat;                            // 平铺方式
  --lh-bg-pattern-size: 40px;                                // 单元尺寸（默认 40px 适配按钮高度，避免图案被截断）
  --lh-bg-pattern-opacity: 0.15;                             // 不透明度
  --lh-bg-pattern-color: var(--lh-decoration-color, rgba(184, 134, 11, 0.12));  // 颜色
  --lh-bg-pattern-blend: soft-light;                         // 混合模式
}
```

全部 `!default` 可覆盖。最常用的两个旋钮：

- **`--lh-bg-pattern-size`**：40px 是「按钮高度内能放下一个完整纹样」的尺寸；大区块背景可以调到 80px+ 让纹样舒展。
- **`--lh-bg-pattern-opacity`**：0.15 是「存在但不抢眼」的默认值；需要更明显的国风氛围可以到 0.25。

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

组件里 `@include` 它即获得花纹背景能力：

```scss
@use 'theme/common/patterns' as *;

.lh-card--patterned {
  @include apply-pattern;
}
```

**为什么前三个不写 fallback**：花纹默认不启用，这三个令牌由用户 / ConfigProvider 传入；缺省即无花纹（`background-image: none` 的回落由令牌自身的默认值提供），写死 fallback 反而会让「未配置花纹」与「显式关闭花纹」无法区分。

## 花纹与暗色

花纹的 `--lh-bg-pattern-color` 默认引用 `--lh-decoration-color`（装饰色），后者在 `var-dark.scss` 里有暗色覆盖——所以花纹颜色会跟随暗色自动调整。

如果定制花纹颜色，记得暗色下也调一下：

```scss
[data-theme='dark'],
.dark {
  --lh-bg-pattern-color: rgba(255, 255, 255, 0.08);
}
```

## 注意事项

- **默认关闭是刻意的**：花纹是氛围而非信息，默认开着会污染所有用户的界面。想要全局花纹的业务自己在 ConfigProvider 开。
- **内联 SVG 的体积**：六个纹样都是精简路径，单个几百字节，内联进 CSS 不产生额外请求。
- **`!default` 覆盖**：想换自己的纹样，在项目里 `--lh-pattern-plum: url('data:image/svg+xml,...')` 覆盖即可，或直接设 `--lh-bg-pattern`。
- **打印场景**：花纹在打印时可能不显示（浏览器对 `background-image` 的打印处理），内容层不要依赖花纹传达信息。

## 相关文档

- [主题系统总览](/theme/overview)
- [运行时定制](/theme/customization)
- [设计令牌](/theme/tokens)
- [样式源](/reference/styles)
