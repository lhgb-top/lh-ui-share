# 语言包 / Locales

## 现有语言

| 语言 | 文件 | 状态 |
|------|------|------|
| 中文 (zh-CN) | zh-CN.ts | ✅ 已启用 |
| 英文 (en-US) | en-US.ts | ✅ 已启用 |
| 日本語 (ja-JP) | ja-JP.ts | ⚠️ 骨架（英文兜底）|
| 한국어 (ko-KR) | ko-KR.ts | ⚠️ 骨架（英文兜底）|
| Deutsch (de-DE) | de-DE.ts | ⚠️ 骨架（英文兜底）|
| Français (fr-FR) | fr-FR.ts | ⚠️ 骨架（英文兜底）|

## 添加新语言

1. 在 `packages/locales/lang/` 创建语言文件（如 `ru-RU.ts`）
2. 在 `packages/constants/index.ts` 中 `LH_LANGUAGE_CONST` 取消或添加对应条目
3. 在 `packages/locales/index.ts` 中 import 并注册到 locales 对象
4. 在 `docs/.vitepress/config.ts` 的locales 中添加对应的站点配置