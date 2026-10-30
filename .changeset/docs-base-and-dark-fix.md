---
'@lh-ui/share': patch
---

修复文档站两处问题：

- 暗色模式整页仍是白底：custom.css 的 `:root` 把背景 / 文本 / 分割线令牌写成明色值，而本文件不分进任何 CSS layer，未分层声明在级联中恒胜过 Starlight 分层声明的暗色令牌。改为把这些明色专属令牌移进 `:root[data-theme='light']`，暗色回落 Starlight 默认暗色盘；与主题无关的主色 / 圆角 / 字体留在 `:root`。
- 首页 hero 按钮（快速开始 / 主题预设，中英双语）此前以 `/` 开头写成，Astro 的 `base` 不会作用于 hero CTA 与 markdown 正文链接，部署到 `/lhui/share/` 后跳到站点根路径。hero 按钮改为写完整前缀；正文 240 条绝对路径链接由 `astro.config.mjs` 新增的 `basePrefixPlugin` 插件在构建期自动补 base，内容里仍可写绝对路径。
- 顺带修正主题文档与源码不一致的示例值（中英双语 dark-mode / tokens / overview / customization 六份）：`--lh-bg-color` 暗色 `#14141F` → 源码实际值 `#2A2520`、暗色文本 `#E8E0D8`、边框 `#3A3530`；主色 `#2B5FA6` → `#2B4C7C`、hover `#3D72BC` → `#3D649E`、明色背景 `#FAF6F0`；commands.md 里 dev 端口 4321 → 实际 5180。
- 重写 tokens.mdx「令牌的分层结构」一节（中英）：原文档编造了一个「基础调色板」中间层（`--lh-blue-6` 等）并声称语义令牌经 `var()` 引用它，实际源码是 SCSS 变量 → 全局 CSS 变量的编译期插值，没有调色板层；第 3 档例子换成真实存在的组件级变量（`.lh-card` 的 `--lh-card-bg` 等）。同步修正 verification.md「EP 调色板」一节（中英）：该检查是 EP 遗留 9 色的黑名单回归护栏，而非「校验颜色落在合法色阶上」。
