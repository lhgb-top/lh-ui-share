# 语言包 / Locales

## 现有语言

| 语言 | 文件 | 状态 |
|------|------|------|
| 中文 (zh-CN) | zh-CN.ts | ✅ 完整（真源） |
| 繁體中文 (zh-TW) | zh-TW.ts | ✅ 完整（简繁转换 + 两岸 IT 用词） |
| English (en-US) | en-US.ts | ✅ 完整 |
| 日本語 (ja-JP) | ja-JP.ts | ✅ 完整 |
| 한국어 (ko-KR) | ko-KR.ts | ✅ 完整 |
| Deutsch (de-DE) | de-DE.ts | ✅ 完整 |
| Français (fr-FR) | fr-FR.ts | ✅ 完整 |
| Español (es) | es.ts | ✅ 完整 |
| العربية (ar) | ar.ts | ✅ 完整（RTL，文档站需配 `<html dir="rtl">`） |
| Русский (ru) | ru.ts | ✅ 完整 |

> 所有语言包的键结构必须与 `zh-CN.ts` 完全一致——`tests/unit/locales.spec.ts`
> 的 `every registered pack mirrors the zh-CN key tree` 用例会校验这一点。
> 术语用词统一按家族 [`docs/i18n/glossary.md`](../../../../docs/i18n/glossary.md)。

## 添加新语言

1. 在 `src/locales/lang/` 创建语言文件（如 `pt-BR.ts`），键结构逐键对齐 `zh-CN.ts`
2. 在 `src/constants/index.ts` 的 `LH_LANGUAGE_CONST` 中添加对应条目
3. 在 `src/locales/locale.ts` 的 `locales` 注册表中导入并挂载（`LhLocaleType` 由常量自动推导，无需改类型）
4. 补上 `tests/unit/locales.spec.ts` 的语言常量断言（parity 用例自动覆盖新语言）
