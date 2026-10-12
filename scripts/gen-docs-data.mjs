#!/usr/bin/env node
/**
 * 生成文档站数据 —— docs/src/data/{tokens,icons,classes}.json
 *
 * 这是 docs 基建脚本：把 styles/ 与 src/core/icon 里的**结构化数据**抽成 JSON，
 * 供 TokenTable / IconGrid 等展示组件消费。它不生成任何组件页散文
 * （58 个组件页一律人工撰写），只解决「令牌/图标/类名清单手写不现实」的问题。
 *
 * 数据源（均为事实源，与 verify:styles 同一份）：
 * - styles/theme/common/var.scss      明色 CSS 变量层（:root）
 * - styles/theme/common/var-dark.scss 暗色 CSS 变量层（[data-theme='dark']）
 * - styles/theme/common/variables.scss SCSS 变量层（$lh-*，!default 可覆盖）
 * - src/core/icon/svgs.ts              33 个内置图标的 path
 * - styles/<name>/index.scss           58 个组件的 BEM 类名（经 sass 编译展平嵌套）
 *
 * 用法：pnpm docs:data
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataDir = resolve(root, 'docs/src/data');
const stylesDir = resolve(root, 'styles');
const nodeModules = resolve(root, 'node_modules');

/** 从 :root / [data-theme] 块里抽 `--lh-xxx: value;` 声明 */
function parseCssVars(file) {
  const text = readFileSync(file, 'utf8');
  const out = [];
  const re = /^\s*(--lh-[A-Za-z0-9_-]+)\s*:\s*([^;]+);/gm;
  let m;
  while ((m = re.exec(text))) {
    const raw = m[2].trim();
    const noteMatch = /\/\*\s*(.*?)\s*\*\//.exec(raw);
    out.push({
      name: m[1],
      // 去掉行级注释（如 `/* no-fallback */`），注释单独存字段
      value: raw.replace(/\/\*.*?\*\//g, '').trim(),
      note: noteMatch ? noteMatch[1].trim() : '',
    });
  }
  return out;
}

/** 从 variables.scss 抽 `$lh-xxx: value !default;` */
function parseScssVars(file) {
  const text = readFileSync(file, 'utf8');
  const out = [];
  const re = /^\s*(\$lh-[A-Za-z0-9_-]+)\s*:\s*([^;]+?)(\s*!default)?\s*;/gm;
  let m;
  while ((m = re.exec(text))) {
    out.push({ name: m[1], value: m[2].trim(), overridable: Boolean(m[3]) });
  }
  return out;
}

/** 从 svgs.ts 抽图标名、path 与上方注释（中文 display name） */
function parseIcons(file) {
  const text = readFileSync(file, 'utf8');
  const out = [];
  const lines = text.split(/\r?\n/);
  let comment = '';
  const entryRe = /^\s*(?:'([^']+)'|([A-Za-z0-9_-]+))\s*:\s*'([^']*)',?\s*(?:\/\/\s*(.*))?$/;
  for (const line of lines) {
    const cm = /^\s*\/\/\s*(.*)$/.exec(line);
    if (cm) {
      comment = cm[1].trim();
      continue;
    }
    const em = entryRe.exec(line);
    if (em) {
      out.push({
        name: em[1] ?? em[2],
        path: em[3],
        // 行尾注释优先，否则取上方行注释
        label: (em[4] ?? comment).trim(),
      });
      comment = '';
    } else if (line.trim() && !/^[A-Za-z]/.test(line.trim())) {
      // 遇到非注释非条目的内容行，重置注释上下文
      comment = '';
    }
  }
  return out;
}

/** 按语义域给令牌分组，供 TokenTable 分节展示 */
function groupOf(name) {
  const n = name;
  if (n.startsWith('--lh-primary') || n.startsWith('--lh-color-')) return '主色与衍生语义';
  if (/^--lh-(success|warning|danger|error|info)-/.test(n)) return '功能色';
  if (/^--lh-(gold|vermilion|jade)-/.test(n) || n === '--lh-decoration-color') return '国风装饰色';
  if (n.startsWith('--lh-text-')) return '文本';
  if (n.startsWith('--lh-border-color-')) return '边框';
  if (n.startsWith('--lh-border-radius-')) return '圆角';
  if (n.startsWith('--lh-bg-')) return '背景';
  if (n.startsWith('--lh-box-shadow-')) return '阴影';
  if (n.startsWith('--lh-font-')) return '字体';
  if (n.startsWith('--lh-spacing-')) return '间距';
  if (n.startsWith('--lh-z-index-')) return '层级';
  if (n.startsWith('--lh-transition-')) return '过渡';
  if (n.startsWith('--lh-disabled-')) return '禁用态';
  if (n.startsWith('--lh-focus-')) return '无障碍焦点环';
  // 状态令牌：跨组件共用的交互态语义色
  if (n === '--lh-hover-bg-color' || n === '--lh-selected-color') return '状态';
  if (n.startsWith('--lh-pattern-') || n.startsWith('--lh-bg-pattern')) return '花纹系统';
  // 组件级令牌：--lh-<component>-<part>
  const parts = n.slice('--lh-'.length).split('-');
  if (parts.length > 1) return `组件级 · ${parts[0]}`;
  return '其他';
}

function isColorLike(value) {
  return /^#([0-9a-fA-F]{3,8})$/.test(value) || /^rgba?\(/.test(value) || /^hsla?\(/.test(value);
}

/** 编译单个组件 scss，从产物 CSS 抽展平后的 BEM 类名 */
function extractClasses(name) {
  const entry = resolve(stylesDir, name, 'index.scss');
  const result = sass.compile(entry, {
    loadPaths: [stylesDir, nodeModules],
    quietDeps: true,
  });
  const tokens = new Set();
  const re = /\.lh-[A-Za-z0-9_-]+/g;
  let m;
  while ((m = re.exec(result.css))) tokens.add(m[0]);
  return [...tokens].sort();
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function main() {
  const light = parseCssVars(resolve(stylesDir, 'theme/common/var.scss'));
  const dark = parseCssVars(resolve(stylesDir, 'theme/common/var-dark.scss'));
  const scssVars = parseScssVars(resolve(stylesDir, 'theme/common/variables.scss'));
  const icons = parseIcons(resolve(root, 'src/core/icon/svgs.ts'));

  const componentDirs = readdirSync(stylesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'theme')
    .map((d) => d.name)
    .filter((name) => existsSync(resolve(stylesDir, name, 'index.scss')))
    .sort();

  const classes = {};
  for (const name of componentDirs) classes[name] = extractClasses(name);

  // 数量断言：与既有审计口径不符即失败，避免数据静默漂移
  const expect = { light: 190, dark: 118, scssVars: 188, icons: 37, components: 58 };
  if (light.length !== expect.light) fail(`明色令牌 ${light.length} ≠ ${expect.light}`);
  if (dark.length !== expect.dark) fail(`暗色令牌 ${dark.length} ≠ ${expect.dark}`);
  if (scssVars.length !== expect.scssVars) fail(`SCSS 变量 ${scssVars.length} ≠ ${expect.scssVars}`);
  if (icons.length !== expect.icons) fail(`图标 ${icons.length} ≠ ${expect.icons}`);
  if (componentDirs.length !== expect.components)
    fail(`组件目录 ${componentDirs.length} ≠ ${expect.components}`);

  // 合并明/暗/可覆盖为单表
  const scssByName = new Map(scssVars.map((v) => [v.name, v]));
  const darkByName = new Map(dark.map((v) => [v.name, v]));
  const tokens = light.map((v) => {
    // 值形如 #{$lh-primary} → 编译期烤死的 SCSS 变量（# 在正则里非元字符，无需转义）
    const baked = /^#\{(\$lh-[A-Za-z0-9_-]+)\}$/.exec(v.value);
    const scssVar = baked ? baked[1] : '';
    const d = darkByName.get(v.name);
    return {
      name: v.name,
      light: v.value,
      dark: d ? d.value : '',
      note: v.note || d?.note || '',
      group: groupOf(v.name),
      color: isColorLike(v.value.startsWith('#{') ? '' : v.value),
      // 可覆盖：由 !default 的 SCSS 变量插值而来，或运行时 var() 链
      scssVar,
      overridable: scssVar ? Boolean(scssByName.get(scssVar)?.overridable) : true,
    };
  });

  mkdirSync(dataDir, { recursive: true });
  writeFileSync(resolve(dataDir, 'tokens.json'), JSON.stringify(tokens, null, 2) + '\n');
  writeFileSync(resolve(dataDir, 'icons.json'), JSON.stringify(icons, null, 2) + '\n');
  writeFileSync(resolve(dataDir, 'classes.json'), JSON.stringify(classes, null, 2) + '\n');

  const groups = [...new Set(tokens.map((t) => t.group))];
  console.log(
    [
      `✓ 令牌 ${tokens.length} 条（${groups.length} 个分组：${groups.join('、')}）`,
      `  ├ 明色 ${light.length} / 暗色 ${dark.length} / SCSS 变量 ${scssVars.length}`,
      `✓ 图标 ${icons.length} 个`,
      `✓ 组件类名 ${componentDirs.length} 份`,
    ].join('\n'),
  );
}

main();
