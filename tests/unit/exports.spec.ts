/**
 * package.json 导出面的结构不变量（纯静态，不依赖 es/ 产物——CI 的 test 步骤
 * 在 build 之前运行，而 es/ 被 gitignore）。
 *
 * 产物侧的一致性（每个键指向的文件真实存在、每个通配模式都有文件命中）
 * 由 pnpm verify:dts 在构建后兜底，不在此重复。
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8'))
const exports = pkg.exports as Record<string, Record<string, string> | string>
const keys = Object.keys(exports)

describe('package.json exports', () => {
  it('exports the component barrels and the per-component compiled CSS', () => {
    // 目录桶：@lh-ui/share/core/button 这类按目录消费的路径
    expect(exports['./core/*']).toBeDefined()
    // 单组件编译产物：无 SCSS 管道的消费方按组件引入
    expect(exports['./dist/*']).toBe('./dist/*')
  })

  it('never uses multi-star patterns (Node silently ignores them)', () => {
    const targets = keys.flatMap((k) => {
      const v = exports[k]
      return typeof v === 'string' ? [v] : Object.values(v)
    })
    for (const t of targets) {
      expect((t.match(/\*/g) ?? []).length).toBeLessThan(2)
    }
  })

  it('generates deep-path patterns with well-formed condition triples', () => {
    // sync-exports 为每个纯扁平深目录生成 ./<bucket>/<dir>/* 模式；
    // import 与 require 必须成对（缺一即某种消费形态解析失败）
    const deep = keys.filter((k) => /^\.\/(core|locales|theme|types|utils)\/[^*/]+\/\*$/.test(k))
    expect(deep.length).toBeGreaterThan(0)
    for (const k of deep) {
      const v = exports[k]
      expect(typeof v).toBe('object')
      const rel = k.slice(2, -2)
      const conds = Object.keys(v!)
      expect(conds.includes('import')).toBe(conds.includes('require'))
      if (conds.includes('types')) expect(v!.types).toBe(`./es/${rel}/*.d.ts`)
      if (conds.includes('import')) {
        expect(v!.import).toBe(`./es/${rel}/*.js`)
        expect(v!.require).toBe(`./lib/${rel}/*.js`)
      }
    }
  })

  it('keeps the types-only subpath free of runtime conditions', () => {
    // ./types 是纯类型入口：挂 import/require 会指向不存在的运行时文件
    expect(exports['./types']).toEqual({ types: './es/types/index.d.ts' })
  })
})

/**
 * src/core 聚合出口的完整性不变量。
 *
 * 背景：src/core/index.ts 靠 `export * from './<comp>'` 收录各组件，新增组件
 * 时只建目录、忘了加导出行，根入口（@lh-ui/share）会静默缺失该组件，
 * 深路径（@lh-ui/share/core/<comp>）却仍可用——消费方行为分裂且无任何报错。
 * 此处做双向 diff：有 index.ts 的目录必须被导出，导出行必须对应真实目录。
 */
describe('src/core 聚合导出完整性', () => {
  const coreDir = join(__dirname, '../../src/core')
  const indexSrc = readFileSync(join(coreDir, 'index.ts'), 'utf8')

  /** index.ts 里全部 re-export 的顶层模块段（star 与显式清单均算；
   *  './shared/virtual' 这类深路径取首段 'shared'， './popconfirm/types' 取 'popconfirm'）。
   *  注意：文件为无分号风格，不能用 `[^;]*` 连接 export 与 from——它会贪婪吞到文件尾、
   *  全局匹配只剩一处。拆成「star 单行」与「显式清单块」两条精确正则。 */
  const starExports = [...indexSrc.matchAll(/^export\s+\*\s+from\s+'\.\/([^']+)'/gm)].map(
    (m) => m[1].split('/')[0],
  )
  const namedExports = [...indexSrc.matchAll(/^export\s*\{[^}]*\}\s*from\s+'\.\/([^']+)'/gm)].map(
    (m) => m[1].split('/')[0],
  )
  const exportedModules = new Set([...starExports, ...namedExports])

  /** src/core 下含 index.ts 的子目录（即一个可被 star 导出的组件模块） */
  const moduleDirs = readdirSync(coreDir).filter((name) => {
    const p = join(coreDir, name)
    return statSync(p).isDirectory() && statSync(join(p, 'index.ts')).isFile()
  })

  it('每个 core 模块目录都被 src/core/index.ts star 导出', () => {
    const missing = moduleDirs.filter((d) => !exportedModules.has(d))
    expect(missing).toEqual([])
  })

  it('每条 star 导出行都对应真实存在的模块目录', () => {
    const dangling = [...exportedModules].filter((m) => !moduleDirs.includes(m))
    expect(dangling).toEqual([])
  })
})
