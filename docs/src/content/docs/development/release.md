---
title: 发布流程
description: '六步发版：changeset → 合 master → changeset:version → commit → release → release:push，及 CI 自动留档'
---

share 的发版是**人工把守的六步流水线**：npm 发布在本地完成（验证环节人工跑），GitHub / Gitee 的标签与发行版由 CI 自动留档。

## 六步

### 1. 写 changeset

```bash
pnpm changeset
```

交互式选择改动范围（major / minor / patch）并写一段变更说明，生成 `.changeset/<随机名>.md`。**在合入 master 前积累**，一个 changeset 一个主题。

级别约定：

| 级别 | 什么时候用 |
| --- | --- |
| `major` | 破坏性变更（改名、删 API、改行为）。0.x 阶段也认真标——下游按这个决定要不要改代码 |
| `minor` | 新增功能（新组件、新预设、新导出） |
| `patch` | bug 修复、样式微调 |

### 2. 提交并合入 master

```bash
git add -A
git commit -m "feat: ..."      # 提交信息用 markdown 详写
# 然后 PR / 直接合入 master
```

### 3. 消费 changeset

```bash
pnpm changeset:version
```

做三件事：把所有待发布 changeset 合并成版本变更说明 → 改 `package.json` 的版本号 → 写 CHANGELOG.md，并**删除已消费的 changeset 文件**。

版本号由所有待发布 changeset 的最高级别决定（比如 9 个 changeset 里最高是 minor → `0.3.0` → `0.4.0`）。

### 4. 提交版本号

```bash
git add -A
git commit -m "chore(release): 0.4.0"
```

**为什么手工提交**：`.changeset/config.json` 的 `commit: false`，changeset 不会自动 git commit。这一步的提交信息按惯例写 `chore(release): x.y.z` + markdown 详写本次发版内容。

### 5. 发布 npm 并建本地 tag

```bash
pnpm release
```

即 `changeset publish`，顺序：

1. 跑 `prepublishOnly`：`pnpm build` + `pnpm verify:dts` + `pnpm verify:styles`
2. 发 npm（`npm publish`）
3. **本地**创建 tag `@lh-ui/share@x.y.z`（只创建、不推送）

**前置条件**：`npm login` 已完成。这是凭证操作，AI 不代做。

**注意 prepublishOnly 只跑三项验证**——test / lint / typecheck / verify:theme 必须在发版前显式手动跑（见 [验证全清单](/development/verification#验证全跑一遍)）。

### 6. 推送并留档

```bash
pnpm release:push
```

推 master + 本次 tag 到 `github-lhgb`，自动触发 `.github/workflows/release.yml`。

## CI 自动留档（release.yml）

```
npm 上已发布的 tarball
  → 创建 GitHub Release（挂 lh-ui-share-<version>.tgz，可离线 npm i ./xxx.tgz 安装）
  → 推 tag 到 Gitee
  → 调 Gitee API 建发行版（正文含 GitHub tgz 下载链接）
```

**关键设计**：release.yml **不重新构建**，安装包直接取 npm 上已发布的 tarball——与用户 `npm i` 装到的逐字节一致。构建与双 verify 由本地 `pnpm release`（prepublishOnly）与 `ci.yml` 各跑一次。

这样补建早期历史版本也不会因旧提交缺 `pnpm-lock.yaml` / 脚本而失败——**把缺的 tag 推到 GitHub 即可**，同一流程自动留档。

## 下游跟进（红线 5）

**发版顺序硬约束：share 先发版，UI 库随其后。**

share 0.4.0 发布后：

```bash
# lh-ui-plus 仓
pnpm up @lh-ui/share@0.4.0
pnpm test          # 回归

# lh-ui-vue2 仓
pnpm up @lh-ui/share@0.4.0
pnpm test          # 回归
```

此时 `pnpm verify:versions` 才会重新通过（发版前两兄弟仓的依赖范围仍是 `^0.3.0`，属于预期）。

## 注意事项

- **本地只推 GitHub（`github-lhgb`）**，**不要手动推 tag 到 Gitee**——Gitee 的 tag / 发行版由 release.yml 统一接管，双写互相冲突。
- **`npm login` 是人工步骤**：`npm whoami` 返回 401 说明没登录，先登录再 `pnpm release`。
- **补建历史版本**：`git push github-lhgb @lh-ui/share@0.2.0` 即可，release.yml 幂等（Release 已存在则只补传 tarball）。发行版创建失败可在 Actions 页用 `workflow_dispatch` 传入 tag 重跑。
- **Gitee 发行版依赖 Secret `GITEE_TOKEN`**（Gitee 个人访问令牌，勾选 releases 权限），配在 GitHub 仓库 Settings → Secrets。
- **不要在发版中途改源码**：`pnpm release` 的 prepublishOnly 会重新 build，此时工作区应该是干净的。
- **0.3.0 的历史遗留**：版本号当时被并入一个 fix 提交（`791ff32`），没有独立 `chore(release)` 提交。本次起恢复约定，不回改历史。

## 部署（另一仓）

文档站部署到家族 nginx，契约在 `lh-ui/docs/部署/nginx-lhui.conf.md`（**另一个仓库**）：加 `location ^~ /lhui/share/`、把八站清单更新为九站。share 仓只负责让 `pnpm docs:build` 产物可用。

## 相关文档

- [命令一览](/development/commands)
- [验证体系](/development/verification)
- [构建与工具脚本](/development/scripts)
- [贡献指南](/development/contribution)
- [各端如何消费](/guide/consumption) —— 下游如何跟进新版本
