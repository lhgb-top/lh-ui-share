---
title: 命名约定
description: top.lhgb 反域名根、LH / Lh / lh / lh- 四档前缀与三条豁免登记
---

# 命名约定

全家族命名规范统一，与 plus 仓 `docs/project/development-guide.md` 对齐。

## 反域名根

**`top.lhgb`**（反写 `www.lhgb.top`）是 lh-ui 家族所有仓的命名根。

- **JS / npm 端**：包名维持 `@lh-ui/*` scope——npm 包名不允许点号，`top.lhgb` 无法
  直接做包名。反域名落**元信息层**：`package.json` 的 `homepage` / `repository` /
  `author` 统一用 `lhgb.top`。
- **原生端**：`lh-ui-android` / `lh-ui-ios` / `lh-ui-harmony` / `lh-ui-c` 的
  applicationId / bundleId / package 才使用 `top.lhgb.*` 形式（不在本仓）。

## LH 前缀四档

**非第三方符号必须带 `LH` 前缀**，新增常量 / 类型 / 接口时即遵守，不要留到事后统一改：

| 档位 | 形态 | 例子 |
| --- | --- | --- |
| 常量 | `LH_XXX`（全大写下划线） | `LH_SIZE_DEFAULT`、`LH_LANGUAGE_DEFAULT`、`LH_THEME_PRESETS` |
| 类型 / 接口 | `LhXxx`（大驼峰） | `LhThemePreset`、`LhSxProps`、`LhVirtualRange` |
| 模块级单例 / 小写对象 | `lhXxx`（小驼峰） | `lhlocale` |
| BEM 类名 / 组件 name | `lh-xxx` / `LhXxx` | `.lh-button--primary`、`name: 'LhButton'` |

常量命名结构为 **`LH_<模块>_<概念>`**，默认值常量以 `DEFAULT` 作后缀：

- `LH_DRAWER_DIRECTION_DEFAULT`（不是 `LH_DEFAULT_DRAWER_DIRECTION`）
- `LH_DROPDOWN_PLACEMENT_DEFAULT`、`LH_POPCONFIRM_TYPE_DEFAULT`

与既有 `LH_SIZE_DEFAULT` / `LH_LANGUAGE_DEFAULT` 保持一致。

## 豁免登记

约定俗成、不强制加前缀。**改动前先在此登记理由**：

| 符号 | 理由 |
| --- | --- |
| 语言包导出 `zhCN` / `enUS` | 标准 locale 命名，且被 `@lh-ui/vue3` / `@lh-ui/vue2` / uniapp 作为公开 API 再导出，改名破坏面过大 |
| 主题预设名的**字符串值**（`name: 'cerblue'` 等） | 这是用户在 ConfigProvider `theme` 里写的配置值，改了破坏所有下游用户配置；对应的 **TS 标识符**仍加前缀（`LhCerblue`） |
| 第三方依赖的导出符号（如 `deepMerge` 之外引入的工具） | 不强制 |

## 0.4.0 的改名

0.4.0 前本仓没跟进家族前缀规范，本次补齐了自己这一侧。全部是标识符级机械替换，
映射表见 [0.4.0 迁移指南](/guide/migration-04)。
