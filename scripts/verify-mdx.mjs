import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
const req = createRequire(import.meta.filename)
const { satteri } = req('./node_modules/.pnpm/@astrojs+markdown-satteri@0.4.3/node_modules/@astrojs/markdown-satteri/dist/processor.js')

const processor = satteri()
const renderer = await processor.createMdxRenderer(
  { syntaxHighlight: false, shikiConfig: {}, gfm: true, smartypants: false },
  { optimize: false, srcDir: resolve('docs/src'), sourcemap: false }
)

const dir = resolve('docs/src/content/docs')
const bad = []
let count = 0
async function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name)
    if (e.isDirectory()) await walk(p)
    else if (e.name.endsWith('.mdx')) {
      count++
      const text = readFileSync(p, 'utf8')
      const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
      const content = m ? text.slice(m[0].length) : text
      try {
        await renderer.process(content, pathToFileURL(p).href, {})
      } catch (err) {
        bad.push(`${relative(dir, p)} :: ${err.message.split('\n')[0].slice(0, 110)}`)
      }
    }
  }
}
await walk(dir)
console.log(bad.length ? bad.map((b) => '✗ ' + b).join('\n') : '✅ 全部 mdx 语法校验通过')
console.log(`剩余 ${bad.length} 处（已扫描 ${count} 个 mdx）`)
