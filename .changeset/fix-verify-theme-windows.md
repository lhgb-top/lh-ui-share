---
'@lh-ui/share': patch
---

verify:theme 在 Windows 上无法运行：动态 `import()` 传的是 Windows 绝对路径
（如 `D:\...\es\theme\index.js`），Node 的 ESM 加载器只接受 `file://` URL，
直接抛 `ERR_UNSUPPORTED_ESM_URL_SCHEME`（CI 跑 ubuntu 不触发，本地发版必踩）。
改用 `pathToFileURL(entry).href` 再 import。纯脚本修复，不改变运行时产物。
