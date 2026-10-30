---
'@lh-ui/share': patch
---

文档站补齐五种语言内容（ko / es / ar / fr / ru 各 95 篇，与中文源 1:1 镜像），加上 W0 的日语站，share 文档站九语言内容齐全：

- 三段式组件标题按 W4 裁决统一（`<slug> <译名> —— <分类译名>`，分类与 astro.config.mjs 侧栏标签对齐）
- 相对 import 深度 +1、站内绝对链接带 locale 前缀、`reference/locales` 语言包真实值保留原文等口径已全树校验
- 同步修复：ar/ru 部分文件 CRLF 行尾归一为 LF、fr 12 篇 frontmatter 单引号标量内直撇号（YAML 解析必崩）改排版撇号、四处跨语言锚点 slug 与 ja 站 cascader 区域 demo 未译
