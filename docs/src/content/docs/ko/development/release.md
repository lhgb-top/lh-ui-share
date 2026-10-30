---
title: 릴리스 절차
description: '육단계 릴리스: changeset → master 합치기 → changeset:version → 커밋 → release → release:push, 그리고 CI 자동 보관'
---

share의 릴리스는 **사람이 지키는 육단계 파이프라인**입니다: npm 게시는 로컬에서 이루어지고(검증 단계는 사람이 직접 돌림), GitHub / Gitee의 태그와 릴리스는 CI가 자동으로 보관합니다.

## 육단계

### 1. changeset 쓰기

```bash
pnpm changeset
```

대화형으로 변경 범위(major / minor / patch)를 고르고 변경 설명을 한 줄 적어 `.changeset/<무작위 이름>.md`를 만듭니다. **master에 합치기 전까지 모아두고**, changeset 하나에 주제 하나를 담습니다.

단계 관례:

| 단계 | 언제 쓰는가 |
| --- | --- |
| `major` | 파괴적 변경(이름 변경, API 삭제, 동작 변경). 0.x 단계에서도 진지하게 표시——하류는 이것을 보고 코드를 바꿀지 결정합니다 |
| `minor` | 기능 추가(새 컴포넌트, 새 사전 설정, 새 내보내기) |
| `patch` | 버그 수정, 스타일 미세 조정 |

### 2. 커밋하고 master에 합치기

```bash
git add -A
git commit -m "feat: ..."      # 커밋 메시지는 markdown으로 상세하게
# 뒤이어 PR / master에 직접 합치기
```

### 3. changeset 소비

```bash
pnpm changeset:version
```

세 가지를 합니다: 대기 중이던 모든 changeset을 버전 변경 설명 하나로 합치기 → `package.json`의 버전 번호 바꾸기 → CHANGELOG.md 쓰기, 그리고 **이미 소비한 changeset 파일을 삭제**합니다.

버전 번호는 대기 중인 모든 changeset의 가장 높은 단계로 정해집니다(예: 9개 changeset 중 가장 높은 것이 minor → `0.3.0` → `0.4.0`).

### 4. 버전 번호 커밋

```bash
git add -A
git commit -m "chore(release): 0.4.0"
```

**왜 손으로 커밋하는가**: `.changeset/config.json`의 `commit: false` 때문에 changeset이 자동으로 git commit하지 않습니다. 이 단계의 커밋 메시지는 관례대로 `chore(release): x.y.z` + markdown으로 이번 릴리스 내용을 상세하게 적습니다.

### 5. npm에 게시하고 로컬 태그 만들기

```bash
pnpm release
```

즉 `changeset publish`, 순서는:

1. `prepublishOnly` 실행: `pnpm build` + `pnpm verify:dts` + `pnpm verify:styles`
2. npm에 게시(`npm publish`)
3. **로컬**에 태그 `@lh-ui/share@x.y.z` 생성(만들기만 하고 푸시하지 않음)

**사전 조건**: `npm login`이 완료되어 있어야 합니다. 이것은 자격 증명 작업이고 AI가 대신하지 않습니다.

**주의: prepublishOnly는 세 가지 검증만 돌립니다**——test / lint / typecheck / verify:theme은 릴리스 전에 명시적으로 직접 돌려야 합니다([검증 전체 목록](/ko/development/verification#검증-전부-실행하기) 참조).

### 6. 푸시하고 보관

```bash
pnpm release:push
```

master와 이번 태그를 `github-lhgb`로 푸시해 `.github/workflows/release.yml`을 자동으로 유발합니다.

## CI 자동 보관(release.yml)

```
npm에 이미 게시된 tarball
  → GitHub Release 생성(lh-ui-share-<version>.tgz 첨부, 오프라인으로 npm i ./xxx.tgz 설치 가능)
  → 태그를 Gitee로 푸시
  → Gitee API를 호출해 릴리스 생성(본문에 GitHub tgz 다운로드 링크 포함)
```

**핵심 설계**: release.yml은 **다시 빌드하지 않고**, 설치 패키지를 npm에 이미 게시된 tarball에서 직접 가져옵니다——사용자가 `npm i`로 설치하는 것과 바이트 단위로 같습니다. 빌드와 두 가지 verify는 로컬의 `pnpm release`(prepublishOnly)와 `ci.yml`이 각각 한 번씩 돌립니다.

이렇게 하면 초기 역사 버전을 보태 만들 때도 옛 커밋에 `pnpm-lock.yaml` / 스크립트가 없어 실패하지 않습니다——**빠진 태그를 GitHub에 푸시하기만 하면** 같은 흐름이 자동으로 보관합니다.

## 하류 따라가기(레드라인 5)

**릴리스 순서의 굳은 제약: share가 먼저 릴리스, UI 라이브러리가 그 뒤를 따름.**

share 0.4.0 게시 뒤:

```bash
# lh-ui-plus 저장소
pnpm up @lh-ui/share@0.4.0
pnpm test          # 회귀

# lh-ui-vue2 저장소
pnpm up @lh-ui/share@0.4.0
pnpm test          # 회귀
```

이때야 `pnpm verify:versions`가 다시 통과합니다(릴리스 전 두 형제 저장소의 의존 범위는 여전히 `^0.3.0`이고, 이것은 예상된 상태입니다).

## 주의 사항

- **로컬에서는 GitHub(`github-lhgb`)에만 푸시**, **Gitee에 태그를 손으로 푸시하지 마세요**——Gitee의 태그 / 릴리스는 release.yml이 함께 관리하고, 양쪽에 적으면 서로 충돌합니다.
- **`npm login`은 사람의 단계**: `npm whoami`가 401을 반환하면 로그인되지 않은 것입니다, 먼저 로그인한 뒤 `pnpm release`를 돌리세요.
- **역사 버전 보태 만들기**: `git push github-lhgb @lh-ui/share@0.2.0`으로 충분합니다, release.yml은 멱등입니다(Release가 이미 있으면 tarball만 보탭). 릴리스 생성에 실패하면 Actions 페이지에서 `workflow_dispatch`로 태그를 넘겨 다시 돌릴 수 있습니다.
- **Gitee 릴리스는 Secret `GITEE_TOKEN`에 의존**합니다(Gitee 개인 액세스 토큰, releases 권한 체크), GitHub 저장소의 Settings → Secrets에 설정합니다.
- **릴리스 도중에 소스 코드를 바꾸지 마세요**: `pnpm release`의 prepublishOnly가 다시 build할 때 작업 공간은 깨끗한 상태여야 합니다.
- **0.3.0의 역사 유물**: 당시 버전 번호가 하나의 fix 커밋(`791ff32`)에 합쳐졌고, 독자적인 `chore(release)` 커밋이 없었습니다. 이번부터 관례를 되살리고, 역사는 거슬러 고치지 않습니다.

## 배포(다른 저장소)

문서 사이트는 가족의 nginx에 배포하고, 계약은 `lh-ui/docs/部署/nginx-lhui.conf.md`에 있습니다(**다른 저장소**): `location ^~ /lhui/share/`를 추가하고, 여덟 사이트 목록을 아홉 사이트로 갱신합니다. share 저장소는 `pnpm docs:build` 산물을 쓸 수 있게 만드는 것까지만 책임집니다.

## 관련 문서

- [명령 목록](/ko/development/commands)
- [검증 체계](/ko/development/verification)
- [빌드와 도구 스크립트](/ko/development/scripts)
- [기여 가이드](/ko/development/contribution)
- [각 단말이 소비하는 법](/ko/guide/consumption) —— 하류가 새 버전을 따라가는 법
