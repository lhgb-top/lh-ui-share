---
title: コマンド一覧
description: 'pnpm build / build:styles / build:dts / test / lint / typecheck / verify:* / changeset / release の全表'
---

すべての開発タスクはルート `package.json` の scripts として公開され、パッケージマネージャは `pnpm` に固定されています。

## ビルド

| タスク | コマンド | 成果物 / 役割 |
| --- | --- | --- |
| ビルド | `pnpm build` | `es/` + `lib/`（preserveModules のミラー構造）+ スタイル + dts + `sync:exports` |
| スタイル成果物 | `pnpm build:styles` | `dist/theme/`（明 / 暗テーマの css）+ `dist/styles/`（全量集約） |
| dts | `pnpm build:dts` | `tsc` がミラー構造からそのまま出力する型宣言 |

`pnpm build` は完全なパイプラインで、内部に `build:styles` と `build:dts` を既に含んでいます。**注意**：`sync:exports` は**`package.json` の exports フィールドを書き換えます**——ソースコードのディレクトリ構造を変更したあとは完全な build を一度走らせなければなりません。さもないと下流が `pnpm up` した後に MODULE_NOT_FOUND になります。

## テストと品質

| タスク | コマンド | 役割 |
| --- | --- | --- |
| 単体テスト | `pnpm test` | vitest、`tests/unit/`（**core の単体テストはこの 1 つのみ**、3 ライブラリが結果を共有） |
| Lint | `pnpm lint` | eslint、`src` / `tests` / `scripts` / `vite.config.ts` / `vitest.config.ts` だけを走査 |
| 型 | `pnpm typecheck` | tsc、include は `src/**/*` のみ |

## 検証

| タスク | コマンド | 役割 |
| --- | --- | --- |
| dts 検証 | `pnpm verify:dts` | 成果物の dts とソースの型が一致しているかを検証 |
| scss 検証 | `pnpm verify:styles` | 6 項目（下を参照） |
| テーマのコントラスト | `pnpm verify:theme` | AA 4.5:1 ゲート、`es/` の成果物を読む（**先に `pnpm build` が必要**） |
| バージョン一致性 | `pnpm verify:versions` | 各 UI ライブラリの依存範囲が share の現在のバージョンをカバーしているか |

### verify:styles の 6 項目

1. **EP パレット** —— 色値の色階 / セマンティクスの遵守
2. **var fallback** —— コンポーネント内の `var(--lh-*)` にフォールバック値が必須
3. **@use トークン** —— コンポーネントの scss は `@use` 経由でトークンを参照しなければならず、hex リテラルを引用しない
4. **集約一致性** —— `styles/index.scss` とコンポーネントディレクトリの走査結果が一致していること（集約漏れを防ぐ）
5. **トランジションクラス名の単一ソース** —— 裸書きの `-enter-from` / `-leave-from` を禁止、一律 [transition mixin](/ja/reference/transition-mixins) を使う
6. **ダークモードカバレッジ** —— 明色にベイクされたトークンが `var-dark.scss` に上書きを持っていること（[ダークモード](/ja/theme/dark-mode)を参照）

## リリース

| タスク | コマンド | 役割 |
| --- | --- | --- |
| 変更を書く | `pnpm changeset` | インタラクティブに `.changeset/*.md` を生成 |
| changeset を消費 | `pnpm changeset:version` | バージョン番号を変更、CHANGELOG を書く、リリース待ちの changeset を削除 |
| 公開 | `pnpm release` | `changeset publish`：まず `prepublishOnly`（build + verify:dts + verify:styles）を走らせてから npm に公開し、ローカルで tag を作る |
| push してアーカイブ | `pnpm release:push` | master と今回の tag を GitHub に push し、自動アーカイブをトリガー |

完全なリリースフローは[リリースフロー](/ja/development/release)を参照。

## ドキュメントサイト

| タスク | コマンド | 役割 |
| --- | --- | --- |
| データ生成 | `pnpm docs:data` | `scripts/gen-docs-data.mjs` がトークン / アイコン / クラス名を解析して `docs/src/data/*.json` を生成 |
| ローカル開発 | `pnpm docs:dev` | Astro dev server（`http://localhost:5180/lhui/share/`） |
| ビルド | `pnpm docs:build` | 本番用にビルドして `docs/dist/` に出力 |
| プレビュー | `pnpm docs:preview` | ビルド成果物をプレビュー |

**注意**：`pnpm docs:data` はべき等で、数量のアサーションを伴います（明色 185 / 暗色 118 / SCSS 183 / アイコン 37 / クラス名 58 件）。解析数が合わなければそのままエラーになります。

## 典型的なワークフロー

### core コンポーネントを変更する

```bash
pnpm test                                    # 単体テストを走らせる（テストを先に書く）
pnpm lint && pnpm typecheck                  # 品質
pnpm build                                   # 完全なビルド（sync:exports を含む）
pnpm verify:dts && pnpm verify:styles        # 成果物とスタイルの検証
pnpm changeset                               # 変更を書く
git add -A && git commit                     # コミット（その後 master に取り込む）
```

### スタイルを変更する

```bash
# styles/ だけを変更する場合、build の js 部分は不要
pnpm verify:styles                           # 6 項目の検証
pnpm build:styles                            # dist 成果物を生成
pnpm docs:data                               # トークン表のデータを更新（トークンが変わった場合のみ必要）
```

### 新しいコンポーネントを追加する

```bash
# 1. 3 点セット
#    src/core/<name>/{logic,types,index}.ts
#    tests/unit/core/<name>.spec.ts
#    styles/<name>/index.scss
# 2. src/core/index.ts にエクスポートを追加
# 3. 検証
pnpm test && pnpm lint && pnpm typecheck
pnpm build                                   # sync:exports が新しい exports キーを生成
pnpm verify:dts && pnpm verify:styles
# 4. changeset（minor：コンポーネントの追加）
pnpm changeset
```

**重要**：`sync:exports` を走らせていないと npm 側に対応する exports キーがありません——リリース前に必ず完全な `pnpm build` を通してください。`styles/<name>/index.scss` を追加したあとは両端のビルドスクリプトが自動的にカバーします（それぞれのコンポーネントディレクトリを走査）が、share 側に対応する scss が**必須**です。さもないとそのコンポーネントはいずれかの端でスタイル成果物を持ちません（サイレントスキップします）。

## CI が走らせるもの

`.github/workflows/ci.yml` は PR / master への push のたびに：install → lint → typecheck → test → build → verify:dts → verify:styles（+ E バッチ以降は `docs:build`）を走らせます。

**走らせないもの**：`verify:theme`（コントラストゲート、ローカルで手動で把守）、`verify:versions`（バージョン一致性、リリース後に下流が対応）。

## 依存とツールチェーン

- パッケージマネージャ：`pnpm`（lockfile のコミットが必須）
- ビルド：`vite` + `rollup`（preserveModules）
- 型：`tsc`（`tsconfig.build.json` がミラー構造から dts をそのまま出力）
- テスト：`vitest`
- スタイル：`sass`（`api: 'modern'`）
- changeset：`@changesets/cli`
- ドキュメントサイト：`astro` + `@astrojs/starlight`

## 関連ドキュメント

- [検証システム](/ja/development/verification) —— 6 項目の検証がそれぞれ何を見ているか
- [ビルドとツールスクリプト](/ja/development/scripts) —— `build-styles.mjs` / `gen-docs-data.mjs` など
- [リリースフロー](/ja/development/release) —— 6 ステップのリリース
- [コントリビューション](/ja/development/contribution) —— レッドラインと PR 前のチェックリスト
