import type { LhUploadFile, LhUploadFileStatus } from './types'

/** 默认大小上限 5MB */
export const LH_UPLOAD_MAX_SIZE = 5 * 1024 * 1024

/** 生成文件 uid */
let uidSeed = 0
export function createUploadUid(): string {
  uidSeed += 1
  return `lh-upload-${Date.now()}-${uidSeed}`
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

/** 校验：超出大小限制 */
export function exceedsMaxSize(file: File, maxSize: number): boolean {
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

/** 校验：扩展名不在允许列表（accept 支持 '.png' 与 'image/*' 两种写法） */
export function isExtensionRejected(fileName: string, accept: string[]): boolean {
  if (accept.length === 0) return false
  const lower = fileName.toLowerCase()
  return !accept.some((pattern) => {
    const rule = pattern.toLowerCase().trim()
    if (rule.startsWith('.')) return lower.endsWith(rule)
    if (rule.endsWith('/*')) return true // MIME 通配在 core 层不做真实类型嗅探，由浏览器 accept 兜底
    return lower.endsWith(`.${rule}`)
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
