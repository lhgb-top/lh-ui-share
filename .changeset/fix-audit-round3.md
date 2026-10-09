---
'@lh-ui/share': minor
---

# 审计修复第三轮：打包缺口 / 逻辑 bug / 单例解耦 / 令牌一致性

第三轮系统排查（打包导出 / 运行时正确性 / 全局可变状态 / 样式令牌 / 文档）的修复汇总。旧导出全部保持兼容，单例 API 保留并标 `@deprecated`。

## 打包与导出（CI 原本会放行的致命缺口）

- **`es/core/index.js` / `lib/core/index.js` 从不产出**：`vite.config.ts` 的 `collectEntries()` 只遍历 `src/core` 的子目录，聚合文件 `src/core/index.ts` 是文件被跳过，而 `package.json` 的 `./core` 子路径导出正指向它们。已在入口收集中单独收录该文件。
- **星号导出同名歧义**：`clampValue`（slider / input-number 同绑定再导出）、`computeWindow` / `LH_VIRTUAL_OVERSCAN`（shared/virtual / virtual-list 同绑定再导出）在 `es/index.d.ts` 被 TS 静默丢弃，造成运行时有、类型上没有的割裂。`src/core/index.ts` 显式重导出恢复对齐。
- **`verify-dts.mjs` 加固**：新增 `es/` 与 `lib/` 的 `.js` 镜像存在性检查（直接兜住上一类缺口）；禁导入扫描从 `.d.ts` 扩展到 `.js` 并补 `import 'x'` / `require('x')` 两种形式；新增 `package.json` exports 目标文件存在性检查。镜像检查的口径为「运行时入口」（与 `vite.config.ts` 的 `collectEntries` 同规则），纯类型模块（各组件 `types.ts`、`src/types/**`）只被 `import type` 引用、Rollup 将其剔除出运行时图，无 `.js` 是预期行为，不在检查范围内。
- **发布门加固**：`prepublishOnly` 改为 `build && verify:dts && verify:styles`（原写法重复执行已含步骤且漏掉质量门）；补 `keywords`。

## 逻辑 bug

- **`parseDate` 丢失时间分量**：此前只解析年月日，`parseDate('2023-01-01 10:30:45', 'yyyy-MM-dd HH:mm:ss')` 的时刻被丢弃。现在按 `HH/mm/ss` 位置取值并参与回读校验（`25:00:00` 等越界值仍返回 null），与 `formatDate` 往返对称。串比 format 短（format 含时间 token 但串里缺分量）仍返回 null，不静默补零——这会掩盖 value-format 与实际值不匹配的 bug。
- **`parseTime` 强制 mm 必填**：`formatTime(10,0,0,'HH')` 产出的 `"10"` 无法被 `parseTime('10','HH')` 解回。缺失分量现在按 0 补齐。
- **`backtop` SSR 崩溃**：`window.matchMedia` 在无 window 环境（SSR / 部分 uniapp 运行时）直接 TypeError。加了与 `shared/popper` 同风格的 `typeof window` / `matchMedia` 双重守卫。
- **`getWordCount` 空值崩溃**：react / uni 挂载前 `value` 可能为 undefined，`value.length` 抛错。兜底按空串处理。
- **tree 未加载非叶子的勾选态反转**：`collectLeafKeys` 对「`isLeaf !== true` 且无 children」返回空数组，导致 `getNodeCheckState` 恒为 `unchecked`——而 `toggleCheckKeys` 会把该节点自身键写入 `checkedKeys`，出现"键在 checkedKeys 里却显示未选"。空子树时改用 `checkedKeys.includes(node.key)` 判定，与 `isSubtreeFullyChecked` 已留的分支语义一致。

## 全局单例 / 副作用解耦

- **`formatMessage` 下沉共享内核**：实现从 `locales/locale.ts` 迁到 `core/shared/format`，rate / pagination 改从 shared 引入。`@lh-ui/share/core/rate` 的消费者不再被迫执行 `new LhLocale()` 的模块级副作用；locales 层再导出同一绑定，旧导入路径完全兼容。
- **`upload` uid 去全局种子**：模块级 `uidSeed` 自增 + `Date.now()` 在三库各自打包时同毫秒会产出同号 uid。改用 `crypto.randomUUID()`（无该 API 的环境回退时间戳 + 随机数），`createUploadUid(prefix?)` 签名兼容默认前缀 `lh-upload`。
- **date-picker adapter 显式参数透传**：`generateCalendarDays(year, month, selected, rangeStart, rangeEnd, today, firstDayOfWeek?, adapter?)` 接受可选适配器参数，默认取 `getDateAdapter()`。模块级单例 `setDateAdapter` / `getDateAdapter` 保留并标 `@deprecated`（多日期选择器实例会互相污染），内部默认路径不变。

## 样式令牌一致性

- **4 处令牌名不匹配**（引用了 var.scss 未声明的令牌，实际不生效）：`--lh-line-height-primary` → `--lh-font-line-height-primary`（drawer / popconfirm / popover）；`--lh-spacing-medium` → `--lh-spacing-base`（space）；`--lh-loading-color` → `--lh-loading-text-color` 且 fallback 改为正文色（loading）；`--lh-notification-color` → `--lh-notification-content-color`（notification）。
- **161 处 ElementPlus 遗留 fallback 色清洗**：24 个组件样式中的 `#409eff` / `#e6a23c` / `#f56c6c` / `#67c23a` / `#909399` / `#606266` / `#303133` / `#ebeef5` / `#c0c4cc` 全部按 `variables.scss` 的 lh-ui 调色板映射替换；顺带把 63 处同色小写形式统一为大写。所有命中均在 `var(--lh-*, #色值)` 的 fallback 位，无调色板外用途被误伤。
- **266 处无 fallback 的 `var(--lh-*)` 补齐**：默认值取自 `var.scss` 的 `:root` 声明（`#{$lh-x}` 插值回查 `variables.scss` 解析为字面量）。组件局部令牌（同文件声明、同作用域消费，如 card 的 `--lh-card-*`）自动豁免；`apply-pattern` mixin 的三个令牌为用户传入语义，以 `/* no-fallback */` 注释显式豁免。`switch` 的两处硬编码 `#fff` 收敛为组件令牌 `--lh-switch-knob-color`。
- **新增 `pnpm verify:styles`**：scss 侧此前无任何 lint 兜底（eslint 显式忽略 scss）。新脚本拦截 EP 调色板 9 色、无 fallback 的 `var(--lh-*)`（`/* no-fallback */` 行级豁免）、组件 scss 缺 `@use '../theme/common/index.scss' as *`；已接入 CI 末步与 `prepublishOnly`。顺带补齐 input-number / slider / switch / tag 四个缺 `@use` 的文件。

## 文档

- README / README.en 的 `t()` 描述更正为支持 `{name}` 插值（原文称不插值，与实现及单测不符）；组件数与共享内核数更正为实际的 55 / 8。
- ja / ko / de / fr 文件头的失效启用指引（`packages/constants/index.ts` 取消注释）改为真实状况：已注册登记，可直接 `setLocale` 切换。
- AGENTS.md：`verify:dts` 的能力描述同步加固后的扫描范围；登记 adapter 迁移与 formatMessage 下沉；过渡类名双写的表述更正（enter 双写、leave 侧无需 `-leave-from`）；`normalize-styles.mjs` 标注已完成。
