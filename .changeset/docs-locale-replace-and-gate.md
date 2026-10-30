---
'@lh-ui/share': patch
---

文档站语言切换体验改进：

- 切换语言由 `window.location.pathname =`（push）改为 `location.replace()`：语言切换被视为「同一页换语言」而非新页面，浏览器回退不再逐语言回退堆积历史条目，back 直达切换前页面。以 Starlight 组件覆盖机制 `components: { LanguageSelect: './src/components/LanguageSelect.astro' }` 实现，覆盖组件内联了 0.42.6 原组件的 `localizedUrl`（该工具未公开导出，升级 Starlight 时需同步对齐原组件）。
- Starlight `locales` 提取为 `STARLIGHT_LOCALES` 常量并加 `buildStarlightLocales()` 内容门禁：目标语言内容目录 `src/content/docs/<locale>/` 尚不存在时不注册（切换器不展示空内容语言，避免点到无翻译的语言），目录出现后守卫自动失效，无需手工撤销。
