import { describe, expect, it } from 'vitest'
import {
  createUploadFile,
  exceedsMaxCount,
  exceedsMaxSize,
  formatFileSize,
  getUploadClassNames,
  getUploadFileClassNames,
  isExtensionRejected,
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

  it('checks size and count limits', () => {
    expect(exceedsMaxSize(makeFile('a', 10), 5)).toBe(true)
    expect(exceedsMaxSize(makeFile('a', 5), 5)).toBe(false)
    expect(exceedsMaxCount(3, 3)).toBe(true)
    expect(exceedsMaxCount(3, 0)).toBe(false)
  })

  it('rejects extensions against an accept list', () => {
    expect(isExtensionRejected('a.png', ['.png'])).toBe(false)
    expect(isExtensionRejected('a.jpg', ['.png'])).toBe(true)
    expect(isExtensionRejected('a.jpg', [])).toBe(false)
    expect(isExtensionRejected('a.jpg', ['image/*'])).toBe(false)
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
})
