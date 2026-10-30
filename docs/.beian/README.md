# 备案/版权数据（同步产物，禁止手改）

- `beian.json`：由工作区根 `scripts/sync-beian.mjs` 从
  `lh-feng-mo-workspace` 的真源生成后提交；改备案号去改真源，再重跑同步。
- `beian.local.json`（可选，不提交则不存在）：本站覆盖，如独立备案号、
  隐藏公安备案、版权行附加 HTML；同步时与真源深合并后写进 `beian.json`。
- 图标在各站静态目录的 `assets/icons/beian.png`（同产物）。
- 完整机制见工作区 `docs/备案资源同步方案.md`。
