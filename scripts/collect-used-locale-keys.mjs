/**
 * 收集源码里实际使用的 locale 键（t() / tm()调用字面量第一参数）。
 *
 * 用途：各 UI 仓的 locale 测试门禁——「本仓使用的键 ⊆ @lh-ui/share zh-CN 叶子键」，
 * 根本防线防止 S-23 类「语言包漏键导致非中文语言回显中文 fallback」。
 *
 * 本仓库自身不消费 t()（core 无文案），脚本只供下游 import。
 *
 * 【纯 JS 约定】本脚本**不得 import 任何 TS 模块**：各 UI 仓测试经
 * 「@vite-ignore 注释 + pathToFileURL」原生加载本脚本（绕开 vite 模块图，
 * 否则仓外绝对路径会被改写成 `/id/D:\...` 导致 Cannot find module），原生 node import
 * 无法解析 .ts。因此 zh-CN 语言包由调用方（仓内经 alias 导入）传入。
 *
 * 扫描约定：只提取点号路径的字面量键（动态拼路径的 t() 不算），跳过
 * node_modules / dist / docs 等目录。
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'

const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.vue', '.js', '.mjs'])
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'docs', 'dev'])

/**
 * @typedef {Object} CollectOptions
 * @property {string|string[]} [sourceDir] 相对/绝对源码根目录（默认调用方 cwd 的 src）；
 *   数组形态供源码分散在多个顶层目录的仓库（如 plus 的 src + packages）一次扫描
 * @property {string[]} [skipDirs] 额外要跳过的目录名
 */

/** t('key') / tm('key') / lhlocale.t('key', ...) 的字面量键（单引号或双引号）；键至少含一个点 */
const T_CALL_RE = /\bt(?:m)?\(\s*['"]([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)+)['"]/g

/**
 * 递归收集 sourceDir 下所有源码文件里出现的 locale 键，返回去重升序数组。
 * @param {CollectOptions} [options]
 * @returns {string[]}
 */
export function collectUsedLocaleKeys(options = {}) {
  const dirs = Array.isArray(options.sourceDir) ? options.sourceDir : [options.sourceDir ?? 'src']
  const roots = dirs.map((d) => resolve(d))
  const skip = new Set([...SKIP_DIRS, ...(options.skipDirs ?? [])])
  const keys = new Set()

  const walk = (dir) => {
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!skip.has(entry.name)) walk(fullPath)
        continue
      }
      if (!entry.isFile()) continue
      if (!SCAN_EXTENSIONS.has(extname(entry.name))) continue
      let src
      try {
        src = readFileSync(fullPath, 'utf8')
      } catch {
        continue
      }
      // 键是字面量；注释里出现的样本键若有缺失也会被门禁报出（语言包没有即算缺）
      for (const match of src.matchAll(T_CALL_RE)) {
        keys.add(match[1])
      }
    }
  }

  for (const root of roots) walk(root)
  return [...keys].sort()
}

/**
 * 取一个语言包对象（如 zh-CN 导出）的全部字符串叶子键（点号路径）。
 * 由调用方传入语言包而非本脚本自行 import——见文件头「纯 JS 约定」。
 * @param {Record<string, unknown>} localePack 语言包对象
 * @returns {Set<string>}
 */
export function collectLocaleLeafKeys(localePack) {
  const leaves = new Set()
  const walk = (obj, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        walk(value, path)
      } else {
        leaves.add(path)
      }
    }
  }
  walk(localePack)
  return leaves
}

/**
 * 求差：usedKeys 里不在 zhCNLeafKeys 中的键（即语言包缺失的键）。
 * @param {string[]} usedKeys
 * @param {Set<string>} zhCNLeafKeys
 * @returns {string[]}
 */
export function findMissingKeys(usedKeys, zhCNLeafKeys) {
  return usedKeys.filter((key) => !zhCNLeafKeys.has(key))
}
