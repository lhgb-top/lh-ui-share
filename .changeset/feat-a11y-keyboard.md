---
'@lh-ui/share': minor
---

# 无障碍 + 键盘快捷键全面适配

本轮补齐 core 层缺失的键盘原语与无障碍语义输出，并补齐样式侧的焦点环与减弱动画缺口。
全部为**纯新增导出 + 内部实现收敛 + 样式增量**：零删除、旧签名零变更，下游既有引用不需要改动。

## 新增共享内核

- `core/shared/keyboard`：按键常量 `LH_KEYS`（Escape / Enter / Space / 方向键 / Home / End / Tab 等），
  判定函数 `isActivationKey` / `isArrowKey` / `isEscapeKey` / `isHomeOrEndKey` / `isSpaceKey` /
  `isHorizontalArrowKey` / `isVerticalArrowKey`，通用列表导航 `getNextListIndex`（支持 loop / skipDisabled /
  首尾直达，空列表或全禁用返回 -1），type-ahead `findTypeAheadIndex`，roving tabindex `getRovingTabIndex`。
  收编 5 处散写导航实现：`select/getNextEnabledIndex`、`segmented/moveSegmentedIndex`、
  `tree/moveTreeFocus`、`menu/moveMenuFocus`、`tabs/getNextActiveName`——外壳签名全部保留并标 `@deprecated`，
  内部改调内核，既有语义（含「当前值无效回退首项」）逐项保留。
- `core/shared/a11y`：aria id 生成 `generateAriaId`；原子构建器 `ariaExpanded` / `ariaControls` /
  `ariaLabelledby` / `ariaDescribedby` / `ariaInvalid` / `ariaRequired` / `ariaCurrent` / `ariaHaspopup`；
  弹出层触发器属性包 `getPopupTriggerAria`；装饰件助手 `getDecorativeAria`。

## 弹出层 a11y + Escape 闸门

- popover / popconfirm / tooltip / dropdown / cascader / date-picker / time-picker / select：
  新增触发器与浮层的无障碍属性包（aria-expanded / aria-controls / aria-haspopup / role），
  UI 层 v-bind 即可；select 补齐 combobox pattern 硬性要求（role=combobox + aria-activedescendant +
  listbox / option 全套，`getSelectOptionId` 确定性拼接选项 id）。
- popover / popconfirm 新增 `canCloseOnEscape`（disabled 时阻止 Esc 关闭）；
  drawer 补齐 `canDrawerClose(state, 'maskClick' | 'escape')`——此前 `closeOnEsc` 只在 state 中声明、
  logic 从不读取，现补为可计算的逃逸闸门（默认允许，与 dialog 的 `canClose` 对称）。
- dialog / drawer / image 新增焦点陷阱接线点 `shouldTrapFocus` 与 `getDialogAria` / `getDrawerAria` /
  `getImageViewerAria`（role=dialog + aria-modal + aria-labelledby）：把「是否圈焦点」变成 core 可计算的决策，
  具体圈焦由 UI 层配合既有的 `core/shared/focus-trap`（saveActiveElement / trapTabKey /
  setInertOutside / restoreActiveElement）实现。

## 表单 a11y

- form 新增 `getFormFieldAria({ prop, error, required })` 与 `getFormFieldErrorId`：
  校验失败时把 `aria-invalid` 与错误提示经 `aria-describedby` 绑到控件（此前 `validateFormField` 只吐文案字符串）。
- input `getInputAria`、input-number `getInputNumberAria`（role=spinbutton + 值域 + valuetext）、
  switch `getSwitchAria`（role=switch + aria-checked）、slider `getSliderThumbAria`（role=slider + 值域 + orientation）、
  rate `getRateAria`（role=slider，复用 `getRateAriaText` 的文案）、upload `getUploadFileAria` / `getUploadDropzoneAria`。

## 导航型与值语义组件

- tabs `getTablistAria` / `getTabAria` / `getTabpanelAria`、tree `getTreeAria` / `getTreeNodeAria`、
  menu `getMenuAria` / `getMenuItemAria` / `getSubMenuAria`、segmented `getSegmentedAria` /
  `getSegmentedItemAria`——此前这四类「有键盘导航函数却无配套 role/aria」的不对等补齐。
- pagination `getPaginationItemAria`（当前页 aria-current="page" + 页码 aria-label 模板，支持 {page} 插值）、
  breadcrumb `getBreadcrumbItemAria`（末项 aria-current="page"）、steps `getStepAria`（aria-current="step"）、
  table `getTableSortAria`（aria-sort，与 `cycleSortOrder` 状态机对齐）、progress `getProgressAria`（role=progressbar）。
- notification 补 `getNotificationRole` / `getNotificationAria`，与 message / alert 的 live region 范式对齐。
- icon / skeleton / loading 应用 `getDecorativeAria`（aria-hidden），loading 同时输出 `aria-busy`。
- calendar `getCalendarCellAria`（选中日 aria-current="date"，禁用日 aria-disabled）。

## locales

- 六个语言包新增 `ariaLabels` 命名空间（close / expand / collapse / clear / openDropdown / page / step /
  upload / rating / sort 等约 50 条），供各 UI 层经 `t('ariaLabels.close')` 取用；
  ja-JP / ko-KR / de-DE / fr-FR 按既有约定给英文兜底文案。

## 样式侧

- 新增焦点环设计令牌 `--lh-focus-color` / `--lh-focus-ring-width` / `--lh-focus-ring-offset`
 （var.scss 默认跟随主色，var-dark.scss 深色提亮保证对比度）。
- 新建 `styles/theme/common/a11y.scss`（经 common/index 转发）：`@mixin focus-ring`、
  `@mixin visually-hidden` / `not-visually-hidden`、`.lh-sr-only` 工具类（全仓此前无任何 sr-only）。
- 为 16 个缺失的交互组件补键盘焦点环（cascader / checkbox / date-picker / dialog / form / input /
  input-number / popconfirm / popover / radio / select / slider / switch / tag / time-picker / tooltip，
  统一走 focus-ring 令牌）；为 22 个缺失的组件补 `prefers-reduced-motion`（alert / anchor / breadcrumb /
  calendar / cascader / checkbox / date-picker / dialog / input / input-number / pagination / progress /
  radio / rate / segmented / slider / steps / switch / tabs / time-picker / transfer / tree）。

## 包面

- 根 barrel 显式清单跟进：popconfirm / popover 的 `canCloseOnEscape` 同名二义按既有 `getDefaultDelay` 方式
  别名处理（`getPopconfirmCanCloseOnEscape`），子路径导出保持原名。
- `./core/*` 与 `./styles/theme/common/*.scss` 导出映射自动覆盖新增的 `core/shared/a11y`、
  `core/shared/keyboard`、`styles/theme/common/a11y.scss`。
