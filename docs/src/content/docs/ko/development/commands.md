---
title: 명령 목록
description: 'pnpm build / build:styles / build:dts / test / lint / typecheck / verify:* / changeset / release 전체 표'
---

모든 개발 작업은 루트 `package.json`의 scripts로 노출되고, 패키지 매니저는 `pnpm`으로 고정됩니다.

## 빌드

| 작업 | 명령 | 산물 / 역할 |
| --- | --- | --- |
| 빌드 | `pnpm build` | `es/` + `lib/`(preserveModules 미러 구조) + 스타일 + dts + `sync:exports` |
| 스타일 산물 | `pnpm build:styles` | `dist/theme/`(밝은 / 어두운 테마 css) + `dist/styles/`(전체 집약) |
| dts | `pnpm build:dts` | `tsc`가 미러 구조에서 그대로 내보내는 타입 선언 |

`pnpm build`는 완전한 파이프라인이고, 내부에 이미 `build:styles`와 `build:dts`를 포함합니다. **주의**: `sync:exports`는 **`package.json`의 exports 필드를 다시 씁니다**——소스 코드의 디렉터리 구조를 바꾼 뒤에는 반드시 완전한 build를 한 번 실행해야 합니다. 그렇지 않으면 하류가 `pnpm up`을 한 뒤 MODULE_NOT_FOUND가 됩니다.

## 테스트와 품질

| 작업 | 명령 | 역할 |
| --- | --- | --- |
| 단위 테스트 | `pnpm test` | vitest, `tests/unit/`(**core 단위 테스트는 이것 한 벌뿐**, 세 라이브러리가 결과를 공유) |
| Lint | `pnpm lint` | eslint, `src` / `tests` / `scripts` / `vite.config.ts` / `vitest.config.ts`만 스캔 |
| 타입 | `pnpm typecheck` | tsc, include는 `src/**/*`만 |

## 검증

| 작업 | 명령 | 역할 |
| --- | --- | --- |
| dts 검증 | `pnpm verify:dts` | 산물 dts와 소스 타입이 일치하는지 검증 |
| scss 검증 | `pnpm verify:styles` | 여섯 항목(아래 참조) |
| 테마 명암비 | `pnpm verify:theme` | AA 4.5:1 게이트, `es/` 산물을 읽음(**먼저 `pnpm build` 필요**) |
| 버전 일치성 | `pnpm verify:versions` | 각 UI 라이브러리의 의존 범위가 share의 현재 버전을 덮는지 |

### verify:styles의 여섯 항목

1. **EP 팔레트** —— 색 값의 색 단계 / 의미론 준수
2. **var fallback** —— 컴포넌트 안의 `var(--lh-*)`에는 반드시 폴백 값이 있어야 함
3. **@use 토큰** —— 컴포넌트 scss는 반드시 `@use`로 토큰을 참조해야 하고, hex 리터럴을 인용하지 않음
4. **집약 일치** —— `styles/index.scss`와 컴포넌트 디렉터리 스캔 결과가 일치함(집약 누락 방지)
5. **전환 클래스명 단일 원본** —— `-enter-from` / `-leave-from`을 직접 적는 것을 금지, 모두 [transition mixin](/ko/reference/transition-mixins) 사용
6. **어두운 색 접근성** —— 밝은 쪽에 구워 넣은 토큰이 `var-dark.scss`에 덮어쓰기가 있어야 함([다크 모드](/ko/theme/dark-mode) 참조)

## 릴리스

| 작업 | 명령 | 역할 |
| --- | --- | --- |
| 변경 사항 작성 | `pnpm changeset` | 대화형으로 `.changeset/*.md` 생성 |
| changeset 소비 | `pnpm changeset:version` | 버전 번호를 바꾸고, CHANGELOG를 쓰고, 대기 중인 changeset을 삭제 |
| 릴리스 | `pnpm release` | `changeset publish`: 먼저 `prepublishOnly`(build + verify:dts + verify:styles)를 실행한 뒤 npm에 올리고, 로컬에 태그 생성 |
| 푸시와 보관 | `pnpm release:push` | master와 이번 태그를 GitHub로 푸시, 자동 보관 유발 |

완전한 릴리스 흐름은 [릴리스 절차](/ko/development/release)를 보세요.

## 문서 사이트

| 작업 | 명령 | 역할 |
| --- | --- | --- |
| 데이터 생성 | `pnpm docs:data` | `scripts/gen-docs-data.mjs`가 토큰 / 아이콘 / 클래스명을 파싱 → `docs/src/data/*.json` |
| 로컬 개발 | `pnpm docs:dev` | Astro dev 서버(`http://localhost:5180/lhui/share/`) |
| 빌드 | `pnpm docs:build` | 프로덕션 빌드를 `docs/dist/`로 |
| 미리 보기 | `pnpm docs:preview` | 빌드 산물 미리 보기 |

**주의**: `pnpm docs:data`는 멱등이고, 수량 단언을 동반합니다(밝은 색 185 / 어두운 색 118 / SCSS 183 / 아이콘 37 / 클래스명 58건). 파싱 수가 맞지 않으면 곧바로 에러를 냅니다.

## 전형적인 워크플로

### core 컴포넌트 하나 바꾸기

```bash
pnpm test                                    # 단위 테스트(먼저 테스트 작성)
pnpm lint && pnpm typecheck                  # 품질
pnpm build                                   # 완전한 빌드(sync:exports 포함)
pnpm verify:dts && pnpm verify:styles        # 산물과 스타일 검증
pnpm changeset                               # 변경 사항 작성
git add -A && git commit                     # 커밋(뒤이어 master에 합치기)
```

### 스타일 바꾸기

```bash
# styles/만 바꾸면, build의 js 부분은 돌릴 필요 없음
pnpm verify:styles                           # 여섯 항목 검증
pnpm build:styles                            # dist 산물 생성
pnpm docs:data                               # 토큰 표 데이터 새로고침(토큰이 바뀔 때만 필요)
```

### 새 컴포넌트 추가

```bash
# 1. 세 벌의 세트
#    src/core/<name>/{logic,types,index}.ts
#    tests/unit/core/<name>.spec.ts
#    styles/<name>/index.scss
# 2. src/core/index.ts에 내보내기 추가
# 3. 검증
pnpm test && pnpm lint && pnpm typecheck
pnpm build                                   # sync:exports가 새 exports 키를 생성
pnpm verify:dts && pnpm verify:styles
# 4. changeset(minor: 컴포넌트 추가)
pnpm changeset
```

**핵심**: `sync:exports`를 돌리지 않으면 npm 쪽에 해당 exports 키가 없습니다——릴리스 전에 반드시 완전한 `pnpm build`를 밟으세요. `styles/<name>/index.scss`를 추가하면 양 단말의 빌드 스크립트가 자동으로 덮습니다(각자의 컴포넌트 디렉터리를 스캔), 단 share 안에 **반드시** 해당 scss가 있어야 합니다. 그렇지 않으면 그 컴포넌트가 어느 한 단말에서 스타일 산물 없이(조용히 건너뛰어) 남습니다.

## CI가 돌리는 것

`.github/workflows/ci.yml`은 매 PR / master로의 push마다 install → lint → typecheck → test → build → verify:dts → verify:styles(E배 이후에는 `docs:build` 추가)를 돌립니다.

**돌리지 않는 것**: `verify:theme`(명암비 게이트, 로컬에서 수동으로 지킴), `verify:versions`(버전 일치성, 릴리스 뒤 하류가 처리).

## 의존과 도구 체인

- 패키지 매니저: `pnpm`(lockfile은 반드시 커밋)
- 빌드: `vite` + `rollup`(preserveModules)
- 타입: `tsc`(`tsconfig.build.json` 미러에서 dts를 그대로 출력)
- 테스트: `vitest`
- 스타일: `sass`(`api: 'modern'`)
- changeset: `@changesets/cli`
- 문서 사이트: `astro` + `@astrojs/starlight`

## 관련 문서

- [검증 체계](/ko/development/verification) —— 여섯 항목 검증이 각각 무엇을 확인하는지
- [빌드 스크립트](/ko/development/scripts) —— `build-styles.mjs` / `gen-docs-data.mjs` 등
- [릴리스 절차](/ko/development/release) —— 육단계 릴리스
- [기여 가이드](/ko/development/contribution) —— 레드라인과 PR 전 체크리스트
