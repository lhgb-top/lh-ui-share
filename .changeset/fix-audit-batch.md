---
'@lh-ui/share': minor
---

# 审计修复：已知 bug、框架设计漏洞与开源组件库对齐

本次对 core / shared / theme / constants / utils 做了一轮全面审计并修复。以下为**破坏性变更**与迁移指引，其余为兼容性修复。

## 破坏性变更（3 处）

1. **`validateFormField` 支持异步校验**：返回类型由 `string | undefined` 扩为 `string | undefined | Promise<string | undefined>`；`LhFormRule.validator` 可返回 Promise。
   - 迁移：组件层调用点需加 `await`，或用 `Promise.all` 汇总多条规则的结果后再决定提示文案。同步用法无需改动。

2. **`isExtensionRejected(fileName, accept)` 重命名为 `isFileRejected(file, accept)`**：新签名接收 `{ name, type }`，因为 MIME 匹配（`image/*`、`image/png`）必须依赖 `file.type`，文件名无法承载该信息。
   - 迁移：`isExtensionRejected(file.name, accept)` → `isFileRejected(file, accept)`（传入完整 File 对象）。

3. **`LH_LANGUAGE_CONST` 开放全部 6 种语言**：取消 ja-JP / ko-KR / de-DE / fr-FR 的注释，`LhLocaleType` 由 2 元联合自动扩为 6 元。
   - 迁移：纯增宽，share 的 registry 早已注册这 4 种骨架包（英文兜底）。消费方若穷举过该联合需补齐 4 个分支。

## 高严重度修复（数据正确性 / 无障碍）

- **date-picker**：`parseDate` 重写为位置驱动解析 + NaN 判定 + 构造后回读校验，`2023-02-30` 与垃圾串不再静默滚到非法日期；`formatDate` / `formatTime` 改全局正则替换，保证 round-trip 对称；`isInRange` 改用天级 `compareDate`；日历首尾填充的 `isToday` / `isSelected` 改为实际计算而非硬编码 `false`。
- **upload**：`isFileRejected` 按后缀 / MIME 前缀 / 精确 MIME 三级匹配（大小写不敏感）；`exceedsMaxSize` 对非有限上限视为无限制。
- **focus-trap**：`trapTabKey` 改用列表索引判定，修复焦点落在容器内 `tabindex="-1"` 元素时的逃逸；`setInertOutside` 引入所有权注册表（双 WeakMap），修复嵌套 overlay 互相误伤 inert、以及容器未 teleport 到 body 时的加锁遗漏；`restoreActiveElement` 归还前检查 inert 祖先链，目标已被 inert 时 blur 当前焦点元素回退 body（`body.focus()` 在部分环境不会移动 activeElement）；可聚焦选择器排除 `type="hidden"`。
- **sx**：`spacingToPx` 收 `string | number`，字符串原样透传，修复 `"NaNpx"`；间距键类型同步放宽。
- **form**：非必填空值跳过后续 validator（对齐 Element / Ant 约定）；新增导出 `isEmptyValue`。
- **环保护**：cascader / tree / table 的所有递归改用祖先链判重，循环数据不再栈溢出（DAG 共享子树不受影响）。
- **time-picker**：`generateTimeColumn` 对 `step <= 0` 兜底为 1（修复死循环）；`parseTime` 纳入秒的 NaN 判定并校验值域（`99:99:99` → null）。
- **虚拟滚动**：定高场景 `first` 钳到 `total - 1`，修复数据收缩瞬间 `start > end` 的白屏。

## 中 / 低严重度修复

- **popper**：`gap` / `padding` 非有限值兜底；shift 夹回改用视口真实边界（支持非原点视口）；新增主轴夹回（两侧都放不下时整体拉进视口）；箭头 padding 上界不超过弹出层一半。
- **cascader**：`itemConfig` 字段映射补齐实现（value / label / children / disabled / leaf，缺失时回退标准键）；`searchNodes` 输出完整祖先链、大小写不敏感、结果上限 50。
- **tree**：未加载的非叶子子树不再被「空子树恒真」误判为全选；禁用子树不参与级联收集。
- **table**：`getStickyOffsets` 支持 px 字符串宽度；`sortTableRows` 非有限数排末尾；`clampColumnWidth` 对 NaN 兜底。
- **pagination / transfer / calendar / select / utils**：`clampPage` 非有限值兜底（NaN 回首页，Infinity 落末页）；`moveTransferKeys` 清理幽灵勾选键（搬运结果与源区都不残留）；`filterTransferItems` label 缺失不抛错；`isCalendarDateDisabled` 归一反序 range；`getNextEnabledIndex` 全禁用时返回 -1；`getScrollbarWidth` SSR 安全。

## 结构性改动

- 新增共享内核 `core/shared/sanitize`（`sanitizeNumber`）与 `core/shared/virtual`（`computeRange` / `getItemOffsetAt`），统一所有数值入口的净化与虚拟滚动算法；`virtual-list` 与 `table` 的两份定高实现改为薄封装委托。
- `getThemeVars` 返回类型改为 `ThemeVars | undefined`（类型自洽）；`THEME_PRESETS` 数组顺序不变。

## 单测

修正 `date-picker.spec.ts` 中把 bug 钉死的断言（`parseDate('')` 由 `not.toBeNull()` 改为 `toBeNull()`）；`focus-trap.spec.ts` 用桩补齐 inert 加锁 / 解锁路径；新增 `sanitize.spec.ts`、`virtual.spec.ts`、`theme.spec.ts`（SCSS 令牌与 `THEME_PRESETS[0]` 漂移护栏）及主要修复项的回归用例（`getField` 经 itemConfig 消费函数间接覆盖；`isCalendarDateDisabled` 反序区间、`isEmptyValue`、`getScrollbarWidth` 的直测在后续 changeset 补齐）。
