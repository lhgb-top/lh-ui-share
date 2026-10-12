/**
 * 版本一致性核对（防跨端漂移）
 *
 * share 发版后，各 UI 库必须 `pnpm up @lh-ui/share` 回归。本脚本在家族布局下
 *（三仓同父目录）逐仓检查 @lh-ui/share 的依赖范围是否覆盖 share 当前版本，
 * 同时拦截被废止的 link:/file:/workspace: 联调形态。
 *
 * 用法：pnpm verify:versions（在 lh-ui-share 下运行）
 *
 * 兄弟仓不存在（CI 单仓 clone、独立下载）时打印提示并正常退出——
 * 本检查只在家族布局下有意义。
 */
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// 未来新增 UI 库（react / uniapp）时在此追加
const LIBS = ['lh-ui-plus', 'lh-ui-vue2']
const PKG = '@lh-ui/share'

const shareVersion = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
if (!/^\d+\.\d+\.\d+/.test(shareVersion)) {
  console.error(`✗ share 版本号无法解析：${shareVersion}`)
  process.exit(1)
}

/** tuple 比较：[major, minor, patch] */
function parse(v) {
  const m = v.match(/^(\d+)\.(\d+)\.(\d+)/)
  return m ? [+m[1], +m[2], +m[3]] : null
}

function cmp(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i]
  }
  return 0
}

/**
 * 极简 range 判定，只覆盖家族实际使用的形态：
 * ^x.y.z / ~x.y.z / x.y.z / >=x.y.z / *；link:/file:/workspace: 直接判为违规。
 */
function satisfies(range, version) {
  if (/^(link|file|workspace):/.test(range)) {
    return { ok: false, reason: '已废止的联调形态（link:/file:/workspace:），请改回 npm 范围版本' }
  }
  const base = parse(range.replace(/^[~^>=]/, ''))
  if (!base) return { ok: false, reason: '无法解析的版本范围' }
  const v = parse(version)
  if (range.startsWith('^')) {
    return { ok: v[0] === base[0] && cmp(v, base) >= 0 }
  }
  if (range.startsWith('~')) {
    return { ok: v[0] === base[0] && v[1] === base[1] && cmp(v, base) >= 0 }
  }
  if (range.startsWith('>=')) {
    return { ok: cmp(v, base) >= 0 }
  }
  return { ok: cmp(v, base) === 0 }
}

let failures = 0
let checked = 0

for (const lib of LIBS) {
  const pkgPath = join(root, '..', lib, 'package.json')
  let pkg
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  } catch {
    continue // 兄弟仓不存在，跳过
  }
  checked++

  const groups = ['dependencies', 'devDependencies', 'peerDependencies']
  const ranges = groups.flatMap((g) =>
    pkg[g] && pkg[g][PKG] ? [{ group: g, range: pkg[g][PKG] }] : [],
  )

  if (ranges.length === 0) {
    console.error(`✗ ${lib}: 未声明 ${PKG} 依赖`)
    failures++
    continue
  }

  for (const { group, range } of ranges) {
    const result = satisfies(range, shareVersion)
    if (result.ok) continue
    console.error(
      `✗ ${lib}(${group}): ${PKG} "${range}" 不覆盖 share 当前版本 ${shareVersion}` +
        (result.reason ? `——${result.reason}` : '——请跑 pnpm up @lh-ui/share'),
    )
    failures++
  }
}

if (checked === 0) {
  console.log(
    `verify:versions 跳过：未发现兄弟 UI 库（${LIBS.join(' / ')}），当前不是家族布局；share 版本 ${shareVersion}`,
  )
  process.exit(0)
}

if (failures > 0) {
  console.error(`\nverify:versions 失败：${failures} 处`)
  process.exit(1)
}
console.log(`verify:versions 通过：share ${shareVersion} 被全部 ${checked} 个 UI 库的依赖范围覆盖`)
