/**
 * 从 CHANGELOG.md 提取指定版本的发行版说明（changesets 生成的段落格式）。
 *
 * CHANGELOG 由 @changesets/cli/changelog 生成，结构为：
 *
 *   # @lh-ui/share
 *
 *   ## 0.3.0
 *   ### Minor Changes
 *   - ...
 *
 *   ## 0.2.0
 *   ...
 *
 * 本脚本截取 `## <version>` 到下一个 `## ` 之间的内容（不含顶层 `# @lh-ui/share`
 * 标题），输出到 stdout。供 .github/workflows/release.yml 生成发行版说明；
 * 本地也可用 `node scripts/release-notes.mjs 0.3.0` 检查。
 *
 * 用法：node scripts/release-notes.mjs <version>   例如 0.3.0
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const changelogPath = path.resolve(__dirname, '..', 'CHANGELOG.md')

const version = process.argv[2]

if (!version) {
  console.error('用法：node scripts/release-notes.mjs <version>，例如 0.3.0')
  process.exit(1)
}

if (!fs.existsSync(changelogPath)) {
  console.error(`未找到 CHANGELOG.md：${changelogPath}`)
  process.exit(1)
}

const lines = fs.readFileSync(changelogPath, 'utf8').split('\n')

// 只认 `## x.y.z` 这一级标题（### Minor/Patch 是子标题，不算版本边界）
const start = lines.findIndex((line) => line === `## ${version}`)
if (start === -1) {
  console.error(`CHANGELOG.md 中未找到版本 ${version}`)
  process.exit(1)
}

let end = lines.findIndex((line, i) => i > start && /^## /.test(line))
if (end === -1) end = lines.length

process.stdout.write(lines.slice(start, end).join('\n').trim() + '\n')
