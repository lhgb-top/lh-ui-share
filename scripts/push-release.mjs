/**
 * 把 master 与本次发版的 tag 推到 GitHub，触发 release.yml 自动留档。
 *
 * tag 由 `pnpm release`（changeset publish）在本地创建，格式固定为
 * `<包名>@<版本号>`（见 @changesets/cli 的 buildGitTag）。changeset publish
 * 只创建 tag、不推送，所以发版后必须执行本脚本。
 *
 * 只推 GitHub（remote: github-lhgb）。Gitee 的 tag 与发行版统一由
 * release.yml 接管（推 tag + 调 API 建发行版），避免本地/CI 双写冲突。
 *
 * 用法：pnpm release:push（读 package.json 的 version 拼 tag）
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgPath = path.resolve(__dirname, '..', 'package.json')

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const tag = `${pkg.name}@${pkg.version}`
const remote = 'github-lhgb'

const run = (command) => {
  console.log(`$ ${command}`)
  execFileSync(command, { stdio: 'inherit', shell: true })
}

run(`git push ${remote} master`)
run(`git push ${remote} ${tag}`)

console.log(`
✅ 已推送 ${tag} 到 GitHub。
GitHub Actions 将自动构建并创建发行版（挂 .tgz 安装包），随后同步 tag 与发行版到 Gitee。
跟踪进度：https://github.com/lhgb-top/lh-ui-share/actions`)
