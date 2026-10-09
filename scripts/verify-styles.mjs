/**
 * scss 侧兜底校验（CI 末步，与 verify:dts 同级）
 *
 * 三项检查，任一失败即非零退出：
 * 1. EP 遗留调色板 9 色不得出现在 styles 目录的 .scss 文件（D2 回归护栏）；
 * 2. 无 fallback 的 var(--lh-*) 必须带 `no-fallback` 行级豁免注释（D3 回归护栏）；
 * 3. 每个组件 scss 首行需 @use 主题令牌（保证令牌可被覆盖）。
 *
 * 前置条件：扫描到 0 个 scss 文件直接失败——否则主循环空转，
 * styles/ 被清空时 CI 仍会假装通过。
 *
 * 豁免约定：确有理由不设 fallback 时，在本行加 `no-fallback` 注释。
 * 组件局部令牌（同文件内声明、同作用域消费）自动豁免，无需注释。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const stylesDir = join(root, 'styles')

/** EP 遗留调色板：出现即失败（D2 清洗后应全部为 lh-ui 调色板） */
const EP_PALETTE = [
  '#409eff',
  '#e6a23c',
  '#f56c6c',
  '#67c23a',
  '#909399',
  '#606266',
  '#303133',
  '#ebeef5',
  '#c0c4cc',
]

function listScss(dir) {
  const out = []
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...listScss(p))
    else if (p.endsWith('.scss')) out.push(p)
  }
  return out
}

/**
 * 去掉注释，避免注释里的示例色值/令牌被误报。
 * 行级 `no-fallback` 标记需保留供第 2 项按行判断，因此先按行剥离行注释，
 * 再整体剥离块注释（块注释内的示例天然不需要 fallback，直接剥掉）。
 */
function stripComments(src) {
  const noLineComments = src.replace(/(^|[^:])\/\/.*$/gm, '$1')
  return noLineComments.replace(/\/\*[\s\S]*?\*\//g, '')
}

/**
 * 从 src 的 i 位置开始解析一个 var(...) 调用，返回其参数文本与结束位置。
 * 按括号深度匹配，正确处理嵌套 var() 与函数调用。
 */
function parseVarCall(src, i) {
  // i 指向 'v'，期望 "var("
  if (src.slice(i, i + 4) !== 'var(') return null
  let depth = 1
  let j = i + 4
  const start = j
  while (j < src.length && depth > 0) {
    const c = src[j]
    if (c === '(') depth++
    else if (c === ')') depth--
    if (depth === 0) break
    j++
  }
  if (depth !== 0) return null
  return { args: src.slice(start, j), end: j + 1 }
}

/** var() 参数中是否存在「顶层逗号」（即有 fallback） */
function hasFallback(args) {
  let depth = 0
  for (const c of args) {
    if (c === '(') depth++
    else if (c === ')') depth--
    else if (c === ',' && depth === 0) return true
  }
  return false
}

let failures = 0
const files = listScss(stylesDir)

if (files.length === 0) {
  console.error(`✗ styles/ 下未找到任何 .scss 文件（扫描根：${stylesDir}），请检查 styles 目录是否完整`)
  process.exit(1)
}

for (const file of files) {
  const rel = 'styles/' + file.slice(stylesDir.length).replace(/\\/g, '/').replace(/^\//, '')
  const raw = readFileSync(file, 'utf8')
  const code = stripComments(raw)

  // 1. EP 调色板
  for (const color of EP_PALETTE) {
    const re = new RegExp(color.replace('#', '\\#') + '\\b', 'i')
    if (re.test(code)) {
      console.error(
        `✗ ${rel}: 含 EP 遗留色 ${color}，请改用 styles/theme/common/variables.scss 的 lh-ui 调色板`,
      )
      failures++
    }
  }

  // 2. 无 fallback 的 var(--lh-*)
  const localTokens = new Set()
  for (const m of code.matchAll(/^\s*(--lh-[a-z0-9-]+):/gm)) localTokens.add(m[1])
  for (let i = 0; i < code.length; i++) {
    if (code.slice(i, i + 4) !== 'var(') continue
    const call = parseVarCall(code, i)
    if (!call) continue
    i = call.end - 1
    const m = call.args.match(/^--lh-[a-z0-9-]+/)
    if (!m) continue
    const token = m[0]
    if (hasFallback(call.args)) continue
    // 组件局部令牌：同文件声明、同作用域消费，必然可解析
    if (localTokens.has(token)) continue
    // 行级豁免：同一原始行带 /* no-fallback */ 标记
    const lineStart = raw.lastIndexOf('\n', i) + 1
    const lineEnd = raw.indexOf('\n', i)
    const line = raw.slice(lineStart, lineEnd === -1 ? undefined : lineEnd)
    if (line.includes('no-fallback')) continue
    console.error(`✗ ${rel}: var(${token}) 缺少 fallback；确需缺省时在本行加 /* no-fallback */`)
    failures++
  }

  // 3. 组件 scss 必须 @use 主题令牌（theme/ 聚合层自身豁免：它就是令牌源）
  if (!rel.startsWith('styles/theme/') && !/^@use\s+['"][^'"]*theme\/common\/index\.scss['"]\s+as\s+\*/m.test(raw)) {
    console.error(`✗ ${rel}: 缺少 @use '../theme/common/index.scss' as *`)
    failures++
  }
}

if (failures > 0) {
  console.error(`\nverify:styles 失败：${failures} 处`)
  process.exit(1)
}
console.log(
  `verify:styles 通过：检查 ${files.length} 个 scss 文件（EP 调色板 / var fallback / @use 主题令牌）`,
)
