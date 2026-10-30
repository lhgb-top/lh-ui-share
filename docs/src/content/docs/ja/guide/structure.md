---
title: パッケージ構成
description: src / styles / tests / scripts のディレクトリ責務、および 56 と 58 という 2 つのコンポーネント数の基準
---

# パッケージ構成

## ソース側

```
lh-ui-share/
├── src/
│   ├── core/                  コンポーネント純関数層（フレームワークインポートなし、CI grep ゲート）
│   │   ├── <コンポーネント>/  logic.ts / types.ts / index.ts の 3 点セット
│   │   └── shared/            コンポーネント横断の共有コア（12 モジュール、<name>/index.ts に正規化済み）
│   ├── theme/                 テーマ TS 側：types + 5 つのプリセット + ランタイムプリミティブ
│   ├── constants/             LH_* 定数（LH_SIZE_DEFAULT / LH_LANGUAGE_DEFAULT …）
│   ├── locales/               LhLocale（純 emitter）+ lang/ 10 個の完全な言語パック
│   ├── types/                 パブリック型（locale / components）
│   ├── utils/                 純ユーティリティ（createNamespace / deepMerge …）
│   └── index.ts               全体集約エントリ
├── styles/                    コンポーネント BEM スタイルの唯一ソース
│   ├── <コンポーネント>/index.scss 58 セットのコンポーネントスタイル
│   └── theme/
│       ├── common/
│       │   ├── var.scss       明色トークン（:root、185 個の --lh-*）
│       │   ├── var-dark.scss  暗色の上書き（[data-theme='dark'], .dark、118 条）
│       │   ├── variables.scss 183 個の $lh-* SCSS 変数（!default）
│       │   ├── patterns.scss  6 つの中華風紋様 mixin
│       │   ├── transition.scss 3 つのトランジションクラス名 mixin（両端の差異を統合）
│       │   └── a11y.scss      アクセシビリティ補助スタイル
│       └── index.scss         テーマ集約
│   └── index.scss             全体集約（トークン + 全コンポーネント、スクリプト生成、手で編集しない）
├── tests/unit/                core 単体テストの唯一のコピー（3 ライブラリで共有、重複コピーなし）
├── scripts/                   ビルドと検証スクリプト
├── docs/                      このドキュメントサイト（Astro Starlight）
└── .changeset/                未リリースの changeset
```

## 各ディレクトリの責務

| ディレクトリ | 責務 | レッドライン |
| --- | --- | --- |
| `src/core/<name>/` | コンポーネント純関数：クラス名計算 / ステートマシン / aria 属性パック | `import 'vue' \| 'react' \| '@dcloudio/*'` を禁止 |
| `src/core/shared/` | コンポーネント横断コア、各端から直接再利用される | 同上；`<name>/index.ts` に正規化済み |
| `styles/` | コンポーネント BEM スタイルの**唯一ソース** | スタイルを UI ライブラリへコピーして手で編集することを禁止；クラス名は `lh-*`；色は必ず `var(--lh-*, fallback)` |
| `tests/unit/` | core 単体テストの**唯一のコピー** | UI ライブラリは複製してはならない |
| `scripts/` | extract-from-plus（一回限り） / build-styles / verify-* / release | — |

## コンポーネント数の基準：56 か 58 か

どちらの数字も正しく、測っているものが違います：

| 基準 | 数字 | 出所 |
| --- | --- | --- |
| core 純関数コンポーネント | **56** | `src/core/` 配下のコンポーネントディレクトリ（`shared/` を除く） |
| コンポーネントスタイルのセット数 | **58** | `styles/` 配下のコンポーネントディレクトリ（`theme/` を除く） |

差異は次の 3 つです：

| 名前 | core | styles | 理由 |
| --- | --- | --- | --- |
| `layout` | — | ✅ | レイアウトコンテナ、ロジックはすべて UI 層（row/col のレスポンシブブレークポイント配線） |
| `tree-select` | — | ✅ | セレクターのグルーはフレームワーク側、ツリーデータのロジックは `core/tree` を再利用 |
| `config` ↔ `config-provider` | `config` | `config-provider` | 同じものが 2 つのディレクトリ名で存在 |

## ビルド成果物

`pnpm build` は 4 つのディレクトリを生成し、`files` はこの 4 つのみを公開します：

| 成果物 | 構造 | 説明 |
| --- | --- | --- |
| `es/` | preserveModules が `src/` をミラー | ESM、サブパスはファイル単位でオンデマンド |
| `lib/` | 同上 | CJS（`require` 条件） |
| `dist/` | `dist/theme/*.css` `dist/styles/index.css` | 集約スタイル成果物 |
| `styles/` | そのまま同梱して公開 | **SCSS ソース**、プロジェクト側でコンパイルするため |

成果物は**フレームワーク依存ゼロ**を維持します：`verify:dts` が `es/**/*.d.ts` を走査し、
フレームワークのインポートが現れた時点で失敗します。

## 単一コンポーネント成果物の中身（button を例に）

```
es/button/
├── index.d.ts        型
├── index.js          ESM
├── logic.d.ts
├── logic.js
├── types.d.ts
└── style/
    ├── index.css     コンパイル済みのコンポーネントスタイル（plus 端の形態）
    └── index.scss    ソース（@use は bare specifier に書き換え済み、成果物に同梱）
```

`lib/button/` も同構成です。両端の UI ライブラリはそれぞれさらにもう 1 層
`es/components/<name>/style/index.css` で包みます（vue2 端は css のみで scss は公開しません）。
