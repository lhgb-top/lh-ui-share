/**
 * 一次性脚本（D3）：为 styles/ 中无 fallback 的 var(--lh-*) 补上 var.scss 的默认值
 *
 * 令牌默认值取自 styles/theme/common/var.scss 的 :root 声明；
 * 其中 #{$lh-x} 插值再回查 styles/theme/common/variables.scss 解析为字面量。
 * 用法：node scripts/patch-var-fallbacks.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const stylesDir = join(root, 'styles')
const dry = process.argv.includes('--dry')

/** 解析 variables.scss：$lh-name: value !default; → name → value（解析 $lh 引用） */
function parseVariables(file) {
  const src = readFileSync(file, 'utf8')
  const raw = new Map()
  for (const m of src.matchAll(/^\s*(\$[A-Za-z0-9_-]+):\s*([^;]+);/gm)) {
    raw.set(m[1], m[2].replace(/!default/g, '').trim())
  }
  const resolved = new Map()
  const resolving = new Set()
  function resolveVar(name) {
    if (resolved.has(name)) return resolved.get(name)
    if (!raw.has(name)) return null
    if (resolving.has(name)) return null // 循环引用保护
    resolving.add(name)
    const val = raw.get(name)
    const out = val.replace(/\$[A-Za-z0-9_-]+/g, (ref) => resolveVar(ref) ?? ref)
    resolving.delete(name)
    resolved.set(name, out.trim())
    return out.trim()
  }
  for (const name of raw.keys()) resolveVar(name)
  return resolved
}

/** 解析 var.scss：--lh-token: value; → token → 字面量（解析 #{$lh-x}） */
function parseVarScss(file, scssVars) {
  const src = readFileSync(file, 'utf8')
  const map = new Map()
  for (const m of src.matchAll(/^\s*(--lh-[a-z0-9-]+):\s*([^;]+);/gm)) {
    const token = m[1]
    let val = m[2].trim()
    // #{$lh-primary} → 字面量
    val = val.replace(/#\{(\$[A-Za-z0-9_-]+)\}/g, (_, ref) => scssVars.get(ref) ?? `\${ref}`)
    map.set(token, val)
  }
  return map
}

function listScss(dir) {
  const out = []
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...listScss(p))
    else if (p.endsWith('.scss')) out.push(p)
  }
  return out
}

const scssVars = parseVariables(join(stylesDir, 'theme/common/variables.scss'))
const varDefaults = parseVarScss(join(stylesDir, 'theme/common/var.scss'), scssVars)

// 统计：styles 用到但 var.scss 未声明的 token
const unknown = new Map()
let patchedFiles = 0
let patchedSites = 0

/**
 * 从 src 的 i 位置开始解析一个 var(...) 调用，返回其参数文本与结束位置。
 * 按括号深度匹配，正确处理嵌套 var() 与 cubic-bezier() 等函数。
 */
function parseVarCall(src, i) {
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

for (const file of listScss(stylesDir)) {
  // 跳过令牌定义文件本身
  if (file.replace(/\\/g, '/').includes('styles/theme/common/')) continue
  const src = readFileSync(file, 'utf8')
  // 组件局部令牌：在同一文件内声明（如 card 的 --lh-card-*、skeleton 的 --lh-skeleton-*），
  // 声明块与消费块同作用域，必然能解析，补 fallback 是死代码 → 跳过
  const localTokens = new Set()
  for (const m of src.matchAll(/^\s*(--lh-[a-z0-9-]+):/gm)) localTokens.add(m[1])
  let out = ''
  let i = 0
  while (i < src.length) {
    if (src.slice(i, i + 4) !== 'var(') {
      out += src[i]
      i++
      continue
    }
    const call = parseVarCall(src, i)
    if (!call) {
      out += src[i]
      i++
      continue
    }
    const m = call.args.match(/^--lh-[a-z0-9-]+/)
    if (!m || hasFallback(call.args) || localTokens.has(m[0])) {
      // 非令牌 / 已有 fallback / 组件局部令牌：原样保留
      out += src.slice(i, call.end)
    } else {
      const def = varDefaults.get(m[0])
      if (def === undefined) {
        unknown.set(m[0], (unknown.get(m[0]) ?? 0) + 1)
        out += src.slice(i, call.end)
      } else {
        patchedSites++
        out += `var(${m[0]}, ${def})`
      }
    }
    i = call.end
  }
  if (out !== src) {
    patchedFiles++
    if (!dry) writeFileSync(file, out)
  }
}

console.log(`var.scss 令牌数: ${varDefaults.size}`)
console.log(`补 fallback: ${patchedSites} 处 / ${patchedFiles} 个文件${dry ? '（dry run，未写盘）' : ''}`)
if (unknown.size) {
  console.log('\n⚠ styles 使用但 var.scss 未声明的 token（需人工判定）：')
  for (const [token, n] of [...unknown.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${token} × ${n}`)
  }
} else {
  console.log('\n所有裸 var(--lh-*) 均已在 var.scss 找到默认值')
}
