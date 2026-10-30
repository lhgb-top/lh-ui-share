---
title: 發布流程
description: '六步發版：changeset → 合 master → changeset:version → commit → release → release:push，及 CI 自動留檔'
---

share 的發版是**人工把守的六步管線**：npm 發布在本地完成（驗證環節人工跑），GitHub / Gitee 的標籤與發行版由 CI 自動留檔。

## 六步

### 1. 寫 changeset

```bash
pnpm changeset
```

互動式選擇改動範圍（major / minor / patch）並寫一段變更說明，生成 `.changeset/<隨機名>.md`。**在合入 master 前累積**，一個 changeset 一個主題。

級別約定：

| 級別 | 什麼時候用 |
| --- | --- |
| `major` | 破壞性變更（改名、刪 API、改行為）。0.x 階段也認真標——下游按這個決定要不要改程式碼 |
| `minor` | 新增功能（新元件、新預設、新匯出） |
| `patch` | bug 修復、樣式微調 |

### 2. 提交並合入 master

```bash
git add -A
git commit -m "feat: ..."      # 提交資訊用 markdown 詳寫
# 然後 PR / 直接合入 master
```

### 3. 消費 changeset

```bash
pnpm changeset:version
```

做三件事：把所有待發布 changeset 合併成版本變更說明 → 改 `package.json` 的版本號 → 寫 CHANGELOG.md，並**刪除已消費的 changeset 檔案**。

版本號由所有待發布 changeset 的最高級別決定（比如 9 個 changeset 裡最高是 minor → `0.3.0` → `0.4.0`）。

### 4. 提交版本號

```bash
git add -A
git commit -m "chore(release): 0.4.0"
```

**為什麼手工提交**：`.changeset/config.json` 的 `commit: false`，changeset 不會自動 git commit。這一步的提交資訊按慣例寫 `chore(release): x.y.z` + markdown 詳寫本次發版內容。

### 5. 發布 npm 並建本地 tag

```bash
pnpm release
```

即 `changeset publish`，順序：

1. 跑 `prepublishOnly`：`pnpm build` + `pnpm verify:dts` + `pnpm verify:styles`
2. 發 npm（`npm publish`）
3. **本地**建立 tag `@lh-ui/share@x.y.z`（只建立、不推送）

**前置條件**：`npm login` 已完成。這是憑證操作，AI 不代做。

**注意 prepublishOnly 只跑三項驗證**——test / lint / typecheck / verify:theme 必須在發版前顯式手動跑（見 [驗證全清單](/development/verification#驗證全跑一遍)）。

### 6. 推送並留檔

```bash
pnpm release:push
```

推 master + 本次 tag 到 `github-lhgb`，自動觸發 `.github/workflows/release.yml`。

## CI 自動留檔（release.yml）

```
npm 上已發布的 tarball
  → 建立 GitHub Release（掛 lh-ui-share-<version>.tgz，可離線 npm i ./xxx.tgz 安裝）
  → 推 tag 到 Gitee
  → 調 Gitee API 建發行版（正文含 GitHub tgz 下載連結）
```

**關鍵設計**：release.yml **不重新構建**，安裝包直接取 npm 上已發布的 tarball——與使用者 `npm i` 裝到的逐位元組一致。構建與雙 verify 由本地 `pnpm release`（prepublishOnly）與 `ci.yml` 各跑一次。

這樣補建早期歷史版本也不會因舊提交缺 `pnpm-lock.yaml` / 腳本而失敗——**把缺的 tag 推到 GitHub 即可**，同一流程自動留檔。

## 下游跟進（紅線 5）

**發版順序硬約束：share 先發版，UI 庫隨其後。**

share 0.4.0 發布後：

```bash
# lh-ui-plus 倉
pnpm up @lh-ui/share@0.4.0
pnpm test          # 回歸

# lh-ui-vue2 倉
pnpm up @lh-ui/share@0.4.0
pnpm test          # 回歸
```

此時 `pnpm verify:versions` 才會重新通過（發版前兩兄弟倉的依賴範圍仍是 `^0.3.0`，屬於預期）。

## 注意事項

- **本地只推 GitHub（`github-lhgb`）**，**不要手動推 tag 到 Gitee**——Gitee 的 tag / 發行版由 release.yml 統一接管，雙寫互相衝突。
- **`npm login` 是人工步驟**：`npm whoami` 傳回 401 說明沒登入，先登入再 `pnpm release`。
- **補建歷史版本**：`git push github-lhgb @lh-ui/share@0.2.0` 即可，release.yml 冪等（Release 已存在則只補傳 tarball）。發行版建立失敗可在 Actions 頁用 `workflow_dispatch` 傳入 tag 重跑。
- **Gitee 發行版依賴 Secret `GITEE_TOKEN`**（Gitee 個人存取權杖，勾選 releases 權限），配在 GitHub 倉庫 Settings → Secrets。
- **不要在發版中途改原始碼**：`pnpm release` 的 prepublishOnly 會重新 build，此時工作區應該是乾淨的。
- **0.3.0 的歷史遺留**：版本號當時被併入一個 fix 提交（`791ff32`），沒有獨立 `chore(release)` 提交。本次起恢復約定，不回改歷史。

## 部署（另一倉）

文件站部署到家族 nginx，契約在 `lh-ui/docs/部署/nginx-lhui.conf.md`（**另一個倉庫**）：加 `location ^~ /lhui/share/`、把八站清單更新為九站。share 倉只負責讓 `pnpm docs:build` 產物可用。

## 相關文件

- [命令一覽](/development/commands)
- [驗證體系](/development/verification)
- [構建與工具腳本](/development/scripts)
- [貢獻指南](/development/contribution)
- [各端如何消費](/guide/consumption) —— 下游如何跟進新版本
