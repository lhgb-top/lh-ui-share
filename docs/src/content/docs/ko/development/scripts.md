---
title: 빌드와 도구 스크립트
description: 'scripts/의 13개 mjs 스크립트 책임: build-styles / sync-exports / verify-* / gen-docs-data / push-release'
---

`scripts/`는 빌드와 검증의 엔진 계층입니다. `package.json`의 명령 대부분은 이 스크립트들을 얇게 감싼 것이며, 스크립트를 직접 실행하면 매개변수를 주어 디버깅할 수 있습니다.

## 스크립트 개요

| 스크립트 | 명령 래핑 | 책임 |
| --- | --- | --- |
| `build-styles.mjs` | `pnpm build:styles` | share scss를 컴파일하여 `dist/theme/` + `dist/styles/` 생성 |
| `sync-exports.mjs` | `pnpm sync:exports`(`pnpm build`에 포함) | 소스 디렉터리 구조에서 `package.json`의 exports 생성 |
| `verify-dts.mjs` | `pnpm verify:dts` | 산출물 dts와 소스 타입이 일치하는지 확인 |
| `verify-styles.mjs` | `pnpm verify:styles` | scss의 6개 항목 검증([검증 체계](/ko/development/verification) 참고) |
| `verify-theme-contrast.mjs` | `pnpm verify:theme` | 테마 AA 4.5:1 대비 게이트 |
| `check-version-sync.mjs` | `pnpm verify:versions` | 각 UI 라이브러리의 의존성 범위가 share의 현재 버전을 포함하는지 확인 |
| `gen-docs-data.mjs` | `pnpm docs:data` | 토큰 / 아이콘 / 클래스명을 파싱하여 `docs/src/data/*.json` 생성 |
| `push-release.mjs` | `pnpm release:push` | master와 tag를 GitHub에 푸시하여 보존 처리 트리거 |
| `release-notes.mjs` | — | 릴리스 노트 생성 |
| `extract-from-plus.mjs` | `pnpm extract` | **일회성 스크립트**: plus 저장소에서 공유 레이어 추출(역사적 용도) |
| `normalize-styles.mjs` | — | 스타일 정규화(역사적 일회성) |
| `patch-var-fallbacks.mjs` | — | `var()` 폴백 값 일괄 보충(역사적 일회성) |

## sync-exports.mjs —— exports 키의 생성기

**가장 문제를 일으키기 쉬운 스크립트**입니다.

`@lh-ui/share`의 `package.json`에는 77개의 exports 키(`./core/button/*` 같은 하위 경로)가 있으며, 전부 이 스크립트가 `src/`와 `styles/`의 디렉터리 구조를 **스캔하여 생성**합니다.

**흐름**: `vite build`의 산출물이 디스크에 기록됨 → `sync:exports`가 `es/` 디렉터리 구조를 스캔 → `package.json`의 `exports` / `files` 필드를 다시 작성.

**왜 중요한가**:

- `src/core/foo/bar.ts`를 새로 만들면, dev 환경(소스 alias 사용)에서는 즉시 쓸 수 있지만 **npm 측에는 대응하는 exports 키가 없습니다** —— 하류의 `pnpm up` 이후에 MODULE_NOT_FOUND가 발생합니다.
- **릴리스 전에 반드시 완전한 `pnpm build`를 실행**(sync-exports 포함)해야 하며, `build:dts`만으로는 부족합니다.

**`package.json`을 변경한다는 점에 주의**: 실행 후 `git diff`를 보면 exports가 바뀌어 있는데, 이것은 정상이며 커밋해야 합니다.

## build-styles.mjs —— 스타일 산출물

`styles/`의 SCSS 소스를 css로 컴파일합니다:

```
dist/
├── theme/
│   ├── index.css          # 테마 토큰(밝은색)
│   └── index-dark.css     # 어두운색 덮어쓰기
└── styles/
    └── index.css          # 전체 집계(토큰 + 모든 컴포넌트)
```

**동시에 `styles/index.scss` 전체 집계 파일도 생성**하며(`styles/*/index.scss`를 스캔), `verify:styles`의 4번째 항목이 일관성을 검증합니다 —— **이 파일은 직접 수정하지 마세요**.

각 UI 라이브러리는 자체 `build-styles.mjs`를 가집니다(plus 버전은 `packages/components`를 스캔, vue2 버전은 `src/components`를 스캔). share에 스타일 소스가 없는 컴포넌트는 **조용히 건너뛰므로**, share에 대응하는 scss가 있어야 해당 컴포넌트가 어느 한 단말에서 무 스타일이 되는 일이 없습니다.

## gen-docs-data.mjs —— 문서 데이터 생성

```bash
pnpm docs:data
```

네 개의 소스를 파싱하여 `docs/src/data/*.json`을 만듭니다:

| 산출물 | 소스 | 내용 |
| --- | --- | --- |
| `tokens.json` | `var.scss` + `var-dark.scss` + `variables.scss` | 185개 밝은색 + 118개 어두운색 + 183개 SCSS 변수, 의미 도메인별로 그룹화 |
| `icons.json` | `src/.../icon/svgs.ts` | 37개의 내장 아이콘 |
| `classes.json` | `styles/*/index.scss` | 58개의 컴포넌트 BEM 클래스명 목록 |

**개수 어서션을 포함**: 파싱 수와 기대값(185 / 118 / 183 / 37 / 58)이 다르면 곧바로 오류를 던집니다. 이것이 "토큰이 잘못 삭제됨 / 컴포넌트가 잘못 삭제됨"의 첫 번째 방어선입니다.

**멱등성**: 언제든 실행할 수 있고, 내용이 바뀔 때만 json을 수정합니다. 토큰이나 클래스명을 바꾼 뒤 한 번 실행하여 문서 데이터를 갱신하세요.

## push-release.mjs —— 릴리스 푸시

```bash
pnpm release:push
```

`pnpm release`(npm 배포 + 로컬 tag 작성) 이후에 실행합니다:

1. master를 `github-lhgb`에 푸시
2. 이번 버전의 tag를 `github-lhgb`에 푸시
3. `.github/workflows/release.yml`을 트리거: npm에서 이미 배포된 tarball을 가져와 → GitHub Release를 생성(`lh-ui-share-<version>.tgz`를 첨부) → Gitee에 tag를 푸시하고 Gitee API로 릴리스를 생성

**GitHub에만 푸시하고, Gitee에는 직접 푸시하지 마세요** —— Gitee의 tag / 릴리스는 release.yml이 통합 관리하며, 이중으로 쓰면 충돌합니다.

## verify-theme-contrast.mjs —— 대비 게이트

`es/` 산출물을 읽으므로(**먼저 `pnpm build`가 필요**), `src/theme/themes/index.ts`가 내보내는 `getRelativeLuminance` / `getContrastRatio`로 모든 "글자 / 배경" 쌍의 WCAG 대비를 계산하여, 4.5:1 미만이면 실터합니다.

단일 색 배합을 디버깅할 때는 전체를 실행하지 않고 node에서 이 두 함수를 직접 호출하면 됩니다.

## 역사적 일회성 스크립트

| 스크립트 | 설명 |
| --- | --- |
| `extract-from-plus.mjs` | share 저장소 창설 시 lh-ui-plus에서 공유 레이어를 추출. **기록으로 남기되 더 이상 실행하지 않음** —— share가 이미 유일 소스(레드라인 2) |
| `normalize-styles.mjs` | 초기 스타일 정규화(토큰 참조 방식 통일). 사명 완수 |
| `patch-var-fallbacks.mjs` | `var(--lh-*)`에 폴백 값을 일괄 보충. verify:styles의 2번째 항목(var fallback)이 도입되기 전의 마이그레이션 도구 —— **새 코드는 반드시 폴백을 직접 작성하고, 이 스크립트에 기대지 마세요** |

## docs 사이트는 npm 산출물이 아님

`package.json`의 `files: ["es", "lib", "dist", "styles"]`에는 **`docs/`가 포함되지 않습니다**. 문서 사이트는 `pnpm docs:build`로 `docs/dist/`에 빌드되어, 패밀리의 nginx에 수동 배포됩니다(계약은 `lh-ui/docs/部署/nginx-lhui.conf.md`, 별도 저장소). 자세한 내용은 [릴리스 흐름](/ko/development/release)을 참고하세요.

## 관련 문서

- [명령 목록](/ko/development/commands) —— 각 script에 대응하는 pnpm 명령
- [검증 체계](/ko/development/verification) —— verify 계열 스크립트가 각각 무엇을 검사하는지
- [릴리스 흐름](/ko/development/release) —— push-release와 CI 보존
- [패키지 진입점과 하위 경로](/ko/guide/exports) —— sync-exports가 생성하는 77개 키
