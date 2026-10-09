import { describe, expect, it } from 'vitest'
import {
  createUploadFile,
  getUploadDropzoneAria,
  getUploadFileAria,
  createUploadUid,
  exceedsMaxCount,
  exceedsMaxSize,
  formatFileSize,
  getUploadClassNames,
  getUploadFileClassNames,
  isFileRejected,
  normalizeUploadAccept,
  patchUploadFile,
  removeUploadFile,
} from '../../../src/core/upload'

const makeFile = (name: string, size: number): File => {
  const file = new File(['x'], name)
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('LhUpload core', () => {
  it('creates an upload record from a File', () => {
    const record = createUploadFile(makeFile('a.png', 100))
    expect(record.name).toBe('a.png')
    expect(record.size).toBe(100)
    expect(record.status).toBe('ready')
    expect(record.percent).toBe(0)
    expect(record.uid).toMatch(/^lh-upload-/)
  })

  it('formats sizes', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(2048)).toBe('2.0 KB')
    expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB')
  })

  it('checks size limits with a non-finite budget treated as unlimited', () => {
    expect(exceedsMaxSize(makeFile('a', 10), 5)).toBe(true)
    expect(exceedsMaxSize(makeFile('a', 5), 5)).toBe(false)
    // NaN 上限不构成限制
    expect(exceedsMaxSize(makeFile('a', 5), NaN)).toBe(false)
    expect(exceedsMaxCount(3, 3)).toBe(true)
    expect(exceedsMaxCount(3, 0)).toBe(false)
  })

  it('matches accept rules by extension, MIME prefix and exact MIME', () => {
    const png = { name: 'a.png', type: 'image/png' }
    const jpg = { name: 'a.jpg', type: 'image/jpeg' }
    // 后缀规则比文件名
    expect(isFileRejected(png, ['.png'])).toBe(false)
    expect(isFileRejected(jpg, ['.png'])).toBe(true)
    // 空 accept 表示不限制
    expect(isFileRejected(jpg, [])).toBe(false)
    // 通配 MIME 比 file.type 前缀（大小写不敏感）
    expect(isFileRejected(png, ['image/*'])).toBe(false)
    expect(isFileRejected(jpg, ['IMAGE/*'])).toBe(false)
    expect(isFileRejected({ name: 'a.txt', type: 'text/plain' }, ['image/*'])).toBe(true)
    // 精确 MIME
    expect(isFileRejected(png, ['image/png'])).toBe(false)
    expect(isFileRejected(jpg, ['image/png'])).toBe(true)
    // 大小写不敏感的文件名后缀
    expect(isFileRejected({ name: 'A.PNG', type: '' }, ['.png'])).toBe(false)
  })

  it('normalizes the accept prop from arrays, comma strings and empty values', () => {
    expect(normalizeUploadAccept(['.png', '.jpg'])).toEqual(['.png', '.jpg'])
    expect(normalizeUploadAccept('.png, .jpg')).toEqual(['.png', '.jpg'])
    expect(normalizeUploadAccept('.png,')).toEqual(['.png'])
    expect(normalizeUploadAccept('')).toEqual([])
    expect(normalizeUploadAccept(undefined)).toEqual([])
    expect(normalizeUploadAccept(null)).toEqual([])
    // 返回副本，避免上游改动影响原数组
    const source = ['.png']
    expect(normalizeUploadAccept(source)).not.toBe(source)
  })

  it('patches and removes records immutably', () => {
    const files = [createUploadFile(makeFile('a', 1), 'u1'), createUploadFile(makeFile('b', 1), 'u2')]
    const patched = patchUploadFile(files, 'u1', { percent: 50, status: 'uploading' })
    expect(patched[0].percent).toBe(50)
    expect(files[0].percent).toBe(0)
    expect(removeUploadFile(files, 'u1').length).toBe(1)
  })

  it('computes class names', () => {
    expect(getUploadClassNames({ dragOver: true, disabled: false })).toEqual([
      'lh-upload',
      'lh-upload--dragover',
    ])
    expect(getUploadFileClassNames('fail')).toEqual(['lh-upload__file', 'lh-upload__file--fail'])
  })

  it('createUploadUid yields unique ids with the default prefix', () => {
    // 旧实现是模块级自增种子 + Date.now()：三库各自打包时
    // 同毫秒会产出同号 uid。新实现用随机源，批量调用必须两两不同
    const ids = new Set(Array.from({ length: 200 }, () => createUploadUid()))
    expect(ids.size).toBe(200)
    for (const id of ids) expect(id).toMatch(/^lh-upload-/)
  })

  it('createUploadUid honors an explicit prefix', () => {
    expect(createUploadUid('custom')).toMatch(/^custom-/)
    // 显式空前缀也允许（调用方自负责唯一性语义）
    expect(createUploadUid('')).toMatch(/^-/)
  })
})

describe('upload accessibility', () => {
  it('links a file item to its status description', () => {
    expect(getUploadFileAria('f1-status')).toEqual({ 'aria-describedby': 'f1-status' })
    expect(getUploadFileAria()).toEqual({})
  })

  it('marks the dropzone as a button', () => {
    expect(getUploadDropzoneAria()).toEqual({ role: 'button' })
    expect(getUploadDropzoneAria(true)).toEqual({ role: 'button', 'aria-disabled': true })
  })
})