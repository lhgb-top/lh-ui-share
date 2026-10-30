---
'@lh-ui/share': patch
---

修复 `styles/switch/index.scss` 两个复合修饰符选择器在 dart-sass 下的编译失败：

- 原写法 `&--small&--checked` / `&--large&--checked` 中 `&` 出现在复合选择器中间，dart-sass 报「"&" may only used at the beginning of a compound selector」，react 文档站直接编译 SCSS 时构建失败。
- 改为 `&--small.lh-switch--checked` / `&--large.lh-switch--checked`（第二段修饰符写全类名），并修正内部嵌套：原 `&__core::after` 会拼成永不匹配的 `.lh-switch--checked__core::after`，改为后代选择器后输出为预期的 `.lh-switch--small.lh-switch--checked .lh-switch__core::after`，与文件末尾 RTL 块的手写形式一致。
- 注意：dist/ 里的旧产物仍是更早的错误形式（`.lh-switch--small .lh-switch--checked__core::after`，永不命中），需重跑 `pnpm build:styles` 重新生成——这同时修复 small/large 档 switch 勾选后滑块位移退化为基础 18px 的运行时 bug。
