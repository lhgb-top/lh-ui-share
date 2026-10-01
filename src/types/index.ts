/**
 * 共享类型聚合（源自 lh-types）
 *
 * `global.d.ts` 与 `theme.ts` 为 ambient 声明，
 * 随 tsconfig include 参与编译，不在此显式导出。
 */
export * from './locale'
// 组件基础属性类型（LhTypes/LhSizes/LhLanguages/LhBaseProps）：供各 UI 库的组件 Props 消费
export * from './components/base'
