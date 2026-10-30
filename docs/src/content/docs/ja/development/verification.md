---
title: 検証システム
description: 'verify:dts / verify:styles の 6 項目 / verify:theme の AA ゲート / verify:versions がそれぞれ何を検査し、出力をどう読むか'
---

lh-ui の「検証」は儀式ではありません——各項目が**かつて実際に発生した**回帰をそれぞれブロックしています。本文は項目ごとに何を検査するか、失敗の出力をどう読むかを説明します。

## verify:dts —— 成果物の型一致性

```bash
pnpm verify:dts
```

**何を検査するか**：`es/` / `lib/` にコンパイルされた `.d.ts` がソースの型宣言と一致しており、かつ exports キーが指すファイルが実在すること。

**典型的な失敗**：

- ソースの型を変更したのに `pnpm build` を走らせていない（成果物が古い）
- `sync:exports` が exports キーを生成したが、対応するファイルがビルドされていない（パスの組み立て間違い）
- `import type` を `import` と書いてしまい、成果物にランタイムコードが余分に入っている

**直し方**：`pnpm build` を完全に再実行してから、再度 `pnpm verify:dts`。

## verify:styles —— 6 項目

```bash
pnpm verify:styles
```

スクリプト：`scripts/verify-styles.mjs`。6 項目を順番に実行し、いずれかが失敗すれば即座に終了します。

### 1. EP パレット

ブラックリスト検査：EP（Element Plus）から残存する 9 つの色値（`#409eff`、`#e6a23c`、`#f56c6c`、`#67c23a`、`#909399`、`#606266`、`#303133`、`#ebeef5`、`#c0c4cc`）が `styles/` の scss ファイルに出現すれば失敗です。これは D2 の洗浄後の回帰ガードで、旧体系の色が再び戻ってくるのを防ぎます——lh-ui の色は一律に `styles/theme/common/variables.scss` のトークン定義に由来します。

### 2. var fallback

コンポーネントの scss 内のすべての `var(--lh-*)` にフォールバック値があるかを検査します：

```scss
// ✅ 通過
color: var(--lh-text-primary, rgba(0, 0, 0, 0.88));

// ❌ 失敗
color: var(--lh-text-primary);
```

**理由**：トークンが欠けているとき（ユーザーが一部のスタイルしか使わない、旧バージョンにトークンが存在しない）、フォールバックのない `var()` は無効な値に解決され、プロパティが捨てられます——文字がデフォルトの黒になり、ボーダーが消えます。フォールバックがあれば「降級しても使える」ことが保証されます。

### 3. @use トークン

コンポーネントの scss がトークン層を `@use` 経由で参照しているか、hex リテラルが散らばっていないかを検査します：

```scss
// ✅ 通過
@use 'theme/common/var' as *;
.lh-card { background: var(--lh-bg-color, #fff); }

// ❌ 失敗
.lh-card { background: #ffffff; }
```

**適用除外**：`var()` のフォールバック値には hex を書けます（降級のためのものです）。失敗のメッセージにはファイルと行番号が列挙されます。

### 4. 集約一致性

`styles/index.scss`（全量集約）が「`styles/*/index.scss` を走査して得られたコンポーネント一覧」と一致しているかを検査します。**`styles/index.scss` は `scripts/build-styles.mjs` が生成するもので、手書きで変更しないでください**——コンポーネントのディレクトリを追加したあと生成を再実行しないと不一致になります。

### 5. トランジションクラス名の単一ソース

コンポーネントの scss に `-enter-from` / `-leave-from` リテラルが**裸書き**されていないかを検査します：

```scss
// ❌ 失敗：トランジションクラス名を二重に手書きしている
.lh-dialog-fade-enter-from { opacity: 0; }

// ✅ 通過：mixin を使っている
@include lh-enter-both('.lh-dialog-fade') { opacity: 0; }
```

**理由**：Vue2 は `-enter`、Vue3/React は `-enter-from` を使い、手書きすれば必ずどちらかが漏れます（[transition-mixins](/ja/reference/transition-mixins)を参照）。かつて 16 個のコンポーネントがそれぞれ二重書きを持ち、一箇所直せば一箇所漏れていました。

### 6. ダークモードカバレッジ

`var.scss` で値が `#{$lh-foo}` の形（コンパイル期に明色にベイクされる）のトークンが、`var-dark.scss` に**対応する上書きを持っているか**を検査します。

**これが最も重要な項目です**。この種の抜けがかつて暗色でメニュー / テーブル / タイムラインの文字が明色の値のままになり**見えなく**なりました（黒地に黒字）。[ダークモードの「コンパイル期にベイクされる罠」](/ja/theme/dark-mode#コンパイル期にベイクされる罠)を参照。

**注意**：かつて誤報の修正が一度ありました——verify:styles のインデックスのずれが `no-fallback` 適用除外行を誤報したものです（コミット `791ff32`）。失敗メッセージに筋が通らないものがあれば（適用除外されている行がまだエラーになるなど）、まずこの既知の問題かどうかを確認してください。

## verify:theme —— AA コントラストゲート

```bash
pnpm build          # ← 先に必ず走らせる、es/ の成果物を読むため
pnpm verify:theme
```

スクリプト：`scripts/verify-theme-contrast.mjs`。

**何を検査するか**：5 つの内蔵テーマ（及びその暗色バリアント）の中の、すべての「文字 / 背景」ペアの WCAG コントラスト比が **4.5:1**（AA レベル）以上であること。

**なぜ es/ の成果物を読むのか**：プリセットテーマの vars はビルド後に最終的な姿になります（`buildPresetDarkVars` の導出結果も成果物に入る）。

**典型的な失敗**：

- 新しいプリセットの主色が浅いのに `--lh-color-on-primary` を与えていない（浅い主色の上の白字は 3.x:1 しかない）
- 選択状態の文字色（`--lh-selected-color`）が hover の地色の上でコントラスト比不足

**直し方**：関連する色値を深く / 浅く調整し、コントラスト比が基準に達するまで続けます。`getContrastRatio()` と `getRelativeLuminance()`（`src/theme/themes/index.ts` がエクスポート）を使えばローカルで計算でき、毎回全量ゲートを走らせる必要はありません。

**CI はこの項目を走らせません**——先に build が必要で、計算量も少なくないためです。ローカルのリリース前に手動で把守します。

## verify:versions —— バージョン一致性

```bash
pnpm verify:versions
```

スクリプト：`scripts/check-version-sync.mjs`。

**何を検査するか**：lh-ui-plus / lh-ui-vue2 の `package.json` における `@lh-ui/share` の依存範囲が、share の現在のバージョンを**カバーしているか**。

**現在の状態**：share が `0.3.0` のときは通ります。**0.4.0 の公開後は失敗します**——2 つの UI ライブラリの依存範囲がまだ `^0.3.0` だからです。これは**想定された挙動**です：[レッドライン 5](/ja/development/contribution#6-つのレッドライン)（share が先にリリースし、UI ライブラリがその後に続く）に従い、リリース後に両方の兄弟リポジトリへ行ってそれぞれ `pnpm up @lh-ui/share@0.4.0` を実行し回帰させます。

## lint と typecheck

| コマンド | 走査範囲 |
| --- | --- |
| `pnpm lint` | `src` / `tests` / `scripts` / `vite.config.ts` / `vitest.config.ts` |
| `pnpm typecheck` | `src/**/*`（`tsconfig.json` の include） |

**`docs/` は走査範囲外**——ドキュメントサイトは独立した Astro プロジェクトで、品質は `pnpm docs:build` が把守します。同様に `styles/` も typecheck の範囲外です（SCSS は verify:styles が管轄）。

**lint のフレームワーク依存ゲート**：CI は `src/` に `import 'vue'` / `import 'react'` / `@dcloudio/*` が出現しないかを grep します——これは[レッドライン 1](/ja/development/contribution#6-つのレッドライン)で、core はフレームワーク非依存でなければなりません。

## テスト

```bash
pnpm test
```

`tests/unit/` は **core の単体テストが唯一存在する場所**（レッドライン 3）です：3 ライブラリが結果を共有し、UI ライブラリはコピーできません。純関数のテストにコンポーネントのレンダリングは不要です——rect のリテラルをこしらえて出力をアサーションする、という形を 4 つの端で共有します。

主要なテストファイル：

| ファイル | カバー範囲 |
| --- | --- |
| `theme.spec.ts` | プリセット的一致性（JS vars と SCSS 変数のデュアルソース同期） |
| `core/*.spec.ts` | 各 core コンポーネントのロジック |
| `shared/*.spec.ts` | 共有コアのアルゴリズム（popper / keyboard / virtual など） |

## 検証をすべて実行する

リリース前の完全なリスト：

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build                    # 注意：sync:exports が package.json を変更する
pnpm verify:dts
pnpm verify:styles            # 6 項目
pnpm verify:theme             # 先に build が必要
pnpm verify:versions          # リリース後は下流の対応に回る
pnpm docs:build               # ドキュメントサイト
```

`prepublishOnly`（`pnpm release` がトリガー）に含まれるのは build + verify:dts + verify:styles だけです。だから **test / lint / typecheck / verify:theme は明示的に手動で走らせる必要があります**。

## 関連ドキュメント

- [コマンド一覧](/ja/development/commands)
- [ビルドとツールスクリプト](/ja/development/scripts)
- [リリースフロー](/ja/development/release)
- [ダークモード](/ja/theme/dark-mode)
- [スタイルソース](/ja/reference/styles)
