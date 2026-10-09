import { describe, expect, it } from 'vitest'
import { resolveDelay } from '../../../../src/core/shared/delay'

describe('core/shared/delay', () => {
  it('falls back to the caller-provided defaults', () => {
    expect(resolveDelay(undefined, undefined, { show: 200, hide: 100 })).toEqual({
      show: 200,
      hide: 100,
    })
    expect(resolveDelay(undefined, undefined, { show: 200, hide: 0 })).toEqual({
      show: 200,
      hide: 0,
    })
  })

  it('honors explicit values over defaults', () => {
    expect(resolveDelay(50, 20, { show: 200, hide: 100 })).toEqual({ show: 50, hide: 20 })
    // 0 是有效值，不能被默认值覆盖
    expect(resolveDelay(0, 0, { show: 200, hide: 100 })).toEqual({ show: 0, hide: 0 })
  })
})
