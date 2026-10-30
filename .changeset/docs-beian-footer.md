---
'@lh-ui/share': patch
---

文档站页脚接入家族统一备案/版权方案（机制见家族 docs/备案资源同步方案.md）：

- 页脚新增备案行（中文界面展示「版权 | 宁ICP备2024006574号 | [公安图标]苏公网安备32040002010537」，非中文仅版权），数据由工作区根 `scripts/sync-beian.mjs` 从 `lh-feng-mo-workspace` 真源同步到 `docs/.beian/beian.json`，结束年份动态取当前年。
- 站点差异化入口 `docs/.beian/beian.local.json`（深合并，未覆盖项继续随真源）。
