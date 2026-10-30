---
'@lh-ui/share': minor
---

share 语言包补齐四种语言并完善现有翻译：

- 新增 `zh-TW` / `es` / `ar` / `ru` 四个语言包（`src/locales/lang/`），`LhLocaleType` 与 `constants` 同步扩展
- `locale.ts` 注册新语言，语言列表注释由骨架标记改为「已完整翻译」
- `de-DE` / `en-US` / `fr-FR` / `ja-JP` / `ko-KR` 现有语言包翻译补全
- `tests/unit/locales.spec.ts` 扩展覆盖：各语言包键集合一致、注册表与导出同步
