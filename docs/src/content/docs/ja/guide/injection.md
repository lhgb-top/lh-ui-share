---
title: 各フレームワークのスタイル注入戦略
description: share はスタイルの内容だけを提供し、注入方法は各 UI ライブラリが選択——両端で戦略が異なる設計上の理由
---

# 各フレームワークのスタイル注入戦略

**share はスタイルの内容**（SCSS ソース + トークン）**だけを提供し、注入方法は各 UI ライブラリ
が自分で選びます**。両端で戦略が異なるのは設計であり欠陥ではありません。どちらの端もその
ためにコンポーネント scss のコピーをローカルに持ってはなりません（レッドライン 2）。

## 両端の対照

| | lh-ui-plus（Vue3） | lh-ui-vue2 |
| --- | --- | --- |
| ライブラリエントリでの注入 | 全体を side-effect で注入：`src/index.ts` がコンポーネントごとに `import '@lh-ui/share/styles/<name>'` を実行、ライブラリを読み込むだけで全スタイルが得られる | 注入しない。ユーザーがオンデマンドで `@lh-ui/vue2/theme.css` + `@lh-ui/vue2/style/<name>` を読み込む |
| スタイル成果物 | `es\|lib/<name>/style/index.css` + `es/<name>/style/index.scss`（scss ソースを成果物に同梱、`@use` は bare specifier に書き換え） | `es\|lib/components/<name>/style/index.css`（css のみ） |
| テーマ成果物 | `theme/index.css` + `dist/index.css`（テーマ + 全体） | `dist/theme/index.css`（明）+ `dist/theme/index-dark.css`（暗） |
| オンデマンドサブパス | `./style/*` → `es/*/style/index.scss`；`./style-css/*` → `es/*/style/index.css` | `./style/*` → `es/components/*/style/index.css`；`./theme.css`、`./theme-dark.css` |
| ビルドスクリプト | `lh-ui-plus/scripts/build-styles.mjs`（コンポーネント一覧は `packages/components` を走査） | `lh-ui-vue2/scripts/build-styles.mjs`（`src/components` を走査、share にスタイルソースがないコンポーネントは自動的にスキップ） |

## なぜ両端で違うのか

- **Vue3 端**は「ライブラリを読み込めばすぐ使える」多数派向けです：vite エコシステムは
  side-effect のスタイル注入と相性がよく、全体注入ならユーザーがオンデマンド設定をする
  コストを省けます。tree-shaking はそもそもスタイルには効かないので、全体のほうがむしろ
  手間がかかりません。
- **Vue2 端**は古いプロジェクトとバンドルサイズに敏感なシナリオ向けです：webpack 4 時代は
  side-effect 注入の設定を誤りやすく、オンデマンド読み込み（2 行の import）のほうが制御
  しやすく、ユーザーが明色だけまたは暗色だけを読み込むこともできます。

## コンポーネント追加時のカバレッジ

コンポーネントを追加すると、**両端のビルドスクリプトが自動的に拾います**（それぞれの
コンポーネントディレクトリを走査）が、share の `styles/` に対応する `<name>/index.scss` が
存在しなければ、そのコンポーネントはどちらかの端でスタイル成果物を持ちません（**サイレント
スキップ**で、エラーにはなりません）。これは「スタイル唯一ソース」というレッドラインが
もたらす直接の制約です：まず share にスタイルを作り、次に各端にコンポーネントを作ります。

## クロスフレームワークのトランジションクラス名：3 つの mixin で統合

Vue2 のトランジションクラス名は `-enter` / `-leave`、Vue3 / React は `-enter-from` /
`-leave-from` です（`-leave-to` は両端同名）。両方を手書きすれば必ずドリフトするため、
必ず `@include` します：

```scss
@use '@lh-ui/share/styles/theme/common/transition' as *;

.lh-dialog-fade {
  @include lh-enter-both;          // -enter + -enter-from（Vue3）
  @include lh-leave-both;          // -leave + -leave-from
  @include lh-transition-ends;     // -enter-to + -leave-to（両端同名）
}
```

状態を**子孫ノード**に載せる必要がある場合は第 2 引数を渡します：

```scss
@include lh-transition-ends('.lh-drawer-fade', '.lh-drawer__panel--right');
```

コンポーネントスタイルは**トランジションクラス名を二重に手書きすることを禁止**します。

## テーマカスタマイズ成果物の注入制約

`buildPresetStyleText(vars)` は注入可能な `<style>` テキスト（`:root` + 暗色ブロック）を
生成します。UI 層が採用する際は**`<style>` 要素だけを書き、`documentElement` のインライン
style を書いてはなりません**：

> インライン style は詳細度が `var-dark.scss` の暗色変数ブロック全体より高く、ダークモード
> の配色を歪めてしまいます。

詳しくは[ランタイムカスタマイズ](/ja/theme/customization)を参照してください。
