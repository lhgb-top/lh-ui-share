---
'@lh-ui/share': patch
---

# Steps 标题换行修复 + 横向定宽折行

`title` 在容器宽度不足时被挤压换行（步骤项 `flex:1` 且 `__main` 为 `min-width:0`，标题无
`white-space` 规则），连接线与圆圈错位、整行高度被撑乱。本次从「换行」这一本质入手，让标题
保持一行、由步骤项整体承担折行，横向纵向两种方向都不再换标题。

## 修复内容

- **标题一行**：`.lh-steps__title` 补 `white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis`，宽度不足时省略号截断，绝不换行（横向纵向均适用）
- **横向定宽折行**：`--horizontal` 开 `flex-wrap: wrap`（行间距取 `--lh-spacing-lg`），
  步骤项改为 `flex: 1 1 var(--lh-steps-item-basis)`。宽容器下仍是等分一行、视觉不变；
  装不下基准宽度时整步折到下一行，而不是逼标题换行
- **新增组件级变量** `--lh-steps-item-basis`（默认 `160px`，定义在 `.lh-steps` 上），
  可通过各端 UI 库的 `themeVars` 机制覆盖，调节折行节奏
- **行末连接线**：横向新增 `lh-steps__item--line-last` 类，行末项的 `::after` 连接线
  `display: none`，不再指向行尾空白。是否为行末项由 UI 层测量 `offsetTop` 后经
  `getStepsLineLastIndices` 计算，纯函数 + 单测随附
- **顺带修复「末项连接线首屏全漏画」**：连接线的「非末项」判定原本依赖 JS 类
  `lh-steps__item--last`，而该类基于子项注册总数计算——子项在各自 setup 阶段渲染，
  此时后续兄弟尚未注册，导致**每一个步骤在首屏（含 SSR/SSG 快照）都被判为末项**，
  连接线全部被隐藏，一个 tick 后才自纠正。现改为结构性 `:last-child`，纯 CSS、
  任意渲染时机都正确；`LhStepClassState` 的 `isLast` 字段与 `lh-steps__item--last`
  类随之移除（vue2 仓无 steps 组件，无下游影响）

## core 变更

- `getStepsLineLastIndices(offsetTops)`：按各步骤项纵向偏移判定每行最后一项索引
- `LhStepClassState` 新增可选 `lineLast`，移除 `isLast`；`getStepClassNames` 据此输出
  `lh-steps__item--line-last`，不再输出 `lh-steps__item--last`

> 行末连接线的测量由各端 UI 库（如 lh-ui-plus）在 Vue/React 层完成，本仓只提供判定函数
> 与样式钩子，不引入框架 API（红线 1）。
