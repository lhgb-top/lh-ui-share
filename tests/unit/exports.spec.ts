/**
 * package.json 导出面的结构不变量（纯静态，不依赖 es/ 产物——CI 的 test 步骤
 * 在 build 之前运行，而 es/ 被 gitignore）。
 *
 * 产物侧的一致性（每个键指向的文件真实存在、每个通配模式都有文件命中）
 * 由 pnpm verify:dts 在构建后兜底，不在此重复。
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
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
