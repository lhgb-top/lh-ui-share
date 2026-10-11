---
title: '@lh-ui/share'
description: lh-ui 家族唯一的框架无关共享层 —— core 纯函数 / theme / 样式源
template: splash
hero:
  title: '@lh-ui/share'
  tagline: lh-ui 家族唯一的<b>框架无关共享层</b> —— 56 个 core 组件纯函数、12 个共享内核、国风主题系统、纯 emitter 国际化、58 套组件样式源。一份逻辑，喂给 Vue3 / Vue2 / React / uniapp 全端 UI 库。
  actions:
    - text: 快速开始
      link: /guide/getting-started
      icon: right-arrow
      variant: primary
    - text: 主题预设
      link: /theme/presets
      icon: sun
    - text: GitHub
      link: https://github.com/lhgb-top/lh-ui-share
      icon: github
---

import { Card, CardGrid } from '@astrojs/starlight/components';

<CardGrid cols={3}>
  <Card title="Core 纯函数" icon="code-branch">
    56 个组件的类名计算、状态机、无障碍属性包全部是零依赖纯函数。框架层只管接线，逻辑单源、单测唯一份。
  </Card>
  <Card title="共享内核" icon="puzzle">
    popper 定位引擎、虚拟滚动、焦点圈、键盘导航、sx 样式 props、数值净化——12 个模块直接被各端复用。
  </Card>
  <Card title="国风主题" icon="pencil">
    五个内置预设（青花瓷 / 松花绿 / 朱砂 / 水墨 / 藤黄），CSS 变量 + 暗色 + 花纹系统，AA 对比度脚本把守。
  </Card>
  <Card title="纯 emitter 国际化" icon="translate">
    LhLocale 是纯事件发射器，不携带任何框架响应式；各端用各自的信号机制订阅 version。
  </Card>
  <Card title="样式唯一源" icon="open-book">
    `styles/` 是全家族组件 BEM 样式的唯一源；过渡类名三 mixin 收编 Vue2 / Vue3 / React 差异。
  </Card>
  <Card title="零框架依赖" icon="padlock">
    `external: []` 全量零依赖打包，`verify:dts` 门禁产物里不许出现任何框架导入。
  </Card>
</CardGrid>

## 这份文档是给谁看的

- **各端 UI 库的开发者**（lh-ui-plus / lh-ui-vue2 / lh-ui-react / lh-ui-uniapp）：查每个纯函数的签名、返回值、边界，以及样式令牌怎么覆盖。
- **直接使用 share 的独立开发者**：项目只想要无障碍基线 + 国风主题令牌，不引任何 UI 库。
- **贡献者**：了解目录职责、红线、验证与发版流程。

## 五分钟看懂这个包

```md
- `src/core/<组件>/`     —— 纯函数逻辑（logic.ts / types.ts），零框架导入
- `src/core/shared/`     —— 跨组件共享内核（popper / virtual / sx / keyboard …）
- `src/theme/`           —— 主题 TS 侧：类型 + 五个预设 + 运行时原语
- `styles/`              —— 组件 BEM 样式唯一源 + theme/common/*.scss 令牌
- `src/{constants,locales,types,utils}/` —— 常量 / 语言包 / 类型 / 工具
```

下一步：[快速开始](/guide/getting-started) 装包、引样式；或直接看[包入口与子路径](/guide/exports)搞清怎么按需导入。
