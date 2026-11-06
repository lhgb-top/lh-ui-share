/**
 * CSS 体积台账：测量 build:styles 产物（dist/<name>/style.css 与 style-standalone.css、
 * dist/styles/index.css、dist/theme/index.css、dist/theme/index-dark.css）的原始字节与
 * gzip 字节，按组件排序输出，并汇总双轨产物（style.css vs style-standalone.css）的节流比。
 *
 * 用途：性能审计基线（2026-11-03 首次落盘于 docs/share/share包计划.md）；
 * standalone 列自双轨产物落地（方向 B）起纳入，用于跟踪按需注入的收益。
 *
 * 用法：node scripts/css-size-report.mjs [--json]
 *   --json 输出机器可读格式（供文档基线落盘核对）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')

/** gzip 字节数（对齐各端按需注入产物在真实传输中的体积口径） */
function gzipBytes(css) {
  return zlib.gzipSync(css, { level: 9 }).length
}

/** 格式化字节数为人类可读（KB） */
function kb(bytes) {
  return (bytes / 1024).toFixed(1)
}

function measure(file) {
  const raw = fs.readFileSync(file, 'utf8')
  return { raw: Buffer.byteLength(raw, 'utf8'), gzip: gzipBytes(raw) }
}

function main() {
  const asJson = process.argv.includes('--json')
  const rows = []

  // 1. 组件维度：dist/<name>/style.css
  const componentDirs = fs
    .readdirSync(distDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !['styles', 'theme'].includes(e.name))
    .map((e) => e.name)
    .sort()

  for (const name of componentDirs) {
    const file = path.join(distDir, name, 'style.css')
    if (!fs.existsSync(file)) continue
    const { raw, gzip } = measure(file)
    const standaloneFile = path.join(distDir, name, 'style-standalone.css')
    const standalone = fs.existsSync(standaloneFile) ? measure(standaloneFile) : undefined
    rows.push({ kind: 'component', name, file: `dist/${name}/style.css`, raw, gzip, standalone })
  }

  // 2. 聚合产物：全量 index / 暗色主题
  const aggregates = [
    { kind: 'aggregate', name: 'styles/index（全量）', file: 'dist/styles/index.css' },
    { kind: 'aggregate', name: 'theme/index（明+暗）', file: 'dist/theme/index.css' },
    { kind: 'aggregate', name: 'theme/index-dark（仅暗色）', file: 'dist/theme/index-dark.css' },
  ]
  for (const agg of aggregates) {
    const file = path.join(distDir, agg.file.replace(/^dist\//, ''))
    if (!fs.existsSync(file)) continue
    const { raw, gzip } = measure(file)
    rows.push({ ...agg, raw, gzip })
  }

  const components = rows.filter((r) => r.kind === 'component').sort((a, b) => b.raw - a.raw)
  const totalRaw = components.reduce((sum, r) => sum + r.raw, 0)
  const totalGzip = components.reduce((sum, r) => sum + r.gzip, 0)
  const standaloneRaw = components.reduce((sum, r) => sum + (r.standalone?.raw ?? 0), 0)
  const standaloneGzip = components.reduce((sum, r) => sum + (r.standalone?.gzip ?? 0), 0)

  if (asJson) {
    console.log(
      JSON.stringify(
        { components, aggregates: rows.filter((r) => r.kind === 'aggregate'), totalRaw, totalGzip, standaloneRaw, standaloneGzip },
        null,
        2,
      ),
    )
    return
  }

  const hasStandalone = standaloneRaw > 0
  console.log('组件 CSS 体积台账（按原始字节降序）')
  console.log('='.repeat(76))
  console.log(
    `${'组件'.padEnd(18)} ${'原始 KB'.padStart(9)} ${'gzip KB'.padStart(9)}${hasStandalone ? ` ${'standalone KB'.padStart(13)} ${'gz'.padStart(7)}` : ''} ${'占比'.padStart(7)}`,
  )
  console.log('-'.repeat(76))
  for (const row of components) {
    const share = ((row.raw / totalRaw) * 100).toFixed(1) + '%'
    const st = hasStandalone
      ? ` ${kb(row.standalone?.raw ?? 0).padStart(13)} ${kb(row.standalone?.gzip ?? 0).padStart(7)}`
      : ''
    console.log(
      `${row.name.padEnd(18)} ${kb(row.raw).padStart(9)} ${kb(row.gzip).padStart(9)}${st} ${share.padStart(7)}`,
    )
  }
  console.log('-'.repeat(76))
  console.log(
    `${'组件合计（58 项）'.padEnd(18)} ${kb(totalRaw).padStart(9)} ${kb(totalGzip).padStart(9)}${hasStandalone ? ` ${kb(standaloneRaw).padStart(13)} ${kb(standaloneGzip).padStart(7)}` : ''} ${'100%'.padStart(7)}`,
  )
  if (hasStandalone) {
    const saved = ((1 - standaloneRaw / totalRaw) * 100).toFixed(1)
    console.log(
      `双轨节流：standalone 合计 ${kb(standaloneRaw)} / ${kb(standaloneGzip)} gz，较 style.css 节省 ${saved}%（令牌由 dist/theme/index.css 提供一次）`,
    )
  }
  console.log()
  console.log('聚合产物')
  console.log('-'.repeat(76))
  for (const row of rows.filter((r) => r.kind === 'aggregate')) {
    console.log(`${row.name.padEnd(24)} ${kb(row.raw).padStart(9)} ${kb(row.gzip).padStart(9)}`)
  }
}

main()
