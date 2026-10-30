---
title: 中華風紋様
description: '柳葉 / 雲紋 / 水波 / 雪花 / 梅花 / 竹葉の 6 種のインライン SVG 紋様と apply-pattern mixin'
---

中華風は lh-ui の装飾ではなく、その設計主張のひとつです。`styles/theme/common/patterns.scss` が 6 種の伝統的な文様を提供し、オプショナルな背景層として注入します。

## 6 種の紋様

| 紋様 | CSS 変数 | 説明 |
| --- | --- | --- |
| 柳葉紋 | `--lh-pattern-willow` | 細長い柳の葉、疎密のバランス、風に軽やかに舞う |
| 雲紋 | `--lh-pattern-cloud` | 祥雲（しょううん）が広がり、うねりながら流れる |
| 水波紋 | `--lh-pattern-water` | 涟漪が微かに揺れ、幾重にも重なる |
| 雪花紋 | `--lh-pattern-snow` | 六角の雪花、細い枝が分かれる |
| 梅花紋 | `--lh-pattern-plum` | 五弁が広がり、蕊芯がはっきりと見える |
| 竹葉紋 | `--lh-pattern-bamboo` | 披針形の竹の葉、中脈が明瞭、疎らに並ぶ |

すべて `data:image/svg+xml` で**インライン**化されています（外部リソースを引かず、ネットワーク依存も CORS の問題もない）、`!default` でユーザーが上書き可能です。さらに `--lh-pattern-none: none`（明示的な紋様なし）があります。

## 紋様を有効にする

紋様は**デフォルトで有効になりません**（`--lh-bg-pattern: none`）。3 つの有効化方法：

### 1. コンポーネント / ページ内に直接書く

```scss
.my-card {
  --lh-bg-pattern: var(--lh-pattern-plum);
}
```

### 2. ConfigProvider の themeVars

```vue
<lh-config-provider :theme-vars="{ 'bg-pattern': 'var(--lh-pattern-plum)' }">
  <App />
</lh-config-provider>
```

省略記法の `'bg-pattern'` が自動的に `--lh-bg-pattern` に補われます。

### 3. pattern prop + ホワイトリスト

```vue
<lh-config-provider
  pattern="plum"
  :pattern-components="['card', 'dialog', 'drawer']"
>
  <App />
</lh-config-provider>
```

紋様は背景に影響するため、すべてのコンポーネントに適しているわけではありません（テーブルの背景に梅の花を印刷すると雑然とします）。`patternComponents` のホワイトリストがどのコンポーネントに紋様を付けるかを制御します。詳細は[ランタイムカスタマイズ](/ja/theme/customization#三patterncomponents--紋様ホワイトリスト)を参照。

## 制御トークン

```scss
:root {
  --lh-bg-pattern: none;                                     // デフォルトで無効
  --lh-bg-pattern-repeat: repeat;                            // タイリング方式
  --lh-bg-pattern-size: 40px;                                // ユニットサイズ（デフォルトの 40px はボタンの高さに合せ、図案が切れないようにする）
  --lh-bg-pattern-opacity: 0.15;                             // 不透明度
  --lh-bg-pattern-color: var(--lh-decoration-color, rgba(184, 134, 11, 0.12));  // 色
  --lh-bg-pattern-blend: soft-light;                         // ブレンドモード
}
```

すべて `!default` で上書き可能です。最もよく使う 2 つのノブ：

- **`--lh-bg-pattern-size`**：40px は「ボタンの高さの中に完全な文様 1 つが収まる」サイズです；大きなブロックの背景では 80px 以上にして文様を広げられます。
- **`--lh-bg-pattern-opacity`**：0.15 は「存在するが目立たない」デフォルト値です；よりはっきりとした中華風の雰囲気が必要なら 0.25 まで上げられます。

## apply-pattern mixin

```scss
// styles/theme/common/patterns.scss
@mixin apply-pattern {
  background-image: var(--lh-bg-pattern);              // /* no-fallback */
  background-repeat: var(--lh-bg-pattern-repeat);      // /* no-fallback */
  background-size: var(--lh-bg-pattern-size);          // /* no-fallback */
  background-blend-mode: var(--lh-bg-pattern-blend, normal);  // fallback あり
  @content;
}
```

コンポーネントで `@include` するだけで紋様背景の能力を獲得します：

```scss
@use 'theme/common/patterns' as *;

.lh-card--patterned {
  @include apply-pattern;
}
```

**なぜ最初の 3 つに fallback を書かないのか**：紋様はデフォルトで無効で、この 3 つのトークンはユーザー / ConfigProvider が渡します；省略時は紋様なし（`background-image: none` への回落はトークン自身のデフォルト値が提供する）となり、fallback を固定すると逆に「紋様を未設定」と「紋様を明示的にオフ」を区別できなくなります。

## 紋様と暗色

紋様の `--lh-bg-pattern-color` はデフォルトで `--lh-decoration-color`（装飾色）を参照し、後者は `var-dark.scss` に暗色の上書きがあります——したがって紋様の色は暗色に追従して自動的に調整されます。

紋様の色をカスタマイズする場合は、暗色の方も調整するのを忘れないでください：

```scss
[data-theme='dark'],
.dark {
  --lh-bg-pattern-color: rgba(255, 255, 255, 0.08);
}
```

## 注意事項

- **デフォルトでオフなのは意図的です**：紋様は雰囲気であって情報ではなく、デフォルトで有効だとすべてのユーザーの画面を汚してしまいます。グローバルな紋様が欲しい業務側は自分で ConfigProvider で有効にしてください。
- **インライン SVG のサイズ**：6 つの文様はいずれも最小化されたパスで、1 つあたり数百バイト、CSS にインライン化しても追加のリクエストは発生しません。
- **`!default` の上書き**：自分の文様に変えたい場合は、プロジェクト内で `--lh-pattern-plum: url('data:image/svg+xml,...')` を上書きするか、直接 `--lh-bg-pattern` を設定してください。
- **印刷の場面**：紋様は印刷時には表示されない場合があります（ブラウザによる `background-image` の印刷処理による）——コンテンツの層が紋様に依存して情報を伝えてはなりません。

## 関連ドキュメント

- [テーマシステム概要](/ja/theme/overview)
- [ランタイムカスタマイズ](/ja/theme/customization)
- [デザイントークン](/ja/theme/tokens)
- [スタイルソース](/ja/reference/styles)
