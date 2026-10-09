---
'@lh-ui/share': minor
---

# 审计修复第五轮：运行时 bug + 导出可扩展性 + 验证脚本加固

第五轮深审发现 4 个运行时 bug 与 1 个「多组件库核心」层面的导出盲区，并补齐验证脚本的兜底缺口。导出面全部向后兼容。

## 运行时 bug

- **virtual-list 非有限入参崩溃**：动态高度路径的 `findVirtualRange` 未像共享内核 `computeRange` 那样净化入参——`overscan` 为 NaN 时 `start` 变 NaN，`items[NaN].offset` 抛 TypeError 直接中断渲染；小数 overscan 产出小数下标同样崩。现在 scrollTop/viewportHeight 的 NaN、overscan 的 NaN/负数/小数全部归一（overscan 是项数，向下取整；scrollTop 的 +Infinity 保留，过度滚动仍正确渲染尾部）。`buildVirtualItems` 的 NaN/非正 defaultSize 回落 `LH_VIRTUAL_ITEM_SIZE`。
- **tree 禁用后代导致父级恒半选**：三处勾选函数对「禁用」的处理不一致——`collectCascadeKeys` / `isSubtreeFullyChecked` 跳过禁用子树，唯独 `getNodeCheckState` 用的 `collectLeafKeys` 不跳过。禁用后代计入分母但永不被 `toggleCheckKeys` 写入，父级勾选后恒显 indeterminate，破坏「父选中 ⇒ 全部可用后代选中」的不变量。新增内部 `collectCheckableLeafKeys`（跳过禁用子树），`collectLeafKeys` 语义不变、照常导出。
- **select 高亮 -1 产出失效 aria id**：JSDoc 声明「-1 表示无高亮」，但 `getSelectOptionId` 只兜了 `!listboxId`，`listboxId` 存在时产出 `aria-activedescendant="lb-option--1"` 指向不存在的 DOM。现在非整数与负下标一律返回 undefined。
- **form 异步校验 reject 未捕获 + 非法正则穿透成用户文案**：`runChecks` 只挂了 onFulfilled，异步 validator reject 时 Promise 直接 reject（同步抛错却按校验失败处理），UI 层 `Promise.all` 汇总时变成未捕获 rejection；`new RegExp(rule.pattern)` 对畸形正则抛 SyntaxError，其信息（如 "Invalid regular expression"）被当成字段错误文案展示给终端用户。现在异步 reject 与同步抛错同语义（取 error.message）；畸形正则单独 try/catch——`console.error` 告警开发者并跳过该 pattern，不阻塞用户提交。

## 导出可扩展性

- **深路径导出盲区**：vite preserveModules 产出 `es/core/<组件>/<文件>.js` 这类扁平深文件，而 Node 的 exports 规范只认单星模式（实测 Node 24 直接忽略两段星号键），既有的单星 `./core/*` 只映射到目录桶 index.js——到不了 `es/core/tooltip/logic.js`。lh-ui-plus 有 10 处 `@lh-ui/<组件>/logic` 深导入，整体迁移时会 MODULE_NOT_FOUND。新增 `scripts/sync-exports.mjs`（`pnpm build` 末步）：扫描 `es/` 下每个**纯扁平**深目录（含 index 之外的直接子文件、且无子目录），为它生成 `./<bucket>/<dir>/*` 单星模式；有 .d.ts 才挂 types、有 .js 才挂 import、lib/ 有同名目录才挂 require。混合形态目录（es/locales、es/theme、es/types 既有扁平文件又有子目录桶）一个单星模式无法同时覆盖两种形状，只提示不生成。新增 58 个模式键；`./core/*`、`./styles/*` 等既有键一律不动。
- **单组件编译 CSS 不可达**：58 个 `dist/<组件>/style.css` 随包发布但 exports 无任何子路径可用，无 SCSS 管道的消费方只能引全量包。新增 `./dist/*` 导出并在 README（中 / 英）登记用法。

## 验证脚本加固

- **verify:dts 通配符活性检查**：旧实现对含 `*` 的导出目标整体跳过（`if (target.includes('*')) return`），三个最易漂移的映射完全不做校验，深路径盲区因此不可见。现在单星模式断言基目录存在且至少一个文件命中；多星模式直接判为死模式。
- **verify:dts 模块标记校验**：`lib/package.json`（`{"type":"commonjs"}`）是 `require('@lh-ui/share')` 不报 ERR_REQUIRE_ESM 的唯一支撑，但 Rollup 每次清空 lib/、该文件只在 `build:styles` 重写——部分重跑会产出 Node 拒绝加载的 CJS 包。现在 verify:dts 校验 es/lib 两个标记文件的存在与内容。
- **tsconfig.build.json `types: []`**：发布声明此前继承 `tsconfig.json` 的 `vite/client` 环境类型（vite 不在 dependencies 里）。src/ 目前零处使用 `import.meta.env`，显式清空防止日后泄漏进 .d.ts。
- **verify:styles 空目录拦截**：`listScss` 返回 `[]` 时主循环空转、打印「检查 0 个 scss 文件」并 exit 0——styles/ 被清空时 CI 仍绿。现在 0 个文件直接失败。

## 测试

- virtual-list：overscan 传 NaN/负数/小数不崩溃且回落正确；NaN scrollTop/viewportHeight；NaN/非正 defaultSize 回落。
- tree：禁用子树下 `toggleCheckKeys` 与 `getNodeCheckState` 的交叉一致性（已用变异测试确认：回退修复使该用例失败、其余用例仍通过——既有套件只断言键集、从不验证显示态，正是 bug 漏掉的原因）。
- select：`highlightedIndex: -1` 且 `listboxId` 有值时无 `aria-activedescendant`（既有用例恰好只测了 listboxId 缺失，绕过了 bug）；非整数下标返回 undefined。
- form：异步 validator reject 返回错误文案；畸形 pattern 不穿透成用户文案（断言开发者告警被触发）。
- 新增 `tests/unit/exports.spec.ts`：导出面结构不变量（目录桶与 `./dist/*` 存在、无多星模式、深路径条件三联形态正确、`./types` 纯类型）。产物侧一致性（目标存在 / 模式活跃）由构建后的 verify:dts 兜底，不在 test 步骤重复——es/ 被 gitignore，CI 的 test 在 build 之前跑。
- 深路径用真实 Node `import()` / `require()` / tsc 实测：`@lh-ui/share/core/tooltip/logic`、`/core/date-picker/adapter`、`/core/icon/svgs`、`/core/shared/date`、`/core/shared/virtual`、`/core/button`、`/locales/lang/zh-CN`、`/utils/css-var` 的 ESM 与 CJS 解析全部通过；类型侧 `import type` 经 `types` 条件解析 `.d.ts` 通过（node16 moduleResolution 消费者实测）。
