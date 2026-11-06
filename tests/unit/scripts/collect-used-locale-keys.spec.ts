import { describe, it, expect } from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
/**
 * collect-used-locale-keys.mjs 的自检（四端 locale 门禁依赖此脚本）。
 * 经 createRequire 加载，绕开 vite 模块图——与四端门禁用例同口径。
 */
const req = createRequire(import.meta.url)
const { collectUsedLocaleKeys, collectLocaleLeafKeys, findMissingKeys } = req(
  join(__dirname, '../../../scripts/collect-used-locale-keys.mjs'),
)

describe('collect-used-locale-keys 脚本自检', () => {
  it('从源码文件提取 t()/tm() 字面量键并去重', () => {
    const dir = mkdtempSync(join(tmpdir(), 'locale-gate-'))
    try {
      writeFileSync(
        join(dir, 'a.ts'),
        `const t = null\nexport const x = t('input.placeholder') + tm('button.confirm')\n`,
      )
      writeFileSync(join(dir, 'b.js'), `tm('input.placeholder')\n`)
      // 非扫描后缀的文件不参与
      writeFileSync(join(dir, 'c.css'), `t('select.empty')\n`)
      expect(collectUsedLocaleKeys({ sourceDir: dir })).toEqual([
        'button.confirm',
        'input.placeholder',
      ])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('跳过 node_modules / dist 等目录', () => {
    const dir = mkdtempSync(join(tmpdir(), 'locale-gate-'))
    try {
      mkdirSync(join(dir, 'node_modules'))
      writeFileSync(join(dir, 'node_modules', 'dep.ts'), `t('from.dep')\n`)
      writeFileSync(join(dir, 'own.ts'), `t('own.key')\n`)
      expect(collectUsedLocaleKeys({ sourceDir: dir })).toEqual(['own.key'])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('collectLocaleLeafKeys 展平语言包对象为点号叶子键', () => {
    const leaves = collectLocaleLeafKeys({ a: { b: 'x', c: { d: 'y' } }, e: 'z' })
    expect([...leaves].sort()).toEqual(['a.b', 'a.c.d', 'e'])
  })

  it('findMissingKeys 求差只报语言包缺失的键', () => {
    const leaves = new Set(['a.b'])
    expect(findMissingKeys(['a.b', 'c.d'], leaves)).toEqual(['c.d'])
    expect(findMissingKeys(['a.b'], leaves)).toEqual([])
  })

  it('share 自身源码不使用 t()/tm()（core 无文案红线）', () => {
    // core 是纯逻辑层，文案只活在 locales/ 语言包；若 core 里出现 t() 调用即违红线
    const used = collectUsedLocaleKeys({ sourceDir: join(__dirname, '../../src') })
    expect(used).toEqual([])
  })
})
