import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { THEME_PRESETS, getThemePreset, getThemeVars, registerTheme } from '../../src/theme/themes'
import type { ThemePresetName } from '../../src/theme/types'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STYLES_ROOT = resolve(__dirname, '../../styles')

/** 从 variables.scss 解析 `$lh-primary*` 的字面值 */
function parseScssPrimaryVars(content: string): Record<string, string> {
  const vars: Record<string, string> = {}
  const re = /\$lh-primary(-hover|-active|-light|-lighter)?\s*:\s*(#[0-9a-fA-F]{3,8})/
  for (const line of content.split('\n')) {
    const match = line.match(re)
    if (match) vars['lh-primary' + (match[1] ?? '')] = match[2]
  }
  return vars
}

describe('theme / THEME_PRESETS', () => {
  it('exposes exactly the documented five presets in a stable order', () => {
    expect(THEME_PRESETS.map((t) => t.name)).toEqual([
      'cerblue',
      'songhua',
      'zhusha',
      'shuimo',
      'golden',
    ])
  })

  it('every preset declares the full primary variable set', () => {
    const required = [
      '--lh-primary-color',
      '--lh-primary-color-hover',
      '--lh-primary-color-active',
      '--lh-primary-color-bg',
      '--lh-primary-color-border',
    ]
    for (const preset of THEME_PRESETS) {
      // 浅主色预设可额外声明 --lh-color-on-primary / --lh-selected-color（见下条测试），
      // 故只断言「包含」必需键集，不要求键集完全相等
      expect(Object.keys(preset.vars)).toEqual(expect.arrayContaining(required))
    }
  })

  // 浅主色预设的对比度兜底：白字在浅主色底上不足 AA（songhua 3.93:1 / golden 3.25:1），
  // 必须改用墨字；同时 active 色作选中文字在悬停底上也不足，需单独加深 selected。
  // 深主色预设（cerblue 8.65 / zhusha 5.90 / shuimo 13.97）白字已达标，无需额外声明。
  it('light-primary presets declare on-primary / selected overrides for AA contrast', () => {
    const lightPrimary = ['songhua', 'golden']
    for (const preset of THEME_PRESETS) {
      const isLight = lightPrimary.includes(preset.name)
      const hasOnPrimary = '--lh-color-on-primary' in preset.vars
      const hasSelected = '--lh-selected-color' in preset.vars
      expect(hasOnPrimary).toBe(isLight)
      expect(hasSelected).toBe(isLight)
    }
  })

  it('getThemePreset / getThemeVars resolve by name', () => {
    const name: ThemePresetName = 'songhua'
    expect(getThemePreset(name)?.labelEn).toBe('Pine Green')
    expect(getThemeVars(name)).toBe(getThemePreset(name)?.vars)
    expect(getThemePreset('nonexistent' as ThemePresetName)).toBeUndefined()
  })

  // 漂移护栏：var.scss 的 :root 是 CSS 侧默认主色来源，
  // THEME_PRESETS[0] 是 JS 侧切换主题时的默认来源。二者必须一致，
  // 否则「未启用主题切换」的页面与「切回青花瓷」的页面观感不同。
  it('the default preset stays in sync with the SCSS token source', () => {
    const scss = readFileSync(resolve(STYLES_ROOT, 'theme/common/variables.scss'), 'utf-8')
    const scssVars = parseScssPrimaryVars(scss)

    expect(scssVars['lh-primary']).toBe(THEME_PRESETS[0].vars['--lh-primary-color'])
    expect(scssVars['lh-primary-hover']).toBe(THEME_PRESETS[0].vars['--lh-primary-color-hover'])
    expect(scssVars['lh-primary-active']).toBe(THEME_PRESETS[0].vars['--lh-primary-color-active'])
    expect(scssVars['lh-primary-light']).toBe(THEME_PRESETS[0].vars['--lh-primary-color-bg'])
    expect(scssVars['lh-primary-lighter']).toBe(THEME_PRESETS[0].vars['--lh-primary-color-border'])
  })

  it('registerTheme registers and overrides presets by name (round 2)', () => {
    registerTheme({
      name: 'test-theme',
      label: '测试主题',
      labelEn: 'Test Theme',
      description: '',
      vars: {
        '--lh-primary-color': '#123456',
        '--lh-primary-color-hover': '#234567',
        '--lh-primary-color-active': '#012345',
        '--lh-primary-color-bg': '#E0E6EC',
        '--lh-primary-color-border': '#D0D8E0',
      },
    })
    expect(getThemeVars('test-theme')?.['--lh-primary-color']).toBe('#123456')

    // 同名覆盖（不增长列表）
    const count = THEME_PRESETS.length
    registerTheme({
      name: 'test-theme',
      label: '覆盖',
      labelEn: 'Override',
      description: '',
      vars: {
        '--lh-primary-color': '#654321',
        '--lh-primary-color-hover': '#543210',
        '--lh-primary-color-active': '#765432',
        '--lh-primary-color-bg': '#ECE0E6',
        '--lh-primary-color-border': '#E0D0D8',
      },
    })
    expect(THEME_PRESETS.length).toBe(count)
    expect(getThemeVars('test-theme')?.['--lh-primary-color']).toBe('#654321')

    // 内置预设不受污染
    expect(getThemeVars('cerblue')?.['--lh-primary-color']).toBe('#2B4C7C')
    // 未注册名称返回 undefined 而非抛错
    expect(getThemeVars('never-registered')).toBeUndefined()
  })
})
