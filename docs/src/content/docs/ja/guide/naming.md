---
title: 命名規約
description: top.lhgb リバースドメインルート、LH / Lh / lh / lh- の 4 段階プレフィックスと 3 つの適用除外の登録
---

# 命名規約

ファミリー全体で命名規約を統一しており、plus リポジトリの
`docs/project/development-guide.md` と揃えています。

## リバースドメインルート

**`top.lhgb`**（`www.lhgb.top` を逆にしたもの）は、lh-ui ファミリーのすべての
リポジトリの命名ルートです。

- **JS / npm 側**：パッケージ名は `@lh-ui/*` scope を維持します——npm のパッケージ名は
  ドットを許可しないため、`top.lhgb` をそのままパッケージ名にはできません。リバース
  ドメインは**メタ情報層**に置きます：`package.json` の `homepage` / `repository` /
  `author` はすべて `lhgb.top` を使用します。
- **ネイティブ端**：`lh-ui-android` / `lh-ui-ios` / `lh-ui-harmony` / `lh-ui-c` の
  applicationId / bundleId / package でこそ `top.lhgb.*` 形式を使用します（本リポジトリには
  ありません）。

## LH プレフィックスの 4 段階

**サードパーティ以外のシンボルは必ず `LH` プレフィックスを付けます**。定数 / 型 / インターフェイスを
追加した時点で従い、後からまとめて直すことはしません：

| 段階 | 形態 | 例 |
| --- | --- | --- |
| 定数 | `LH_XXX`（全大文字スネーク） | `LH_SIZE_DEFAULT`、`LH_LANGUAGE_DEFAULT`、`LH_THEME_PRESETS` |
| 型 / インターフェイス | `LhXxx`（パスカルケース） | `LhThemePreset`、`LhSxProps`、`LhVirtualRange` |
| モジュールレベルのシングルトン / 小文字オブジェクト | `lhXxx`（キャメルケース） | `lhlocale` |
| BEM クラス名 / コンポーネント name | `lh-xxx` / `LhXxx` | `.lh-button--primary`、`name: 'LhButton'` |

定数の命名構造は **`LH_<モジュール>_<概念>`** で、デフォルト値の定数は `DEFAULT` を
接尾辞にします：

- `LH_DRAWER_DIRECTION_DEFAULT`（`LH_DEFAULT_DRAWER_DIRECTION` ではない）
- `LH_DROPDOWN_PLACEMENT_DEFAULT`、`LH_POPCONFIRM_TYPE_DEFAULT`

既存の `LH_SIZE_DEFAULT` / `LH_LANGUAGE_DEFAULT` と一致させます。

## 適用除外の登録

慣例として定着しており、プレフィックスを強制しません。**変更する前にここに理由を登録して
ください**：

| シンボル | 理由 |
| --- | --- |
| 言語パックのエクスポート `zhCN` / `enUS` | 標準的な locale 命名であり、`@lh-ui/vue3` / `@lh-ui/vue2` / uniapp が公開 API として再エクスポートしているため、改名の影響範囲が大きすぎる |
| テーマプリセット名の**文字列値**（`name: 'cerblue'` など） | これはユーザーが ConfigProvider の `theme` に書く設定値で、変更するとすべての下流ユーザーの設定が壊れる。対応する **TS 識別子**には引き続きプレフィックスを付ける（`LhCerblue`） |
| サードパーティ依存のエクスポートシンボル（`deepMerge` 以外に導入したユーティリティなど） | 強制しない |

## 0.4.0 での改名

0.4.0 より前、本リポジトリはファミリーのプレフィックス規約に追随しておらず、今回自分の側を
補完しました。すべて識別子レベルの機械的な置換です。マッピング表は
[0.4.0 移行ガイド](/ja/guide/migration-04)を参照してください。
