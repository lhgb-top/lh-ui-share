# @lh-ui/share

## 0.4.0

### Minor Changes

- c873c82: # 高度令牌专项：统一控件高度 + 居中体系收尾

  新增 `--lh-control-height-{mini,small,medium,large,x-large}` 令牌（`theme/common/variables.scss` + `var.scss`，
  语义为控件**外高 border-box**），全部表单控件改引令牌，同表单混排时垂直中心与基线对齐。

  ## 破坏性变化（视觉）

  此前多数控件未声明 `box-sizing: border-box`，`min-height`/子元素高度并不等于外高；本次统一按外高对齐，下列控件实际渲染高度**降低**：

  - **input**：由 padding 派生改为固定高度，各档 mini 28→20、small 32→24、medium 39→32、large 50→40
  - **cascader**：42→32（原 `min-height: 32px` 被 padding 4px×2 + 边框 2px 顶到 42px，"与 select 同高"此前未兑现）
  - **tree-select**：44→32（同上，padding 5px×2 + 边框 2px）
  - **input-number**：small 30→24（边框在根元素，子元素高度改 `令牌 - 2px`，外高才等于令牌）
  - **date-picker / time-picker**：约 35→32（垂直 padding 8px→6px，由 `min-height` 兜底到令牌）
  - **input has-label**：单行输入框移除 `--has-label` 的 `padding-top: 16px`（改固定高度后不再需要，否则带 label 的输入框会比令牌高 16px）；textarea 分支保留

  ## 非破坏性变化
  - button / select medium 已在本次前置改动中改引令牌，select 的 small / large 补齐
  - checkbox 对勾与 indeterminate 横杠由固定 `top/left` 改为 `50%` 居中（与盒子尺寸解耦）
  - switch 的 loading 指示器由绝对定位 + `translate(-50%,-50%)` 改为 `__core` 的 flex 居中，keyframes 只留 `rotate(360deg)`，消除 base 与 keyframes 的重复硬编码
  - input 的四个零引用死变量 `$lh-input-height*` 删除

  ## 配套
  - docs 令牌页更新：组件令牌示例改用真实存在的 `--lh-switch-knob-color`；"已知令牌缺口"清掉本次已修项
  - customization 页的 componentTheme 示例改为有效键 `control-height-medium`（原 `control-height` 无组件消费）

  ## 仍不在本次范围
  - spinner 与 icon 同名尺寸档位不一致（small 16 vs 14 等）：改任一侧波及全库，触发条件为同槽位混用的视觉投诉，届时单独立项
  - size 档位不齐（select/switch 仅 3 档、date/time validator 收窄、tree-select/rate/segmented/pagination 无 size）：属 API 层改动，与高度令牌解耦

- c873c82: # divider 竖向支持文案

  `hasContent` 在四端胶水层此前被锁死为 `direction === 'horizontal' && 有子节点`，导致
  `needsAriaOrientation(direction, hasContent)` 要求的「有文案且竖向」恒不可达，
  `aria-orientation="vertical"` 从未被输出。本次让竖向分割线与横向对齐，支持默认插槽文案：

  - `getDividerClassNames`：`--label-left/center/right` 是横向语义，竖向文案恒居中，
    只在横向产出该修饰类（竖向 `hasContent: true` 仍产出 `--with-text`）。
  - `styles/divider/index.scss`：新增 `.lh-divider--vertical.lh-divider--with-text` 纵向
    flex 布局（线段在文案上下，几何相对横向整体反转），含虚线变体的纵向渐变。
  - `needsAriaOrientation` 不变——现在可达，且与 APG 语义一致（separator 默认横向，竖向需声明）。

  各 UI 库（plus / vue2 / react / uniapp）同步放开 `hasContent` 的横向门控，竖向带文案时
  输出 `role="separator"` + `aria-orientation="vertical"`。

- 5374698: # 文档站（Astro Starlight，中英双语）

  新增独立文档站，作为本包的「开发者电子说明书」：部署在 <https://www.lhgb.top/lhui/share/>。

  ## 覆盖范围
  - **指南**：项目介绍、快速开始、包入口与子路径（77 个 exports 键全表）、包结构、
    命名约定、各端样式注入策略、各端如何消费（Vue3 / Vue2 / React / uniapp 四端接线样例）、
    0.4.0 迁移指南。
  - **组件 API（56 页）**：每个 core 组件一页，含定位、何时使用、导入方式、设计意图、
    函数表（签名 + 入参 + 返回值 + 边界）、类型定义、无障碍、使用示例、样式与令牌、注意事项。
  - **共享内核（12 页）**：sx / pt / popper / virtual / keyboard / focus-trap / a11y /
    date / format / delay / sanitize / types。
  - **主题系统（6 页）**：总览、预设、令牌、运行时定制、暗色模式、花纹。
  - **参考（6 页）**与**开发（5 页）**：locales / utils / constants / types / styles /
    transition mixin；命令、验证、脚本、发版、贡献指南。

  ## 可交互试运行

  每个组件页末尾的 `<FnPlayground>` 直接调用真实 core 纯函数（构建时把模块打成
  可执行签名源码），改入参即时看返回值——文档里的每个示例值都在构建期对照源码核对过。

  ## 双语

  中文为主源，`src/content/docs/en/` 镜像全部页面；Starlight `locales` 配 `en` 子路径，
  未翻译页面自动回退到中文内容 + 英文外壳。

  ## 其他
  - `pnpm docs:build` 加入 `.github/workflows/ci.yml` 门禁。
  - README 中英双版本补文档站链接，英文版顺带修正滞后事实（组件数 55 → 56、
    共享内核 10 → 12、`THEME_PRESETS` → `LH_THEME_PRESETS`、补 56 / 58 计数口径说明）。

- c873c82: 命名规范收敛：非第三方公共符号补齐 `LH` 前缀（breaking rename）

  与 plus 仓 `docs/project/development-guide.md` 的家族命名规范对齐：反域名根 `top.lhgb`，
  JS / npm 端包名维持 `@lh-ui/*`（npm 不允许点号），非第三方符号必须带 `LH` 前缀。
  share 仓此前未跟进，本次补齐自己这一侧。规范已写入本仓 `AGENTS.md`「命名规范」小节。

  **类型 / 接口（`LhXxx`）**

  - `ThemePreset` → `LhThemePreset`、`ThemePresetName` → `LhThemePresetName`、
    `ThemeVars` → `LhThemeVars`（`src/theme/types.ts`）
  - `SxProps` → `LhSxProps`（`core/shared/sx`，下游 plus / vue2 / uniapp 大量引用）
  - `DOMRectLike` → `LhDOMRectLike`、`ComputePositionOptions` → `LhComputePositionOptions`、
    `PopperPosition` → `LhPopperPosition`（`core/shared/popper`）
  - `PtAttrs` → `LhPtAttrs`、`SanitizeNumberOptions` → `LhSanitizeNumberOptions`、
    `VirtualRange` → `LhVirtualRange`、`AxisRange` → `LhAxisRange`（`core/shared`）
  - `LocalePath` → `LhLocalePath`（`locales`）、`Leaves` → `LhLeaves`、
    `LocaleOptions` → `LhLocaleOptions`（`types/locale`）

  **常量（`LH_<模块>_<概念>`，默认值以 `DEFAULT` 作后缀）**

  - `DEFAULT_THEME` → `LH_THEME_DEFAULT`（`core/config`）
  - `DEFAULT_DRAWER_DIRECTION` → `LH_DRAWER_DIRECTION_DEFAULT`、
    `DEFAULT_DRAWER_SIZE` → `LH_DRAWER_SIZE_DEFAULT`（`core/drawer`）
  - `DEFAULT_DROPDOWN_PLACEMENT` → `LH_DROPDOWN_PLACEMENT_DEFAULT`、
    `DROPDOWN_TRIGGERS` → `LH_DROPDOWN_TRIGGERS`（`core/dropdown`）
  - `DEFAULT_POPCONFIRM_TYPE` → `LH_POPCONFIRM_TYPE_DEFAULT`、
    `DEFAULT_POPCONFIRM_PLACEMENT` → `LH_POPCONFIRM_PLACEMENT_DEFAULT`（`core/popconfirm`）
  - `POPOVER_TRIGGERS` → `LH_POPOVER_TRIGGERS`、
    `DEFAULT_POPOVER_PLACEMENT` → `LH_POPOVER_PLACEMENT_DEFAULT`（`core/popover`）
  - `THEME_PRESETS` → `LH_THEME_PRESETS`、
    `PRESET_THEME_STYLE_ID` → `LH_PRESET_THEME_STYLE_ID`、
    预设对象 `cerblue` / `songhua` / `zhusha` / `shuimo` / `golden` →
    `LhCerblue` / `LhSonghua` / `LhZhusha` / `LhShuimo` / `LhGolden`（`theme`）

  **不改（豁免，理由见 AGENTS.md「命名规范 · 豁免登记」）**

  - 语言包导出 `zhCN` / `enUS`——标准 locale 命名，且是三个 UI 库的公开 API。
  - 主题预设名的**字符串值**（`name: 'cerblue'` 等）——用户在 ConfigProvider `theme`
    里写的配置值，改了破坏全部下游用户配置；只有 TS 标识符加前缀。
  - 函数名（`getThemeVars` / `sxToStyle` 等）——本次只收敛常量 / 类型 / 接口 / 类。

  **迁移**：全是标识符级机械替换。各 UI 库（plus / vue2 / uniapp）已同步改名，本地联动
  即时生效；独立用户请按上方映射改 import。

- c873c82: # 本地联动 + 样式治理 + 主题审计

  ## 新增（样式源）
  - **`styles/index.scss` 全量聚合**：`@use 'theme/index.scss'` + 全部组件样式，
    由 `scripts/build-styles.mjs` 按组件清单生成。供各端 docs / dev 沙箱一行引入全量样式，
    也作为主题定制台的导出基础。`package.json` exports 同步新增 `"./styles/index.scss"`
    （置于 `./styles/*` 通配之前，精确优先），`files` 已含 `styles`——这是各端单仓 clone
    回退 npm 包时解析 `@lh-ui/share/styles/index.scss` 的必要条件，随本次发版进入 npm。
    `verify:styles` 新增「聚合与组件目录一致」检查。
  - **过渡类名 mixin**（`styles/theme/common/transition.scss`）：
    `lh-enter-both` / `lh-leave-both` / `lh-transition-ends`，内部双写 `-enter` 与
    `-enter-from`（及 leave 对），收编此前散在 16 个组件里逐文件手写的过渡双份
    （dialog / drawer / select / cascader / tree-select / date-picker / time-picker /
    notification / menu / dropdown / table / popover / popconfirm / tooltip / message / backtop）。
    编译产物等价，SCSS 源码消费方改用 `@include`，`verify:styles` 禁止组件再手写
    `-enter-from` / `-leave-from`。mixin 内的 `if()` 内置函数已改为 `@if` 赋值，
    消除 Dart Sass `[if-function]` 弃用警告。
  - **`styles/index.scss` 聚合命名空间**：每条 `@use` 改为 `as <组件名>` 显式命名空间，
    否则 59 条 `@use '<name>/index'` 的默认命名空间都叫 `index`，Sass modern API 下
    直接 `There's already a module with namespace "index"` 编译失败。生成器同步修改。
  - **暗色令牌缺口补齐**：审计全部组件引用的 `--lh-*` 令牌，补上 `var-dark.scss` 缺失的
    暗色覆盖（共 12 处），「所有组件默认支持暗色与亮色」从约定变成可验证——
    `verify:styles` 新增「组件引用的令牌在明/暗都有定义」检查。
  - **`/* hairline */` 标记审计**：全部 1px 边框规则补上行级标记（65 处），
    为未来 uniapp 的 px→rpx 注入留 sanctioned seam；`verify:styles` 新增「细边框有标记」检查。

  ## 开发体验（不发版，scripts 不在 files 内）
  - **`tsconfig.build.json` 开 `declarationMap`**：各 UI 库编辑器可从 d.ts 跳回 share 源码。
  - **`verify:theme`**：对比度自查脚本（按真实消费配对复算每个预设的 AA 对比度），新预设门禁。
  - **`verify:versions`**（`scripts/check-version-sync.mjs`）：家族布局下检查各 UI 库的
    `@lh-ui/share` 依赖范围是否覆盖 share 当前版本，并拦截已废止的 `link:` / `file:` 联调形态。

  ## 约定更新（AGENTS.md）

  新增「本地联动」章节（带存在性守卫的 vite alias 机制、CI 不受影响、npm 包定位调整为
  服务终端用户独立引入）与「注入契约」章节（两端 dev 注入方式、产物落位、`./style/*`
  子路径形态差异表，明确「注入分散、内容单源」）。

  > 发版顺序：share 先发，各 UI 库随后 `pnpm up @lh-ui/share` 回归（本次为 `^0.4.0`）。

- c873c82: 三库审计修复批次（2026-10 审计报告 S-02 ~ S-15 / D-07 收尾）：

  **修复**

  - **affix**：`isAffixFixed` 底部吸附判定引入视口高度（新增第 4 参数），修复 offsetBottom 模式几乎恒固定的功能错误；同步修正测试断言与两库调用点
  - **statistic**：`safePrecision` 下沉至 `core/shared/sanitize` 并与 input-number 共用，precision 超界/负数不再抛 RangeError
  - **space**：预设档位改引用实际注册的令牌（small→`--lh-spacing-sm` / medium→`--lh-spacing-base` / large→`--lh-spacing-xl`），JS 与 SCSS 兜底值对齐，用户定制 `--lh-spacing-*` 不再静默失效
  - **dialog**：遮罩硬编码 rgba 换 `var(--lh-bg-color-overlay, …)`，暗色正常翻转；Esc 关闭默认值对齐 drawer（默认 true）
  - **image**：注册 `--lh-image-viewer-mask` 语义令牌（明/暗两套），verify:styles 门禁由红转绿（D-07 收尾）
  - **on-primary 迁移收尾**：badge / button / steps / date-picker 约 15 处写死 `#fff` 换 `var(--lh-color-on-primary, #fff)`，浅主色预设对比度达标
  - **button**：plain 变体烤死主色 rgba 换 `color-mix()` 派生；`@use` 语句丢空格笔误还原
  - **table**：`buildHeaderCells` 组列跨度改为递归实际发射叶子数，DAG 共享列不再与 `flattenLeafColumns` 错位
  - **grid**：col 定位起点随跨度钳制在 24 列坐标系内，越界组合不再生成隐式轨道撑破容器
  - **popper**：安全网双向钳制，flip/shift 关闭时超宽弹出层不再从视口高侧整体溢出
  - **transfer**：移动键集合运算由 O(n²) 降为 Set
  - **form**：required 规则的显式空串 message 按内置规则同口径原样使用
  - **utils**：throttle 补尾沿执行与 cancel；debounce 补 cancel / flush
  - **backtop / loading**：补 SSR 环境守卫（与 popper / focus-trap 风格一致）
  - **avatar**：头像字按码点提取，emoji 等增补平面字符不再截半
  - **导出面**：新增 `./package.json` 导出；移除空文件 `src/types/components/utils.ts`；`grid-demo-cell` 文档演示样式迁出组件样式源（改由 plus 文档站自定义样式承载）

### Patch Changes

- c873c82: hairline 规范随 uniapp v3 px 直出废止（bugfix-log D-01 / D-02 / D-05）：

  - `scripts/verify-styles.mjs` 移除第 6 项「1px 细边框必须带 `/* hairline */` 行级标记」校验（七项→六项），头部注释与尾部通过信息同步
  - `AGENTS.md` 红线第 4 条废止：hairline 标记原供 uniapp 的 px→rpx 转译跳过 1px 声明，v3 不再转译即失去用途；`styles/` 内既有的 65 处标记保留为普通注释，新增 1px 边框无需再标记
  - `README.md` 组件计数「55 个」改为「56 个」并新增计数口径说明：`src/core/config/` 与 `styles/config-provider/` 是同一组件（目录名不一致），`styles/layout` / `styles/tree-select` 两个组件无 core 纯函数层（逻辑仍在各 UI 库），故 core 计 56、styles 计 58

  纯治理性改动（脚本门禁 + 文档），不改变运行时产物；`pnpm verify:styles` 实跑通过（六项、67 个 scss 文件）。

- c873c82: # 补齐 divider borderStyle 单测

  迁移核对 plus 的 `tests/unit/core/` 与本仓库的 `tests/unit/core/` 时发现：`getDividerClassNames`
  的 `borderStyle` 优先级逻辑（显式 `borderStyle` 压过 `dashed` prop、`dotted` 修饰类）在 plus 侧有
  3 个用例，本仓库此前缺测。逻辑本身已随迁移完整保留，本次只补用例，无运行时改动：

  - `adds dashed class from borderStyle even when dashed is false`
  - `adds dotted class from borderStyle`
  - `prefers borderStyle over the dashed prop`

  背景：plus 迁移到消费 `@lh-ui/share` 后会删除自身的 `tests/unit/core/`（core 单测唯一一份在本仓库），
  补齐后 coverage 不回退。

- 9e21865: # 拆除 date-picker 循环依赖，修正 notification 的类型值导入

  - `core/date-picker`：`formatDate` / `parseDate` 下沉到共享内核 `core/shared/date`，
    `adapter.ts` 改为直接依赖内核，不再反向 import `logic.ts`。此前
    `logic ↔ adapter` 的二元值环会在下游（如 lh-ui-plus 的 UMD 全量打包）触发
    Rollup 循环依赖告警；拆环后只剩 `logic → adapter` 单向。
    `@lh-ui/share/core/date-picker` 的导出面一字不变（formatDate / parseDate 由
    logic.ts 按原路径转发）。
  - `core/notification`：`LhIconName` 只用于类型位置，原值导入会把 `icon/svgs.ts`
    的大对象打进 notification 产物 chunk，改为 `import type`。

- c873c82: GUI 回归测试发现的缺陷修复（share 侧逻辑/样式/语言包，随 share 发版对 @lh-ui/vue3 生效）。

  - **Form 必填文案优先级**（BUG-02）：`validateFormField` 在空值分支用
    `rules.find((rule) => rule.required)` 取首个必填规则。组件层在 `required` 为真时会合成一条
    无 `message` 的 `{ required: true }` 规则并排在用户规则之前，`find` 命中合成规则后回退通用文案，
    吞掉用户自定义 `message`。现改为先取「显式提供了 message 的必填规则」，取不到再回退首个必填规则；
    `message` 显式提供（含空串）仍原样使用，仅 `undefined` 回退通用文案。
  - **深主色预设暗色提亮**（BUG-07）：水墨（`#2C2C2C`）等深主色预设切暗色后，主色对暗色页面底
    （`#1A1A2E`，与 `var-dark.scss` 同源）对比度不足 3:1，主要按钮近乎不可见。新增
    `buildPresetDarkVars(vars)`：在既有 `primary-color-bg` / `selected-color` 两条暗色覆盖之外，
    按 WCAG 相对亮度判定，主色对暗底对比度低于 3:1 时追加
    `--lh-primary-color: color-mix(in srgb, <主色字面值> 55%, #fff)`（字面值代入，避免 CSS 自引用）
    及配套 hover/active，并改用墨字 `#101410` 保证按钮文字对比度。浅主色预设（松花绿/藤黄）不动。
    `buildPresetStyleText` 与 docs 主题台的预览区都调用同一函数，导出文件与预览一致。
  - **Calendar 面板标题 locale 化**（F-03）：新增 `datepicker.panelTitle` 模板，
    中文 `'{year}年{month}'`（→「2026年10月」）、英文 `'{month} {year}'`（→「Oct 2026」），
    月份名复用既有 `month1~12`，组件层不再硬编码中文标题格式。
  - **花纹背景消费面**（F-12）：`bg-pattern` 令牌原本只有 button 消费，card / dialog / drawer /
    dropdown / icon / input / popconfirm / popover / steps / tooltip 十个组件的根容器补上
    `background-image: var(--lh-bg-pattern, none)` 及 blend-mode / repeat / size 四件套，
    默认仍为 `none`，仅在用户显式配 `bg-pattern` 且组件在 `patternComponents` 白名单内时生效。
  - **Table 表头横向滚动**（BUG-04 配套）：`.lh-table__header` 加 `overflow-x: auto`，
    滚动条隐藏（`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`），
    横向滚动只由表体那一根承担，配合组件层的 scrollLeft 双向同步。

- c873c82: verify:theme 在 Windows 上无法运行：动态 `import()` 传的是 Windows 绝对路径
  （如 `D:\...\es\theme\index.js`），Node 的 ESM 加载器只接受 `file://` URL，
  直接抛 `ERR_UNSUPPORTED_ESM_URL_SCHEME`（CI 跑 ubuntu 不触发，本地发版必踩）。
  改用 `pathToFileURL(entry).href` 再 import。纯脚本修复，不改变运行时产物。
- c873c82: # 表单控件居中与间距修复（cascader/button/switch/date/time-picker/pagination/spinner）

  全面排查各组件「图标在输入框中垂直居中」与「旋转动画居中」时定位出一批 scss 层缺陷，本次统一修复。

  > 与「高度令牌专项」（见 `control-height-tokens.md`）同批落地、相互配套：本文件记录**居中与间距**侧的修复，
  > 控件**外高统一**由令牌专项承载。两项 changeset 同时消费、同期发版，changelog 会合并展示。

  ## 修复内容
  - **cascader**：`.lh-cascader__input` / `.lh-cascader__tags` 此前零样式，`__input-inner` 的 `flex:1; min-width:0` 是死代码——补中间层 flex 容器规则后输入框才能随容器收缩，窄容器下不再把右侧清空/箭头图标顶出
  - **button**：`.lh-button__loading` 的 `margin-right: 4px` 与 `&__loading + &__text` 的 `margin-left: 4px` 双写，导致圆形 loading-only 按钮的 spinner 向左偏心约 2px、loading 态与文字间距 8px（非 loading 态只有 4px）。去掉 `margin-right`，间距统一由相邻选择器控制
  - **switch**：loading 指示器居中于轨道，checked 时滑块右移与之重叠，新增 `&--loading &__core::after { opacity: 0 }` 在 loading 期间隐藏滑块
  - **date-picker / time-picker**：`__input-inner` 补 `flex:1; min-width:0`，长占位符不再顶出右侧图标；`__icon` 补 `flex-shrink: 0`
  - **pagination**：跳页框 `height: 30px` 缺 `line-height`，垂直位置原交 UA 默认处理，补 `line-height: 30px`
  - **spinner**：补 `vertical-align: middle`，行内语境下与 LhIcon 对齐、不再落基线

  ## 已并入高度令牌专项、不在本文件范围

  下列缺陷在排查时一并定位，但属控件外高体系问题，由 `control-height-tokens.md` 承载（此处不重复记录，避免 changelog 双开）：

  - 各表单控件外高不统一（input 39 / cascader 42 / tree-select 44 / date-time 35 / input-number 34），根因是缺 `--lh-control-height-*` 令牌且多数控件未声明 `box-sizing: border-box`
  - input `--has-label` 的非对称 `padding-top: 16px`、checkbox 对勾固定 `top:2/left:5`、switch 的 `translate(-50%,-50%)` 在 base 与 keyframes 重复硬编码

  仍未处理的体系问题（单列后续专项）：spinner 与 icon 同名尺寸档位不一致（small 16 vs 14、medium 24 vs 16 等）。

- c873c82: # Steps 标题换行修复 + 横向定宽折行

  `title` 在容器宽度不足时被挤压换行（步骤项 `flex:1` 且 `__main` 为 `min-width:0`，标题无
  `white-space` 规则），连接线与圆圈错位、整行高度被撑乱。本次从「换行」这一本质入手，让标题
  保持一行、由步骤项整体承担折行，横向纵向两种方向都不再换标题。

  ## 修复内容
  - **标题一行**：`.lh-steps__title` 补 `white-space: nowrap; overflow: hidden;
text-overflow: ellipsis`，宽度不足时省略号截断，绝不换行（横向纵向均适用）
  - **横向定宽折行**：`--horizontal` 开 `flex-wrap: wrap`（行间距取 `--lh-spacing-lg`），
    步骤项改为 `flex: 1 1 var(--lh-steps-item-basis)`。宽容器下仍是等分一行、视觉不变；
    装不下基准宽度时整步折到下一行，而不是逼标题换行
  - **新增组件级变量** `--lh-steps-item-basis`（默认 `160px`，定义在 `.lh-steps` 上），
    可通过各端 UI 库的 `themeVars` 机制覆盖，调节折行节奏
  - **行末连接线**：横向新增 `lh-steps__item--line-last` 类，行末项的 `::after` 连接线
    `display: none`，不再指向行尾空白。是否为行末项由 UI 层测量 `offsetTop` 后经
    `getStepsLineLastIndices` 计算，纯函数 + 单测随附
  - **顺带修复「末项连接线首屏全漏画」**：连接线的「非末项」判定原本依赖 JS 类
    `lh-steps__item--last`，而该类基于子项注册总数计算——子项在各自 setup 阶段渲染，
    此时后续兄弟尚未注册，导致**每一个步骤在首屏（含 SSR/SSG 快照）都被判为末项**，
    连接线全部被隐藏，一个 tick 后才自纠正。现改为结构性 `:last-child`，纯 CSS、
    任意渲染时机都正确；`LhStepClassState` 的 `isLast` 字段与 `lh-steps__item--last`
    类随之移除（vue2 仓无 steps 组件，无下游影响）

  ## core 变更
  - `getStepsLineLastIndices(offsetTops)`：按各步骤项纵向偏移判定每行最后一项索引
  - `LhStepClassState` 新增可选 `lineLast`，移除 `isLast`；`getStepClassNames` 据此输出
    `lh-steps__item--line-last`，不再输出 `lh-steps__item--last`

  > 行末连接线的测量由各端 UI 库（如 lh-ui-plus）在 Vue/React 层完成，本仓只提供判定函数
  > 与样式钩子，不引入框架 API（红线 1）。

## 0.3.0

### Minor Changes

- # 主题令牌收敛与 config 纳管 theme

  前提结论：**主题不单独拆包**——theme 就是 `@lh-ui/share` 的一部分（TS 侧纯对象 + scss 令牌零框架依赖），
  各 UI 库统一从 share 消费主题。本轮把 lh-ui-plus 侧真实改进的令牌与样式择优回流 share，
  并让 config 模块纳管主题预设名，为 plus 迁移到消费 share 做准备。

  ## 阶段 0：清理主题多源
  - 删除 `src/theme/themes/{cerblue,golden,shuimo,songhua,zhusha}.scss` 五个孤立文件：
    与 `themes/index.ts` 的 TS `vars` 逐字重复、全仓无引用、不参与编译也不被 exports 暴露。
    删除后 TS `vars` 成为预设主色的唯一来源，消除双源漂移。

  ## 阶段 1：令牌收敛（plus 的三个变量回流）

  新增三个设计令牌，贯通 SCSS 变量 → `:root` 映射 → 暗色覆盖 → **浅主色预设取值**：

  - `--lh-color-on-primary`：主色底上的文字色。此前各组件写死 `#fff`，在金色 / 松花等浅主色底上
    对比度不足 AA；默认值仍为 `#fff`，暗色侧显式声明防外部覆盖丢失。
  - `--lh-hover-bg-color`：列表 / 面板项的中性悬停底色，与选中态主色底区分开；暗色翻转为
    `rgba(255,255,255,.08)`（此前暗色下拉悬停为写死的深色，形成「反向悬停」）。
  - `--lh-selected-color`：选中态文字色。`buildPresetStyleText` 的暗色块**已经在用**
    `color-mix(... 40%, #fff)` 派生它，但明色侧缺失——补齐 share 现有的不自洽。
    明色侧直接引用 `--lh-primary-color-active`（不做编译期烤死），各预设 active 在其 bg 上的
    对比度已验证 ≥4.5:1。

  **浅主色预设的对比度兜底**（预设层取值，WCAG 数值全部重新验算）：

  - songhua / golden 的主色属浅主色，白字仅 3.93:1 / 3.25:1（不足 AA），改用墨字
    `#101410`（4.73:1）/ `#1E1A16`（5.31:1）——`--lh-color-on-primary` 显式写进预设 vars。
  - active 色作选中文字在悬停底上仅 3.48:1 / 3.41:1，两个预设各自加深 `--lh-selected-color`
    至 `#456F44`（5.17:1）/ `#82600A`（5.37:1）；按压底色同步加深至 `#4F8F4C` / `#A87F0A`
    （墨字对比 4.75:1 / 4.70:1，原值 3.70:1 / 3.94:1 均不足）。
  - cerblue / zhusha / shuimo 为深主色，白字 8.65:1 / 5.90:1 / 13.97:1 已达标，不额外声明，
    回落 `--lh-color-on-primary` 默认 `#fff` 与 `--lh-selected-color` 默认 active 变体。
  - 暗色下两个预设仍走 `buildPresetStyleText` 暗色块的 color-mix 提亮值（注入文本中暗色块在
    `:root` 块之后，同特异性后者胜，明色值不会泄漏进暗色）。

  同时 5 处编译期烤死的主色改为引用 CSS 变量（预设主题只覆盖 `--lh-primary-*`，烤死值会让选中态不跟随预设）：
  `$lh-dropdown-item-hover-bg-color`、`$lh-menu-item-active-color` / `-bg`、
  `$lh-tree-node-selected-color` / `-bg`。

  > 层叠说明：var-dark.scss 暗色块的取值已与 `buildPresetStyleText` 注入的暗色块**完全一致**
  > （`--lh-primary-color-bg` 同为 25% 掺透明、`--lh-selected-color` 同为 40% 掺白），
  > 二者谁后插入结果都相同，层叠顺序不再是风险点。`:root` 上编译为 var() 引用的 token
  > 只在 :root 求值、暗色下不会自动翻转，故在 var-dark.scss 显式重新指向暗色值。

  顺手修正 `variables.scss` / `var.scss` / `var-dark.scss` 头部过时注释（仍写「lh-ui-plus」，应为 lh-ui-share）。

  ## 阶段 2：组件样式择优回流

  plus 的 58 个组件样式与 share 无一相同，但绝大多数差异是「share 已有的双写过渡类名 /
  focus-ring / reduced-motion」造成的假阳性。择优回流 plus 的真实改进（保留 share 侧已有的
  无障碍成果，不反向覆盖）：

  - 19 处令牌引用点：alert / cascader / date-picker / select / tabs / time-picker 的悬停底色
    走 `--lh-hover-bg-color`；button / calendar / date-picker / pagination / table / tree 的
    主色底文字走 `--lh-color-on-primary`；cascader / select / time-picker / tree 的选中态
    走 `--lh-selected-color` + `--lh-primary-color-bg`。
  - dialog 补 `--center` 居中变体（header / body / footer 居中，关闭按钮绝对定位到右上角）。
  - avatar `__icon` 补 `svg { width: 1em; height: 1em; }`，图标随头像尺寸缩放。
  - calendar / date-picker 的「今日」补 `box-shadow: inset 0 0 0 1px` 内描边环；
    date-picker 面板阴影改用 `--lh-box-shadow-base` 令牌。

  **未回流**（plus 侧缺陷或死代码）：popconfirm / popover / drawer 引用未定义的
  `--lh-line-height-primary`、loading 的 `--lh-loading-color`、notification 的 `--lh-notification-color`
  （share 的正确名分别为 `--lh-font-line-height-primary` / `--lh-loading-text-color` /
  `--lh-notification-content-color`）；divider 的 `--dotted`（plus 模板不产出该类，死 CSS）；
  time-picker 激活态 `font-weight: 600`（share 为 500，属行为变更，不做）。

  ## 阶段 4：config 模块纳管 theme

  core 保持纯函数、零 DOM（红线 #1）：config 状态只存主题**名**（字符串，可序列化），
  vars 取值与 `<style>` 注入由 UI 层调 `getThemeVars` + `buildPresetStyleText` 完成。

  - `LhConfigState` 新增 `theme: ThemePresetName`，默认 `'cerblue'`（`DEFAULT_THEME` 常量，
    与 `variables.scss` 的默认主色同源，theme.spec.ts 有回归守护）。
  - 新增纯函数 `getEffectiveTheme(localTheme, globalTheme)`：局部 > 全局 > 默认青花瓷。
  - `src/core/index.ts` 导出 config 模块；单测补 `DEFAULT_THEME` ↔ `THEME_PRESETS[0].name`
    一致性护栏、`mergeConfig` 主题覆盖与 `getEffectiveTheme` 三级回退。
  - theme.spec.ts 的预设键集断言放宽为「包含必需键」（浅主色预设现在额外声明两个令牌），
    新增浅主色预设必须成对声明 `--lh-color-on-primary` / `--lh-selected-color` 的护栏。

  ## 包面
  - 全部为**新增导出 + 内部令牌收敛 + 样式增量**：`getEffectiveTheme` / `DEFAULT_THEME` 为新增，
    既有导出零删除、旧签名零变更，下游既有引用不需要改动。
  - 三个令牌均为新增 CSS 自定义属性，不覆盖任何既有令牌；组件样式改动只把写死色值换成令牌引用，
    默认值与原值一致，无主题时视觉不变。

  ## 阶段 3 / 5（后续，另仓）

  plus 迁移到消费 share（import `@lh-ui/share/core/*`、删 `packages/core` / `packages/theme` /
  各组件 `style/`、build-styles 改编译 share 源、rollup / vite / workspace 配置同步）
  在 plus 仓单独进行，按红线 #5：**share 先发版，plus 随其后 `pnpm up @lh-ui/share` 回归**。

## 0.2.0

### Minor Changes

- e38b52e: # 无障碍 + 键盘快捷键全面适配

  本轮补齐 core 层缺失的键盘原语与无障碍语义输出，并补齐样式侧的焦点环与减弱动画缺口。
  全部为**纯新增导出 + 内部实现收敛 + 样式增量**：零删除、旧签名零变更，下游既有引用不需要改动。

  ## 新增共享内核
  - `core/shared/keyboard`：按键常量 `LH_KEYS`（Escape / Enter / Space / 方向键 / Home / End / Tab 等），
    判定函数 `isActivationKey` / `isArrowKey` / `isEscapeKey` / `isHomeOrEndKey` / `isSpaceKey` /
    `isHorizontalArrowKey` / `isVerticalArrowKey`，通用列表导航 `getNextListIndex`（支持 loop / skipDisabled /
    首尾直达，空列表或全禁用返回 -1），type-ahead `findTypeAheadIndex`，roving tabindex `getRovingTabIndex`。
    收编 5 处散写导航实现：`select/getNextEnabledIndex`、`segmented/moveSegmentedIndex`、
    `tree/moveTreeFocus`、`menu/moveMenuFocus`、`tabs/getNextActiveName`——外壳签名全部保留并标 `@deprecated`，
    内部改调内核，既有语义（含「当前值无效回退首项」）逐项保留。
  - `core/shared/a11y`：aria id 生成 `generateAriaId`；原子构建器 `ariaExpanded` / `ariaControls` /
    `ariaLabelledby` / `ariaDescribedby` / `ariaInvalid` / `ariaRequired` / `ariaCurrent` / `ariaHaspopup`；
    弹出层触发器属性包 `getPopupTriggerAria`；装饰件助手 `getDecorativeAria`。

  ## 弹出层 a11y + Escape 闸门
  - popover / popconfirm / tooltip / dropdown / cascader / date-picker / time-picker / select：
    新增触发器与浮层的无障碍属性包（aria-expanded / aria-controls / aria-haspopup / role），
    UI 层 v-bind 即可；select 补齐 combobox pattern 硬性要求（role=combobox + aria-activedescendant +
    listbox / option 全套，`getSelectOptionId` 确定性拼接选项 id）。
  - popover / popconfirm 新增 `canCloseOnEscape`（disabled 时阻止 Esc 关闭）；
    drawer 补齐 `canDrawerClose(state, 'maskClick' | 'escape')`——此前 `closeOnEsc` 只在 state 中声明、
    logic 从不读取，现补为可计算的逃逸闸门（默认允许，与 dialog 的 `canClose` 对称）。
  - dialog / drawer / image 新增焦点陷阱接线点 `shouldTrapFocus` 与 `getDialogAria` / `getDrawerAria` /
    `getImageViewerAria`（role=dialog + aria-modal + aria-labelledby）：把「是否圈焦点」变成 core 可计算的决策，
    具体圈焦由 UI 层配合既有的 `core/shared/focus-trap`（saveActiveElement / trapTabKey /
    setInertOutside / restoreActiveElement）实现。

  ## 表单 a11y
  - form 新增 `getFormFieldAria({ prop, error, required })` 与 `getFormFieldErrorId`：
    校验失败时把 `aria-invalid` 与错误提示经 `aria-describedby` 绑到控件（此前 `validateFormField` 只吐文案字符串）。
  - input `getInputAria`、input-number `getInputNumberAria`（role=spinbutton + 值域 + valuetext）、
    switch `getSwitchAria`（role=switch + aria-checked）、slider `getSliderThumbAria`（role=slider + 值域 + orientation）、
    rate `getRateAria`（role=slider，复用 `getRateAriaText` 的文案）、upload `getUploadFileAria` / `getUploadDropzoneAria`。

  ## 导航型与值语义组件
  - tabs `getTablistAria` / `getTabAria` / `getTabpanelAria`、tree `getTreeAria` / `getTreeNodeAria`、
    menu `getMenuAria` / `getMenuItemAria` / `getSubMenuAria`、segmented `getSegmentedAria` /
    `getSegmentedItemAria`——此前这四类「有键盘导航函数却无配套 role/aria」的不对等补齐。
  - pagination `getPaginationItemAria`（当前页 aria-current="page" + 页码 aria-label 模板，支持 {page} 插值）、
    breadcrumb `getBreadcrumbItemAria`（末项 aria-current="page"）、steps `getStepAria`（aria-current="step"）、
    table `getTableSortAria`（aria-sort，与 `cycleSortOrder` 状态机对齐）、progress `getProgressAria`（role=progressbar）。
  - notification 补 `getNotificationRole` / `getNotificationAria`，与 message / alert 的 live region 范式对齐。
  - icon / skeleton / loading 应用 `getDecorativeAria`（aria-hidden），loading 同时输出 `aria-busy`。
  - calendar `getCalendarCellAria`（选中日 aria-current="date"，禁用日 aria-disabled）。

  ## locales
  - 六个语言包新增 `ariaLabels` 命名空间（close / expand / collapse / clear / openDropdown / page / step /
    upload / rating / sort 等约 50 条），供各 UI 层经 `t('ariaLabels.close')` 取用；
    ja-JP / ko-KR / de-DE / fr-FR 按既有约定给英文兜底文案。

  ## 样式侧
  - 新增焦点环设计令牌 `--lh-focus-color` / `--lh-focus-ring-width` / `--lh-focus-ring-offset`
    （var.scss 默认跟随主色，var-dark.scss 深色提亮保证对比度）。
  - 新建 `styles/theme/common/a11y.scss`（经 common/index 转发）：`@mixin focus-ring`、
    `@mixin visually-hidden` / `not-visually-hidden`、`.lh-sr-only` 工具类（全仓此前无任何 sr-only）。
  - 为 16 个缺失的交互组件补键盘焦点环（cascader / checkbox / date-picker / dialog / form / input /
    input-number / popconfirm / popover / radio / select / slider / switch / tag / time-picker / tooltip，
    统一走 focus-ring 令牌）；为 22 个缺失的组件补 `prefers-reduced-motion`（alert / anchor / breadcrumb /
    calendar / cascader / checkbox / date-picker / dialog / input / input-number / pagination / progress /
    radio / rate / segmented / slider / steps / switch / tabs / time-picker / transfer / tree）。

  ## 包面
  - 根 barrel 显式清单跟进：popconfirm / popover 的 `canCloseOnEscape` 同名二义按既有 `getDefaultDelay` 方式
    别名处理（`getPopconfirmCanCloseOnEscape`），子路径导出保持原名。
  - `./core/*` 与 `./styles/theme/common/*.scss` 导出映射自动覆盖新增的 `core/shared/a11y`、
    `core/shared/keyboard`、`styles/theme/common/a11y.scss`。

- e38b52e: # 扩展性落地：主题注册 / locale 插值 / 日期适配器 / 虚拟滚动轴无关 / 表单内置规则

  本轮把 5 个低成本扩展点与 3 个结构性扩展件全部落地。均为**增量 API**，既有导出保持兼容（个别旧别名标注 `@deprecated` 但功能不变）。

  ## theme：开放自定义预设注册
  - 新增 `registerTheme(preset)`：注册（同名覆盖）自定义主题预设，`getThemePreset` / `getThemeVars` 即可按名取用。
  - `ThemePresetName` 以 `string & {}` 开放：保留 5 个内置名的自动补全，同时接受任意自定义名称（未注册名在 get 系列返回 undefined 而非编译错误）。
  - 删除 `src/theme/themes/*.scss` 五个零引用文件：真实 CSS 变量链路是 `styles/theme/common/variables.scss → var.scss :root`，这些文件是误导性的第二事实源。防漂移由 theme.spec 的 TS↔SCSS 一致性护栏继续保障（覆盖内置预设需与 variables.scss 同步修改）。

  ## locale：插值与数组取值
  - `t(path, params?)` 第二参支持对象：`{key}` 占位符插值（如 `'共 {total} 条'`）；传 string 仍是原 fallback 语义，完全兼容。
  - 新增 `tm(path, fallback?)`：读取数组文案（`datepicker.months`、`datepicker.weeks` 等月份 / 星期名不再绕过 locale 内核）。
  - 新增导出 `formatMessage(template, params)`：`{key}` 插值唯一实现；pagination 的 `formatMessage` 与 rate 的内部插值收敛至此（pagination 导出保留、同签名）。

  ## date：适配器接缝 + 周起始参数
  - 新增 `LhDateAdapter` 接口（parse / format / getDaysInMonth / getFirstDayOfMonth / compare / isSameDay / addDays）与默认实现（包装现有手写算法）；`setDateAdapter(adapter | undefined)` 注入 / 还原。`generateCalendarDays` 的网格生成经适配器路由，注入 dayjs 等实现后自动跟随。
  - `generateCalendarDays` 新增可选 `firstDayOfWeek`（0=周日默认 … 6=周六），一周起始贯通日历网格。

  ## virtual：轴无关 + 增量测量
  - 新增 `computeWindow(scrollOffset, viewportSize, itemSize, total, overscan)`：轴无关定高窗口，水平虚拟滚动（scrollLeft / viewportWidth / itemWidth）与纵向同一份算法；`computeRange` 继续作为纵向入口。
  - 新增 `patchMeasuredSize(items, index, size, defaultSize?)`：动态测量模式下单点更新尺寸并顺移后续偏移，不再全量 `buildVirtualItems` 重建；返回尺寸变化量 delta 供滚动位置校正。
  - `computeVirtualRange` / `getItemOffset`（virtual-list）与 `computeVisibleRange`（table）标注 `@deprecated` 保留，指向共享内核唯一实现；`LH_VIRTUAL_OVERSCAN` 改为共享内核同一绑定。

  ## form：内置规则扩展
  - `LhFormRule` 新增 `type`（string / number / boolean / array / email / url）、`pattern`（string | RegExp，仅对字符串值生效）、`min` / `max`（数值范围或长度范围）、`len`（精确长度）、`trigger`（触发时机标记，core 只承载、UI 层按事件过滤）。
  - 内置规则与 validator 按规则顺序求值；失败文案优先 `rule.message`，缺省用英文兜底（UI 层应提供业务文案）。

- e38b52e: # 审计修复：已知 bug、框架设计漏洞与开源组件库对齐

  本次对 core / shared / theme / constants / utils 做了一轮全面审计并修复。以下为**破坏性变更**与迁移指引，其余为兼容性修复。

  ## 破坏性变更（3 处）
  1. **`validateFormField` 支持异步校验**：返回类型由 `string | undefined` 扩为 `string | undefined | Promise<string | undefined>`；`LhFormRule.validator` 可返回 Promise。
     - 迁移：组件层调用点需加 `await`，或用 `Promise.all` 汇总多条规则的结果后再决定提示文案。同步用法无需改动。

  2. **`isExtensionRejected(fileName, accept)` 重命名为 `isFileRejected(file, accept)`**：新签名接收 `{ name, type }`，因为 MIME 匹配（`image/*`、`image/png`）必须依赖 `file.type`，文件名无法承载该信息。
     - 迁移：`isExtensionRejected(file.name, accept)` → `isFileRejected(file, accept)`（传入完整 File 对象）。

  3. **`LH_LANGUAGE_CONST` 开放全部 6 种语言**：取消 ja-JP / ko-KR / de-DE / fr-FR 的注释，`LhLocaleType` 由 2 元联合自动扩为 6 元。
     - 迁移：纯增宽，share 的 registry 早已注册这 4 种骨架包（英文兜底）。消费方若穷举过该联合需补齐 4 个分支。

  ## 高严重度修复（数据正确性 / 无障碍）
  - **date-picker**：`parseDate` 重写为位置驱动解析 + NaN 判定 + 构造后回读校验，`2023-02-30` 与垃圾串不再静默滚到非法日期；`formatDate` / `formatTime` 改全局正则替换，保证 round-trip 对称；`isInRange` 改用天级 `compareDate`；日历首尾填充的 `isToday` / `isSelected` 改为实际计算而非硬编码 `false`。
  - **upload**：`isFileRejected` 按后缀 / MIME 前缀 / 精确 MIME 三级匹配（大小写不敏感）；`exceedsMaxSize` 对非有限上限视为无限制。
  - **focus-trap**：`trapTabKey` 改用列表索引判定，修复焦点落在容器内 `tabindex="-1"` 元素时的逃逸；`setInertOutside` 引入所有权注册表（双 WeakMap），修复嵌套 overlay 互相误伤 inert、以及容器未 teleport 到 body 时的加锁遗漏；`restoreActiveElement` 归还前检查 inert 祖先链，目标已被 inert 时 blur 当前焦点元素回退 body（`body.focus()` 在部分环境不会移动 activeElement）；可聚焦选择器排除 `type="hidden"`。
  - **sx**：`spacingToPx` 收 `string | number`，字符串原样透传，修复 `"NaNpx"`；间距键类型同步放宽。
  - **form**：非必填空值跳过后续 validator（对齐 Element / Ant 约定）；新增导出 `isEmptyValue`。
  - **环保护**：cascader / tree / table 的所有递归改用祖先链判重，循环数据不再栈溢出（DAG 共享子树不受影响）。
  - **time-picker**：`generateTimeColumn` 对 `step <= 0` 兜底为 1（修复死循环）；`parseTime` 纳入秒的 NaN 判定并校验值域（`99:99:99` → null）。
  - **虚拟滚动**：定高场景 `first` 钳到 `total - 1`，修复数据收缩瞬间 `start > end` 的白屏。

  ## 中 / 低严重度修复
  - **popper**：`gap` / `padding` 非有限值兜底；shift 夹回改用视口真实边界（支持非原点视口）；新增主轴夹回（两侧都放不下时整体拉进视口）；箭头 padding 上界不超过弹出层一半。
  - **cascader**：`itemConfig` 字段映射补齐实现（value / label / children / disabled / leaf，缺失时回退标准键）；`searchNodes` 输出完整祖先链、大小写不敏感、结果上限 50。
  - **tree**：未加载的非叶子子树不再被「空子树恒真」误判为全选；禁用子树不参与级联收集。
  - **table**：`getStickyOffsets` 支持 px 字符串宽度；`sortTableRows` 非有限数排末尾；`clampColumnWidth` 对 NaN 兜底。
  - **pagination / transfer / calendar / select / utils**：`clampPage` 非有限值兜底（NaN 回首页，Infinity 落末页）；`moveTransferKeys` 清理幽灵勾选键（搬运结果与源区都不残留）；`filterTransferItems` label 缺失不抛错；`isCalendarDateDisabled` 归一反序 range；`getNextEnabledIndex` 全禁用时返回 -1；`getScrollbarWidth` SSR 安全。

  ## 结构性改动
  - 新增共享内核 `core/shared/sanitize`（`sanitizeNumber`）与 `core/shared/virtual`（`computeRange` / `getItemOffsetAt`），统一所有数值入口的净化与虚拟滚动算法；`virtual-list` 与 `table` 的两份定高实现改为薄封装委托。
  - `getThemeVars` 返回类型改为 `ThemeVars | undefined`（类型自洽）；`THEME_PRESETS` 数组顺序不变。

  ## 单测

  修正 `date-picker.spec.ts` 中把 bug 钉死的断言（`parseDate('')` 由 `not.toBeNull()` 改为 `toBeNull()`）；`focus-trap.spec.ts` 用桩补齐 inert 加锁 / 解锁路径；新增 `sanitize.spec.ts`、`virtual.spec.ts`、`theme.spec.ts`（SCSS 令牌与 `THEME_PRESETS[0]` 漂移护栏）及主要修复项的回归用例（`getField` 经 itemConfig 消费函数间接覆盖；`isCalendarDateDisabled` 反序区间、`isEmptyValue`、`getScrollbarWidth` 的直测在后续 changeset 补齐）。

- e38b52e: # 审计修复第二轮：健壮化 + shared 内核加固

  第二轮系统排查（递归环 / 数学危害 / 纯度 / 异步契约 / 日期对称性 / 测试与包面盘点）的修复汇总。全部旧导出保持兼容，无签名变更。

  ## 行为变化（下游需知晓，均非签名破坏）
  1. **sx 优先级**：`m` / `p` 简写不再无条件覆盖长手——优先级固定为「单边 > 轴组 > 简写」且与键序无关（`{ mt: 4, m: 2 }` 得 `marginTop: 32px`）。新增 `mergeSx(...sx)` 组合入口。排查确认现役下游未使用简写键，实际影响为零。
  2. **LhLocale**：`bump()` 对监听器逐个 try/catch（一个抛错不再阻断后续订阅者）；`setLocale` 未注册语言回退默认语言包（`getLocale()` 与 `t()` 不再脱节）；`add()` 改为对当前生效包**深合并**（旧实现整包替换会丢失未覆盖键）并对当前语言广播；`use()` 只写用户注册表遮蔽内置包，不再永久覆写 `locales['zh-CN']` 等内置注册项。
  3. **popper**：`shift: false` 现在同时豁免主轴夹回（此前主轴夹回无条件执行，与注释不符）；最后一道视口地板改为含 `padding`（与其它钳制约定一致）；`parsePlacement` 对类型联合之外的垃圾字符串回退 `bottom/center`；rect 字段非有限值净化为 0。
  4. **validateFormField**：同步抛错的 validator 按校验失败处理（取 `error.message`），不再穿透为未捕获异常；异步规则**不再短路**——首个 thenable 之后的所有规则仍会求值，结果并入同一个 Promise（旧实现会跳过异步规则之后的规则）。

  ## 递归环守卫补齐（栈溢出）
  - table：`flattenLeafColumns` / `buildHeaderCells` 的两个 walk 补祖先链判重（`getDepth` / `getLeafCount` 上轮已守卫）。
  - tree：`collectCascadeKeys` / `isSubtreeFullyChecked` 补判重；勾选回溯跳过禁用父级（不再把部分子树未勾选的禁用父写进勾选集）。
  - anchor：`flattenAnchorItems` / `collectAnchorIds` 补判重。

  ## shared 内核加固
  - **sanitize**：新增 `max` 选项；`min` / `max` 边界自身非有限时忽略（坏 prop 不再把 NaN 带回结果）；新增 `clamp` 原始钳制助手，input-number / slider 的 `clampValue` 与 popper 内部钳制收敛到同一实现。
  - **virtual**：`computeRange` 全参非有限净化（NaN scrollTop 曾产出 `slice(NaN)` 白屏窗口）。
  - **focus-trap**：`setInertOutside` 第三参 `locked` 实现为「额外豁免节点」语义（曾是死参数）；容器脱离文档后未解锁残留的 inert 所有权在再次加锁时自动释放。

  ## core 其余修复
  - pagination：`getPageCount` 双参净化（NaN/Infinity total 曾穿透为 NaN 页数）。
  - slider：`snapToStep` 对 `step <= 0` / 非有限回退纯钳制（`step=0` 曾产 NaN 值）。
  - notification：`groupNotificationsByPosition` 对未知 position 兜底进 `top-right`（脏数据曾 TypeError 殃及整队分组）。
  - input-number：计算结果非有限回退 [min, max] 内确定值；`precision` 净化到 [0, 100]（越界曾 RangeError）。
  - calendar：`clampDateToRange` 先归一反序区间（键盘导航不再钳到错误一端）。
  - image：`stepRotate` 归一到 [0, 360)（JS `%` 保留符号，负角度曾越界）。
  - cascader：`getChildren` 对 null / 原始值节点与非数组 children 返回空（去掉最后一个 `as any`）。
  - space：`resolveSpaceGaps` 对缺项 / 非数值元组兜底（不再产出 `"undefinedpx"`）。
  - date-picker：`formatDate` 年份补零到 4 位（year < 1000 恢复可回读）；两位年份归一去重为唯一实现。
  - transfer：`LhTransferItem.label` 类型放宽为 `label?: string`（与运行时契约一致，消除下游强转）。

- e38b52e: # 审计修复第三轮：打包缺口 / 逻辑 bug / 单例解耦 / 令牌一致性

  第三轮系统排查（打包导出 / 运行时正确性 / 全局可变状态 / 样式令牌 / 文档）的修复汇总。旧导出全部保持兼容，单例 API 保留并标 `@deprecated`。

  ## 打包与导出（CI 原本会放行的致命缺口）
  - **`es/core/index.js` / `lib/core/index.js` 从不产出**：`vite.config.ts` 的 `collectEntries()` 只遍历 `src/core` 的子目录，聚合文件 `src/core/index.ts` 是文件被跳过，而 `package.json` 的 `./core` 子路径导出正指向它们。已在入口收集中单独收录该文件。
  - **星号导出同名歧义**：`clampValue`（slider / input-number 同绑定再导出）、`computeWindow` / `LH_VIRTUAL_OVERSCAN`（shared/virtual / virtual-list 同绑定再导出）在 `es/index.d.ts` 被 TS 静默丢弃，造成运行时有、类型上没有的割裂。`src/core/index.ts` 显式重导出恢复对齐。
  - **`verify-dts.mjs` 加固**：新增 `es/` 与 `lib/` 的 `.js` 镜像存在性检查（直接兜住上一类缺口）；禁导入扫描从 `.d.ts` 扩展到 `.js` 并补 `import 'x'` / `require('x')` 两种形式；新增 `package.json` exports 目标文件存在性检查。镜像检查的口径为「运行时入口」（与 `vite.config.ts` 的 `collectEntries` 同规则），纯类型模块（各组件 `types.ts`、`src/types/**`）只被 `import type` 引用、Rollup 将其剔除出运行时图，无 `.js` 是预期行为，不在检查范围内。
  - **发布门加固**：`prepublishOnly` 改为 `build && verify:dts && verify:styles`（原写法重复执行已含步骤且漏掉质量门）；补 `keywords`。

  ## 逻辑 bug
  - **`parseDate` 丢失时间分量**：此前只解析年月日，`parseDate('2023-01-01 10:30:45', 'yyyy-MM-dd HH:mm:ss')` 的时刻被丢弃。现在按 `HH/mm/ss` 位置取值并参与回读校验（`25:00:00` 等越界值仍返回 null），与 `formatDate` 往返对称。串比 format 短（format 含时间 token 但串里缺分量）仍返回 null，不静默补零——这会掩盖 value-format 与实际值不匹配的 bug。
  - **`parseTime` 强制 mm 必填**：`formatTime(10,0,0,'HH')` 产出的 `"10"` 无法被 `parseTime('10','HH')` 解回。缺失分量现在按 0 补齐。
  - **`backtop` SSR 崩溃**：`window.matchMedia` 在无 window 环境（SSR / 部分 uniapp 运行时）直接 TypeError。加了与 `shared/popper` 同风格的 `typeof window` / `matchMedia` 双重守卫。
  - **`getWordCount` 空值崩溃**：react / uni 挂载前 `value` 可能为 undefined，`value.length` 抛错。兜底按空串处理。
  - **tree 未加载非叶子的勾选态反转**：`collectLeafKeys` 对「`isLeaf !== true` 且无 children」返回空数组，导致 `getNodeCheckState` 恒为 `unchecked`——而 `toggleCheckKeys` 会把该节点自身键写入 `checkedKeys`，出现"键在 checkedKeys 里却显示未选"。空子树时改用 `checkedKeys.includes(node.key)` 判定，与 `isSubtreeFullyChecked` 已留的分支语义一致。

  ## 全局单例 / 副作用解耦
  - **`formatMessage` 下沉共享内核**：实现从 `locales/locale.ts` 迁到 `core/shared/format`，rate / pagination 改从 shared 引入。`@lh-ui/share/core/rate` 的消费者不再被迫执行 `new LhLocale()` 的模块级副作用；locales 层再导出同一绑定，旧导入路径完全兼容。
  - **`upload` uid 去全局种子**：模块级 `uidSeed` 自增 + `Date.now()` 在三库各自打包时同毫秒会产出同号 uid。改用 `crypto.randomUUID()`（无该 API 的环境回退时间戳 + 随机数），`createUploadUid(prefix?)` 签名兼容默认前缀 `lh-upload`。
  - **date-picker adapter 显式参数透传**：`generateCalendarDays(year, month, selected, rangeStart, rangeEnd, today, firstDayOfWeek?, adapter?)` 接受可选适配器参数，默认取 `getDateAdapter()`。模块级单例 `setDateAdapter` / `getDateAdapter` 保留并标 `@deprecated`（多日期选择器实例会互相污染），内部默认路径不变。

  ## 样式令牌一致性
  - **4 处令牌名不匹配**（引用了 var.scss 未声明的令牌，实际不生效）：`--lh-line-height-primary` → `--lh-font-line-height-primary`（drawer / popconfirm / popover）；`--lh-spacing-medium` → `--lh-spacing-base`（space）；`--lh-loading-color` → `--lh-loading-text-color` 且 fallback 改为正文色（loading）；`--lh-notification-color` → `--lh-notification-content-color`（notification）。
  - **161 处 ElementPlus 遗留 fallback 色清洗**：24 个组件样式中的 `#409eff` / `#e6a23c` / `#f56c6c` / `#67c23a` / `#909399` / `#606266` / `#303133` / `#ebeef5` / `#c0c4cc` 全部按 `variables.scss` 的 lh-ui 调色板映射替换；顺带把 63 处同色小写形式统一为大写。所有命中均在 `var(--lh-*, #色值)` 的 fallback 位，无调色板外用途被误伤。
  - **266 处无 fallback 的 `var(--lh-*)` 补齐**：默认值取自 `var.scss` 的 `:root` 声明（`#{$lh-x}` 插值回查 `variables.scss` 解析为字面量）。组件局部令牌（同文件声明、同作用域消费，如 card 的 `--lh-card-*`）自动豁免；`apply-pattern` mixin 的三个令牌为用户传入语义，以 `/* no-fallback */` 注释显式豁免。`switch` 的两处硬编码 `#fff` 收敛为组件令牌 `--lh-switch-knob-color`。
  - **新增 `pnpm verify:styles`**：scss 侧此前无任何 lint 兜底（eslint 显式忽略 scss）。新脚本拦截 EP 调色板 9 色、无 fallback 的 `var(--lh-*)`（`/* no-fallback */` 行级豁免）、组件 scss 缺 `@use '../theme/common/index.scss' as *`；已接入 CI 末步与 `prepublishOnly`。顺带补齐 input-number / slider / switch / tag 四个缺 `@use` 的文件。

  ## 文档
  - README / README.en 的 `t()` 描述更正为支持 `{name}` 插值（原文称不插值，与实现及单测不符）；组件数与共享内核数更正为实际的 55 / 8。
  - ja / ko / de / fr 文件头的失效启用指引（`packages/constants/index.ts` 取消注释）改为真实状况：已注册登记，可直接 `setLocale` 切换。
  - AGENTS.md：`verify:dts` 的能力描述同步加固后的扫描范围；登记 adapter 迁移与 formatMessage 下沉；过渡类名双写的表述更正（enter 双写、leave 侧无需 `-leave-from`）；`normalize-styles.mjs` 标注已完成。

- e38b52e: # 审计修复第四轮：栅格越界 / 分页钳制 / 组件解耦

  第三轮验证通过后继续排查发现的问题，均为 P1/P2。导出面全部保持兼容。

  ## 逻辑 bug
  - **grid `span=0` + offset 越界**：`getColStyle({ offset: 6 })` 此前产出 `grid-column: 7 / span 24`，在 24 列栅格中从第 7 线占 24 列会越过右边界、迫使 grid 生成隐式轨道。span = 0 是「不占列、仅用于定位」的哨兵，现在改为 `7 / 25`（延伸到栅格末行）；显式 span 仍用 `span N`。
  - **`getPaginationRange` 不钳制 current**：UI 层透传的 `innerCurrent` 在受控模式下可能短暂越界（总数变小未同步 current），未钳制时当前页会落在显示窗口之外、省略号判定反转。入口先经 `clampPage` 归一到 `[1, pageCount]`。

  ## 低耦合改进
  - **calendar → date-picker 解耦**：`calendar/logic.ts` 此前从同级组件 `../date-picker` 引入 `compareDate` / `isDateDisabled` / `isSameDay` 等通用日期原语。这些原语下沉到新的共享内核 `core/shared/date`（含 `getDaysInMonth` / `getFirstDayOfMonth` / `isSameMonth`，及两位数年份归一），date-picker 按原导出面再导出，下游 `@lh-ui/share/core/date-picker` 的引用不需要改路径。`generateCalendarDays` 的再导出保留——日历网格算法本就是 date-picker 的职责，属语义性依赖。
  - **`getDefaultDelay` 三份重复收敛**：popconfirm / popover / tooltip 各自实现了同一段「undefined 回落」逻辑（且 tooltip 的 hide 默认值与另两者不同）。归一逻辑抽到 `core/shared/delay` 的 `resolveDelay`，各组件只声明自己的默认节奏；三处的 `getDefaultDelay` 导出与签名不变。

  ## 测试
  - 新增 `tests/unit/core/shared/date.spec.ts`（6 例：闰年、两位数年份归一、星期、只比较日期部分、禁用判定优先级）与 `shared/delay.spec.ts`（2 例：默认值回落、0 是有效值）。
  - grid 单测更新越界期望并补显式 span 用例；pagination 补 current 越界钳制用例；calendar 补源码级守卫，防止再退化回从 date-picker 引入通用原语。

- e38b52e: # 审计修复第五轮：运行时 bug + 导出可扩展性 + 验证脚本加固

  第五轮深审发现 4 个运行时 bug 与 1 个「多组件库核心」层面的导出盲区，并补齐验证脚本的兜底缺口。导出面全部向后兼容。

  ## 运行时 bug
  - **virtual-list 非有限入参崩溃**：动态高度路径的 `findVirtualRange` 未像共享内核 `computeRange` 那样净化入参——`overscan` 为 NaN 时 `start` 变 NaN，`items[NaN].offset` 抛 TypeError 直接中断渲染；小数 overscan 产出小数下标同样崩。现在 scrollTop/viewportHeight 的 NaN、overscan 的 NaN/负数/小数全部归一（overscan 是项数，向下取整；scrollTop 的 +Infinity 保留，过度滚动仍正确渲染尾部）。`buildVirtualItems` 的 NaN/非正 defaultSize 回落 `LH_VIRTUAL_ITEM_SIZE`。
  - **tree 禁用后代导致父级恒半选**：三处勾选函数对「禁用」的处理不一致——`collectCascadeKeys` / `isSubtreeFullyChecked` 跳过禁用子树，唯独 `getNodeCheckState` 用的 `collectLeafKeys` 不跳过。禁用后代计入分母但永不被 `toggleCheckKeys` 写入，父级勾选后恒显 indeterminate，破坏「父选中 ⇒ 全部可用后代选中」的不变量。新增内部 `collectCheckableLeafKeys`（跳过禁用子树），`collectLeafKeys` 语义不变、照常导出。
  - **select 高亮 -1 产出失效 aria id**：JSDoc 声明「-1 表示无高亮」，但 `getSelectOptionId` 只兜了 `!listboxId`，`listboxId` 存在时产出 `aria-activedescendant="lb-option--1"` 指向不存在的 DOM。现在非整数与负下标一律返回 undefined。
  - **form 异步校验 reject 未捕获 + 非法正则穿透成用户文案**：`runChecks` 只挂了 onFulfilled，异步 validator reject 时 Promise 直接 reject（同步抛错却按校验失败处理），UI 层 `Promise.all` 汇总时变成未捕获 rejection；`new RegExp(rule.pattern)` 对畸形正则抛 SyntaxError，其信息（如 "Invalid regular expression"）被当成字段错误文案展示给终端用户。现在异步 reject 与同步抛错同语义（取 error.message）；畸形正则单独 try/catch——`console.error` 告警开发者并跳过该 pattern，不阻塞用户提交。

  ## 导出可扩展性
  - **深路径导出盲区**：vite preserveModules 产出 `es/core/<组件>/<文件>.js` 这类扁平深文件，而 Node 的 exports 规范只认单星模式（实测 Node 24 直接忽略两段星号键），既有的单星 `./core/*` 只映射到目录桶 index.js——到不了 `es/core/tooltip/logic.js`。lh-ui-plus 有 10 处 `@lh-ui/<组件>/logic` 深导入，整体迁移时会 MODULE_NOT_FOUND。新增 `scripts/sync-exports.mjs`（`pnpm build` 末步）：扫描 `es/` 下每个**纯扁平**深目录（含 index 之外的直接子文件、且无子目录），为它生成 `./<bucket>/<dir>/*` 单星模式；有 .d.ts 才挂 types、有 .js 才挂 import、lib/ 有同名目录才挂 require。混合形态目录（es/locales、es/theme、es/types 既有扁平文件又有子目录桶）一个单星模式无法同时覆盖两种形状，只提示不生成。新增 58 个模式键；`./core/*`、`./styles/*` 等既有键一律不动。
  - **单组件编译 CSS 不可达**：58 个 `dist/<组件>/style.css` 随包发布但 exports 无任何子路径可用，无 SCSS 管道的消费方只能引全量包。新增 `./dist/*` 导出并在 README（中 / 英）登记用法。

  ## 验证脚本加固
  - **verify:dts 通配符活性检查**：旧实现对含 `*` 的导出目标整体跳过（`if (target.includes('*')) return`），三个最易漂移的映射完全不做校验，深路径盲区因此不可见。现在单星模式断言基目录存在且至少一个文件命中；多星模式直接判为死模式。
  - **verify:dts 模块标记校验**：`lib/package.json`（`{"type":"commonjs"}`）是 `require('@lh-ui/share')` 不报 ERR_REQUIRE_ESM 的唯一支撑，但 Rollup 每次清空 lib/、该文件只在 `build:styles` 重写——部分重跑会产出 Node 拒绝加载的 CJS 包。现在 verify:dts 校验 es/lib 两个标记文件的存在与内容。
  - **tsconfig.build.json `types: []`**：发布声明此前继承 `tsconfig.json` 的 `vite/client` 环境类型（vite 不在 dependencies 里）。src/ 目前零处使用 `import.meta.env`，显式清空防止日后泄漏进 .d.ts。
  - **verify:styles 空目录拦截**：`listScss` 返回 `[]` 时主循环空转、打印「检查 0 个 scss 文件」并 exit 0——styles/ 被清空时 CI 仍绿。现在 0 个文件直接失败。

  ## 测试
  - virtual-list：overscan 传 NaN/负数/小数不崩溃且回落正确；NaN scrollTop/viewportHeight；NaN/非正 defaultSize 回落。
  - tree：禁用子树下 `toggleCheckKeys` 与 `getNodeCheckState` 的交叉一致性（已用变异测试确认：回退修复使该用例失败、其余用例仍通过——既有套件只断言键集、从不验证显示态，正是 bug 漏掉的原因）。
  - select：`highlightedIndex: -1` 且 `listboxId` 有值时无 `aria-activedescendant`（既有用例恰好只测了 listboxId 缺失，绕过了 bug）；非整数下标返回 undefined。
  - form：异步 validator reject 返回错误文案；畸形 pattern 不穿透成用户文案（断言开发者告警被触发）。
  - 新增 `tests/unit/exports.spec.ts`：导出面结构不变量（目录桶与 `./dist/*` 存在、无多星模式、深路径条件三联形态正确、`./types` 纯类型）。产物侧一致性（目标存在 / 模式活跃）由构建后的 verify:dts 兜底，不在 test 步骤重复——es/ 被 gitignore，CI 的 test 在 build 之前跑。
  - 深路径用真实 Node `import()` / `require()` / tsc 实测：`@lh-ui/share/core/tooltip/logic`、`/core/date-picker/adapter`、`/core/icon/svgs`、`/core/shared/date`、`/core/shared/virtual`、`/core/button`、`/locales/lang/zh-CN`、`/utils/css-var` 的 ESM 与 CJS 解析全部通过；类型侧 `import type` 经 `types` 条件解析 `.d.ts` 通过（node16 moduleResolution 消费者实测）。

### Patch Changes

- # 修复 getNextListIndex 不循环模式跳过中间禁用项

  `core/shared/keyboard` 的 `getNextListIndex` 在 `loop: false` 下此前只要碰到任意禁用项就返回 -1，
  导致「中间项禁用、边界项可用」的列表无法导航到边界。现在不循环模式与循环模式行为一致：

  - 中间位置的禁用项照常跳过，继续向边界步进
  - 只有边界项本身被禁用时才返回 -1（无可用目标）

  单测同步补齐：新增边界项禁用的用例，并修正原断言（`getNextListIndex(items, 0, 1, { loop: false })`
  在中间项禁用时应得到边界下标而非 -1）。

## 0.1.0

### Minor Changes

- 首次发布：从 lh-ui-plus 提取的框架无关共享层——core 纯函数（56 组件逻辑 + shared 工具）、theme（SCSS 令牌 + TS 预设）、constants、locales（纯 emitter 版 LhLocale）、types、utils、组件样式源（唯一源，过渡类名双写兼容 Vue2/Vue3/React）。
