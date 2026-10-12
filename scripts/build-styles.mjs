/**
 * 样式构建（sass modern API 直出）：
 *   dist/theme/index.css        明色 + 暗色全量（styles/theme/index.scss 聚合）
 *   dist/theme/index-dark.css   仅暗色（styles/theme/common/var-dark.scss，字面量值可独立编译）
 *   dist/styles/index.css       全量（theme + 全部组件）
 *   styles/index.scss           全量聚合源码（供各端 dev 沙箱与主题定制导出，随仓库提交）
 *   dist/<name>/style.css       单组件样式
 *   es/package.json / lib/package.json  产物模块类型声明
 *     （根 package.json 为 "type": "module"，es/*.js 是 ESM；lib/*.js 是 CJS，
 *      需嵌套声明覆盖，否则 Node 按 ESM 解释 CJS 产物导致 require 失败。）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const stylesDir = path.join(root, 'styles')

async function compile(input) {
  const result = await sass.compileAsync(input, {
    style: 'expanded',
    silenceDeprecations: ['import', 'global-builtin'],
  })
  return result.css
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content, 'utf8')
}

// 1. 主题（明+暗全量、仅暗色）
const themeCss = await compile(path.join(stylesDir, 'theme', 'index.scss'))
const themeDarkCss = await compile(path.join(stylesDir, 'theme', 'common', 'var-dark.scss'))
write(path.join(root, 'dist', 'theme', 'index.css'), themeCss)
write(path.join(root, 'dist', 'theme', 'index-dark.css'), themeDarkCss)

// 2. 组件样式（唯一源 styles/<name>/index.scss，已含过渡类名双写）
const names = fs
  .readdirSync(stylesDir)
  .filter((n) => n !== 'theme' && fs.statSync(path.join(stylesDir, n)).isDirectory())
  .sort()
const cssList = []
for (const name of names) {
  const css = await compile(path.join(stylesDir, name, 'index.scss'))
  cssList.push(css)
  write(path.join(root, 'dist', name, 'style.css'), css)
}

// 3. 全量聚合源码 styles/index.scss（供各端 dev 沙箱与主题定制导出使用）
//    与 dist/styles/index.css 一一对应；随仓库提交，新增组件后由本脚本自动同步
const aggregate = [
  '/**',
  ' * 全量样式聚合（源码版，自动生成）',
  ' *',
  ' * 由 scripts/build-styles.mjs 按组件目录生成，请勿手改；新增组件后跑 pnpm build:styles 自动同步。',
  ' * 与编译产物 dist/styles/index.css 一一对应（主题变量 + 全部组件样式）。',
  ' *',
  ' * 用途：',
  ' *   - 各端 dev 沙箱一行引入全量样式（如 dev/main.ts）；',
  ' *   - 主题定制导出的 scss 通过本文件引入全量组件，令牌覆盖见 theme/common/variables.scss。',
  ' */',
  "@use 'theme/index' as theme;",
  ...names.map((n) => `@use '${n}/index' as ${n};`),
  '',
].join('\n')
write(path.join(stylesDir, 'index.scss'), aggregate)

// 4. 全量编译产物（主题 + 组件）
write(path.join(root, 'dist', 'styles', 'index.css'), `${themeCss}\n${cssList.join('\n')}`)

// 5. 产物目录模块类型声明
write(path.join(root, 'es', 'package.json'), JSON.stringify({ type: 'module' }, null, 2) + '\n')
write(path.join(root, 'lib', 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2) + '\n')

console.log(
  `styles built: theme(light+dark) + ${names.length} components -> dist/theme, dist/styles, dist/<name>, styles/index.scss`,
)
