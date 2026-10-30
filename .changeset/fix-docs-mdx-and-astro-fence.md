---
'@lh-ui/share': patch
---

修复文档站两处构建阻断：

- ja 版 `theme/presets.mdx` 正文里的裸 `<style>` 标签未加反引号，MDX 解析成未闭合 JSX 标签导致构建失败（`Expected a closing tag for <style> before the end of paragraph`）。其他语言同句均为 `` `<style>` ``，仅 ja 漏了。
- `docs/src/components/LanguageSelect.astro` 文件开头缺少 `---` frontmatter 栅栏（注释直接开头），导致整个 frontmatter 处于未闭合状态、astro 编译报 `Unexpected token`。Astro 要求开头栅栏在文件绝对起始位置（修复方式：栅栏置于首字符，注释随入 frontmatter 内部）。
