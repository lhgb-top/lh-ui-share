import type { LhUploadFile, LhUploadFileStatus } from './types'
import { ariaDescribedby } from '../shared/a11y'
import type { LhAriaAttrs } from '../shared/a11y'

/** 默认大小上限 5MB */
export const LH_UPLOAD_MAX_SIZE = 5 * 1024 * 1024

/**
 * 生成文件 uid
 *
 * 不再使用模块级自增种子：share 被三库各自打包，同毫秒内不同库实例
 * 会产出同号 uid（Date.now 相同 + 种子各自从 0 起）。改用 crypto.randomUUID，
 * 无该 API 的环境（部分 uniapp 运行时）回退到时间戳 + 随机数。
 */
export function createUploadUid(prefix: string = 'lh-upload'): string {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  return `${prefix}-${random}`
}

/** 人类可读大小 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** 把原生 File 转成上传项 */
export function createUploadFile(file: File, uid: string = createUploadUid()): LhUploadFile {
  return {
    uid,
    name: file.name,
    size: file.size,
    status: 'ready',
    percent: 0,
    raw: file,
  }
}

/** 校验：超出大小限制（maxSize 非有限数时视为无限制） */
export function exceedsMaxSize(file: File, maxSize: number): boolean {
  if (!Number.isFinite(maxSize)) return false
  return file.size > maxSize
}

/** 校验：超出数量限制 */
export function exceedsMaxCount(current: number, limit: number): boolean {
  return limit > 0 && current >= limit
}

/**
 * 归一 accept 输入：数组原样（浅拷贝）、字符串按逗号切分、空值给空数组。
 * 组件入口统一调用，下游（校验 / 原生属性）只面对 string[] 一种形态。
 */
export function normalizeUploadAccept(accept?: string | string[] | null): string[] {
  if (accept == null) return []
  if (Array.isArray(accept)) return [...accept]
  return accept
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}

/**
 * 校验：文件是否被 accept 规则拒绝（支持 '.png' 扩展名、'image/*' 通配、'image/png' 具体 MIME）。
 *
 * MIME 规则必须比对文件的真实 type（`file.type`），文件名无法承载该信息。
 * 注意：原生 `<input accept>` 只是建议性过滤（用户可切到「所有文件」），
 * core 层的校验是最后一道防线，不能对通配规则恒真放行。
 *
 * @returns true 表示文件不在 accept 允许范围内
 */
export function isFileRejected(file: { name: string; type: string }, accept: string[]): boolean {
  if (accept.length === 0) return false
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return !accept.some((pattern) => {
    const rule = pattern.toLowerCase().trim()
    if (rule.startsWith('.')) return name.endsWith(rule)
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1))
    return type === rule
  })
}

/** 更新某个文件项（不可变） */
export function patchUploadFile(
  files: LhUploadFile[],
  uid: string,
  patch: Partial<LhUploadFile>,
): LhUploadFile[] {
  return files.map((file) => (file.uid === uid ? { ...file, ...patch } : file))
}

/** 移除某个文件项 */
export function removeUploadFile(files: LhUploadFile[], uid: string): LhUploadFile[] {
  return files.filter((file) => file.uid !== uid)
}

/** 容器类名 */
export function getUploadClassNames(state: { dragOver: boolean; disabled: boolean }): string[] {
  const classes = ['lh-upload']
  if (state.dragOver) classes.push('lh-upload--dragover')
  if (state.disabled) classes.push('lh-upload--disabled')
  return classes
}

/** 文件项类名 */
export function getUploadFileClassNames(status: LhUploadFileStatus): string[] {
  return ['lh-upload__file', `lh-upload__file--${status}`]
}

/**
 * 上传文件的无障碍属性包：把文件状态描述（上传中 / 成功 / 失败）关联到文件项
 *
 * @param statusId 状态描述元素 id（由 UI 层渲染「上传失败」等提示并绑定）
 */
export function getUploadFileAria(statusId?: string): LhAriaAttrs {
  return ariaDescribedby(statusId)
}

/**
 * 拖拽上传区域的无障碍属性包：role="button"，禁用时输出 aria-disabled
 */
export function getUploadDropzoneAria(disabled?: boolean): LhAriaAttrs {
  const attrs: LhAriaAttrs = { role: 'button' }
  if (disabled) attrs['aria-disabled'] = true
  return attrs
}
