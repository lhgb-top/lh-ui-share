---
'@lh-ui/share': minor
---

# 文档站（Astro Starlight，中英双语）

新增独立文档站，作为本包的「开发者电子说明书」：部署在 <https://www.lhgb.top/lhui/share/>。

## 覆盖范围

- **指南**：项目介绍、快速开始、包入口与子路径（77 个 exports 键全表）、包结构、
  命名约定、各端样式注入策略、各端如何消费（Vue3 / Vue2 / React / uniapp 四端接线样例）、
  0.4.0 迁移指南。
- **组件 API（56 页）**：每个 core 组件一页，含定位、何时使用、导入方式、设计意图、
  函数表（签名 + 入参 + 返回值 + 边界）、类型定义、无障碍、使用示例、样式与令牌、注意事项。
- **共享内核（12 页）**：sx / pt / popper / virtual / keyboard / focus-trap / a11y /
  date / format / delay / sanitize / types。
- **主题系统（6 页）**：总览、预设、令牌、运行时定制、暗色模式、花纹。
- **参考（6 页）**与**开发（5 页）**：locales / utils / constants / types / styles /
  transition mixin；命令、验证、脚本、发版、贡献指南。

## 可交互试运行

每个组件页末尾的 `<FnPlayground>` 直接调用真实 core 纯函数（构建时把模块打成
可执行签名源码），改入参即时看返回值——文档里的每个示例值都在构建期对照源码核对过。

## 双语

中文为主源，`src/content/docs/en/` 镜像全部页面；Starlight `locales` 配 `en` 子路径，
未翻译页面自动回退到中文内容 + 英文外壳。

## 其他

- `pnpm docs:build` 加入 `.github/workflows/ci.yml` 门禁。
- README 中英双版本补文档站链接，英文版顺带修正滞后事实（组件数 55 → 56、
  共享内核 10 → 12、`THEME_PRESETS` → `LH_THEME_PRESETS`、补 56 / 58 计数口径说明）。
