---
'@lh-ui/share': patch
---

locales 十语言包为 autocomplete / mentions 补 `label` 键（各语言译文），供 uniapp 端组件的 aria-label 取值（`lhlocale.t('autocomplete.label', ...)`）；此前 0.5.0 批次漏了这两个可达性名称键，uniapp 的 locale 键门禁会报缺键回退。
