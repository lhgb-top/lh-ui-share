import { describe, it, expect } from 'vitest'
import { getAlertClassNames, getAlertRole, getAlertIconName } from '../../../src/core/alert'

describe('Alert Core Logic', () => {
  describe('getAlertClassNames', () => {
    it('returns base and type classes', () => {
      const classes = getAlertClassNames({
        type: 'danger',
        closable: false,
        showIcon: false,
        plain: false,
        withTitle: false,
      })
      expect(classes).toContain('lh-alert')
      expect(classes).toContain('lh-alert--danger')
    })

    it('adds feature classes', () => {
      const classes = getAlertClassNames({
        type: 'info',
        closable: true,
        showIcon: true,
        plain: true,
        withTitle: true,
      })
      expect(classes).toContain('lh-alert--closable')
      expect(classes).toContain('lh-alert--show-icon')
      expect(classes).toContain('lh-alert--plain')
      expect(classes).toContain('lh-alert--with-title')
    })
  })

  describe('getAlertRole', () => {
    it('maps warning and danger to alert (immediate announcement)', () => {
      expect(getAlertRole('warning')).toBe('alert')
      expect(getAlertRole('danger')).toBe('alert')
    })

    it('maps info and success to status (polite announcement)', () => {
      expect(getAlertRole('info')).toBe('status')
      expect(getAlertRole('success')).toBe('status')
    })
  })

  describe('getAlertIconName', () => {
    it('maps each type to an existing icon name', () => {
      expect(getAlertIconName('info')).toBe('info')
      expect(getAlertIconName('success')).toBe('check')
      expect(getAlertIconName('warning')).toBe('warning')
      expect(getAlertIconName('danger')).toBe('error')
    })
  })
})
