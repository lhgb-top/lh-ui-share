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
