---
title: 검증 체계
description: 'verify:dts / verify:styles의 6개 항목 / verify:theme AA 게이트 / verify:versions가 각각 무엇을 검사하고, 출력을 어떻게 읽는지'
---

lh-ui의 "검증"은 형식적인 절차가 아닙니다 —— 각 항목이 **실제로 발생했던** 회귀를 하나씩 막습니다. 이 문서는 항목별로 무엇을 검사하는지, 실패 출력을 어떻게 읽는지 설명합니다.

## verify:dts —— 산출물 타입 일치

```bash
pnpm verify:dts
```

**무엇을 검사하는가**: `es/` / `lib/`에 컴파일된 `.d.ts`가 소스 타입 선언과 일치하고, exports 키가 가리키는 파일이 실제로 존재하는지.

**전형적인 실패**:

- 소스 타입을 바꾸고 `pnpm build`를 다시 실행하지 않음(산출물이 옛것)
- `sync:exports`가 exports 키를 생성했지만, 대응하는 파일이 빌드되지 않음(경로 오타)
- `import type`을 `import`로 잘못 써서, 산출물에 런타임 코드가 한 벌 더 들어감

**해결**: `pnpm build`를 완전히 다시 실행한 뒤, `pnpm verify:dts`.

## verify:styles —— 6개 항목

```bash
pnpm verify:styles
```

스크립트: `scripts/verify-styles.mjs`. 6개 항목이 순서대로 실행되며, 어느 하나라도 실패하면 종료합니다.

### 1. EP 색 팔레트

블랙리스트 점검: EP(Element Plus)에서 유래한 9개의 색 값(`#409eff`, `#e6a23c`, `#f56c6c`, `#67c23a`, `#909399`, `#606266`, `#303133`, `#ebeef5`, `#c0c4cc`)이 `styles/`의 scss 파일에 나타나면 실패입니다. 이것은 D2 정리 이후의 회귀 방지책으로, 옛 체계의 색이 되돌아오는 것을 막습니다 —— lh-ui의 색은 항상 `styles/theme/common/variables.scss`의 토큰 정의에서 옵니다.

### 2. var fallback

컴포넌트 scss의 모든 `var(--lh-*)`에 폴백 값이 있는지 확인합니다:

```scss
// ✅ 통과
color: var(--lh-text-primary, rgba(0, 0, 0, 0.88));

// ❌ 실패
color: var(--lh-text-primary);
```

**왜**: 토큰이 없을 때(사용자가 일부 스타일만 사용, 옛 버전에 토큰이 없음) 폴백 없는 `var()`는 유효하지 않은 값으로 평가되어 속성이 버려집니다 —— 글자가 기본 검은색이 되고, 테두리가 사라집니다. 폴백이 있으면 "내려앉아도 사용 가능"함을 보장합니다.

### 3. @use 토큰

컴포넌트 scss가 흩어진 hex 리터럴이 아니라 `@use`로 토큰 계층을 참조하는지 확인합니다:

```scss
// ✅ 통과
@use 'theme/common/var' as *;
.lh-card { background: var(--lh-bg-color, #fff); }

// ❌ 실패
.lh-card { background: #ffffff; }
```

**예외**: `var()`의 폴백 값에는 hex를 쓸 수 있습니다(내려앉기용). 실패 메시지는 파일과 줄 번호를 나열합니다.

### 4. 집계 일치

`styles/index.scss`(전체 집계)이 " `styles/*/index.scss`를 스캔하여 얻은 컴포넌트 목록"과 일치하는지 확인합니다. **`styles/index.scss`는 `scripts/build-styles.mjs`가 생성하는 것이므로 직접 수정하지 마세요** —— 컴포넌트 디렉터리를 새로 추가한 뒤 생성을 다시 실행하지 않으면 불일치가 발생합니다.

### 5. 전환 클래스명 단일 소스

컴포넌트 scss에 `-enter-from` / `-leave-from` 리터럴을 **직접** 썼는지 확인합니다:

```scss
// ❌ 실패: 두 벌의 전환 클래스명을 손으로 작성
.lh-dialog-fade-enter-from { opacity: 0; }

// ✅ 통과: mixin 사용
@include lh-enter-both('.lh-dialog-fade') { opacity: 0; }
```

**왜**: Vue2는 `-enter`, Vue3/React는 `-enter-from`을 사용하며, 손으로 쓰면 반드시 한쪽이 누락됩니다([transition-mixins](/ko/reference/transition-mixins) 참고). 과거에는 16개 컴포넌트가 각자 두 벌을 쓰고 있어, 한 곳을 고치면 한 곳이 누락되었습니다.

### 6. 어두운색 도달성

`var.scss`에서 값이 `#{$lh-foo}` 형태(컴파일 타임에 밝은색으로 구워짐)인 토큰이 `var-dark.scss`에 **대응하는 덮어쓰기가 있는지** 확인합니다.

**가장 중요한 항목**입니다. 이런 누락은 과거에 어두운색에서 메뉴 / 표 / 타임라인의 글자가 밝은색 값을 그대로 써서 **보이지 않게** 만들었습니다(검은 바탕에 검은 글자). 자세한 내용은 [다크 모드의 컴파일 타임 베이크 함정](/ko/theme/dark-mode#컴파일-타임-베이크-함정)을 참고하세요.

**참고**: 과거에 오탐 수정이 한 번 있었습니다 —— verify:styles의 인덱스 어긋남으로 `no-fallback` 예외 줄이 오탐보고된 사례(커밋 `791ff32`). 실패 메시지가 이상하게 보인다면(예외된 줄이 여전히 오류로 보고되면), 먼저 이 알려진 문제인지 확인하세요.

## verify:theme —— AA 대비 게이트

```bash
pnpm build          # ← 먼저 실행 필요, es/ 산출물을 읽음
pnpm verify:theme
```

스크립트: `scripts/verify-theme-contrast.mjs`.

**무엇을 검사하는가**: 5개 내장 테마(및 그 어두운색 변형)에서, 모든 "글자 / 배경" 쌍의 WCAG 대비가 **4.5:1** 이상(AA 등급)인지.

**왜 es/ 산출물을 읽는가**: 프리셋 테마의 vars는 빌드 후에야 최종 형태가 됩니다(`buildPresetDarkVars`의 도출 결과도 산출물 안에 있습니다).

**전형적인 실패**:

- 새 프리셋의 밝은 주색에 `--lh-color-on-primary`를 주지 않음(밝은 주색 위의 흰 글자가 3.x:1에 불과)
- 선택된 상태의 글자색(`--lh-selected-color`)이 마우스오버 배경에서 대비가 부족

**해결**: 관련 색 값을 어둡게 / 밝게 조정하여 대비가 기준을 통과할 때까지 반복합니다. `getContrastRatio()`와 `getRelativeLuminance()`(`src/theme/themes/index.ts`가 내보냄)를 로컬에서 계산할 수 있으니, 매번 전체 게이트를 실행할 필요는 없습니다.

**CI는 이 항목을 실행하지 않습니다** —— 먼저 build가 필요하고 연산량이 적지 않기 때문입니다. 로컬에서 릴리스 전에 수동으로 지킵니다.

## verify:versions —— 버전 일치

```bash
pnpm verify:versions
```

스크립트: `scripts/check-version-sync.mjs`.

**무엇을 검사하는가**: lh-ui-plus / lh-ui-vue2의 `package.json`에 있는 `@lh-ui/share`의 의존성 범위가 **share의 현재 버전을 포함**하는지.

**현재 상태**: share가 `0.3.0`일 때는 통과합니다. **0.4.0 배포 후에는 실패합니다** —— 두 UI 라이브러리의 의존성 범위가 여전히 `^0.3.0`이기 때문입니다. 이것은 **예상된 동작**입니다: [레드라인 5](/ko/development/contribution#6개의-레드라인)(share를 먼저 릴리스하고, UI 라이브러리가 그 뒤를 따름)에 따라, 릴리스 후 두 형제 저장소로 가서 각자 `pnpm up @lh-ui/share@0.4.0`을 실행하고 회귀시킵니다.

## lint과 typecheck

| 명령 | 스캔 범위 |
| --- | --- |
| `pnpm lint` | `src` / `tests` / `scripts` / `vite.config.ts` / `vitest.config.ts` |
| `pnpm typecheck` | `src/**/*`(`tsconfig.json`의 include) |

**`docs/`는 스캔 범위가 아닙니다** —— 문서 사이트는 독립된 Astro 프로젝트이며, 품질은 `pnpm docs:build`가 관리합니다. 마찬가지로 `styles/`는 typecheck 범위가 아닙니다(SCSS는 verify:styles가 관리).

**lint의 프레임워크 의존성 게이트**: CI는 `src/`에 `import 'vue'` / `import 'react'` / `@dcloudio/*`가 나타나는지 grep합니다 —— 이것은 [레드라인 1](/ko/development/contribution#6개의-레드라인)이며, core는 프레임워크 비종속이어야 합니다.

## 테스트

```bash
pnpm test
```

`tests/unit/`은 **core 단위 테스트의 유일 사본**(레드라인 3)입니다: 세 라이브러리가 결과를 공유하며, UI 라이브러리는 복사할 수 없습니다. 순수 함수 테스트에는 컴포넌트 렌더링이 필요 없습니다 —— rect 리터럴을 만들고 출력을 어서션하며, 네 단말이 같은 어서션을 공유합니다.

주요 테스트 파일:

| 파일 | 커버 범위 |
| --- | --- |
| `theme.spec.ts` | 프리셋 일치성(JS vars와 SCSS 변수의 이중 소스 동기화) |
| `core/*.spec.ts` | 각 core 컴포넌트 논리 |
| `shared/*.spec.ts` | 공유 코어 알고리즘(popper / keyboard / virtual 등) |

## 검증 전부 실행하기

릴리스 전의 완전한 목록:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build                    # sync:exports가 package.json을 변경하는 것에 주의
pnpm verify:dts
pnpm verify:styles            # 6개 항목
pnpm verify:theme             # 먼저 build 필요
pnpm verify:versions          # 릴리스 후 하류 처리로 넘어감
pnpm docs:build               # 문서 사이트
```

`prepublishOnly`(`pnpm release`가 트리거)에는 build + verify:dts + verify:styles만 포함됩니다. 따라서 **test / lint / typecheck / verify:theme은 명시적으로 수동 실행해야 합니다**.

## 관련 문서

- [명령 목록](/ko/development/commands)
- [빌드 스크립트](/ko/development/scripts)
- [릴리스 흐름](/ko/development/release)
- [다크 모드](/ko/theme/dark-mode)
- [스타일 소스](/ko/reference/styles)
