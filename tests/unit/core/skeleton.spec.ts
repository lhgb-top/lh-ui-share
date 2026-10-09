import { describe, it, expect } from 'vitest'
import {
  getSkeletonItemClassNames,
  getSkeletonClassNames,
  getSkeletonRowWidths,
  getSkeletonAria,
} from '../../../src/core/skeleton'

describe('Skeleton Core Logic', () => {
  describe('getSkeletonItemClassNames', () => {
    it('returns base and variant classes', () => {
      const classes = getSkeletonItemClassNames('circle', true)
      expect(classes).toContain('lh-skeleton-item')
      expect(classes).toContain('lh-skeleton-item--circle')
      expect(classes).toContain('lh-skeleton-item--animated')
    })

    it('omits animated class when disabled', () => {
      expect(getSkeletonItemClassNames('text', false)).not.toContain('lh-skeleton-item--animated')
    })
  })

  describe('getSkeletonClassNames', () => {
    it('marks animated container with avatar', () => {
      const classes = getSkeletonClassNames({ animated: true, avatar: true })
      expect(classes).toContain('lh-skeleton')
      expect(classes).toContain('lh-skeleton--animated')
      expect(classes).toContain('lh-skeleton--with-avatar')
    })
  })

  describe('getSkeletonRowWidths', () => {
    it('returns full width rows with a shortened last row', () => {
      expect(getSkeletonRowWidths(3)).toEqual(['100%', '100%', '60%'])
    })

    it('single row is full width', () => {
      expect(getSkeletonRowWidths(1)).toEqual(['100%'])
    })

    it('handles zero rows', () => {
      expect(getSkeletonRowWidths(0)).toEqual([])
    })
  })
})

describe('LhSkeleton accessibility', () => {
  it('hides placeholder content', () => {
    expect(getSkeletonAria()).toEqual({ 'aria-hidden': true })
  })
})