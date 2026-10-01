/**
 * dts 校验：
 * 1. src/ 下每个 .ts（非 .d.ts）在 es/ 有镜像 .d.ts（tsc --emitDeclarationOnly 直出）
 * 2. 产物 d.ts 无框架导入（vue/react/@dcloudio）与未发布的旧别名（lh-constants / lh-types / ~/）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'src')
const esDir = path.join(root, 'es')

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
  console.error('[verify-dts] es/ 不存在，请先运行 pnpm build:dts')
  process.exit(1)
}

const missing = []
for (const file of listFiles(srcDir, '.ts')) {
  if (file.endsWith('.d.ts')) continue
  const dts = path.join(esDir, path.relative(srcDir, file).replace(/\.ts$/, '.d.ts'))
  if (!fs.existsSync(dts)) missing.push(path.relative(root, dts))
}

const forbidden = /from ['"](vue|react|react-dom|@dcloudio\/[^'"]+|lh-[^'"]+|~\/[^'"]+)['"]/
const bad = []
for (const file of listFiles(esDir, '.d.ts')) {
  if (forbidden.test(fs.readFileSync(file, 'utf8'))) bad.push(path.relative(root, file))
}

if (missing.length || bad.length) {
  if (missing.length) {
    console.error('[verify-dts] 缺少镜像声明：')
    for (const m of missing) console.error(`  - ${m}`)
  }
  if (bad.length) {
    console.error('[verify-dts] 存在禁止的导入：')
    for (const b of bad) console.error(`  - ${b}`)
  }
  process.exit(1)
}

console.log(`[verify-dts] 通过：src 镜像完整，产物无框架/旧别名导入`)
