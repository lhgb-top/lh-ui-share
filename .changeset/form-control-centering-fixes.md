---
'@lh-ui/share': patch
---

# 表单控件居中与间距修复（cascader/button/switch/date/time-picker/pagination/spinner）

全面排查各组件「图标在输入框中垂直居中」与「旋转动画居中」时定位出一批 scss 层缺陷，本次统一修复。

> 与「高度令牌专项」（见 `control-height-tokens.md`）同批落地、相互配套：本文件记录**居中与间距**侧的修复，
> 控件**外高统一**由令牌专项承载。两项 changeset 同时消费、同期发版，changelog 会合并展示。

## 修复内容

- **cascader**：`.lh-cascader__input` / `.lh-cascader__tags` 此前零样式，`__input-inner` 的 `flex:1; min-width:0` 是死代码——补中间层 flex 容器规则后输入框才能随容器收缩，窄容器下不再把右侧清空/箭头图标顶出
- **button**：`.lh-button__loading` 的 `margin-right: 4px` 与 `&__loading + &__text` 的 `margin-left: 4px` 双写，导致圆形 loading-only 按钮的 spinner 向左偏心约 2px、loading 态与文字间距 8px（非 loading 态只有 4px）。去掉 `margin-right`，间距统一由相邻选择器控制
- **switch**：loading 指示器居中于轨道，checked 时滑块右移与之重叠，新增 `&--loading &__core::after { opacity: 0 }` 在 loading 期间隐藏滑块
- **date-picker / time-picker**：`__input-inner` 补 `flex:1; min-width:0`，长占位符不再顶出右侧图标；`__icon` 补 `flex-shrink: 0`
- **pagination**：跳页框 `height: 30px` 缺 `line-height`，垂直位置原交 UA 默认处理，补 `line-height: 30px`
- **spinner**：补 `vertical-align: middle`，行内语境下与 LhIcon 对齐、不再落基线

## 已并入高度令牌专项、不在本文件范围

下列缺陷在排查时一并定位，但属控件外高体系问题，由 `control-height-tokens.md` 承载（此处不重复记录，避免 changelog 双开）：

- 各表单控件外高不统一（input 39 / cascader 42 / tree-select 44 / date-time 35 / input-number 34），根因是缺 `--lh-control-height-*` 令牌且多数控件未声明 `box-sizing: border-box`
- input `--has-label` 的非对称 `padding-top: 16px`、checkbox 对勾固定 `top:2/left:5`、switch 的 `translate(-50%,-50%)` 在 base 与 keyframes 重复硬编码

仍未处理的体系问题（单列后续专项）：spinner 与 icon 同名尺寸档位不一致（small 16 vs 14、medium 24 vs 16 等）。
