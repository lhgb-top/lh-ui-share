---
title: 패키지 구조
description: src / styles / tests / scripts의 디렉터리 책임, 그리고 56과 58이라는 두 가지 컴포넌트 집계 기준
---

# 패키지 구조

## 소스 측

```
lh-ui-share/
├── src/
│   ├── core/                  컴포넌트 순수 함수 계층(프레임워크 import 없음, CI grep 게이트)
│   │   ├── <컴포넌트>/            logic.ts / types.ts / index.ts의 3세트
│   │   └── shared/            컴포넌트 횡단 공유 코어(12개 모듈, <name>/index.ts로 규격화됨)
│   ├── theme/                 테마 TS 측: types + 5개 프리셋 + 런타임 원시
│   ├── constants/             LH_* 상수(LH_SIZE_DEFAULT / LH_LANGUAGE_DEFAULT …)
│   ├── locales/               LhLocale(순수 에미터) + lang/의 10개 완전 언어 팩
│   ├── types/                 공개 타입(locale / components)
│   ├── utils/                 순수 유틸리티(createNamespace / deepMerge …)
│   └── index.ts               전체 집계 진입점
├── styles/                    컴포넌트 BEM 스타일 유일 소스
│   ├── <컴포넌트>/index.scss      58세트 컴포넌트 스타일
│   └── theme/
│       ├── common/
│       │   ├── var.scss       밝은색 토큰(:root, 185개 --lh-*)
│       │   ├── var-dark.scss  어두운색 덮어쓰기([data-theme='dark'], .dark, 118개)
│       │   ├── variables.scss 183개 $lh-* SCSS 변수(!default)
│       │   ├── patterns.scss  6개의 중국풍 문양 mixin
│       │   ├── transition.scss 3개의 전환 클래스명 mixin(양 단말의 차이를 통합)
│       │   └── a11y.scss      접근성 보조 스타일
│       └── index.scss         테마 집계
│   └── index.scss             전체 집계(토큰 + 모든 컴포넌트, 스크립트가 생성, 직접 수정 금지)
├── tests/unit/                core 단위 테스트 유일 사본(3개 라이브러리가 공유, 복사하지 않음)
├── scripts/                   빌드와 검증 스크립트
├── docs/                      이 문서 사이트(Astro Starlight)
└── .changeset/                대기 중인 체인지셋
```

## 각 디렉터리의 책임

| 디렉터리 | 책임 | 레드라인 |
| --- | --- | --- |
| `src/core/<name>/` | 컴포넌트 순수 함수: 클래스명 계산 / 상태 머신 / aria 속성 팩 | `import 'vue' \| 'react' \| '@dcloudio/*'` 금지 |
| `src/core/shared/` | 컴포넌트 횡단 코어, 각 단말이 직접 재사용 | 같음; `<name>/index.ts`로 규격화됨 |
| `styles/` | 컴포넌트 BEM 스타일 **유일 소스** | 스타일을 UI 라이브러리로 복사하여 직접 수정하는 것을 금지; 클래스명 `lh-*`; 색은 항상 `var(--lh-*, fallback)` |
| `tests/unit/` | core 단위 테스트 **유일 사본** | UI 라이브러리가 복사하는 것을 금지 |
| `scripts/` | extract-from-plus(일회성) / build-styles / verify-* / release | — |

## 컴포넌트 집계 기준: 56인가 58인가

두 숫자 모두 맞으며, 헤아리는 대상이 다릅니다:

| 기준 | 숫자 | 근거 |
| --- | --- | --- |
| core 순수 함수 컴포넌트 | **56** | `src/core/` 아래의 컴포넌트 디렉터리(`shared/` 제외) |
| 컴포넌트 스타일 세트 수 | **58** | `styles/` 아래의 컴포넌트 디렉터리(`theme/` 제외) |

차이는 이 세 가지입니다:

| 이름 | core | styles | 이유 |
| --- | --- | --- | --- |
| `layout` | — | ✅ | 레이아웃 컨테이너, 논리는 모두 UI 계층에 있음(row/col의 반응형 중단점 연결) |
| `tree-select` | — | ✅ | 선택기 접착은 프레임워크 측에 있고, 트리 데이터 논리는 `core/tree`를 재사용 |
| `config` ↔ `config-provider` | `config` | `config-provider` | 같은 것의 두 가지 디렉터리 이름 |

## 빌드 산출물

`pnpm build`는 4개의 디렉터리를 만들어내며, `files`도 이 4개만 공개합니다:

| 산출물 | 구조 | 설명 |
| --- | --- | --- |
| `es/` | preserveModules로 `src/`를 미러링 | ESM, 하위 경로별로 파일 단위 필요에 따른 사용 |
| `lib/` | 같음 | CJS(`require` 조건) |
| `dist/` | `dist/theme/*.css` `dist/styles/index.css` | 집계 스타일 산출물 |
| `styles/` | 원본 그대로 패키지에 포함 | **SCSS 소스**, 프로젝트가 직접 컴파일 |

산출물은 **프레임워크 의존성이 없음**을 유지합니다: `verify:dts`가 `es/**/*.d.ts`를 스캔하여, 프레임워크 import가 하나라도 나타나면 실패합니다.

## 단일 컴포넌트 산출물의 모습(button 예시)

```
es/button/
├── index.d.ts        타입
├── index.js          ESM
├── logic.d.ts
├── logic.js
├── types.d.ts
└── style/
    ├── index.css     컴파일된 컴포넌트 스타일(plus 단말 형태)
    └── index.scss    소스(@use는 bare specifier로 재작성되어 산출물과 함께 배포)
```

`lib/button/`도 같은 구조입니다. 양 단말의 UI 라이브러리는 각자 `es/components/<name>/style/index.css`로
한 번 더 감쌉니다(vue2 단말은 css만 배포하고 scss는 배포하지 않습니다).
