import { describe, expect, it } from 'vitest'
import { getTimelineClassNames, getTimelineItemClassNames, getTimelineSide } from '../../../src/core/timeline'

describe('LhTimeline core', () => {
  it('computes container class names', () => {
    expect(getTimelineClassNames('left')).toEqual(['lh-timeline'])
    expect(getTimelineClassNames('alternate')).toEqual(['lh-timeline', 'lh-timeline--alternate'])
  })

  it('computes item class names', () => {
    expect(
      getTimelineItemClassNames({ type: 'success', hollow: true, side: 'left', isLast: false }),
    ).toEqual(['lh-timeline__item', 'lh-timeline__item--success', 'lh-timeline__item--hollow'])
    expect(
      getTimelineItemClassNames({ type: undefined, hollow: false, side: 'left', isLast: true }),
    ).toEqual(['lh-timeline__item', 'lh-timeline__item--last'])
  })

  it('alternates sides by index', () => {
    expect(getTimelineSide(0)).toBe('left')
    expect(getTimelineSide(1)).toBe('right')
    expect(getTimelineSide(2)).toBe('left')
  })
})
