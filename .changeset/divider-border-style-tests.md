---
'@lh-ui/share': patch
---

# 补齐 divider borderStyle 单测

迁移核对 plus 的 `tests/unit/core/` 与本仓库的 `tests/unit/core/` 时发现：`getDividerClassNames`
的 `borderStyle` 优先级逻辑（显式 `borderStyle` 压过 `dashed` prop、`dotted` 修饰类）在 plus 侧有
3 个用例，本仓库此前缺测。逻辑本身已随迁移完整保留，本次只补用例，无运行时改动：

- `adds dashed class from borderStyle even when dashed is false`
- `adds dotted class from borderStyle`
- `prefers borderStyle over the dashed prop`

背景：plus 迁移到消费 `@lh-ui/share` 后会删除自身的 `tests/unit/core/`（core 单测唯一一份在本仓库），
补齐后 coverage 不回退。
