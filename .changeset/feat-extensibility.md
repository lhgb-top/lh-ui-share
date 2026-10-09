---
'@lh-ui/share': minor
---

# 扩展性落地：主题注册 / locale 插值 / 日期适配器 / 虚拟滚动轴无关 / 表单内置规则

本轮把 5 个低成本扩展点与 3 个结构性扩展件全部落地。均为**增量 API**，既有导出保持兼容（个别旧别名标注 `@deprecated` 但功能不变）。

## theme：开放自定义预设注册

- 新增 `registerTheme(preset)`：注册（同名覆盖）自定义主题预设，`getThemePreset` / `getThemeVars` 即可按名取用。
- `ThemePresetName` 以 `string & {}` 开放：保留 5 个内置名的自动补全，同时接受任意自定义名称（未注册名在 get 系列返回 undefined 而非编译错误）。
- 删除 `src/theme/themes/*.scss` 五个零引用文件：真实 CSS 变量链路是 `styles/theme/common/variables.scss → var.scss :root`，这些文件是误导性的第二事实源。防漂移由 theme.spec 的 TS↔SCSS 一致性护栏继续保障（覆盖内置预设需与 variables.scss 同步修改）。

## locale：插值与数组取值

- `t(path, params?)` 第二参支持对象：`{key}` 占位符插值（如 `'共 {total} 条'`）；传 string 仍是原 fallback 语义，完全兼容。
- 新增 `tm(path, fallback?)`：读取数组文案（`datepicker.months`、`datepicker.weeks` 等月份 / 星期名不再绕过 locale 内核）。
- 新增导出 `formatMessage(template, params)`：`{key}` 插值唯一实现；pagination 的 `formatMessage` 与 rate 的内部插值收敛至此（pagination 导出保留、同签名）。

## date：适配器接缝 + 周起始参数

- 新增 `LhDateAdapter` 接口（parse / format / getDaysInMonth / getFirstDayOfMonth / compare / isSameDay / addDays）与默认实现（包装现有手写算法）；`setDateAdapter(adapter | undefined)` 注入 / 还原。`generateCalendarDays` 的网格生成经适配器路由，注入 dayjs 等实现后自动跟随。
- `generateCalendarDays` 新增可选 `firstDayOfWeek`（0=周日默认 … 6=周六），一周起始贯通日历网格。

## virtual：轴无关 + 增量测量

- 新增 `computeWindow(scrollOffset, viewportSize, itemSize, total, overscan)`：轴无关定高窗口，水平虚拟滚动（scrollLeft / viewportWidth / itemWidth）与纵向同一份算法；`computeRange` 继续作为纵向入口。
- 新增 `patchMeasuredSize(items, index, size, defaultSize?)`：动态测量模式下单点更新尺寸并顺移后续偏移，不再全量 `buildVirtualItems` 重建；返回尺寸变化量 delta 供滚动位置校正。
- `computeVirtualRange` / `getItemOffset`（virtual-list）与 `computeVisibleRange`（table）标注 `@deprecated` 保留，指向共享内核唯一实现；`LH_VIRTUAL_OVERSCAN` 改为共享内核同一绑定。

## form：内置规则扩展

- `LhFormRule` 新增 `type`（string / number / boolean / array / email / url）、`pattern`（string | RegExp，仅对字符串值生效）、`min` / `max`（数值范围或长度范围）、`len`（精确长度）、`trigger`（触发时机标记，core 只承载、UI 层按事件过滤）。
- 内置规则与 validator 按规则顺序求值；失败文案优先 `rule.message`，缺省用英文兜底（UI 层应提供业务文案）。
