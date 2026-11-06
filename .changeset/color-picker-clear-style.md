---
'@lh-ui/share': patch
---

styles/color-picker 补 `.lh-color-picker__clear` 清除按钮段（clearable 且已有值时的触发器内清除钮，与 autocomplete__clear 同风格：圆形透明底 + 次要色 hover 加深）。此前 plus 的 SFC 引用了该类但样式源缺失，按钮裸奔；uniapp 端 color-picker 组件落地（对齐 plus 同构契约）同样需要。
