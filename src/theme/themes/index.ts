import type { ThemePreset, ThemePresetName } from '../types'

/** 青花瓷主题配置 */
const cerblue: ThemePreset = {
  name: 'cerblue',
  label: '青花瓷',
  labelEn: 'Ceramic Blue',
  description: '青花瓷釉下彩，清雅素净',
  vars: {
    '--lh-primary-color': '#2B4C7C',
    '--lh-primary-color-hover': '#3D649E',
    '--lh-primary-color-active': '#1F3A5F',
    '--lh-primary-color-bg': '#E8EDF3',
    '--lh-primary-color-border': '#D4DCE8',
  },
}

/** 松花绿主题配置 */
const songhua: ThemePreset = {
  name: 'songhua',
  label: '松花绿',
  labelEn: 'Pine Green',
  description: '竹林修竹，生机勃勃',
  vars: {
    '--lh-primary-color': '#5B8C5A',
    '--lh-primary-color-hover': '#7BB079',
    '--lh-primary-color-active': '#4B7A4A',
    '--lh-primary-color-bg': '#E8F5E8',
    '--lh-primary-color-border': '#D0E8CF',
  },
}

/** 朱砂主题配置 */
const zhusha: ThemePreset = {
  name: 'zhusha',
  label: '朱砂',
  labelEn: 'Vermilion',
  description: '传统印章朱砂红，喜庆庄重',
  vars: {
    '--lh-primary-color': '#B23A3A',
    '--lh-primary-color-hover': '#C45050',
    '--lh-primary-color-active': '#9A3030',
    '--lh-primary-color-bg': '#FDF0F0',
    '--lh-primary-color-border': '#F0D8D8',
  },
}

/** 水墨黑白主题配置 */
const shuimo: ThemePreset = {
  name: 'shuimo',
  label: '水墨',
  labelEn: 'Ink Wash',
  description: '水墨丹青，素雅极简',
  vars: {
    '--lh-primary-color': '#2C2C2C',
    '--lh-primary-color-hover': '#5A5A5A',
    '--lh-primary-color-active': '#1A1A1A',
    '--lh-primary-color-bg': '#F5F5F5',
    '--lh-primary-color-border': '#E0E0E0',
  },
}

/** 藤黄主题配置 */
const golden: ThemePreset = {
  name: 'golden',
  label: '藤黄',
  labelEn: 'Golden Autumn',
  description: '深秋枫黄，温暖金黄',
  vars: {
    '--lh-primary-color': '#B8860B',
    '--lh-primary-color-hover': '#D4A843',
    '--lh-primary-color-active': '#9A7208',
    '--lh-primary-color-bg': '#FBF6EA',
    '--lh-primary-color-border': '#F0E8D0',
  },
}

/** 所有预设主题列表 */
export const THEME_PRESETS: ThemePreset[] = [cerblue, songhua, zhusha, shuimo, golden]

/** 根据名称获取主题配置 */
export function getThemePreset(name: ThemePresetName): ThemePreset | undefined {
  return THEME_PRESETS.find((t) => t.name === name)
}

/** 根据名称获取主题 CSS 变量 */
export function getThemeVars(name: ThemePresetName): Record<string, string> | undefined {
  return getThemePreset(name)?.vars
}

export { cerblue, songhua, zhusha, shuimo, golden }
