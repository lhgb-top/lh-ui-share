import type { LhFormRule } from './types'
import type { LhAriaAttrs } from '../shared/a11y'

export function getFormFieldValue(model: Record<string, unknown>, prop: string): unknown {
  return prop.split('.').reduce<unknown>((value, key) => {
    if (value && typeof value === 'object') {
      return (value as Record<string, unknown>)[key]
    }
    return undefined
  }, model)
}

/**
 * 值是否为「空」：undefined / null / 空串 / 空数组。
 *
 * 空格串与空对象不算空（空格语义由组件层按需在传入前 trim）。
 */
export function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (value === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

/** type: email 的宽松判定（有且仅有一个 @，两端非空，域名带点） */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** type: url 的宽松判定（http/https 协议 + 非空白余量） */
const URL_RE = /^https?:\/\/\S+$/i

/** 内置规则的兜底文案：UI 层应通过 rule.message 提供业务文案 */
const BUILTIN_FALLBACK_MESSAGES: Record<NonNullable<LhFormRule['type']>, string> = {
  string: 'expected a string',
  number: 'expected a finite number',
  boolean: 'expected a boolean',
  array: 'expected an array',
  email: 'invalid email format',
  url: 'invalid url format',
}

const GENERIC_FALLBACK_MESSAGE = 'invalid value'

function checkType(value: unknown, type: NonNullable<LhFormRule['type']>): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string'
    case 'number':
      return typeof value === 'number' && Number.isFinite(value)
    case 'boolean':
      return typeof value === 'boolean'
    case 'array':
      return Array.isArray(value)
    case 'email':
      return typeof value === 'string' && EMAIL_RE.test(value)
    case 'url':
      return typeof value === 'string' && URL_RE.test(value)
    default:
      return true
  }
}

/**
 * 内置规则（type / pattern / min / max / len）求值，失败返回 rule.message（缺省用英文兜底）
 */
function validateBuiltinRule(rule: LhFormRule, value: unknown): string | undefined {
  const fail = (): string =>
    rule.message !== undefined
      ? rule.message
      : rule.type
        ? BUILTIN_FALLBACK_MESSAGES[rule.type]
        : GENERIC_FALLBACK_MESSAGE

  if (rule.type && !checkType(value, rule.type)) return fail()

  if (rule.pattern) {
    // 正则只对字符串值生效；其它类型交由 type / validator 管
    if (typeof value === 'string') {
      let re: RegExp
      try {
        re = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern
      } catch (error) {
        // 畸形正则是开发者配置错误，不该把 SyntaxError 的信息当成字段错误文案
        // 展示给终端用户；告警开发者并跳过该 pattern，不阻塞用户提交
        if (typeof console !== 'undefined') {
          console.error('[lh-ui/form] 非法的 pattern 规则，已跳过：', rule.pattern, error)
        }
        return undefined
      }
      if (!re.test(value)) return fail()
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    if (rule.min !== undefined && value < rule.min) return fail()
    if (rule.max !== undefined && value > rule.max) return fail()
  } else if (typeof value === 'string' || Array.isArray(value)) {
    const size = value.length
    if (rule.len !== undefined && size !== rule.len) return fail()
    if (rule.min !== undefined && size < rule.min) return fail()
    if (rule.max !== undefined && size > rule.max) return fail()
  }

  return undefined
}

/** 单条规则的求值闭包：内置规则 + 自定义校验器合成 */
type RuleCheck = () => string | undefined | Promise<string | undefined>

function isThenable(value: unknown): value is Promise<string | undefined> {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as { then?: unknown }).then === 'function'
  )
}

/**
 * 从 index 起按序求值：同步规则立即返回首个错误；
 * 遇到异步规则不短路——剩余规则的错误并入同一个 Promise 汇总
 */
function runChecks(checks: RuleCheck[], index: number): string | undefined | Promise<string | undefined> {
  for (let i = index; i < checks.length; i++) {
    let result: string | undefined | Promise<string | undefined>
    try {
      result = checks[i]()
    } catch (error) {
      // 双保险：validator 调用在 check 内部已 try/catch，这里兜住其余意外
      return error instanceof Error ? error.message : String(error)
    }
    if (isThenable(result)) {
      return result.then(
        (error) => {
          if (error) return error
          return runChecks(checks, i + 1)
        },
        // 异步 validator reject 与同步抛错同语义：按校验失败处理（取 error.message），
        // 不穿透为未捕获 rejection——UI 层用 Promise.all 汇总时那会让整次校验静默失败
        (error) => (error instanceof Error ? error.message : String(error)),
      )
    }
    if (result) return result
  }
  return undefined
}

/**
 * 校验单个字段：按规则顺序求值，返回首个错误文案。
 *
 * - 必填且空值 → 返回必填提示；
 * - 非必填且空值 → 跳过全部规则（与主流库约定一致：没填就不报错）；
 * - 内置规则（type / pattern / min / max / len）按序求值；
 * - validator 支持异步：**不短路**——首个 thenable 之后的所有规则仍会求值，
 *   结果并入同一个 Promise 汇总（旧实现会跳过异步规则之后的规则）；
 * - 同步抛错的 validator 按校验失败处理（取 error.message），不穿透为未捕获异常。
 *
 * @returns 同步错误文案、异步错误文案的 Promise、或 undefined（通过）
 */
export function validateFormField(
  value: unknown,
  rules: LhFormRule[] = [],
  model: Record<string, unknown>,
  requiredMessage?: string
): string | undefined | Promise<string | undefined> {
  const empty = isEmptyValue(value)

  // 空值只关心 required：优先取「显式提供了 message 的必填规则」，
  // 否则回退首个必填规则。组件层（form item）在 required 属性为真时会合成
  // 一条无 message 的 { required: true } 规则，若它排在用户带 message 的
  // 规则之前，find 会命中合成规则并回退到通用文案，吞掉用户自定义文案。
  if (empty) {
    const requiredRule =
      rules.find((rule) => rule.required && rule.message !== undefined) ??
      rules.find((rule) => rule.required)
    if (!requiredRule) return undefined
    // 与内置规则同口径：message 显式提供（含空串）即原样使用，仅 undefined 回退通用文案
    return requiredRule.message !== undefined ? requiredRule.message : requiredMessage
  }

  const checks: RuleCheck[] = rules.map((rule) => () => {
    const builtinError = validateBuiltinRule(rule, value)
    if (builtinError) return builtinError
    if (rule.validator) {
      try {
        return rule.validator(value, model)
      } catch (error) {
        // 同步抛错的 validator 按校验失败处理，不穿透为未捕获异常
        return error instanceof Error ? error.message : String(error)
      }
    }
    return undefined
  })

  return runChecks(checks, 0)
}

/**
 * 字段错误提示元素 id：与控件 aria-describedby 指向同一元素
 *
 * @param prop 字段名（表单内唯一）
 */
export function getFormFieldErrorId(prop: string): string {
  return `lh-form-error-${prop}`
}

/**
 * 字段的无障碍属性包：校验失败时把 aria-invalid 与错误提示关联到控件上
 *
 * 调用方通常是 form-item：拿 validateFormField 的错误文案渲染提示元素并绑定其 id，
 * 同时把本属性包 v-bind 到被包裹的控件上，读屏软件即可播报「无效输入，错误是……」。
 *
 * @param prop 字段名
 * @param error 当前错误文案（有值才关联，避免引用空提示元素）
 * @param required 是否必填（输出 aria-required）
 */
export function getFormFieldAria(options: {
  prop: string
  error?: string
  required?: boolean
}): LhAriaAttrs {
  const { prop, error, required } = options
  const attrs: LhAriaAttrs = {}
  if (error) {
    attrs['aria-invalid'] = true
    attrs['aria-describedby'] = getFormFieldErrorId(prop)
  }
  if (required) attrs['aria-required'] = true
  return attrs
}
