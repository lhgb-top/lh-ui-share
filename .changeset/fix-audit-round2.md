---
'@lh-ui/share': minor
---

# 审计修复第二轮：健壮化 + shared 内核加固

第二轮系统排查（递归环 / 数学危害 / 纯度 / 异步契约 / 日期对称性 / 测试与包面盘点）的修复汇总。全部旧导出保持兼容，无签名变更。

## 行为变化（下游需知晓，均非签名破坏）

1. **sx 优先级**：`m` / `p` 简写不再无条件覆盖长手——优先级固定为「单边 > 轴组 > 简写」且与键序无关（`{ mt: 4, m: 2 }` 得 `marginTop: 32px`）。新增 `mergeSx(...sx)` 组合入口。排查确认现役下游未使用简写键，实际影响为零。
2. **LhLocale**：`bump()` 对监听器逐个 try/catch（一个抛错不再阻断后续订阅者）；`setLocale` 未注册语言回退默认语言包（`getLocale()` 与 `t()` 不再脱节）；`add()` 改为对当前生效包**深合并**（旧实现整包替换会丢失未覆盖键）并对当前语言广播；`use()` 只写用户注册表遮蔽内置包，不再永久覆写 `locales['zh-CN']` 等内置注册项。
3. **popper**：`shift: false` 现在同时豁免主轴夹回（此前主轴夹回无条件执行，与注释不符）；最后一道视口地板改为含 `padding`（与其它钳制约定一致）；`parsePlacement` 对类型联合之外的垃圾字符串回退 `bottom/center`；rect 字段非有限值净化为 0。
4. **validateFormField**：同步抛错的 validator 按校验失败处理（取 `error.message`），不再穿透为未捕获异常；异步规则**不再短路**——首个 thenable 之后的所有规则仍会求值，结果并入同一个 Promise（旧实现会跳过异步规则之后的规则）。

## 递归环守卫补齐（栈溢出）

- table：`flattenLeafColumns` / `buildHeaderCells` 的两个 walk 补祖先链判重（`getDepth` / `getLeafCount` 上轮已守卫）。
- tree：`collectCascadeKeys` / `isSubtreeFullyChecked` 补判重；勾选回溯跳过禁用父级（不再把部分子树未勾选的禁用父写进勾选集）。
- anchor：`flattenAnchorItems` / `collectAnchorIds` 补判重。

## shared 内核加固

- **sanitize**：新增 `max` 选项；`min` / `max` 边界自身非有限时忽略（坏 prop 不再把 NaN 带回结果）；新增 `clamp` 原始钳制助手，input-number / slider 的 `clampValue` 与 popper 内部钳制收敛到同一实现。
- **virtual**：`computeRange` 全参非有限净化（NaN scrollTop 曾产出 `slice(NaN)` 白屏窗口）。
- **focus-trap**：`setInertOutside` 第三参 `locked` 实现为「额外豁免节点」语义（曾是死参数）；容器脱离文档后未解锁残留的 inert 所有权在再次加锁时自动释放。

## core 其余修复

- pagination：`getPageCount` 双参净化（NaN/Infinity total 曾穿透为 NaN 页数）。
- slider：`snapToStep` 对 `step <= 0` / 非有限回退纯钳制（`step=0` 曾产 NaN 值）。
- notification：`groupNotificationsByPosition` 对未知 position 兜底进 `top-right`（脏数据曾 TypeError 殃及整队分组）。
- input-number：计算结果非有限回退 [min, max] 内确定值；`precision` 净化到 [0, 100]（越界曾 RangeError）。
- calendar：`clampDateToRange` 先归一反序区间（键盘导航不再钳到错误一端）。
- image：`stepRotate` 归一到 [0, 360)（JS `%` 保留符号，负角度曾越界）。
- cascader：`getChildren` 对 null / 原始值节点与非数组 children 返回空（去掉最后一个 `as any`）。
- space：`resolveSpaceGaps` 对缺项 / 非数值元组兜底（不再产出 `"undefinedpx"`）。
- date-picker：`formatDate` 年份补零到 4 位（year < 1000 恢复可回读）；两位年份归一去重为唯一实现。
- transfer：`LhTransferItem.label` 类型放宽为 `label?: string`（与运行时契约一致，消除下游强转）。
