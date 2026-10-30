---
title: transition-mixins —— 단마 간 전환 클래스명
description: 'lh-enter-both / lh-leave-both / lh-transition-ends의 3개 mixin이 Vue2와 Vue3/React의 전환 클래스명 차이를 통합'
---

`styles/theme/common/transition.scss`는 단말 간 전환 클래스명의 **단일 소스**입니다. 이것이 해결하는 것은 실제 있었던 고통입니다:

Vue2의 전환 클래스명은 `<name>-enter` / `<name>-leave`(진입 / 이탈의 **시작 상태**)이고, Vue3과 React는 `<name>-enter-from` / `<name>-leave-from`으로 바뀌었습니다. 양쪽은 같은 의미("진입 시작 상태" / "이탈 시작 상태")이지만 이름만 다릅니다. 과거에는 16개 컴포넌트가 파일마다 두 벌의 선택자를 손으로 썼고, 한 곳을 고치면 한 곳이 누락되었습니다.

## 3개의 mixin

| Mixin | 매개변수 | 생성하는 클래스명 | 용도 |
| --- | --- | --- | --- |
| `lh-enter-both` | `$selector`(필수), `$child`(선택) | `#{$selector}-enter`, `#{$selector}-enter-from` | 진입 시작 상태 이중 작성 |
| `lh-leave-both` | `$selector`, `$child`? | `#{$selector}-leave`, `#{$selector}-leave-from` | 이탈 시작 상태 이중 작성 |
| `lh-transition-ends` | `$selector`, `$child`? | `#{$selector}-enter`, `#{$selector}-enter-from`, `#{$selector}-leave-to` | 전환 시작/끝 상태(진입 시작 이중 작성 + 양쪽이 같은 이름인 이탈 종료 상태) |

셋 모두 `@content`로 스타일 블록을 받습니다.

### `$child` 매개변수

전환 상태를 **자손 노드**에 걸어야 할 때 두 번째 매개변수를 전달하면, 생성된 선택자에 ` #{$child}` 접미사가 붙습니다:

```scss
// $child 미전달: 상태는 선택자 자신에 적용
@include lh-enter-both('.lh-backtop-fade') { ... }
// → .lh-backtop-fade-enter, .lh-backtop-fade-enter-from { ... }

// $child 전달: 상태는 내부 패널에 적용
@include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') { ... }
// → .lh-drawer-fade-enter .lh-drawer__panel--right,
//   .lh-drawer-fade-enter-from .lh-drawer__panel--right { ... }
```

## 왜 이 세 개인가

- `-enter-to` / `-leave-to`는 **양쪽이 같은 이름**이므로 이중 작성이 필요 없습니다.
- 이중 작성이 필요한 것은 **쌍을 이루는 시작 상태**뿐입니다: `-enter` / `-enter-from`과 `-leave` / `-leave-from`.
- `lh-transition-ends`는 "진입 시작과 이탈 종료가 같은 모양"인 흔한 시나리오(페이드 인/아웃: 불투명도 0 → 1 → 0)로, 하나의 mixin이 진입 시작 상태 이중 작성 + 이탈 종료 상태를 동시에 덮습니다.

## 사용 예시

### 일반적인 전환(backtop 페이드 인/아웃)

```scss
.lh-backtop-fade {
  @include lh-transition-ends('.lh-backtop-fade') {
    opacity: 0;
  }
}
```

컴파일 결과:

```scss
.lh-backtop-fade-enter,
.lh-backtop-fade-enter-from,
.lh-backtop-fade-leave-to {
  opacity: 0;
}
```

### 진입 시작 상태만(dialog 페이드 인, 종료 상태는 필요 없음)

```scss
.lh-dialog-fade {
  @include lh-enter-both('.lh-dialog-fade') {
    opacity: 0;
    transform: scale(0.9);
  }
}
```

### 상태를 내부 패널에 적용(drawer slide-in)

```scss
.lh-drawer-fade {
  @include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') {
    transform: translateX(100%);
  }
}
```

Vue3의 `<transition name="lh-drawer-fade">`는 enter 단계에서 **루트 요소**에 `lh-drawer-fade-enter-from`을 붙이고, 선택자의 자손 일치로 패널을 찾아 패널이 이동합니다 —— 루트 요소 자체는 움직이지 않아, teleport 루트 노드의 transform이 배치에 영향을 주는 것을 피합니다.

## 컴포넌트 안에서의 사용법

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

UI 계층(Vue3):

```vue
<transition name="lh-drawer-fade">
  <div v-if="visible" class="lh-drawer">...</div>
</transition>
```

UI 계층(Vue2):

```vue
<transition name="lh-drawer-fade">
  <div v-show="visible" class="lh-drawer">...</div>
</transition>
```

**양쪽이 같은 `name`을 사용**하며, 스타일 안의 mixin이 생성한 두 벌의 선택자가 각각 자기 단말의 클래스명에 적중합니다. 이것이 "주입은 분산, 내용은 단일 소스"가 전환 클래스명에 착지한 모습입니다.

## 주의 사항

- **컴포넌트 스타일에서 두 벌의 전환 클래스명을 다시 손으로 쓰는 것은 금지**되어 있으며, 항상 `@include`를 사용합니다([레드라인 2](/ko/development/contribution#6개의-레드라인)). `verify:styles`의 5번째 항목(전환 클래스명 단일 소스)이 직접 작성한 `-enter-from` / `-leave-from` 리터럴을 스캔합니다.
- **`@use` 경로**: `@use 'theme/common/transition' as *;`(각 컴포넌트 scss의 상대 경로 또는 빌드 시점의 bare specifier는 [주입 전략](/ko/guide/injection)이 정함).
- **React 시나리오**: React 버전은 headless 전환(상태 기반 className)을 사용하며, mixin이 생성한 `-enter-from` 클래스명이 마찬가지로 적용됩니다.
- **`$child` 접미사는 자손 선택자**입니다: `&`로 이어 붙인 것이 아니라, 생성된 선택자는 `.parent-enter .child`이며, 루트 요소가 전환 클래스명을 가지고 있어야 작동합니다.

## 관련 문서

- [주입 전략](/ko/guide/injection) —— 양 단말의 스타일 산출물 차이
- [다크 모드](/ko/theme/dark-mode) —— 토큰의 런타임 vs 컴파일 타임
- [스타일 소스](/ko/reference/styles) —— `styles/` 디렉터리와 BEM 규칙
