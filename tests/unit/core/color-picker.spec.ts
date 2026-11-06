import { describe, it, expect } from 'vitest'
import {
  LH_COLOR_FORMAT_CONST,
  clampColorAlpha,
  clampColorChannel,
  clampColorHue,
  clampColorRatio,
  formatColor,
  getColorPickerClassNames,
  hexToRgb,
  hsvToRgb,
  isSameColor,
  isValidColorFormat,
  parseColorString,
  rgbToHex,
  rgbToHsv,
} from '../../../src/core/color-picker'

describe('ColorPicker Core Logic — 钳制', () => {
  it('暴露两个输出格式', () => {
    expect(LH_COLOR_FORMAT_CONST).toEqual(['hex', 'rgb'])
    expect(isValidColorFormat('hex')).toBe(true)
    expect(isValidColorFormat('rgb')).toBe(true)
    expect(isValidColorFormat('hsl')).toBe(false)
  })

  it('clampColorChannel 钳到 0~255 整数', () => {
    expect(clampColorChannel(300)).toBe(255)
    expect(clampColorChannel(-10)).toBe(0)
    expect(clampColorChannel(128.9)).toBe(128)
    expect(clampColorChannel(NaN)).toBe(0)
    expect(clampColorChannel(undefined)).toBe(0)
  })

  it('clampColorAlpha 钳到 0~1 两位小数', () => {
    expect(clampColorAlpha(1.5)).toBe(1)
    expect(clampColorAlpha(-0.2)).toBe(0)
    expect(clampColorAlpha(0.555)).toBe(0.56)
    expect(clampColorAlpha(NaN)).toBe(1)
    expect(clampColorAlpha(undefined)).toBe(1)
  })

  it('clampColorHue 钳到 0~360 整数', () => {
    expect(clampColorHue(400)).toBe(360)
    expect(clampColorHue(-20)).toBe(0)
    expect(clampColorHue(NaN)).toBe(0)
  })

  it('clampColorRatio 钳到 0~1 两位小数', () => {
    expect(clampColorRatio(1.2)).toBe(1)
    expect(clampColorRatio(-1)).toBe(0)
    expect(clampColorRatio(0.333)).toBe(0.33)
    expect(clampColorRatio(NaN)).toBe(0)
  })
})

describe('ColorPicker Core Logic — hex 解析与格式化', () => {
  it('hexToRgb 解析 6 位 hex', () => {
    expect(hexToRgb('#2B4C7C')).toEqual({ r: 0x2b, g: 0x4c, b: 0x7c, a: 1 })
    expect(hexToRgb('2b4c7c')).toEqual({ r: 0x2b, g: 0x4c, b: 0x7c, a: 1 })
  })

  it('hexToRgb 解析 3 位 / 4 位 / 8 位 hex', () => {
    // 单位 hex 不在合法形态内（3/4/6/8 位）
    expect(hexToRgb('#3')).toBeNull()
    expect(hexToRgb('#f00a')).toEqual({ r: 0xff, g: 0x00, b: 0x00, a: Math.round((0xaa / 255) * 100) / 100 })
    expect(hexToRgb('#ff000080')).toEqual({ r: 255, g: 0, b: 0, a: Math.round((0x80 / 255) * 100) / 100 })
  })

  it('hexToRgb 非法输入返回 null', () => {
    expect(hexToRgb('#gggggg')).toBeNull()
    expect(hexToRgb('#12345')).toBeNull()
    expect(hexToRgb('#1234567')).toBeNull()
    expect(hexToRgb('')).toBeNull()
  })

  it('rgbToHex 6 位（不透明）与 8 位（半透明）', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0, a: 1 })).toBe('#ff0000')
    expect(rgbToHex({ r: 0, g: 0, b: 255, a: 0.5 })).toMatch(/^#[0-9a-f]{8}$/)
    // 通道截断语义：0.5 * 255 = 127.5 → 127（0x7f）
    expect(rgbToHex({ r: 0, g: 0, b: 255, a: 0.5 })).toBe('#0000ff7f')
  })

  it('rgbToHex 通道越界被钳制', () => {
    expect(rgbToHex({ r: 300, g: -1, b: 0, a: 2 })).toBe('#ff0000')
  })
})

describe('ColorPicker Core Logic — rgb / hsv 互转', () => {
  it('rgbToHsv 纯红 / 纯绿 / 纯蓝', () => {
    expect(rgbToHsv({ r: 255, g: 0, b: 0, a: 1 })).toEqual({ h: 0, s: 1, v: 1, a: 1 })
    expect(rgbToHsv({ r: 0, g: 255, b: 0, a: 1 })).toEqual({ h: 120, s: 1, v: 1, a: 1 })
    expect(rgbToHsv({ r: 0, g: 0, b: 255, a: 1 })).toEqual({ h: 240, s: 1, v: 1, a: 1 })
  })

  it('rgbToHsv 黑白灰饱和度为 0', () => {
    expect(rgbToHsv({ r: 0, g: 0, b: 0, a: 1 })).toEqual({ h: 0, s: 0, v: 0, a: 1 })
    expect(rgbToHsv({ r: 255, g: 255, b: 255, a: 1 })).toEqual({ h: 0, s: 0, v: 1, a: 1 })
    const gray = rgbToHsv({ r: 128, g: 128, b: 128, a: 1 })
    expect(gray.s).toBe(0)
    expect(gray.v).toBe(Math.round((128 / 255) * 100) / 100)
  })

  it('hsvToRgb 三个原色与中点色', () => {
    expect(hsvToRgb({ h: 0, s: 1, v: 1, a: 1 })).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(hsvToRgb({ h: 120, s: 1, v: 1, a: 1 })).toEqual({ r: 0, g: 255, b: 0, a: 1 })
    expect(hsvToRgb({ h: 240, s: 1, v: 1, a: 1 })).toEqual({ r: 0, g: 0, b: 255, a: 1 })
    // 黄色（h=60, s=1, v=1）
    expect(hsvToRgb({ h: 60, s: 1, v: 1, a: 1 })).toEqual({ r: 255, g: 255, b: 0, a: 1 })
  })

  it('hsvToRgb 饱和度 / 明度为 0 退化为灰', () => {
    expect(hsvToRgb({ h: 200, s: 0, v: 1, a: 1 })).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(hsvToRgb({ h: 200, s: 1, v: 0, a: 1 })).toEqual({ r: 0, g: 0, b: 0, a: 1 })
  })

  it('rgb ↔ hsv 往返保持一致（通道误差 ≤ 1）', () => {
    const colors = [
      { r: 43, g: 76, b: 124, a: 1 },
      { r: 240, g: 100, b: 50, a: 0.5 },
      { r: 10, g: 200, b: 130, a: 0.8 },
    ]
    for (const color of colors) {
      const round = hsvToRgb(rgbToHsv(color))
      expect(Math.abs(round.r - color.r)).toBeLessThanOrEqual(1)
      expect(Math.abs(round.g - color.g)).toBeLessThanOrEqual(1)
      expect(Math.abs(round.b - color.b)).toBeLessThanOrEqual(1)
      expect(round.a).toBe(color.a)
    }
  })
})

describe('ColorPicker Core Logic — 字符串解析与输出', () => {
  it('parseColorString 解析 rgb()/rgba()', () => {
    expect(parseColorString('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(parseColorString('rgba(255, 0, 0, 0.5)')).toEqual({ r: 255, g: 0, b: 0, a: 0.5 })
    expect(parseColorString('rgba(100%, 50%, 0%, 1)')).toEqual({
      r: 255,
      // 50% → 127.5，通道截断为 127
      g: 127,
      b: 0,
      a: 1,
    })
  })

  it('parseColorString 解析 hex 并钳制非法透明度', () => {
    expect(parseColorString('#ff8800')).toEqual({ r: 255, g: 136, b: 0, a: 1 })
    expect(parseColorString('rgba(1,2,3, 5)')).toEqual({ r: 1, g: 2, b: 3, a: 1 })
  })

  it('parseColorString 非法输入返回 null', () => {
    expect(parseColorString('')).toBeNull()
    expect(parseColorString(undefined)).toBeNull()
    expect(parseColorString('hsl(120, 50%, 50%)')).toBeNull()
    expect(parseColorString('red')).toBeNull()
    expect(parseColorString('rgb(1,2)')).toBeNull()
    expect(parseColorString('rgb(1,2,a)')).toBeNull()
  })

  it('formatColor hex / rgb 双格式输出', () => {
    const red = { r: 255, g: 0, b: 0, a: 1 }
    expect(formatColor(red, 'hex')).toBe('#ff0000')
    expect(formatColor(red, 'rgb')).toBe('rgb(255, 0, 0)')
    const half = { r: 0, g: 0, b: 255, a: 0.5 }
    expect(formatColor(half, 'hex')).toBe('#0000ff7f')
    expect(formatColor(half, 'rgb')).toBe('rgba(0, 0, 255, 0.5)')
  })
})

describe('ColorPicker Core Logic — 比较 / 类名', () => {
  it('isSameColor 感知相等', () => {
    expect(isSameColor({ r: 255, g: 0, b: 0, a: 1 }, { r: 255, g: 0, b: 0, a: 1 })).toBe(true)
    expect(isSameColor({ r: 255, g: 0, b: 0, a: 1 }, { r: 255, g: 0, b: 0, a: 0.5 })).toBe(false)
    expect(isSameColor({ r: 255, g: 0, b: 0, a: 1 }, { r: 254, g: 0, b: 0, a: 1 })).toBe(false)
    expect(
      isSameColor({ r: 255.4, g: 0, b: 0, a: 1.4 }, { r: 255, g: 0, b: 0, a: 1 }),
    ).toBe(true)
  })

  it('getColorPickerClassNames 尺寸与状态修饰', () => {
    expect(getColorPickerClassNames({})).toEqual(['lh-color-picker'])
    expect(getColorPickerClassNames({ size: 'small' })).toContain('lh-color-picker--small')
    expect(getColorPickerClassNames({ disabled: true })).toContain('lh-color-picker--disabled')
    expect(getColorPickerClassNames({ open: true })).toContain('lh-color-picker--open')
  })
})
