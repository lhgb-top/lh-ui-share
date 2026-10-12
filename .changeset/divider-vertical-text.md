---
'@lh-ui/share': minor
---

# divider 竖向支持文案

`hasContent` 在四端胶水层此前被锁死为 `direction === 'horizontal' && 有子节点`，导致
`needsAriaOrientation(direction, hasContent)` 要求的「有文案且竖向」恒不可达，
`aria-orientation="vertical"` 从未被输出。本次让竖向分割线与横向对齐，支持默认插槽文案：

- `getDividerClassNames`：`--label-left/center/right` 是横向语义，竖向文案恒居中，
  只在横向产出该修饰类（竖向 `hasContent: true` 仍产出 `--with-text`）。
- `styles/divider/index.scss`：新增 `.lh-divider--vertical.lh-divider--with-text` 纵向
  flex 布局（线段在文案上下，几何相对横向整体反转），含虚线变体的纵向渐变。
- `needsAriaOrientation` 不变——现在可达，且与 APG 语义一致（separator 默认横向，竖向需声明）。

各 UI 库（plus / vue2 / react / uniapp）同步放开 `hasContent` 的横向门控，竖向带文案时
输出 `role="separator"` + `aria-orientation="vertical"`。
