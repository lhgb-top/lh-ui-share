/**
 * 按构建产物（es/）同步 package.json 的深路径导出键。
 *
 * 背景：vite preserveModules 产出 es/<bucket>/<dir>/<file>.js 这类扁平深文件，
 * 但 Node 的 exports 规范只认单星模式键——多星键（两段星号）实测被
 * Node 24 直接忽略（解析 core/tooltip/logic 时落回单星桶模式，指向不存在的
 * logic/index.js）。而既有的单星桶模式（./core 星键）只映射到目录桶 index.js，
 * 到不了 es/core/tooltip/logic.js：lh-ui-plus 整体迁移时它的 10 处
 * @lh-ui/core/<组件>/logic 深导入会 MODULE_NOT_FOUND。
 *
 * 规则（纯机械、无歧义）：扫描 es/ 下每个「含 index 之外直接子文件」的目录——
 * 仅当它【没有任何子目录】（纯扁平）时才生成 "./<相对路径>/*" 单星模式。
 * 纯扁平目录里所有子路径都是同形文件，一个模式即可精确覆盖；有 .d.ts 才挂
 * types，有 .js 才挂 import，lib/ 有同名目录才挂 require。
 * 混合形态目录（既有深文件又有子目录，如 es/locales、es/theme）一个单星模式
 * 无法同时覆盖「扁平文件」与「子目录桶」两种形状，强行生成会互相遮蔽——
 * 这些目录只打印提示、不生成键。
 *
 * 本脚本只清理六个运行时桶下形如 ./<bucket>/.../* 的既有生成键，
 * 固定路径键、桶级目录模式（./core 星键等）、styles 键一律不动。幂等可重复。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const esDir = path.join(root, 'es')
const libDir = path.join(root, 'lib')
const pkgPath = path.join(root, 'package.json')

// es/ 下的运行时桶：生成键的清理范围与插入锚点都限定在这些桶内
const BUCKETS = ['core', 'constants', 'locales', 'theme', 'utils', 'types']

if (!fs.existsSync(esDir)) {
  throw new Error(`sync-exports 需要 es/ 产物，请先运行 pnpm build。未找到 ${esDir}`)
}

/** 收集纯扁平深目录；混合目录单独列出待提示 */
function collectDirs() {
  const flat = new Map()
  const mixed = []
  const walk = (dir, rel) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    const files = entries.filter((e) => e.isFile()).map((e) => e.name)
    const dirs = entries.filter((e) => e.isDirectory())
    const hasJs = files.some((f) => f.endsWith('.js') && !f.startsWith('index.'))
    const hasDts = files.some((f) => f.endsWith('.d.ts') && !f.startsWith('index.'))
    if (rel && (hasJs || hasDts)) {
      if (dirs.length === 0) {
        const libRel = rel.split('/').join(path.sep)
        flat.set(rel, { hasJs, hasDts, hasLib: fs.existsSync(path.join(libDir, libRel)) })
      } else {
        mixed.push(rel)
      }
    }
    for (const e of dirs) {
      walk(path.join(dir, e.name), rel ? `${rel}/${e.name}` : e.name)
    }
  }
  walk(esDir, '')
  return { flat, mixed }
}

const { flat, mixed } = collectDirs()

// 每个桶的深路径键（按目录排序，输出稳定）
const perBucket = new Map(BUCKETS.map((b) => [b, []]))
const unknownBuckets = []
for (const [rel, info] of [...flat.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const bucket = rel.split('/')[0]
  if (!perBucket.has(bucket)) {
    unknownBuckets.push(rel)
    continue
  }
  const entry = {}
  if (info.hasDts) entry.types = `./es/${rel}/*.d.ts`
  if (info.hasJs) entry.import = `./es/${rel}/*.js`
  if (info.hasJs && info.hasLib) entry.require = `./lib/${rel}/*.js`
  perBucket.get(bucket).push([`./${rel}/*`, entry])
}

// 读取并重排：保留非生成键的原有顺序，每个桶的深路径键紧跟该桶锚点键之后
const raw = fs.readFileSync(pkgPath, 'utf8')
const pkg = JSON.parse(raw)
const exports = pkg.exports
const isGenerated = (key) =>
  new RegExp('^\\.\\/(?:' + BUCKETS.join('|') + ')\\/[^*]+\\/\\*$').test(key)

const ordered = []
for (const key of Object.keys(exports)) {
  if (isGenerated(key)) continue
  ordered.push([key, exports[key]])
  // 锚点键：./<bucket> 或 ./<bucket>/星 —— 该桶的深路径键紧随其后
  for (const bucket of BUCKETS) {
    if (key === `./${bucket}` || key === `./${bucket}/*`) {
      ordered.push(...perBucket.get(bucket))
    }
  }
}
// 没有锚点键的桶（新增桶时可能出现）追加到末尾
for (const bucket of BUCKETS) {
  const keys = perBucket.get(bucket)
  if (keys.length && !ordered.some(([k]) => k === `./${bucket}` || k === `./${bucket}/*`)) {
    ordered.push(...keys)
  }
}

pkg.exports = Object.fromEntries(ordered)
const next = JSON.stringify(pkg, null, 2) + '\n'
if (next !== raw) {
  fs.writeFileSync(pkgPath, next)
  let count = 0
  for (const [, entries] of perBucket) count += entries.length
  console.log(`sync-exports: 写入 ${count} 个深路径导出模式`)
} else {
  console.log('sync-exports: 无变化')
}
if (mixed.length) {
  console.log(
    `sync-exports: ${mixed.length} 个混合形态目录未生成键（单星模式无法同时覆盖扁平文件与子目录桶）：${mixed.join('、')}`,
  )
}
if (unknownBuckets.length) {
  console.log(`sync-exports: 未知桶（需扩展 BUCKETS）：${unknownBuckets.join('、')}`)
}
