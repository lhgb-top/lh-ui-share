---
'@lh-ui/share': patch
---

文档站搜索结果图标（favicon）与社交分享图补齐（家族统一整改，机制见家族 docs/SEO提交与曝光指南.md「搜索结果图标」一节）：

- 品牌图标统一为家族 logo（靛蓝印章 + lh 字标，源 lh-ui-plus/docs/public/logo.svg），栅格化产物（favicon.ico 16/32/48、apple-touch-icon 180、og.png 512）分发到本站静态目录。
- head 补齐 icon 声明：SVG 主链接 + ICO fallback（供 Bing/Google 等搜索引擎与老浏览器）+ apple-touch-icon；社交卡片补 og:image / twitter:image。
