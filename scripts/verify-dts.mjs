/**
 * dts 校验：
 * 1. src/ 下每个 .ts（非 .d.ts）在 es/ 有镜像 .d.ts（tsc --emitDeclarationOnly 直出）
 * 2. 运行时入口（与 vite.config.ts 的 collectEntries 同规则）在 es/ 与 lib/ 都有镜像 .js
 *    ——只校验 d.ts 会漏掉"类型在、运行时产物缺失"（A1 类入口收集缺口）。
 *    其余被引用模块随 preserveModules 一并产出；纯类型模块（types.ts）本就不该有 .js。
 * 3. 产物（.d.ts 与 .js，es/ 与 lib/ 均扫）无框架导入（vue/react/@dcloudio）
 *    与未发布的旧别名（lh-constants / lh-types / ~/），覆盖 `import 'x'`、`from 'x'`、`require('x')`、`import('x')`
 * 4. package.json exports 指向的产物文件真实存在（兜住入口收集遗漏）
 *    ——含通配模式的活性检查：基目录存在且至少一个文件命中，否则模式已漂移
 * 5. es/ 与 lib/ 的模块标记（package.json type）正确：
 *    根包是 ESM，lib/ 的 CJS 全靠 lib/package.json 支撑，丢失则 require 报 ERR_REQUIRE_ESM
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'src')
const esDir = path.join(root, 'es')
const libDir = path.join(root, 'lib')

function listFiles(dir, ext) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listFiles(p, ext))
    else if (entry.name.endsWith(ext)) out.push(p)
  }
  return out
}

if (!fs.existsSync(esDir)) {
  console.error('[verify-dts] es/ 不存在，请先运行 pnpm build')
  process.exit(1)
}

/**
 * 运行时入口清单——与 vite.config.ts 的 collectEntries() 同规则。
 * 规则的唯一真相源是 vite.config.ts，此处只是镜像；改动入口收集时两处同步。
 */
function collectRuntimeEntries() {
  const entries = [path.join(srcDir, 'index.ts')]
  const coreDir = path.join(srcDir, 'core')
  const coreIndex = path.join(coreDir, 'index.ts')
  if (fs.existsSync(coreIndex)) entries.push(coreIndex)
  if (fs.existsSync(coreDir)) {
    for (const name of fs.readdirSync(coreDir).sort()) {
      const dir = path.join(coreDir, name)
      if (fs.statSync(dir).isDirectory() && fs.existsSync(path.join(dir, 'index.ts'))) {
        entries.push(path.join(dir, 'index.ts'))
      }
    }
  }
  for (const sub of ['constants', 'locales', 'theme', 'utils']) {
    const file = path.join(srcDir, sub, 'index.ts')
    if (fs.existsSync(file)) entries.push(file)
  }
  return entries
}

const missingDts = []
const missingJs = []
for (const file of listFiles(srcDir, '.ts')) {
  if (file.endsWith('.d.ts')) continue
  const rel = path.relative(srcDir, file)
  const dts = path.join(esDir, rel.replace(/\.ts$/, '.d.ts'))
  if (!fs.existsSync(dts)) missingDts.push(path.relative(root, dts))
}
// 运行时入口镜像：es/ 与 lib/ 都要有（同一构建步骤产出，缺一即入口收集或构建链断裂）
for (const file of collectRuntimeEntries()) {
  const rel = path.relative(srcDir, file)
  for (const dir of [esDir, libDir]) {
    const js = path.join(dir, rel.replace(/\.ts$/, '.js'))
    if (!fs.existsSync(js)) missingJs.push(path.relative(root, js))
  }
}

const forbidden =
  /(?:\bfrom\s+|\bimport\s*(?:\(\s*)?|\brequire\s*\(\s*)['"](vue|react|react-dom|@dcloudio\/[^'"]+|lh-[^'"]+|~\/[^'"]+)['"]/
const bad = []
for (const dir of [esDir, libDir]) {
  if (!fs.existsSync(dir)) continue
  for (const file of [...listFiles(dir, '.d.ts'), ...listFiles(dir, '.js')]) {
    if (forbidden.test(fs.readFileSync(file, 'utf8'))) bad.push(path.relative(root, file))
  }
}

// package.json exports 目标存在性 + 通配模式活性
const missingExports = []
const deadPatterns = []
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
function checkTarget(target) {
  if (typeof target !== 'string') return
  // 多星模式 Node 的 exports 规范不认（实测被忽略），直接判为死模式
  const starCount = (target.match(/\*/g) ?? []).length
  if (starCount === 0) {
    const abs = path.resolve(root, target)
    if (!fs.existsSync(abs)) missingExports.push(`${target}（${path.relative(root, abs)}）`)
    return
  }
  if (starCount > 1) {
    deadPatterns.push(`${target}（多星模式不被 Node exports 规范支持）`)
    return
  }
  // 单星模式：基目录必须存在，且至少一个文件命中——否则模式已与产物漂移
  // 星号替换的是「键的子路径」，落到产物上可能是文件名（logic）也可能是多段路径
  // （shared/date），故按「基目录下相对路径以 suffix 结尾」递归查找
  const [prefix, suffix] = target.split('*')
  const baseDir = path.resolve(root, path.dirname(prefix))
  if (!fs.existsSync(baseDir) || !fs.statSync(baseDir).isDirectory()) {
    deadPatterns.push(`${target}（基目录 ${path.relative(root, baseDir)} 不存在）`)
    return
  }
  const hit = walkFiles(baseDir).some((f) =>
    path.relative(baseDir, f).split(path.sep).join('/').endsWith(suffix),
  )
  if (!hit) deadPatterns.push(`${target}（基目录下无文件命中该模式）`)
}

/** 递归列出目录下所有文件（用于通配模式活性检查） */
function walkFiles(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkFiles(p))
    else out.push(p)
  }
  return out
}
for (const value of Object.values(pkg.exports ?? {})) {
  if (typeof value === 'string') {
    checkTarget(value)
  } else if (value && typeof value === 'object') {
    for (const target of Object.values(value)) checkTarget(target)
  }
}

// es/lib 模块标记：根包是 type:module，lib/ 的 CJS 只能靠 lib/package.json 支撑
const badMarkers = []
for (const [dir, expected] of [
  [esDir, 'module'],
  [libDir, 'commonjs'],
]) {
  const markerPath = path.join(dir, 'package.json')
  if (!fs.existsSync(markerPath)) {
    badMarkers.push(`${path.relative(root, markerPath)} 缺失（需重新构建）`)
    continue
  }
  const marker = JSON.parse(fs.readFileSync(markerPath, 'utf8'))
  if (marker.type !== expected) {
    badMarkers.push(`${path.relative(root, markerPath)} 的 type 为 ${String(marker.type)}，应为 "${expected}"`)
  }
}

const failed =
  missingDts.length || missingJs.length || bad.length || missingExports.length || deadPatterns.length || badMarkers.length
if (failed) {
  if (missingDts.length) {
    console.error('[verify-dts] 缺少镜像声明（es/*.d.ts）：')
    for (const m of missingDts) console.error(`  - ${m}`)
  }
  if (missingJs.length) {
    console.error('[verify-dts] 缺少镜像产物（es|lib/*.js，请检查 vite 入口收集）：')
    for (const m of missingJs) console.error(`  - ${m}`)
  }
  if (bad.length) {
    console.error('[verify-dts] 存在禁止的导入：')
    for (const b of bad) console.error(`  - ${b}`)
  }
  if (missingExports.length) {
    console.error('[verify-dts] package.json exports 指向的文件不存在：')
    for (const m of missingExports) console.error(`  - ${m}`)
  }
  if (deadPatterns.length) {
    console.error('[verify-dts] package.json exports 存在死通配模式（基目录缺失或无文件命中）：')
    for (const m of deadPatterns) console.error(`  - ${m}`)
  }
  if (badMarkers.length) {
    console.error('[verify-dts] es/lib 模块标记异常：')
    for (const m of badMarkers) console.error(`  - ${m}`)
  }
  process.exit(1)
}

console.log(
  `[verify-dts] 通过：src 镜像完整（d.ts + js），产物无框架/旧别名导入，exports 目标均存在且模式活跃，es/lib 模块标记正确`,
)
