---
'@lh-ui/share': patch
---

hairline 规范随 uniapp v3 px 直出废止（bugfix-log D-01 / D-02 / D-05）：

- `scripts/verify-styles.mjs` 移除第 6 项「1px 细边框必须带 `/* hairline */` 行级标记」校验（七项→六项），头部注释与尾部通过信息同步
- `AGENTS.md` 红线第 4 条废止：hairline 标记原供 uniapp 的 px→rpx 转译跳过 1px 声明，v3 不再转译即失去用途；`styles/` 内既有的 65 处标记保留为普通注释，新增 1px 边框无需再标记
- `README.md` 组件计数「55 个」改为「56 个」并新增计数口径说明：`src/core/config/` 与 `styles/config-provider/` 是同一组件（目录名不一致），`styles/layout` / `styles/tree-select` 两个组件无 core 纯函数层（逻辑仍在各 UI 库），故 core 计 56、styles 计 58

纯治理性改动（脚本门禁 + 文档），不改变运行时产物；`pnpm verify:styles` 实跑通过（六项、67 个 scss 文件）。
