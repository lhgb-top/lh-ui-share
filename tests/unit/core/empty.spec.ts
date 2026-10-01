import { describe, it, expect } from 'vitest'
import { getEmptyClassNames } from '../../../src/core/empty'

describe('Empty Core Logic', () => {
  it('returns base class', () => {
    expect(getEmptyClassNames({ hasImage: false })).toEqual(['lh-empty'])
  })

  it('marks custom image usage', () => {
    expect(getEmptyClassNames({ hasImage: true })).toContain('lh-empty--custom-image')
  })
})
