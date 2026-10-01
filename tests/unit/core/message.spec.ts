import { describe, expect, it } from 'vitest'
import {
  LH_MESSAGE_DURATION_DEFAULT,
  LH_MESSAGE_MAX_DEFAULT,
  LH_MESSAGE_OFFSET_DEFAULT,
  clampMessageQueue,
  createMessageRecord,
  getMessageClassNames,
  getMessageIconName,
  getMessageRole,
  resolveMessageDuration,
} from '../../../src/core/message'

describe('LhMessage core', () => {
  it('maps semantics to live region roles', () => {
    expect(getMessageRole('info')).toBe('status')
    expect(getMessageRole('success')).toBe('status')
    expect(getMessageRole('loading')).toBe('status')
    expect(getMessageRole('warning')).toBe('alert')
    expect(getMessageRole('danger')).toBe('alert')
    expect(getMessageRole('error')).toBe('alert')
  })

  it('resolves icon names with loading using the spinner instead', () => {
    expect(getMessageIconName('success')).toBe('check')
    expect(getMessageIconName('warning')).toBe('warning')
    expect(getMessageIconName('loading')).toBeNull()
  })

  it('computes item class names', () => {
    expect(getMessageClassNames({ type: 'info', showClose: false })).toEqual([
      'lh-message__item',
      'lh-message__item--info',
    ])
    expect(getMessageClassNames({ type: 'danger', showClose: true })).toEqual([
      'lh-message__item',
      'lh-message__item--danger',
      'lh-message__item--closable',
    ])
  })

  it('resolves durations: loading never auto-closes unless explicit', () => {
    expect(resolveMessageDuration(undefined, 'info')).toBe(LH_MESSAGE_DURATION_DEFAULT)
    expect(resolveMessageDuration(undefined, 'loading')).toBe(0)
    expect(resolveMessageDuration(1000, 'loading')).toBe(1000)
    expect(resolveMessageDuration(0, 'info')).toBe(0)
  })

  it('clamps the queue keeping the newest records and reporting removals', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
    const { kept, removed } = clampMessageQueue(items, LH_MESSAGE_MAX_DEFAULT)
    expect(kept).toBe(items)
    expect(removed).toEqual([])

    const { kept: kept2, removed: removed2 } = clampMessageQueue(items, 2)
    expect(kept2).toEqual([{ id: 3 }, { id: 4 }])
    expect(removed2).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('normalizes user options into queue records', () => {
    const record = createMessageRecord(
      { type: 'success', content: '已保存', showClose: true, sx: undefined },
      7,
    )
    expect(record).toMatchObject({
      id: 7,
      type: 'success',
      content: '已保存',
      duration: LH_MESSAGE_DURATION_DEFAULT,
      offset: LH_MESSAGE_OFFSET_DEFAULT,
      showClose: true,
    })
  })
})
