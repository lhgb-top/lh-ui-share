// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// 仓库根（docs/ 的上一级）。docs 站以 docs/ 为 Astro root，share 源码在仓库根的 src/ 与 styles/。
const repoRoot = fileURLToPath(new URL('../', import.meta.url));

// 本地联动：把 @lh-ui/share 的子路径导入重定向到本仓源码，改源码即时在 docs 热更新。
// 与家族各 UI 库的 local-share-alias 同语义，但目标就是自己，无需存在性守卫。
const shareAlias = [
  // 样式源：@lh-ui/share/styles/<name> → styles/<name>/index.scss（vite 目录解析到 index）
  // 命中顺序在通用规则之前，避免被 src/ 规则吞掉。
  { find: /^@lh-ui\/share\/styles\/(.+)$/, replacement: resolve(repoRoot, 'styles/$1') },
  // 其余一律落 src/：@lh-ui/share/core/button → src/core/button/index.ts
  { find: /^@lh-ui\/share\/?(.*)$/, replacement: resolve(repoRoot, 'src/$1') },
];

// https://astro.build/config
export default defineConfig({
  site: 'https://www.lhgb.top',
  base: '/lhui/share/',
  root: './',
  srcDir: './src',
  integrations: [
    starlight({
      title: '@lh-ui/share',
      description: 'lh-ui 家族唯一的框架无关共享层 —— core 纯函数 / theme / 样式源',
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
        en: { label: 'English', lang: 'en' },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/lhgb-top/lh-ui-share',
        },
        {
          icon: 'npm',
          label: 'npm',
          href: 'https://www.npmjs.com/package/@lh-ui/share',
        },
      ],
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: '开始',
          items: [
            { label: '项目介绍', link: '/guide/introduction' },
            { label: '快速开始', link: '/guide/getting-started' },
            { label: '包入口与子路径', link: '/guide/exports' },
            { label: '包结构', link: '/guide/structure' },
            { label: '命名约定', link: '/guide/naming' },
            { label: '各端样式注入策略', link: '/guide/injection' },
            { label: '各端如何消费', link: '/guide/consumption' },
            { label: '0.4.0 迁移指南', link: '/guide/migration-04' },
          ],
        },
        {
          label: '共享内核',
          items: [
            { label: '总览', link: '/core/overview' },
            { label: 'sx 样式速写', link: '/core/sx' },
            { label: 'popper 定位引擎', link: '/core/popper' },
            { label: 'virtual 虚拟滚动', link: '/core/virtual' },
            { label: 'keyboard 键盘导航', link: '/core/keyboard' },
            { label: 'focus-trap 焦点管理', link: '/core/focus-trap' },
            { label: 'a11y aria 构建器', link: '/core/a11y' },
            { label: 'date 日期原语', link: '/core/date' },
            { label: 'format 文案插值', link: '/core/format' },
            { label: 'delay 显隐延迟', link: '/core/delay' },
            { label: 'pt 透传合并', link: '/core/pt' },
            { label: 'sanitize 数值净化', link: '/core/sanitize' },
            { label: 'types 共享联合类型', link: '/core/types' },
          ],
        },
        {
          label: '组件',
          collapsed: false,
          items: [
            {
              label: '基础',
              collapsed: true,
              items: [
                { label: 'button 按钮', link: '/components/basic/button' },
                { label: 'icon 图标', link: '/components/basic/icon' },
                { label: 'tag 标签', link: '/components/basic/tag' },
                { label: 'badge 徽标', link: '/components/basic/badge' },
                { label: 'avatar 头像', link: '/components/basic/avatar' },
                { label: 'divider 分割线', link: '/components/basic/divider' },
                { label: 'card 卡片', link: '/components/basic/card' },
                { label: 'empty 空状态', link: '/components/basic/empty' },
                { label: 'skeleton 骨架屏', link: '/components/basic/skeleton' },
                { label: 'spinner 旋转图形', link: '/components/basic/spinner' },
                { label: 'space 间距', link: '/components/basic/space' },
                { label: 'statistic 统计数值', link: '/components/basic/statistic' },
              ],
            },
            {
              label: '表单',
              collapsed: true,
              items: [
                { label: 'input 输入框', link: '/components/form/input' },
                { label: 'input-number 计数器', link: '/components/form/input-number' },
                { label: 'select 选择器', link: '/components/form/select' },
                { label: 'cascader 级联选择', link: '/components/form/cascader' },
                { label: 'checkbox 复选框', link: '/components/form/checkbox' },
                { label: 'radio 单选框', link: '/components/form/radio' },
                { label: 'switch 开关', link: '/components/form/switch' },
                { label: 'slider 滑块', link: '/components/form/slider' },
                { label: 'rate 评分', link: '/components/form/rate' },
                { label: 'segmented 分段控制器', link: '/components/form/segmented' },
                { label: 'time-picker 时间选择', link: '/components/form/time-picker' },
                { label: 'date-picker 日期选择', link: '/components/form/date-picker' },
                { label: 'calendar 日历', link: '/components/form/calendar' },
                { label: 'upload 上传', link: '/components/form/upload' },
                { label: 'transfer 穿梭框', link: '/components/form/transfer' },
                { label: 'form 表单', link: '/components/form/form' },
              ],
            },
            {
              label: '数据',
              collapsed: true,
              items: [
                { label: 'table 表格', link: '/components/data/table' },
                { label: 'pagination 分页', link: '/components/data/pagination' },
                { label: 'tree 树', link: '/components/data/tree' },
                { label: 'descriptions 描述列表', link: '/components/data/descriptions' },
                { label: 'timeline 时间线', link: '/components/data/timeline' },
                { label: 'progress 进度条', link: '/components/data/progress' },
                { label: 'image 图片', link: '/components/data/image' },
                { label: 'collapse 折叠面板', link: '/components/data/collapse' },
              ],
            },
            {
              label: '反馈',
              collapsed: true,
              items: [
                { label: 'dialog 对话框', link: '/components/feedback/dialog' },
                { label: 'drawer 抽屉', link: '/components/feedback/drawer' },
                { label: 'message 消息', link: '/components/feedback/message' },
                { label: 'notification 通知', link: '/components/feedback/notification' },
                { label: 'loading 加载遮罩', link: '/components/feedback/loading' },
                { label: 'tooltip 文字提示', link: '/components/feedback/tooltip' },
                { label: 'popover 弹出层', link: '/components/feedback/popover' },
                { label: 'popconfirm 气泡确认框', link: '/components/feedback/popconfirm' },
                { label: 'alert 警告提示', link: '/components/feedback/alert' },
                { label: 'backtop 回到顶部', link: '/components/feedback/backtop' },
              ],
            },
          ],
        },
        {
          label: '主题系统',
          items: [
            { label: '总览', link: '/theme/overview' },
            { label: '主题预设', link: '/theme/presets' },
            { label: '设计令牌', link: '/theme/tokens' },
            { label: '运行时定制', link: '/theme/customization' },
            { label: '暗色模式', link: '/theme/dark-mode' },
            { label: '国风花纹', link: '/theme/patterns' },
          ],
        },
        {
          label: '参考',
          items: [
            { label: 'locales 国际化', link: '/reference/locales' },
            { label: 'utils 工具函数', link: '/reference/utils' },
            { label: 'constants 常量', link: '/reference/constants' },
            { label: 'types 公共类型', link: '/reference/types' },
            { label: 'styles 样式源', link: '/reference/styles' },
            { label: 'transition-mixins', link: '/reference/transition-mixins' },
          ],
        },
        {
          label: '开发',
          items: [
            { label: '命令一览', link: '/development/commands' },
            { label: '验证体系', link: '/development/verification' },
            { label: '构建与工具脚本', link: '/development/scripts' },
            { label: '发布流程', link: '/development/release' },
            { label: '贡献指南', link: '/development/contribution' },
          ],
        },
      ],
    }),
  ],
  vite: {
    resolve: { alias: shareAlias },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          loadPaths: [resolve(repoRoot, 'node_modules')],
        },
      },
    },
  },
});
