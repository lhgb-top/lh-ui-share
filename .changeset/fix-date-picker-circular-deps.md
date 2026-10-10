---
'@lh-ui/share': patch
---

# 拆除 date-picker 循环依赖，修正 notification 的类型值导入

- `core/date-picker`：`formatDate` / `parseDate` 下沉到共享内核 `core/shared/date`，
  `adapter.ts` 改为直接依赖内核，不再反向 import `logic.ts`。此前
  `logic ↔ adapter` 的二元值环会在下游（如 lh-ui-plus 的 UMD 全量打包）触发
  Rollup 循环依赖告警；拆环后只剩 `logic → adapter` 单向。
  `@lh-ui/share/core/date-picker` 的导出面一字不变（formatDate / parseDate 由
  logic.ts 按原路径转发）。
- `core/notification`：`LhIconName` 只用于类型位置，原值导入会把 `icon/svgs.ts`
  的大对象打进 notification 产物 chunk，改为 `import type`。
