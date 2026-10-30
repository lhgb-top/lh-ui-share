---
title: transition-mixins —— クロスフレームワークのトランジションクラス名
description: 'lh-enter-both / lh-leave-both / lh-transition-ends の 3 つの mixin が Vue2 と Vue3/React のトランジションクラス名の差異を収束させる'
---

`styles/theme/common/transition.scss` はクロスフレームワークのトランジションクラス名の**単一ソース**です。これが解決するのは現実の痛点です：

Vue2 のトランジションクラス名は `<name>-enter` / `<name>-leave`（enter / leave の**開始状態**）で、Vue3 と React は `<name>-enter-from` / `<name>-leave-from` に改めました。両端は同じセマンティクス（「enter の開始状態」/「leave の開始状態」）で、名前が違うだけです。以前は 16 個のコンポーネントがファイルごとに手書きで 2 つのセレクタを書き、一箇所直せば一箇所漏れていました。

## 3 つの mixin

| Mixin | パラメータ | 生成されるクラス名 | 用途 |
| --- | --- | --- | --- |
| `lh-enter-both` | `$selector`（必須）、`$child`（省略可） | `#{$selector}-enter`、`#{$selector}-enter-from` | enter 開始状態の二重書き |
| `lh-leave-both` | `$selector`、`$child`? | `#{$selector}-leave`、`#{$selector}-leave-from` | leave 開始状態の二重書き |
| `lh-transition-ends` | `$selector`、`$child`? | `#{$selector}-enter`、`#{$selector}-enter-from`、`#{$selector}-leave-to` | トランジションの開始・終了（enter 開始の二重書き + 両端同名の leave 終了状態） |

3 つとも `@content` でスタイルブロックを受け取ります。

### `$child` パラメータ

トランジション状態を**子孫ノード**に載せたいときは第 2 パラメータを渡すと、生成されるセレクタに ` #{$child}` のサフィックスが付きます：

```scss
// $child なし：状態をセレクタ自身に載せる
@include lh-enter-both('.lh-backtop-fade') { ... }
// → .lh-backtop-fade-enter, .lh-backtop-fade-enter-from { ... }

// $child あり：状態を内部パネルに載せる
@include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') { ... }
// → .lh-drawer-fade-enter .lh-drawer__panel--right,
//   .lh-drawer-fade-enter-from .lh-drawer__panel--right { ... }
```

## なぜこの 3 つなのか

- `-enter-to` / `-leave-to` は**両端で同名**なので、二重書きは不要です。
- 二重書きが必要なのは**ペアになる開始状態**だけです：`-enter` / `-enter-from` と `-leave` / `-leave-from`。
- `lh-transition-ends` は「enter の開始点と leave の終了点が同じ姿」というよくある場面（フェードイン・アウト：不透明度 0 → 1 → 0）をカバーし、1 つの mixin で enter 開始状態の二重書き + leave 終了状態を同時に扱います。

## 使用例

### 通常のトランジション（backtop のフェード）

```scss
.lh-backtop-fade {
  @include lh-transition-ends('.lh-backtop-fade') {
    opacity: 0;
  }
}
```

コンパイル結果：

```scss
.lh-backtop-fade-enter,
.lh-backtop-fade-enter-from,
.lh-backtop-fade-leave-to {
  opacity: 0;
}
```

### enter の開始状態のみ（dialog のフェードイン、終了状態は不要）

```scss
.lh-dialog-fade {
  @include lh-enter-both('.lh-dialog-fade') {
    opacity: 0;
    transform: scale(0.9);
  }
}
```

### 状態を内部パネルに載せる（drawer のスライドイン）

```scss
.lh-drawer-fade {
  @include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') {
    transform: translateX(100%);
  }
}
```

Vue3 の `<transition name="lh-drawer-fade">` は enter フェーズで**ルート要素**に `lh-drawer-fade-enter-from` を付けるので、セレクタが子孫マッチしてパネルに位移を適用します——ルート要素自身は動かず、teleport されたルートノードの transform が位置決めに影響するのを避けます。

## コンポーネントでの使い方

```scss
// styles/drawer/index.scss
@use 'theme/common/transition' as *;

.lh-drawer-fade {
  @include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') {
    transform: translateX(100%);
  }
  @include lh-leave-both('.lh-drawer-fade', '.lh-drawer__panel--right') {
    transform: translateX(100%);
  }
}
```

UI 層（Vue3）：

```vue
<transition name="lh-drawer-fade">
  <div v-if="visible" class="lh-drawer">...</div>
</transition>
```

UI 層（Vue2）：

```vue
<transition name="lh-drawer-fade">
  <div v-show="visible" class="lh-drawer">...</div>
</transition>
```

**両端で同じ `name` を使い**、スタイル側の mixin が生成する 2 つのセレクタがそれぞれの端のクラス名に命中します。これが「注入は分散、内容は単一ソース」がトランジションクラス名で実現された姿です。

## 注意事項

- **コンポーネントスタイルでトランジションクラス名を二重に手書きすることは禁止**です、常に `@include` してください（[レッドライン 2](/ja/development/contribution#6-つのレッドライン)）。`verify:styles` の第 5 項（トランジションクラス名の単一ソース）が裸書きの `-enter-from` / `-leave-from` リテラルを走査します。
- **`@use` のパス**：`@use 'theme/common/transition' as *;`（各コンポーネント scss の相対パスか、ビルド期の bare specifier のどちらを使うかは[注入戦略](/ja/guide/injection)による）。
- **React の場合**：React 版は headless なトランジション（状態駆動の className）で、mixin が生成した `-enter-from` クラス名がそのまま適用できます。
- **`$child` サフィックスは子孫セレクタです**：`&` による結合ではなく、生成されるセレクタは `.parent-enter .child` で、ルート要素がトランジションクラス名を帯びることに依存します。

## 関連ドキュメント

- [注入戦略](/ja/guide/injection) —— 両端のスタイル成果物の差異
- [ダークモード](/ja/theme/dark-mode) —— トークンのランタイム vs コンパイル期
- [スタイルソース](/ja/reference/styles) —— `styles/` ディレクトリと BEM 規約
