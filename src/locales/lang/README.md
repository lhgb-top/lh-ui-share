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

1. 在 `src/locales/lang/` 创建语言文件（如 `ru-RU.ts`）
2. 在 `src/constants/index.ts` 的 `LH_LANGUAGE_CONST` 中添加对应条目
3. 在 `src/locales/locale.ts` 的 `locales` 注册表中导入并挂载（`LhLocaleType` 由常量自动推导，无需改类型）