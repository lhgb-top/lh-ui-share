/**
 * 一次性提取脚本：从 ../lh-ui-plus 只读提取框架无关资产到本仓库。
 *
 * 映射关系（详见 docs/share/share包计划.md，家族规划文档已迁至根级 docs/）：
 *   packages/core/**                -> src/core/**（shared/*.ts 规范化为 shared/<name>/index.ts；跳过其 package.json）
 *   packages/theme/src/common/*.scss -> styles/theme/common/**（令牌 scss 唯一源，随 styles/ 发布）
 *   packages/theme/src/index.scss    -> styles/theme/index.scss
 *   packages/theme/src/{types.ts,themes/**} -> src/theme/**
 *   packages/theme/index.ts          -> src/theme/index.ts（重写 ./src/* 相对路径）
 *   packages/constants/index.ts      -> src/constants/index.ts
 *   packages/locales/{lang/**,src/types.ts,index.ts} -> src/locales/{lang/**,types.ts,locale.ts}
 *   types/**（lh-types）             -> src/types/**
 *   packages/utils/{index,css-var}.ts -> src/utils/
 *   packages/components/<name>/style/index.scss -> styles/<name>/index.scss（重写主题 @use 路径）
 *   tests/unit/core/**、tests/unit/utils/css-var.spec.ts、tests/unit/locales.spec.ts -> tests/unit/**（重写 ~/ 别名）
 *
 * import 重写规则（按目标文件深度计算相对路径）：
 *   lh-constants -> src/constants；lh-types/* -> src/types/*；
 *   @lh-ui/core/*、~/core/* -> src/core/*；~/utils/* -> src/utils/*；
 *   ~/locales -> src/locales；~/theme/* -> src/theme/*；~/constants -> src/constants
 *
 * 可重复执行（覆盖拷贝 + 重新计算重写）；提取完成后以本仓库为准源。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const plusDir = path.resolve(root, '..', 'lh-ui-plus')

if (!fs.existsSync(path.join(plusDir, 'package.json'))) {
  console.error(`[extract] 未找到源仓库：${plusDir}`)
  process.exit(1)
}

const report = { copied: 0, rewrittenFiles: [], skipped: [] }

/** 目标文件内，把对 src/<sub> 的引用写成相对 import 说明符 */
function toSrcImport(file, sub) {
  let rel = path
    .relative(path.dirname(file), path.join(root, 'src', sub))
    .split(path.sep)
    .join('/')
  if (!rel.startsWith('.')) rel = './' + rel
  return rel
}

const RULES = [
  [/from 'lh-constants'/g, (file) => `from '${toSrcImport(file, 'constants')}'`],
  [/from 'lh-types\/([^']+)'/g, (file, m) => `from '${toSrcImport(file, `types/${m[1]}`)}'`],
  [/from '@lh-ui\/core\/([^']+)'/g, (file, m) => `from '${toSrcImport(file, `core/${m[1]}`)}'`],
  [/from '~\/core\/([^']+)'/g, (file, m) => `from '${toSrcImport(file, `core/${m[1]}`)}'`],
  [/from '~\/utils\/([^']+)'/g, (file, m) => `from '${toSrcImport(file, `utils/${m[1]}`)}'`],
  [/from '~\/theme\/([^']+)'/g, (file, m) => `from '${toSrcImport(file, `theme/${m[1]}`)}'`],
  [/from '~\/locales'/g, (file) => `from '${toSrcImport(file, 'locales')}'`],
  [/from '~\/constants'/g, (file) => `from '${toSrcImport(file, 'constants')}'`],
]

function rewriteTs(dstAbs, code) {
  let out = code
  let n = 0
  for (const [re, rep] of RULES) {
    out = out.replace(re, (...args) => {
      n += 1
      return rep(dstAbs, args)
    })
  }
  return { out, n }
}

function copyFile(srcAbs, dstAbs, { rewrite = false } = {}) {
  fs.mkdirSync(path.dirname(dstAbs), { recursive: true })
  let code = fs.readFileSync(srcAbs, 'utf8')
  if (rewrite) {
    const { out, n } = rewriteTs(dstAbs, code)
    if (n > 0) {
      code = out
      report.rewrittenFiles.push(`${path.relative(root, dstAbs)}（重写 ${n} 处 import）`)
    }
  }
  fs.writeFileSync(dstAbs, code, 'utf8')
  report.copied += 1
}

function copyDir(srcDir, dstDir, { rewrite = false } = {}) {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, entry.name)
    const d = path.join(dstDir, entry.name)
    if (entry.isDirectory()) copyDir(s, d, { rewrite })
    else copyFile(s, d, { rewrite })
  }
}

const plus = (...p) => path.join(plusDir, ...p)
const dst = (...p) => path.join(root, ...p)

// ——— 1. core（shared 扁平文件规范化为 <name>/index.ts） ———
const coreSrc = plus('packages', 'core')
for (const entry of fs.readdirSync(coreSrc, { withFileTypes: true })) {
  if (entry.name === 'package.json') {
    report.skipped.push('packages/core/package.json（内部包声明，不提取）')
    continue
  }
  const s = path.join(coreSrc, entry.name)
  if (entry.isDirectory()) {
    if (entry.name === 'shared') {
      for (const f of fs.readdirSync(s)) {
        if (f === 'index.ts') {
          copyFile(path.join(s, f), dst('src', 'core', 'shared', 'index.ts'), { rewrite: true })
        } else if (f.endsWith('.ts')) {
          const name = f.replace(/\.ts$/, '')
          copyFile(path.join(s, f), dst('src', 'core', 'shared', name, 'index.ts'), { rewrite: true })
        }
      }
    } else {
      copyDir(s, dst('src', 'core', entry.name), { rewrite: true })
    }
  } else {
    copyFile(s, dst('src', 'core', entry.name), { rewrite: true })
  }
}

// ——— 2. theme：scss 令牌进 styles/（随包发布，供各库与使用方 @use），TS 侧进 src/theme ———
copyDir(plus('packages', 'theme', 'src', 'common'), dst('styles', 'theme', 'common'))
copyFile(plus('packages', 'theme', 'src', 'index.scss'), dst('styles', 'theme', 'index.scss'))
copyFile(plus('packages', 'theme', 'src', 'types.ts'), dst('src', 'theme', 'types.ts'), { rewrite: true })
copyDir(plus('packages', 'theme', 'src', 'themes'), dst('src', 'theme', 'themes'), { rewrite: true })
const themeIndex = fs
  .readFileSync(plus('packages', 'theme', 'index.ts'), 'utf8')
  .replace(/from '\.\/src\/themes'/g, "from './themes'")
  .replace(/from '\.\/src\/types'/g, "from './types'")
fs.mkdirSync(dst('src', 'theme'), { recursive: true })
fs.writeFileSync(dst('src', 'theme', 'index.ts'), themeIndex, 'utf8')
report.copied += 1

// ——— 3. constants ———
copyFile(plus('packages', 'constants', 'index.ts'), dst('src', 'constants', 'index.ts'), { rewrite: true })

// ——— 4. locales ———
copyDir(plus('packages', 'locales', 'lang'), dst('src', 'locales', 'lang'))
copyFile(plus('packages', 'locales', 'src', 'types.ts'), dst('src', 'locales', 'types.ts'), { rewrite: true })
copyFile(plus('packages', 'locales', 'index.ts'), dst('src', 'locales', 'locale.ts'), { rewrite: true })

// ——— 5. types（lh-types） ———
copyDir(plus('types'), dst('src', 'types'))

// ——— 6. utils（纯函数；composables.ts 是 Vue3 胶水，不提取） ———
copyFile(plus('packages', 'utils', 'index.ts'), dst('src', 'utils', 'index.ts'), { rewrite: true })
copyFile(plus('packages', 'utils', 'css-var.ts'), dst('src', 'utils', 'css-var.ts'), { rewrite: true })

// ——— 7. 组件样式源（唯一源；主题 @use 路径重写为包内 styles/theme） ———
const compsDir = plus('packages', 'components')
let styleCount = 0
for (const name of fs.readdirSync(compsDir)) {
  const styleFile = path.join(compsDir, name, 'style', 'index.scss')
  if (!fs.existsSync(styleFile)) continue
  fs.mkdirSync(dst('styles', name), { recursive: true })
  const code = fs
    .readFileSync(styleFile, 'utf8')
    .replace(/@use '[^']*theme\/src\/common\/index\.scss' as \*;/, "@use '../theme/common/index.scss' as *;")
  fs.writeFileSync(dst('styles', name, 'index.scss'), code, 'utf8')
  report.copied += 1
  styleCount += 1
}

// ——— 8. core 单测（唯一一份）+ 纯工具/locale spec ———
copyDir(plus('tests', 'unit', 'core'), dst('tests', 'unit', 'core'), { rewrite: true })
copyFile(plus('tests', 'unit', 'utils', 'css-var.spec.ts'), dst('tests', 'unit', 'utils', 'css-var.spec.ts'), { rewrite: true })
copyFile(plus('tests', 'unit', 'locales.spec.ts'), dst('tests', 'unit', 'locales.spec.ts'), { rewrite: true })

console.log(`[extract] 复制 ${report.copied} 个文件（组件样式源 ${styleCount} 份）`)
console.log(`[extract] import 重写 ${report.rewrittenFiles.length} 个文件：`)
for (const line of report.rewrittenFiles) console.log(`  - ${line}`)
if (report.skipped.length) {
  console.log('[extract] 跳过：')
  for (const line of report.skipped) console.log(`  - ${line}`)
}
