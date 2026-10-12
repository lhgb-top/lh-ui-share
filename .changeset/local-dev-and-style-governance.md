---
'@lh-ui/share': minor
---

# 本地联动 + 样式治理 + 主题审计

## 新增（样式源）

- **`styles/index.scss` 全量聚合**：`@use 'theme/index.scss'` + 全部组件样式，
  由 `scripts/build-styles.mjs` 按组件清单生成。供各端 docs / dev 沙箱一行引入全量样式，
  也作为主题定制台的导出基础。`package.json` exports 同步新增 `"./styles/index.scss"`
  （置于 `./styles/*` 通配之前，精确优先），`files` 已含 `styles`——这是各端单仓 clone
  回退 npm 包时解析 `@lh-ui/share/styles/index.scss` 的必要条件，随本次发版进入 npm。
  `verify:styles` 新增「聚合与组件目录一致」检查。
- **过渡类名 mixin**（`styles/theme/common/transition.scss`）：
  `lh-enter-both` / `lh-leave-both` / `lh-transition-ends`，内部双写 `-enter` 与
  `-enter-from`（及 leave 对），收编此前散在 16 个组件里逐文件手写的过渡双份
  （dialog / drawer / select / cascader / tree-select / date-picker / time-picker /
  notification / menu / dropdown / table / popover / popconfirm / tooltip / message / backtop）。
  编译产物等价，SCSS 源码消费方改用 `@include`，`verify:styles` 禁止组件再手写
  `-enter-from` / `-leave-from`。mixin 内的 `if()` 内置函数已改为 `@if` 赋值，
  消除 Dart Sass `[if-function]` 弃用警告。
- **`styles/index.scss` 聚合命名空间**：每条 `@use` 改为 `as <组件名>` 显式命名空间，
  否则 59 条 `@use '<name>/index'` 的默认命名空间都叫 `index`，Sass modern API 下
  直接 `There's already a module with namespace "index"` 编译失败。生成器同步修改。
- **暗色令牌缺口补齐**：审计全部组件引用的 `--lh-*` 令牌，补上 `var-dark.scss` 缺失的
  暗色覆盖（共 12 处），「所有组件默认支持暗色与亮色」从约定变成可验证——
  `verify:styles` 新增「组件引用的令牌在明/暗都有定义」检查。
- **`/* hairline */` 标记审计**：全部 1px 边框规则补上行级标记（65 处），
  为未来 uniapp 的 px→rpx 注入留 sanctioned seam；`verify:styles` 新增「细边框有标记」检查。

## 开发体验（不发版，scripts 不在 files 内）

- **`tsconfig.build.json` 开 `declarationMap`**：各 UI 库编辑器可从 d.ts 跳回 share 源码。
- **`verify:theme`**：对比度自查脚本（按真实消费配对复算每个预设的 AA 对比度），新预设门禁。
- **`verify:versions`**（`scripts/check-version-sync.mjs`）：家族布局下检查各 UI 库的
  `@lh-ui/share` 依赖范围是否覆盖 share 当前版本，并拦截已废止的 `link:` / `file:` 联调形态。

## 约定更新（AGENTS.md）

新增「本地联动」章节（带存在性守卫的 vite alias 机制、CI 不受影响、npm 包定位调整为
服务终端用户独立引入）与「注入契约」章节（两端 dev 注入方式、产物落位、`./style/*`
子路径形态差异表，明确「注入分散、内容单源」）。

> 发版顺序：share 先发，各 UI 库随后 `pnpm up @lh-ui/share` 回归（本次为 `^0.4.0`）。
