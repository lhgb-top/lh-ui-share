---
'@lh-ui/share': patch
---

修复文档站非根语言（zh-TW / ja）页面构建失败：mdx 中 `FnPlayground` / `TokenTable` / `LocaleInspector` / `PresetPreview` 等组件的相对导入沿用了根语言的 `../` 级数，但 locale 目录比根语言深一级，路径全部解析到不存在的 `content/components/`。

- `zh-TW/components/**`（56 份）：`../../../../components/` → `../../../../../components/`
- `zh-TW/{core,theme,reference}/**` 与 `ja/core/**`：`../../../components/` → `../../../../components/`
- en 语言此前已修正，本次未改动；根语言不受影响
