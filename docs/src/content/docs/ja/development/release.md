---
title: リリースフロー
description: '6 ステップのリリース：changeset → master に取り込み → changeset:version → コミット → release → release:push、及び CI による自動アーカイブ'
---

share のリリースは**人間が把守する 6 ステップのパイプライン**です：npm への公開はローカルで行い（検証の各ステップは人が走らせる）、GitHub / Gitee のタグとリリースは CI が自動的にアーカイブします。

## 6 ステップ

### 1. changeset を書く

```bash
pnpm changeset
```

インタラクティブに変更の範囲（major / minor / patch）を選んで変更説明を書くと、`.changeset/<ランダム名>.md` が生成されます。**master に取り込む前に蓄積**し、changeset 1 つにつき 1 つのテーマにします。

レベルの慣例：

| レベル | いつ使うか |
| --- | --- |
| `major` | 破壊的変更（改名、API の削除、挙動の変更）。0.x の段階でも真面目に付ける——下流はこれを見てコードを直すか判断する |
| `minor` | 機能の追加（新コンポーネント、新プリセット、新 エクスポート） |
| `patch` | バグ修正、スタイルの微調整 |

### 2. コミットして master に取り込む

```bash
git add -A
git commit -m "feat: ..."      # コミットメッセージは markdown で詳細に書く
# その後 PR / 直接 master に取り込む
```

### 3. changeset を消費する

```bash
pnpm changeset:version
```

3 つのことをします：リリース待ちの changeset をすべてマージしてバージョン変更説明にする → `package.json` のバージョン番号を変更する → CHANGELOG.md を書く。そして**消費済みの changeset ファイルを削除**します。

バージョン番号はリリース待ち changeset のうち最高のレベルで決まります（例：9 つの changeset のうち最高が minor → `0.3.0` → `0.4.0`）。

### 4. バージョン番号をコミット

```bash
git add -A
git commit -m "chore(release): 0.4.0"
```

**なぜ手動コミットなのか**：`.changeset/config.json` が `commit: false` で、changeset は自動的に git commit しないからです。このステップのコミットメッセージは慣例として `chore(release): x.y.z` とし、今回のリリース内容を markdown で詳細に書きます。

### 5. npm に公開してローカル tag を作る

```bash
pnpm release
```

すなわち `changeset publish`、順序：

1. `prepublishOnly` を走らせる：`pnpm build` + `pnpm verify:dts` + `pnpm verify:styles`
2. npm に公開（`npm publish`）
3. **ローカル**で tag `@lh-ui/share@x.y.z` を作成（作るだけで push はしない）

**前提条件**：`npm login` が済んでいること。これは認証操作で、AI は代行しません。

**注意：prepublishOnly が走らせる検証は 3 つだけ**——test / lint / typecheck / verify:theme はリリース前に明示的に手動で走らせる必要があります（[検証の完全リスト](/ja/development/verification#検証をすべて実行する)を参照）。

### 6. push してアーカイブ

```bash
pnpm release:push
```

master と今回の tag を `github-lhgb` に push し、`.github/workflows/release.yml` を自動的にトリガーします。

## CI による自動アーカイブ（release.yml）

```
npm で公開済みの tarball
  → GitHub Release を作成（lh-ui-share-<version>.tgz を添付、オフラインで npm i ./xxx.tgz からインストール可能）
  → tag を Gitee に push
  → Gitee API でリリースを作成（本文に GitHub の tgz ダウンロードリンクを含む）
```

**重要な設計**：release.yml は**再ビルドせず**、npm に公開済みの tarball をそのまま取りに行きます——ユーザーが `npm i` で手に入れるものとバイト単位で一致します。ビルドと 2 つの verify はローカルの `pnpm release`（prepublishOnly）と `ci.yml` がそれぞれ 1 回ずつ走らせます。

このため早期の歴史バージョンを補完するときも、古いコミットに `pnpm-lock.yaml` / スクリプトが欠けている理由で失敗することはありません——**足りない tag を GitHub に push するだけで**、同一のフローが自動的にアーカイブします。

## 下流の追従（レッドライン 5）

**リリース順序のハード制約：share が先にリリースし、UI ライブラリがその後に続く。**

share 0.4.0 の公開後：

```bash
# lh-ui-plus リポジトリ
pnpm up @lh-ui/share@0.4.0
pnpm test          # 回帰

# lh-ui-vue2 リポジトリ
pnpm up @lh-ui/share@0.4.0
pnpm test          # 回帰
```

このとき初めて `pnpm verify:versions` が再び通ります（リリース前、2 つの兄弟リポジトリの依存範囲はまだ `^0.3.0` のままで、これは想定通りです）。

## 注意事項

- **ローカルから push するのは GitHub のみ（`github-lhgb`）**、**Gitee に手動で tag を push しないでください**——Gitee の tag / リリースは release.yml が一括して管理し、二重書きが互いに衝突します。
- **`npm login` は手動ステップ**：`npm whoami` が 401 を返したら未ログインです。先にログインしてから `pnpm release` してください。
- **歴史バージョンの補完**：`git push github-lhgb @lh-ui/share@0.2.0` だけでかまいません。release.yml はべき等です（Release が既存なら tarball の追補のみ行う）。リリースの作成に失敗した場合は Actions ページで `workflow_dispatch` から tag を渡して再実行できます。
- **Gitee のリリースは Secret `GITEE_TOKEN` に依存**（Gitee の個人アクセストークン、releases 権限にチェック）、GitHub リポジトリの Settings → Secrets に設定します。
- **リリースの途中でソースコードを変更しないでください**：`pnpm release` の prepublishOnly は再度 build を走らせるため、このときワークツリーはクリーンであるべきです。
- **0.3.0 の歴史経緯**：当時バージョン番号がひとつの fix コミット（`791ff32`）に併合され、独立した `chore(release)` コミットがありませんでした。今回から慣例を復活させますが、歴史は遡って直しません。

## デプロイ（別リポジトリ）

ドキュメントサイトはファミリーの nginx にデプロイされ、その契約は `lh-ui/docs/部署/nginx-lhui.conf.md`（**別のリポジトリ**）にあります：`location ^~ /lhui/share/` を追加し、8 サイトのリストを 9 サイトに更新する。share リポジトリは `pnpm docs:build` の成果物が使えるようにするまでを担います。

## 関連ドキュメント

- [コマンド一覧](/ja/development/commands)
- [検証システム](/ja/development/verification)
- [ビルドとツールスクリプト](/ja/development/scripts)
- [コントリビューション](/ja/development/contribution)
- [各フレームワークでの利用](/ja/guide/consumption) —— 下流が新バージョンに追従する方法
