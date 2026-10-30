---
'@lh-ui/share': patch
---

修复文档站两处法/西语言页面问题：

- `fr/core/popper.mdx`：frontmatter `description` 是单引号 YAML 标量，其中的 `l\'axe` 写法对 YAML 无效（单引号串的正确转义是重复一次引号 `''`），astro 解析 frontmatter 直接失败。改为 `l''axe`。
- `fr/components/basic/card.mdx`、`fr/components/basic/empty.mdx`：同类问题——单引号串内含未转义的 `l'interactivité` / `l'image`，改写为 `''`。
- `es/development/commands.md`：代码围栏信息串写成了 ` ```bash# 注释…`，astro-expressive-code 把 `bash#` 当语言名找不到，退化成 txt 并告警；注释移入代码块内部。
