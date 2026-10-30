---
title: ランタイムカスタマイズ
description: 'themeVars の省略記法へのプレフィックス補完、componentTheme のコンポーネント単位の上書き、patternComponents の紋様ホワイトリスト'
---

ランタイムカスタマイズは lh-ui テーマシステムの中核能力です：**スタイルを再コンパイルせずに**、ランタイムでコンポーネントの appearance を変えます。3 つの API がそれぞれ 1 つの層を担います。

## 一、themeVars —— グローバルトークンの上書き

ConfigProvider は `themeVars` を受け取り、キーは**省略記法**です：

```vue
<lh-config-provider
  :theme-vars="{
    'primary-color': '#1677ff',
    'border-radius-base': '8px',
  }"
>
  <App />
</lh-config-provider>
```

### 省略記法にプレフィックスを補う

`'primary-color'` は自動的に `--lh-primary-color` に補われます。この補完は [toCssVarName](/ja/reference/utils#cssvars-3-点セット) が担い、**べき等**です（既にプレフィックスが付いたキーはそのまま返し、`--lh---lh-...` にはしない）。

完全名をそのまま書くこともできます：

```ts
{ '--lh-primary-color': '#1677ff' }   // 同等
```

内部実装は `cssVars(themeVars)` で、キーと値のペアをそのまま `:style` にバインドできる CSS 変数オブジェクトに変換します。

### スコープは DOM の部分木

CSS 変数は本来的にカスケードします：ConfigProvider が変数をラップ要素に注入し、**その子孫のコンポーネントだけが新しい値を消費します**。これによって部分的なスキン切り替えができます：

```vue
<lh-config-provider :theme-vars="brandVars">
  <Header />
</lh-config-provider>

<lh-config-provider :theme-vars="neutralVars">
  <Content />
</lh-config-provider>
```

### docs サイトのエクスポートは同じもの

docs のテーマカスタマイズページがエクスポートする `:root { --lh-*: ... }` のテキストと `themeVars` は**同じもの**をファイルに落としたものです——そのままプロジェクトのエントリに貼れます：

```css
/* プロジェクトのエントリ */
:root {
  --lh-primary-color: #2B4C7C;
  --lh-primary-color-hover: #3D649E;
  /* ... */
}
```

## 二、componentTheme —— コンポーネント単位の上書き

`themeVars` はグローバルです；ときにはコンポーネント 1 つのトークンだけを変えたい場合があります（すべてのボタンの角丸は変えたいが、他のコンポーネントはそのまま、など）。

```vue
<lh-config-provider
  :component-theme="{
    button: { 'border-radius': '20px' },
    input: { 'control-height-medium': '40px' },
  }"
>
  <App />
</lh-config-provider>
```

key はコンポーネント名（`styles/` のディレクトリ名）で、value はそのコンポーネントのスコープ内での `themeVars` です。注入される変数はコンポーネクトのプレフィックスをスコープとして帯び、指定したコンポーネントにだけ影響します。キー名はトークン名と一致しなければなりません（`control-height-medium` → `--lh-control-height-medium`）——`input` のデフォルト段階は medium で、段階のサフィックスなしの `control-height` を消費するコンポーネントはありません。

**注意**：コンポーネントレベルのトークンは、そのコンポーネントの SCSS が `var(--lh-<name>-*)` で該当トークンを消費していることに依存します——すべてのコンポーネントがすべてのスタイルポイントをトークン化しているわけではなく、何を変えられるかは[デザイントークン](/ja/theme/tokens)の表のそのコンポーネントの挙動が基準です。

## 三、patternComponents —— 紋様ホワイトリスト

中華風紋様（[中華風紋様](/ja/theme/patterns)を参照）はデフォルトで**有効になりません**。有効にすると背景に影響するため、すべてのコンポーネントに適しているわけではありません（テーブルの背景に梅の花を印刷すると雑然とします）。

`patternComponents` がどのコンポーネントに紋様を適用するかを制御します：

```vue
<lh-config-provider
  :pattern-components="['card', 'dialog', 'drawer']"
  pattern="plum"
>
  <App />
</lh-config-provider>
```

ホワイトリストに入ったコンポーネントだけが紋様を帯びます。具体的な props 名は各 UI ライブラリの ConfigProvider ドキュメントを優先してください。

## 四、プリセット + カスタマイズの重ね合わせ

3 つは重ね合わせ可能で、優先度は「子孫が祖先を上書き、具体的なものがグローバルを上書き」です：

```vue
<lh-config-provider
  theme="cerblue"
  :theme-vars="{ 'border-radius-base': '4px' }"
>
  <!-- まず青花瓷プリセットを適用し、その後 themeVars で角丸を微調整 -->
  <App />
</lh-config-provider>
```

## 五、暗色とカスタマイズの関係

カスタマイズした `themeVars` が注入された要素にだけ、その部分木の明暗が影響を受けます：

```vue
<!-- このブロックは強制的に暗色 -->
<div data-theme="dark">
  <lh-button>ダークボタン</lh-button>
</div>
```

- 暗色のスイッチは `[data-theme='dark']` または `.dark` クラスです（`var-dark.scss` のセレクタ）。
- **`themeVars` を `documentElement` のインライン style に書かないでください**——インライン style の詳細度は `var-dark.scss` の暗色変数ブロック全体より高く、ダークモードの配色が歪みます（[テーマ総覧の注入制約](/ja/theme/overview#注入制約style-要素のみ許可)を参照）。

## 六、ランタイムでは変えられないもの

| 変えたいもの | 変える | 代わりの方法 |
| --- | --- | --- |
| 主色、文字色、角丸、間隔などのトークン | ✅ `themeVars` | — |
| 単一コンポーネントのトークン | ✅ `componentTheme` | — |
| 紋様 | ✅ `pattern` + `patternComponents` | — |
| コンポーネントの高さ（input 37px など） | ⚠️ 限定 | 高さトークンはまだ統一されていません、[既知のギャップ](/ja/theme/tokens#既知のトークンギャップ)を参照 |
| コンポーネントの DOM 構造 / クラス名 | ❌ | [pt パススルー](/ja/core/pt)やスロットを使う |
| シャドウのレイヤ合成 | ❌ コンパイル期 | `$lh-*` SCSS 変数を上書きして再コンパイル |
| アニメーションカーブ | ✅ `--lh-animation-timing-function` | — |

## 例：完全なテーマ設定

```vue
<template>
  <lh-config-provider
    theme="songhua"
    :theme-vars="{
      'border-radius-base': '8px',
      'font-size-base': '15px',
    }"
    :component-theme="{
      button: { 'border-radius': '999px' },
    }"
    :pattern-components="['card', 'dialog']"
  >
    <App />
  </lh-config-provider>
</template>
```

## 注意事項

- **省略記法のキーにプレフィックスを重複して付けないでください**：`'--lh-primary-color'` ではなく `'primary-color'` で（べき等ですが、省略記法に統一するほうがすっきりします）。
- **スコープのリーク**：`themeVars` は子孫コンポーネントにだけ影響します；逆に、**祖先** ConfigProvider の変数は子孫のものに上書きされます（CSS のカスケードルール）。
- **注入位置**：ConfigProvider はラップ要素に注入し（`documentElement` ではなく）、削除可能・局所化可能なようにしています。
- **SSR**：注入されるのは通常の CSS 変数で、サーバー側のレンダリングは inline style を出力し、クライアントの hydrate 後にも一致します。

## 関連ドキュメント

- [テーマシステム概要](/ja/theme/overview)
- [テーマプリセット](/ja/theme/presets)
- [デザイントークン](/ja/theme/tokens)
- [中華風紋様](/ja/theme/patterns)
- [cssVars ユーティリティ関数](/ja/reference/utils#cssvars-3-点セット)
