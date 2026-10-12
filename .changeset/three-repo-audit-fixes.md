---
'@lh-ui/share': minor
---

三库审计修复批次（2026-10 审计报告 S-02 ~ S-15 / D-07 收尾）：

**修复**

- **affix**：`isAffixFixed` 底部吸附判定引入视口高度（新增第 4 参数），修复 offsetBottom 模式几乎恒固定的功能错误；同步修正测试断言与两库调用点
- **statistic**：`safePrecision` 下沉至 `core/shared/sanitize` 并与 input-number 共用，precision 超界/负数不再抛 RangeError
- **space**：预设档位改引用实际注册的令牌（small→`--lh-spacing-sm` / medium→`--lh-spacing-base` / large→`--lh-spacing-xl`），JS 与 SCSS 兜底值对齐，用户定制 `--lh-spacing-*` 不再静默失效
- **dialog**：遮罩硬编码 rgba 换 `var(--lh-bg-color-overlay, …)`，暗色正常翻转；Esc 关闭默认值对齐 drawer（默认 true）
- **image**：注册 `--lh-image-viewer-mask` 语义令牌（明/暗两套），verify:styles 门禁由红转绿（D-07 收尾）
- **on-primary 迁移收尾**：badge / button / steps / date-picker 约 15 处写死 `#fff` 换 `var(--lh-color-on-primary, #fff)`，浅主色预设对比度达标
- **button**：plain 变体烤死主色 rgba 换 `color-mix()` 派生；`@use` 语句丢空格笔误还原
- **table**：`buildHeaderCells` 组列跨度改为递归实际发射叶子数，DAG 共享列不再与 `flattenLeafColumns` 错位
- **grid**：col 定位起点随跨度钳制在 24 列坐标系内，越界组合不再生成隐式轨道撑破容器
- **popper**：安全网双向钳制，flip/shift 关闭时超宽弹出层不再从视口高侧整体溢出
- **transfer**：移动键集合运算由 O(n²) 降为 Set
- **form**：required 规则的显式空串 message 按内置规则同口径原样使用
- **utils**：throttle 补尾沿执行与 cancel；debounce 补 cancel / flush
- **backtop / loading**：补 SSR 环境守卫（与 popper / focus-trap 风格一致）
- **avatar**：头像字按码点提取，emoji 等增补平面字符不再截半
- **导出面**：新增 `./package.json` 导出；移除空文件 `src/types/components/utils.ts`；`grid-demo-cell` 文档演示样式迁出组件样式源（改由 plus 文档站自定义样式承载）
