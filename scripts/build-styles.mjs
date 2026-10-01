/**
 * 样式构建（sass modern API 直出）：
 *   dist/theme/index.css        明色 + 暗色全量（styles/theme/index.scss 聚合）
 *   dist/theme/index-dark.css   仅暗色（styles/theme/common/var-dark.scss，字面量值可独立编译）
 *   dist/styles/index.css       全量（theme + 全部组件）
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

// 3. 全量（主题 + 组件）
write(path.join(root, 'dist', 'styles', 'index.css'), `${themeCss}\n${cssList.join('\n')}`)

// 4. 产物目录模块类型声明
write(path.join(root, 'es', 'package.json'), JSON.stringify({ type: 'module' }, null, 2) + '\n')
write(path.join(root, 'lib', 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2) + '\n')

console.log(`styles built: theme(light+dark) + ${names.length} components -> dist/theme, dist/styles, dist/<name>`)
