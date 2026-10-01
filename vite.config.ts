import { defineConfig } from 'vite'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * 库构建（vite lib mode + preserveModules）
 *
 * 产物结构镜像 src/：
 *   es/core/button/index.js / lib/core/button/index.js / es/core/shared/sx/index.js ...
 * 与 package.json 的 `./core/*` 子路径导出一一对应，天然支持 tree-shaking。
 * dts 由 `pnpm build:dts`（tsc --emitDeclarationOnly）按同一镜像结构直出，无需聚合。
 */

const srcDir = resolve(__dirname, 'src')

/** 入口：根入口 + core 各组件目录 + 各子层（constants/locales/theme/utils） */
function collectEntries() {
  const entries = [join(srcDir, 'index.ts')]
  const coreDir = join(srcDir, 'core')
  for (const name of readdirSync(coreDir).sort()) {
    const dir = join(coreDir, name)
    if (statSync(dir).isDirectory() && existsSync(join(dir, 'index.ts'))) {
      entries.push(join(dir, 'index.ts'))
    }
  }
  for (const sub of ['constants', 'locales', 'theme', 'utils']) {
    const file = join(srcDir, sub, 'index.ts')
    if (existsSync(file)) entries.push(file)
  }
  return entries
}

const commonOutput = {
  preserveModules: true,
  preserveModulesRoot: 'src',
  entryFileNames: '[name].js',
  exports: 'named',
}

export default defineConfig({
  build: {
    target: 'es2020',
    minify: false,
    sourcemap: false,
    reportCompressedSize: false,
    lib: { entry: collectEntries() },
    rollupOptions: {
      // 零依赖：无 external（框架在 UI 层，share 内禁止出现）
      external: [],
      output: [
        { ...commonOutput, format: 'es', dir: 'es' },
        { ...commonOutput, format: 'cjs', dir: 'lib' },
      ],
    },
  },
})
