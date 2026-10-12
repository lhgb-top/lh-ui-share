---
"@lh-ui/share": patch
---

GUI 回归测试发现的缺陷修复（share 侧逻辑/样式/语言包，随 share 发版对 @lh-ui/vue3 生效）。

- **Form 必填文案优先级**（BUG-02）：`validateFormField` 在空值分支用
  `rules.find((rule) => rule.required)` 取首个必填规则。组件层在 `required` 为真时会合成一条
  无 `message` 的 `{ required: true }` 规则并排在用户规则之前，`find` 命中合成规则后回退通用文案，
  吞掉用户自定义 `message`。现改为先取「显式提供了 message 的必填规则」，取不到再回退首个必填规则；
  `message` 显式提供（含空串）仍原样使用，仅 `undefined` 回退通用文案。
- **深主色预设暗色提亮**（BUG-07）：水墨（`#2C2C2C`）等深主色预设切暗色后，主色对暗色页面底
  （`#1A1A2E`，与 `var-dark.scss` 同源）对比度不足 3:1，主要按钮近乎不可见。新增
  `buildPresetDarkVars(vars)`：在既有 `primary-color-bg` / `selected-color` 两条暗色覆盖之外，
  按 WCAG 相对亮度判定，主色对暗底对比度低于 3:1 时追加
  `--lh-primary-color: color-mix(in srgb, <主色字面值> 55%, #fff)`（字面值代入，避免 CSS 自引用）
  及配套 hover/active，并改用墨字 `#101410` 保证按钮文字对比度。浅主色预设（松花绿/藤黄）不动。
  `buildPresetStyleText` 与 docs 主题台的预览区都调用同一函数，导出文件与预览一致。
- **Calendar 面板标题 locale 化**（F-03）：新增 `datepicker.panelTitle` 模板，
  中文 `'{year}年{month}'`（→「2026年10月」）、英文 `'{month} {year}'`（→「Oct 2026」），
  月份名复用既有 `month1~12`，组件层不再硬编码中文标题格式。
- **花纹背景消费面**（F-12）：`bg-pattern` 令牌原本只有 button 消费，card / dialog / drawer /
  dropdown / icon / input / popconfirm / popover / steps / tooltip 十个组件的根容器补上
  `background-image: var(--lh-bg-pattern, none)` 及 blend-mode / repeat / size 四件套，
  默认仍为 `none`，仅在用户显式配 `bg-pattern` 且组件在 `patternComponents` 白名单内时生效。
- **Table 表头横向滚动**（BUG-04 配套）：`.lh-table__header` 加 `overflow-x: auto`，
  滚动条隐藏（`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`），
  横向滚动只由表体那一根承担，配合组件层的 scrollLeft 双向同步。
