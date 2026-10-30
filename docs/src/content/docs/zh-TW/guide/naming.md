---
title: 命名約定
description: top.lhgb 反域名根、LH / Lh / lh / lh- 四檔前綴與三條豁免登記
---

# 命名約定

全家族命名規範統一，與 plus 倉 `docs/project/development-guide.md` 對齊。

## 反域名根

**`top.lhgb`**（反寫 `www.lhgb.top`）是 lh-ui 家族所有倉的命名根。

- **JS / npm 端**：套件名維持 `@lh-ui/*` scope——npm 套件名不允許點號，`top.lhgb` 無法
  直接做套件名。反域名落**元資訊層**：`package.json` 的 `homepage` / `repository` /
  `author` 統一用 `lhgb.top`。
- **原生端**：`lh-ui-android` / `lh-ui-ios` / `lh-ui-harmony` / `lh-ui-c` 的
  applicationId / bundleId / package 才使用 `top.lhgb.*` 形式（不在本倉）。

## LH 前綴四檔

**非第三方符號必須帶 `LH` 前綴**，新增常數 / 類型 / 介面時即遵守，不要留到事後統一改：

| 檔位 | 形態 | 例子 |
| --- | --- | --- |
| 常數 | `LH_XXX`（全大寫下劃線） | `LH_SIZE_DEFAULT`、`LH_LANGUAGE_DEFAULT`、`LH_THEME_PRESETS` |
| 類型 / 介面 | `LhXxx`（大駝峰） | `LhThemePreset`、`LhSxProps`、`LhVirtualRange` |
| 模組級單例 / 小寫物件 | `lhXxx`（小駝峰） | `lhlocale` |
| BEM 類別名 / 元件 name | `lh-xxx` / `LhXxx` | `.lh-button--primary`、`name: 'LhButton'` |

常數命名結構為 **`LH_<模組>_<概念>`**，預設值常數以 `DEFAULT` 作後綴：

- `LH_DRAWER_DIRECTION_DEFAULT`（不是 `LH_DEFAULT_DRAWER_DIRECTION`）
- `LH_DROPDOWN_PLACEMENT_DEFAULT`、`LH_POPCONFIRM_TYPE_DEFAULT`

與既有 `LH_SIZE_DEFAULT` / `LH_LANGUAGE_DEFAULT` 保持一致。

## 豁免登記

約定俗成、不強制加前綴。**改動前先在此登記理由**：

| 符號 | 理由 |
| --- | --- |
| 語言包匯出 `zhCN` / `enUS` | 標準 locale 命名，且被 `@lh-ui/vue3` / `@lh-ui/vue2` / uniapp 作為公開 API 再匯出，改名破壞面過大 |
| 主題預設名的**字串值**（`name: 'cerblue'` 等） | 這是使用者在 ConfigProvider `theme` 裡寫的設定值，改了破壞所有下游使用者設定；對應的 **TS 識別字**仍加前綴（`LhCerblue`） |
| 第三方依賴的匯出符號（如 `deepMerge` 之外引入的工具） | 不強制 |

## 0.4.0 的改名

0.4.0 前本倉沒跟進家族前綴規範，本次補齊了自己這一側。全部是識別字級機械替換，
映射表見 [0.4.0 遷移指南](/guide/migration-04)。
