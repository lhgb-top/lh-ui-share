import { describe, expect, it } from 'vitest'
import { getFormFieldValue, validateFormField } from '../../../src/core/form'

describe('form/core/logic', () => {
  it('reads nested field values', () => {
    expect(getFormFieldValue({ user: { name: 'Lin' } }, 'user.name')).toBe('Lin')
    expect(getFormFieldValue({ user: {} }, 'user.name')).toBeUndefined()
  })

  it('validates required fields', () => {
    // core 层不含文案：必填兜底文案由组件层传入（i18n 键 form.required）
    expect(validateFormField('', [{ required: true }], {})).toBeUndefined()
    expect(validateFormField('', [{ required: true }], {}, '此项为必填')).toBe('此项为必填')
    expect(validateFormField('ok', [{ required: true }], {})).toBeUndefined()
  })

  it('prefers the rule message over the passed-in default', () => {
    expect(validateFormField('', [{ required: true, message: '必填' }], {}, '兜底')).toBe('必填')
  })

  it('uses custom validation messages', () => {
    const message = validateFormField(
      'short',
      [{ validator: (value) => String(value).length < 8 ? 'Too short' : undefined }],
      {},
    )
    expect(message).toBe('Too short')
  })
})
