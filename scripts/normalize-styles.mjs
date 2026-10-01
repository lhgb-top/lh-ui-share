/**
 * 一次性脚本：组件样式过渡类名双写。
 *
 * Vue2 的过渡类是 `*-enter` / `*-leave`，Vue3 / React 是 `*-enter-from` / `*-leave-from`。
 * share 是三框架的唯一样式源，这里把每个 `*-enter-from` 选择器并列补写一个 `*-enter`
 * （`-leave-from` 同理），多余的 Vue2 类名对 Vue3/React 无害（永远不会被施加）。
 *
 * 处理范围：styles/<name>/index.scss（组件样式，不含 theme 令牌）。可重复执行（仅多写并列选择器）。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const stylesDir = path.join(root, 'styles')

let changed = 0
for (const name of fs.readdirSync(stylesDir)) {
  const dir = path.join(stylesDir, name)
  if (name === 'theme' || !fs.statSync(dir).isDirectory()) continue
  const file = path.join(dir, 'index.scss')
  if (!fs.existsSync(file)) continue
  const before = fs.readFileSync(file, 'utf8')
  const after = before
    .replace(/\.([\w-]+)-enter-from\b/g, '.$1-enter,\n.$1-enter-from')
    .replace(/\.([\w-]+)-leave-from\b/g, '.$1-leave,\n.$1-leave-from')
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8')
    changed += 1
    console.log(`[dual-write] ${path.relative(root, file)}`)
  }
}
console.log(`[dual-write] 完成：${changed} 个文件补写了 Vue2 过渡类名并列`)
