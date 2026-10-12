/**
 * 主题预设对比度门禁（WCAG AA）
 *
 * 直接取本包构建产物 es/theme 的 LH_THEME_PRESETS，按组件真实消费配对复算对比度，
 * 确认发版产物与设计值一致（AA 阈值 4.5:1）。新增预设时本脚本自动覆盖。
 *
 * 配对取自 styles/theme/common/var.scss 的真实消费链：
 *   - --lh-color-on-primary 文字 @ --lh-primary-color 底      → 主按钮
 *   - --lh-selected-color 文字 @ --lh-primary-color-bg 底      → menu-item / tree-node 选中态
 * 亮色侧 --lh-selected-color 缺省取 --lh-primary-color-active（var.scss 的默认链路），
 * 暗色侧由 buildPresetStyleText 的暗色块覆盖为 color-mix（不在此复算）。
 *
 * 前置条件：需先跑过 `pnpm build`（读取 es/ 产物）；产物缺失直接失败。
 *
 * 用法：pnpm verify:theme
 */
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const entry = resolve(root, 'es/theme/index.js')

if (!existsSync(entry)) {
  console.error(`✗ 未找到构建产物 ${entry}；请先跑 pnpm build`)
  process.exit(1)
}

// Windows 上动态 import() 只接受 file:// URL，绝对路径（如 D:\...）会被 ESM 加载器拒绝
const { LH_THEME_PRESETS } = await import(pathToFileURL(entry).href)

function srgbToLinear(c) {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255)
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

const AA = 4.5
let failures = 0

for (const preset of LH_THEME_PRESETS) {
  const v = preset.vars
  const primary = v['--lh-primary-color']
  const primaryBg = v['--lh-primary-color-bg']
  const onPrimary = v['--lh-color-on-primary'] ?? '#ffffff'
  // 亮色侧缺省链路：selected → primary-color-active（var.scss）
  const selected = v['--lh-selected-color'] ?? v['--lh-primary-color-active']

  const checks = [
    ['主按钮 on-primary/primary', onPrimary, primary],
    ['选中 selected/primary-bg', selected, primaryBg],
  ]

  const lines = []
  for (const [label, fg, bg] of checks) {
    const cr = contrast(fg, bg)
    const ok = cr >= AA
    if (!ok) failures++
    lines.push(`${label} ${cr.toFixed(2)}:${ok ? '✓' : '✗'}`)
  }
  console.log(`${preset.name.padEnd(9)} ${lines.join('  ')}`)
}

console.log(
  `\n${failures === 0 ? `全部 ${LH_THEME_PRESETS.length} 个预设的主按钮与选中态文字对比度均达 AA（4.5:1）` : `${failures} 处未达 AA`}`,
)
process.exit(failures === 0 ? 0 : 1)
