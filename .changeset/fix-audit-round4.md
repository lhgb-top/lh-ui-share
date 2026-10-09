---
'@lh-ui/share': minor
---

# 审计修复第四轮：栅格越界 / 分页钳制 / 组件解耦

第三轮验证通过后继续排查发现的问题，均为 P1/P2。导出面全部保持兼容。

## 逻辑 bug

- **grid `span=0` + offset 越界**：`getColStyle({ offset: 6 })` 此前产出 `grid-column: 7 / span 24`，在 24 列栅格中从第 7 线占 24 列会越过右边界、迫使 grid 生成隐式轨道。span = 0 是「不占列、仅用于定位」的哨兵，现在改为 `7 / 25`（延伸到栅格末行）；显式 span 仍用 `span N`。
- **`getPaginationRange` 不钳制 current**：UI 层透传的 `innerCurrent` 在受控模式下可能短暂越界（总数变小未同步 current），未钳制时当前页会落在显示窗口之外、省略号判定反转。入口先经 `clampPage` 归一到 `[1, pageCount]`。

## 低耦合改进

- **calendar → date-picker 解耦**：`calendar/logic.ts` 此前从同级组件 `../date-picker` 引入 `compareDate` / `isDateDisabled` / `isSameDay` 等通用日期原语。这些原语下沉到新的共享内核 `core/shared/date`（含 `getDaysInMonth` / `getFirstDayOfMonth` / `isSameMonth`，及两位数年份归一），date-picker 按原导出面再导出，下游 `@lh-ui/share/core/date-picker` 的引用不需要改路径。`generateCalendarDays` 的再导出保留——日历网格算法本就是 date-picker 的职责，属语义性依赖。
- **`getDefaultDelay` 三份重复收敛**：popconfirm / popover / tooltip 各自实现了同一段「undefined 回落」逻辑（且 tooltip 的 hide 默认值与另两者不同）。归一逻辑抽到 `core/shared/delay` 的 `resolveDelay`，各组件只声明自己的默认节奏；三处的 `getDefaultDelay` 导出与签名不变。

## 测试

- 新增 `tests/unit/core/shared/date.spec.ts`（6 例：闰年、两位数年份归一、星期、只比较日期部分、禁用判定优先级）与 `shared/delay.spec.ts`（2 例：默认值回落、0 是有效值）。
- grid 单测更新越界期望并补显式 span 用例；pagination 补 current 越界钳制用例；calendar 补源码级守卫，防止再退化回从 date-picker 引入通用原语。
