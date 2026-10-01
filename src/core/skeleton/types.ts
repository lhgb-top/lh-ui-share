/** 骨架占位块形状 */
export type LhSkeletonVariant = 'text' | 'rect' | 'circle'

/** 骨架屏状态（类名计算入参） */
export interface LhSkeletonState {
  animated: boolean
  avatar: boolean
}
