/** 文件项状态 */
export type LhUploadFileStatus = 'ready' | 'uploading' | 'success' | 'fail'

/** 上传文件项 */
export interface LhUploadFile {
  /** 唯一标识（内部生成或用户提供） */
  uid: string
  /** 文件名 */
  name: string
  /** 字节大小 */
  size: number
  /** 状态 */
  status: LhUploadFileStatus
  /** 上传进度 0-100 */
  percent: number
  /** 服务端返回地址（成功时） */
  url?: string
  /** 失败原因 */
  error?: string
  /** 原始 File 对象 */
  raw?: File
}

/** 上传请求函数签名（由使用方提供，库不内置 HTTP 客户端） */
export type LhUploadRequest = (options: {
  file: File
  onProgress: (percent: number) => void
}) => Promise<{ url?: string }>
