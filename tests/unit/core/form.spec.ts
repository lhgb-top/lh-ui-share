import { describe, expect, it, vi } from 'vitest'
import {
  getFormFieldValue,
  isEmptyValue,
  validateFormField,
  getFormFieldAria,
  getFormFieldErrorId,
} from '../../../src/core/form'

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

  it('skips later validators when a non-required field is empty', () => {
    // 对齐 Element / Ant 约定：非必填的空值不触发后续 validator
    const seen: string[] = []
    validateFormField('', [{ validator: () => (seen.push('called'), undefined) }], {})
    expect(seen).toEqual([])

    // 有值时 validator 正常执行
    validateFormField('x', [{ validator: () => (seen.push('called'), undefined) }], {})
    expect(seen).toEqual(['called'])
  })

  it('supports async validators by returning a promise', async () => {
    const result = validateFormField(
      'dup-name',
      [{ validator: (value) => Promise.resolve(value === 'dup-name' ? '已存在' : undefined) }],
      {},
    )
    // 同步调用点拿到的是 Promise，交组件层 Promise.all 汇总
    expect(typeof result?.then).toBe('function')
    expect(await result).toBe('已存在')

    const ok = validateFormField(
      'ok-name',
      [{ validator: (value) => Promise.resolve(value === 'dup-name' ? '已存在' : undefined) }],
      {},
    )
    expect(await ok).toBeUndefined()
  })

  it('treats empty arrays as empty values', () => {
    expect(validateFormField([], [{ required: true }], {}, '必填')).toBe('必填')
    // 非必填空数组跳过后续校验
    const seen: string[] = []
    validateFormField([], [{ validator: () => (seen.push('called'), undefined) }], {})
    expect(seen).toEqual([])
  })

  it('isEmptyValue matches the documented contract', () => {
    expect(isEmptyValue(undefined)).toBe(true)
    expect(isEmptyValue(null)).toBe(true)
    expect(isEmptyValue('')).toBe(true)
    expect(isEmptyValue([])).toBe(true)
    expect(isEmptyValue(' ')).toBe(false)
    expect(isEmptyValue({})).toBe(false)
    expect(isEmptyValue(0)).toBe(false)
  })

  it('evaluates builtin type rules', () => {
    expect(validateFormField('x', [{ type: 'number' }], {})).toBe('expected a finite number')
    expect(validateFormField(3.5, [{ type: 'number' }], {})).toBeUndefined()
    expect(validateFormField(NaN, [{ type: 'number' }], {})).toBe('expected a finite number')
    expect(validateFormField('a@b.co', [{ type: 'email' }], {})).toBeUndefined()
    expect(validateFormField('nope', [{ type: 'email', message: '邮箱不合法' }], {})).toBe('邮箱不合法')
    expect(validateFormField([1], [{ type: 'array' }], {})).toBeUndefined()
    expect(validateFormField('https://lh.dev/a', [{ type: 'url' }], {})).toBeUndefined()
    expect(validateFormField('x', [{ type: 'boolean' }], {})).toBe('expected a boolean')
  })

  it('evaluates pattern / min / max / len rules', () => {
    expect(validateFormField('abc', [{ pattern: /^\d+$/, message: '仅数字' }], {})).toBe('仅数字')
    expect(validateFormField('abc', [{ pattern: '^[a-z]+$' }], {})).toBeUndefined()
    // 正则只对字符串生效，非字符串值交给 type / validator
    expect(validateFormField(123, [{ pattern: /^\d+$/ }], {})).toBeUndefined()
    expect(validateFormField(5, [{ min: 10 }], {})).toBe('invalid value')
    expect(validateFormField(15, [{ max: 10 }], {})).toBe('invalid value')
    expect(validateFormField(7, [{ min: 5, max: 10 }], {})).toBeUndefined()
    expect(validateFormField('ab', [{ len: 3 }], {})).toBe('invalid value')
    expect(validateFormField('abc', [{ len: 3 }], {})).toBeUndefined()
    expect(validateFormField('ab', [{ min: 3 }], {})).toBe('invalid value')
    expect(validateFormField([1, 2], [{ max: 1 }], {})).toBe('invalid value')
  })

  it('isolates sync-throwing validators as validation failures', () => {
    const message = validateFormField(
      'x',
      [
        {
          validator: () => {
            throw new Error('校验器崩了')
          },
        },
      ],
      {}
    )
    expect(message).toBe('校验器崩了')
  })

  it('does not short-circuit on async validators', async () => {
    // 回归：旧实现遇到首个 thenable 直接返回，其后的规则（含同步规则）被跳过
    const seen: string[] = []
    const result = validateFormField(
      'x',
      [
        {
          validator: async () => {
            seen.push('async')
            return undefined
          },
        },
        { validator: () => (seen.push('sync-late'), '后面的规则也要执行') },
      ],
      {}
    )
    expect(result).toBeInstanceOf(Promise)
    expect(await result).toBe('后面的规则也要执行')
    expect(seen).toEqual(['async', 'sync-late'])
  })

  it('preserves rule order: the async error wins over later rules', async () => {
    const result = validateFormField(
      'x',
      [
        { validator: async () => '异步错误' },
        { validator: () => '同步错误' },
      ],
      {}
    )
    expect(await result).toBe('异步错误')
  })

  it('treats an async validator rejection like a sync throw', async () => {
    // 回归：旧实现只挂了 onFulfilled，异步校验器 reject 时返回的 Promise 直接 reject，
    // 而 sync 抛错被转成校验失败——同一份 JSDoc 承诺的语义在异步路径不兑现
    const result = validateFormField(
      'x',
      [
        {
          validator: () => Promise.reject(new Error('异步拒绝')),
        },
      ],
      {}
    )
    expect(result).toBeInstanceOf(Promise)
    expect(await result).toBe('异步拒绝')
  })

  it('skips a malformed pattern rule instead of surfacing SyntaxError to users', async () => {
    // 回归：畸形正则曾让 new RegExp 抛 SyntaxError，其信息（如
    // "Invalid regular expression"）被当成字段错误文案展示给终端用户
    const warn = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(validateFormField('x', [{ pattern: '[unclosed' }], {})).toBeUndefined()
      expect(warn).toHaveBeenCalledTimes(1)
      // 开发者告警带规则原文；用户侧不出现任何文案
      expect(warn.mock.calls[0][1]).toBe('[unclosed')
    } finally {
      warn.mockRestore()
    }
  })
})

describe('form accessibility', () => {
  it('derives a stable error element id from the field prop', () => {
    expect(getFormFieldErrorId('username')).toBe('lh-form-error-username')
  })

  it('links the control to its error message only when an error exists', () => {
    expect(getFormFieldAria({ prop: 'username' })).toEqual({})
    expect(getFormFieldAria({ prop: 'username', required: true })).toEqual({ 'aria-required': true })
    expect(getFormFieldAria({ prop: 'username', error: '必填项' })).toEqual({
      'aria-invalid': true,
      'aria-describedby': 'lh-form-error-username',
    })
  })
})