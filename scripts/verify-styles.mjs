/**
 * scss 侧兜底校验（CI 末步，与 verify:dts 同级）
 *
 * 六项检查，任一失败即非零退出：
 * 1. EP 遗留调色板 9 色不得出现在 styles 目录的 .scss 文件（D2 回归护栏）；
 * 2. 无 fallback 的 var(--lh-*) 必须带 `no-fallback` 行级豁免注释（D3 回归护栏）；
 * 3. 每个组件 scss 首行需 @use 主题令牌（保证令牌可被覆盖）；
 * 4. 全量聚合 styles/index.scss 必须与组件目录一致（theme + 全部组件，升序）；
 * 5. 组件 scss 禁止手写跨端过渡双写类名（-enter-from / -leave-from），一律走
 *    theme/common/transition.scss 的 mixin（注入分散、内容单源）。
 * 6. 暗色可达性：组件引用的令牌在暗色下必须能翻转——明色值为 #{$lh-*}（编译期烤死）
 *    的颜色令牌必须在 var-dark.scss 有覆盖；未注册令牌的 fallback 链不得落在写死颜色上。
 *
 * 原第 6 项「1px 细边框必须带 hairline 行级标记」已随 uniapp v3 的 px 直出废弃
 * （bugfix-log D-02）：hairline 标记原供 uniapp 的 px→rpx 转译跳过 1px 声明，
 * v3 不再转译，标记失去用途；styles/ 内既有的 65 处历史标记保留为普通注释，无需清理。
 *
 * 前置条件：扫描到 0 个 scss 文件直接失败——否则主循环空转，
 * styles/ 被清空时 CI 仍会假装通过。
 *
 * 豁免约定：确有理由不设 fallback 时，在本行加 no-fallback 注释。
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
 *
 * 用等长空白替换注释而非删除：第 2 项在剥离结果上遍历，却用其索引 i 回 raw
 * 取整行做 `no-fallback` 行级豁免（raw.lastIndexOf('\n', i)）。删除式剥离会让
 * 二者长度不一致、索引错位，取到非 var() 所在行——已标注 no-fallback 行级标记
 * 的行仍被误报，且行越靠后累积偏移越大越严重。等长替换保持行列严格对齐，
 * 行级标记即可正确命中，同时注释内容仍不参与匹配（与删除等价）。
 */
function stripComments(src) {
  const noLineComments = src.replace(
    /(^|[^:])\/\/.*$/gm,
    (m, pre) => pre + ' '.repeat(m.length - pre.length),
  )
  return noLineComments.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
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

// —— 第 7 项检查用的主题令牌表 ——
// 明色令牌值若是 #{$lh-*}，SCSS 变量在编译期被烤死成具体颜色；这类令牌在暗色下
// 不会自动翻转，必须由 var-dark.scss 显式覆盖，否则暗色模式沿用明色值（文字不可见等）。
function parseDecls(file) {
  const out = new Map()
  for (const m of readFileSync(file, 'utf8').matchAll(/^\s*(--lh-[a-z0-9-]+)\s*:\s*([^;]+);/gm)) {
    out.set(m[1], m[2].trim())
  }
  return out
}
const lightDecls = parseDecls(join(stylesDir, 'theme/common/var.scss'))
const darkDecls = parseDecls(join(stylesDir, 'theme/common/var-dark.scss'))
const scssVars = new Map()
for (const m of readFileSync(join(stylesDir, 'theme/common/variables.scss'), 'utf8').matchAll(
  /^\s*\$([\w-]+)\s*:\s*([^;]+?)(?:\s*!default)?\s*;/gm,
)) {
  scssVars.set(m[1], m[2].trim())
}
const COLOR_LEAF = /^(#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|color-mix\()/i

/** 沿 $lh-* 引用链判断是否最终落在颜色字面量上 */
function scssVarIsColor(name, depth = 0) {
  if (depth > 8) return false
  const v = scssVars.get(name)
  if (v === undefined) return false
  if (COLOR_LEAF.test(v)) return true
  const refs = [...v.matchAll(/\$([\w-]+)/g)].map((m) => m[1])
  if (refs.length === 0) return false
  return refs.some((r) => scssVarIsColor(r, depth + 1))
}

/**
 * 未注册令牌沿组件里的 fallback 链追到尽头；落在写死颜色上则暗色无法自适应。
 * 返回链条终点的颜色字面量（命中）或 null。
 */
function fallbackChainEndsInLiteral(token, fbOf, depth = 0) {
  if (depth > 5 || lightDecls.has(token)) return null
  const fb = fbOf[token]
  if (fb === undefined) return null
  const nested = fb.match(/^var\(\s*(--lh-[a-z0-9-]+)/)
  if (nested) return fallbackChainEndsInLiteral(nested[1], fbOf, depth + 1)
  return COLOR_LEAF.test(fb) ? fb : null
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

  // 3. 组件 scss 必须 @use 主题令牌（theme/ 聚合层与全量聚合文件豁免：它们不是组件）
  if (
    !rel.startsWith('styles/theme/') &&
    rel !== 'styles/index.scss' &&
    !/^@use\s+['"][^'"]*theme\/common\/index\.scss['"]\s+as\s+\*/m.test(raw)
  ) {
    console.error(`✗ ${rel}: 缺少 @use '../theme/common/index.scss' as *`)
    failures++
  }

  // 5. 禁止手写跨端过渡双写类名：-enter-from / -leave-from 只能出现在 mixin 定义文件里
  if (rel !== 'styles/theme/common/transition.scss') {
    for (const suffix of ['-enter-from', '-leave-from']) {
      if (code.includes(suffix)) {
        console.error(
          `✗ ${rel}: 手写 ${suffix} 类名；跨端过渡双写改用 theme/common/transition.scss 的 lh-enter-both / lh-leave-both / lh-transition-ends mixin`,
        )
        failures++
      }
    }
  }

  // 6. 暗色可达性：组件引用的令牌在暗色下必须能翻转
  const reported = new Set()
  // 本文件内每个 token 的直接回落值（供未注册令牌沿链追溯）
  const fbOf = {}
  for (const m of code.matchAll(/var\(\s*(--lh-[a-z0-9-]+)\s*,\s*([^()]*(?:\([^)]*\)[^()]*)*)\)/g)) {
    if (!(m[1] in fbOf)) fbOf[m[1]] = m[2].trim()
  }
  for (const m of code.matchAll(/var\(\s*(--lh-[a-z0-9-]+)/g)) {
    const token = m[1]
    if (reported.has(token) || localTokens.has(token)) continue
    if (!darkDecls.has(token) && lightDecls.has(token)) {
      const lv = lightDecls.get(token)
      const sm = lv.match(/^#\{\$([\w-]+)\}$/)
      if (sm && scssVarIsColor(sm[1])) {
        console.error(
          `✗ ${rel}: var(${token}) 明色值为编译期烤死的颜色（${lv}），var-dark.scss 未覆盖，暗色下沿用明色值`,
        )
        reported.add(token)
        failures++
      }
    } else if (!lightDecls.has(token)) {
      const literal = fallbackChainEndsInLiteral(token, fbOf)
      if (literal) {
        console.error(
          `✗ ${rel}: var(${token}) 未注册且回落到写死颜色（${literal}），暗色下无法自适应；请在 var.scss/var-dark.scss 注册或改引用语义令牌`,
        )
        reported.add(token)
        failures++
      }
    }
  }
}

// 4. 全量聚合 styles/index.scss 与组件目录一致（theme + 全部组件，升序）
const aggregatePath = join(stylesDir, 'index.scss')
let aggregateRaw
try {
  aggregateRaw = readFileSync(aggregatePath, 'utf8')
} catch {
  console.error(`✗ styles/index.scss 不存在（跑 pnpm build:styles 生成）`)
  failures++
}
if (aggregateRaw !== undefined) {
  const names = readdirSync(stylesDir)
    .filter((n) => n !== 'theme' && statSync(join(stylesDir, n)).isDirectory())
    .sort()
  // 聚合的每条 @use 带显式命名空间（@use '<name>/index' as <name>;），正则要容下 as 段
  const used = [...aggregateRaw.matchAll(/@use\s+['"]([^'"/]+)\/index['"](?:\s+as\s+[^;]+)?;/g)].map(
    (m) => m[1],
  )
  const missing = ['theme', ...names].filter((n) => !used.includes(n))
  const extra = used.filter((n) => n !== 'theme' && !names.includes(n))
  if (missing.length) {
    console.error(`✗ styles/index.scss 缺少组件：${missing.join(', ')}（跑 pnpm build:styles 同步）`)
    failures++
  }
  if (extra.length) {
    console.error(`✗ styles/index.scss 含已删除的组件：${extra.join(', ')}（跑 pnpm build:styles 同步）`)
    failures++
  }
}

if (failures > 0) {
  console.error(`\nverify:styles 失败：${failures} 处`)
  process.exit(1)
}
console.log(
  `verify:styles 通过：检查 ${files.length} 个 scss 文件（EP 调色板 / var fallback / @use 主题令牌 / 聚合一致性 / 过渡类名单源 / 暗色可达性）`,
)
