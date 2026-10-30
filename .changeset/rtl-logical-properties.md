---
'@lh-ui/share': minor
---

# 组件样式支持 RTL：物理方向声明改为逻辑属性

为支持阿拉伯语等从右向左语言，`styles/` 中所有方向相关声明改用 CSS 逻辑属性，
`dir="rtl"` 下布局随阅读方向自动镜像。规范见 `docs/i18n/glossary.md` §4.1，
例外登记簿见 `_work/rtl-exceptions.md`。

## 改造范围（17 个组件样式）

button、form、date-picker、time-picker、message、progress、tag、descriptions、
cascader、input-number、steps、badge、dialog、select、slider、input、switch
的方向相关声明，统一改为 `margin-inline-*` / `padding-inline-*` / `border-inline-*` /
`inset-inline-*` / `text-align: start|end` / 逻辑角圆角（`border-start-start-radius` 等）。

- 变换驱动的位移（badge 角标缩放、switch 滑块滑动）新增 `[dir='rtl']` 覆盖块翻转，
  LTR 行为完全不变
- tooltip / popover / popconfirm 的箭头定位与 popper 的 JS 数学耦合，按已登记例外保留物理值
- drawer `--left/--right`、notification 四角等 API 语义方位保留物理值（例外第二类）
- 全幅拉伸（`left: 0; right: 0`）、`left: 50%` 居中等方向无关形态保留物理值（例外第四类）

## 顺带修复

`switch/index.scss` 的 `&--small &--checked` 与 `&--large &--checked` 编译为后代选择器
（`.lh-switch--small .lh-switch--checked`），而两修饰符实际在同一根元素上，永不匹配——
small / large 档位的滑块位移（14px / 22px）此前一直退化为基础 18px。改为复合选择器后
各尺寸位移生效。
