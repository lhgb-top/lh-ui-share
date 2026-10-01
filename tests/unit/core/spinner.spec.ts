import { describe, expect, it } from 'vitest'
import { getSpinnerClassNames, LH_SPINNER_SIZE_PX } from '../../../src/core/spinner'

describe('LhSpinner core', () => {
  it('computes spinner class names per size', () => {
    expect(getSpinnerClassNames({ size: 'medium' })).toEqual(['lh-spinner', 'lh-spinner--medium'])
    expect(getSpinnerClassNames({ size: 'small' })).toEqual(['lh-spinner', 'lh-spinner--small'])
  })

  it('maps sizes to diameters', () => {
    expect(LH_SPINNER_SIZE_PX.small).toBe(16)
    expect(LH_SPINNER_SIZE_PX.medium).toBe(24)
    expect(LH_SPINNER_SIZE_PX.large).toBe(32)
  })
})
