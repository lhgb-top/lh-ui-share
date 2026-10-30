---
title: ビルドとツールスクリプト
description: 'scripts/ 配下の 12 個の mjs スクリプトの責務：build-styles / sync-exports / verify-* / gen-docs-data / push-release'
---

`scripts/` はビルドと検証のエンジン層です。`package.json` のコマンドの多くはこれらのスクリプトを薄くラップしたもので、スクリプトを直接実行すればパラメータを付けてデバッグできます。

## スクリプト概要

| スクリプト | コマンドのラップ | 責務 |
| --- | --- | --- |
| `build-styles.mjs` | `pnpm build:styles` | share の scss をコンパイル → `dist/theme/` + `dist/styles/` |
| `sync-exports.mjs` | `pnpm sync:exports`（`pnpm build` に含む） | ソースのディレクトリ構造から `package.json` の exports を生成 |
| `verify-dts.mjs` | `pnpm verify:dts` | 成果物の dts とソースの型が一致しているか |
| `verify-styles.mjs` | `pnpm verify:styles` | scss の 6 項目検証（[検証システム](/ja/development/verification)を参照） |
| `verify-theme-contrast.mjs` | `pnpm verify:theme` | テーマの AA 4.5:1 コントラストゲート |
| `check-version-sync.mjs` | `pnpm verify:versions` | 各 UI ライブラリの依存範囲が share の現在のバージョンをカバーしているか |
| `gen-docs-data.mjs` | `pnpm docs:data` | トークン / アイコン / クラス名を解析 → `docs/src/data/*.json` |
| `push-release.mjs` | `pnpm release:push` | master と tag を GitHub に push してアーカイブをトリガー |
| `release-notes.mjs` | — | リリースノートを生成 |
| `extract-from-plus.mjs` | `pnpm extract` | **使い捨てスクリプト**：plus リポジトリから共有層を抽出（歴史的用途） |
| `normalize-styles.mjs` | — | スタイルの正規化（歴史の使い捨て） |
| `patch-var-fallbacks.mjs` | — | `var()` のフォールバック値を一括補充（歴史の使い捨て） |

## sync-exports.mjs —— exports キーのジェネレータ

**これが最も問題を起こしやすいスクリプトです**。

`@lh-ui/share` の `package.json` には 77 個の exports キー（`./core/button/*` といったサブパス）があり、すべてこのスクリプトが `src/` と `styles/` のディレクトリ構造を**走査して生成**します。

**フロー**：`vite build` の成果物がディスクに落ちる → `sync:exports` が `es/` のディレクトリ構造を走査 → `package.json` の `exports` / `files` フィールドを書き換える。

**なぜ重要か**：

- `src/core/foo/bar.ts` を新しく追加すると、dev 期（ソースの alias 経由）はすぐに使えますが、**npm 側に対応する exports キーがありません**——下流が `pnpm up` した後に MODULE_NOT_FOUND になります。
- **リリース前に必ず完全な `pnpm build` を走らせなければなりません**（sync:exports を含む）、`build:dts` だけでは不十分です。

**このスクリプトは `package.json` を変更するので注意してください**：走らせたあと `git diff` に exports の変化が見えますが、これは正常であり、コミットする必要があります。

## build-styles.mjs —— スタイル成果物

`styles/` の SCSS ソースを css にコンパイルします：

```
dist/
├── theme/
│   ├── index.css          # テーマトークン（明色）
│   └── index-dark.css     # 暗色の上書き
└── styles/
    └── index.css          # 全量集約（トークン + すべてのコンポーネント）
```

**あわせて `styles/index.scss` の全量集約ファイルを生成します**（`styles/*/index.scss` を走査）。`verify:styles` の第 4 項がその一致性を検証します——**このファイルを手書きで変更しないでください**。

各 UI ライブラリには独自の `build-styles.mjs` があります（plus 版は `packages/components` を走査、vue2 版は `src/components` を走査）。share 側にスタイルソースがないコンポーネントは**サイレントスキップ**されます——だから share 側に対応する scss が必須で、さもないとそのコンポーネントはいずれかの端でスタイルを持てません。

## gen-docs-data.mjs —— ドキュメントデータ生成

```bash
pnpm docs:data
```

4 つのソースを解析して `docs/src/data/*.json` を生成します：

| 出力 | ソース | 内容 |
| --- | --- | --- |
| `tokens.json` | `var.scss` + `var-dark.scss` + `variables.scss` | 明色 185 + 暗色 118 + SCSS 変数 183 個、セマンティックドメインごとにグループ化 |
| `icons.json` | `src/.../icon/svgs.ts` | 37 個の内蔵アイコン |
| `classes.json` | `styles/*/index.scss` | 58 件のコンポーネント BEM クラス名一覧 |

**数量のアサーションを伴います**：解析数が期待値（185 / 118 / 183 / 37 / 58）と不合致ならそのまま例外を投げます。これが「トークンの誤削除 / コンポーネントの誤削除」を防ぐ最初の防波堤です。

**べき等**：何度走らせてもよく、内容が変化したときだけ json を書き換えます。トークンやクラス名を変更したあとに一度走らせてドキュメントのデータを更新してください。

## push-release.mjs —— リリースの push

```bash
pnpm release:push
```

`pnpm release`（npm への公開 + ローカルでの tag 作成）のあとに走らせます：

1. master を `github-lhgb` に push
2. 今回のバージョン tag を `github-lhgb` に push
3. `.github/workflows/release.yml` をトリガー：npm から公開済みの tarball を取得 → GitHub Release を作成（`lh-ui-share-<version>.tgz` を添付）→ tag を Gitee に push し Gitee API でリリースを作成

**push するのは GitHub のみで、Gitee に手動で tag を push しないでください**——Gitee の tag / リリースは release.yml が一括して管理し、二重書きが衝突します。

## verify-theme-contrast.mjs —— コントラストゲート

`es/` の成果物を読むため（**先に `pnpm build` が必須**）、`src/theme/themes/index.ts` がエクスポートする `getRelativeLuminance` / `getContrastRatio` で「文字 / 背景」のすべてのペアの WCAG コントラスト比を計算し、4.5:1 を下回ると失敗にします。

単一の配色をデバッグするときは、全量ゲートを走らせずに node でこの 2 つの関数を直接呼べます。

## 履歴の使い捨てスクリプト

| スクリプト | 説明 |
| --- | --- |
| `extract-from-plus.mjs` | share リポジトリの新規作成時に lh-ui-plus から共有層を抽出したもの。**記録として残すだけで、もう走らせない**——share が既に唯一のソース（レッドライン 2）。 |
| `normalize-styles.mjs` | 早期のスタイル正規化（トークン参照方法の統一）。使命は完了している。 |
| `patch-var-fallbacks.mjs` | `var(--lh-*)` にフォールバック値を一括で補充したもの。verify:styles の第 2 項（var fallback）が稼働する前の移行ツール——**新規のコードは必ず自分で fallback を書いてください。このスクリプトがフォローしてくれることを当てにしないこと**。 |

## docs サイトは npm 成果物ではない

`package.json` の `files: ["es", "lib", "dist", "styles"]` には **`docs/` が含まれません**。ドキュメントサイトは `pnpm docs:build` で `docs/dist/` にビルドされ、ファミリーの nginx に手動でデプロイされます（契約は `lh-ui/docs/部署/nginx-lhui.conf.md`、別リポジトリ）。詳細は[リリースフロー](/ja/development/release)を参照。

## 関連ドキュメント

- [コマンド一覧](/ja/development/commands) —— 各 script に対応する pnpm コマンド
- [検証システム](/ja/development/verification) —— verify 系スクリプトがそれぞれ何を検査しているか
- [リリースフロー](/ja/development/release) —— push-release と CI によるアーカイブ
- [パッケージエントリとサブパス](/ja/guide/exports) —— sync-exports が生成する 77 個のキー
