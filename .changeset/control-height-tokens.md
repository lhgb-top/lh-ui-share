---
'@lh-ui/share': minor
---

# 高度令牌专项：统一控件高度 + 居中体系收尾

新增 `--lh-control-height-{mini,small,medium,large,x-large}` 令牌（`theme/common/variables.scss` + `var.scss`，
语义为控件**外高 border-box**），全部表单控件改引令牌，同表单混排时垂直中心与基线对齐。

## 破坏性变化（视觉）

此前多数控件未声明 `box-sizing: border-box`，`min-height`/子元素高度并不等于外高；本次统一按外高对齐，下列控件实际渲染高度**降低**：

- **input**：由 padding 派生改为固定高度，各档 mini 28→20、small 32→24、medium 39→32、large 50→40
- **cascader**：42→32（原 `min-height: 32px` 被 padding 4px×2 + 边框 2px 顶到 42px，"与 select 同高"此前未兑现）
- **tree-select**：44→32（同上，padding 5px×2 + 边框 2px）
- **input-number**：small 30→24（边框在根元素，子元素高度改 `令牌 - 2px`，外高才等于令牌）
- **date-picker / time-picker**：约 35→32（垂直 padding 8px→6px，由 `min-height` 兜底到令牌）
- **input has-label**：单行输入框移除 `--has-label` 的 `padding-top: 16px`（改固定高度后不再需要，否则带 label 的输入框会比令牌高 16px）；textarea 分支保留

## 非破坏性变化

- button / select medium 已在本次前置改动中改引令牌，select 的 small / large 补齐
- checkbox 对勾与 indeterminate 横杠由固定 `top/left` 改为 `50%` 居中（与盒子尺寸解耦）
- switch 的 loading 指示器由绝对定位 + `translate(-50%,-50%)` 改为 `__core` 的 flex 居中，keyframes 只留 `rotate(360deg)`，消除 base 与 keyframes 的重复硬编码
- input 的四个零引用死变量 `$lh-input-height*` 删除

## 配套

- docs 令牌页更新：组件令牌示例改用真实存在的 `--lh-switch-knob-color`；"已知令牌缺口"清掉本次已修项
- customization 页的 componentTheme 示例改为有效键 `control-height-medium`（原 `control-height` 无组件消费）

## 仍不在本次范围

- spinner 与 icon 同名尺寸档位不一致（small 16 vs 14 等）：改任一侧波及全库，触发条件为同槽位混用的视觉投诉，届时单独立项
- size 档位不齐（select/switch 仅 3 档、date/time validator 收窄、tree-select/rate/segmented/pagination 无 size）：属 API 层改动，与高度令牌解耦
