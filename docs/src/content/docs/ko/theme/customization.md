---
title: 런타임 맞춤 설정
description: 'themeVars의 약식 접두사 보충, componentTheme의 컴포넌트별 덮어쓰기, patternComponents 문양 화이트리스트'
---

런타임 맞춤 설정은 lh-ui 테마 시스템의 핵심 역량입니다: **스타일을 재컴파일하지 않고**, 런타임에 컴포넌트의 외형을 바꿉니다. 세 개의 API가 각각 한 계층을 담당합니다.

## 一、themeVars —— 전역 토큰 덮어쓰기

ConfigProvider는 `themeVars`를 받으며, 키는 **약식**입니다:

```vue
<lh-config-provider
  :theme-vars="{
    'primary-color': '#1677ff',
    'border-radius-base': '8px',
  }"
>
  <App />
</lh-config-provider>
```

### 약식 접두사 보충

`'primary-color'`는 자동으로 `--lh-primary-color`로 보충됩니다. 이 보충은 [toCssVarName](/ko/reference/utils#cssvars의-3개-세트)가 수행하며 **멱등**입니다(이미 접두사가 있는 키는 그대로 반환되어 `--lh---lh-...`이 되지 않습니다).

전체 이름을 직접 쓸 수도 있습니다:

```ts
{ '--lh-primary-color': '#1677ff' }   // 동등
```

내부 구현은 `cssVars(themeVars)`로, 키-값 쌍을 바로 `:style`에 묶을 수 있는 CSS 변수 객체로 바꿉니다.

### 유효 범위는 DOM 부분 트리

CSS 변수는 본래 계단식: ConfigProvider가 변수를 감싸는 요소에 주입하면, **그 자손 컴포넌트만 새 값을 소비합니다**. 이로 인해 부분적인 스킨 교체를 할 수 있습니다:

```vue
<lh-config-provider :theme-vars="brandVars">
  <Header />
</lh-config-provider>

<lh-config-provider :theme-vars="neutralVars">
  <Content />
</lh-config-provider>
```

### docs 사이트가 내보내는 것도 같은 한 벌

docs 테마 맞춤 설정 페이지가 내보내는 `:root { --lh-*: ... }` 텍스트와 `themeVars`는 **같은 것**을 파일로 기록한 것입니다 —— 프로젝트 진입점에 바로 붙여 넣을 수 있습니다:

```css
/* 프로젝트 진입점 */
:root {
  --lh-primary-color: #2B4C7C;
  --lh-primary-color-hover: #3D649E;
  /* ... */
}
```

## 二、componentTheme —— 컴포넌트별 덮어쓰기

`themeVars`는 전역입니다; 어떨 때는 단일 컴포넌트의 토큰만 바꾸고 싶을 때가 있습니다(예: 모든 버튼의 모서리 둥글기, 단 다른 컴포넌트는 유지).

```vue
<lh-config-provider
  :component-theme="{
    button: { 'border-radius': '20px' },
    input: { 'control-height-medium': '40px' },
  }"
>
  <App />
</lh-config-provider>
```

key는 컴포넌트 이름(`styles/` 아래의 디렉터리 이름), value는 해당 컴포넌트 유효 범위의 `themeVars`입니다. 주입할 때 변수가 컴포넌트 접두사의 유효 범위를 가져와 지정된 컴포넌트에만 영향을 줍니다. 키 이름은 토큰 이름과 일치해야 합니다(`control-height-medium` → `--lh-control-height-medium`) —— `input`의 기본 단계는 medium이며, 단계 접미사 없는 `control-height`를 소비하는 컴포넌트는 없습니다.

**주의**: 컴포넌트 수준 토큰은 해당 컴포넌트의 SCSS가 `var(--lh-<name>-*)`로 관계된 토큰을 소비하고 있는 것에 의존합니다 —— 모든 컴포넌트가 전부의 스타일 지점을 토큰화한 것은 아니며, 무엇을 바꿀 수 있는지는 [디자인 토큰](/ko/theme/tokens) 표 안의 해당 컴포넌트의 거동이 기준입니다.

## 三、patternComponents —— 문양 화이트리스트

중국풍 문양([중국풍 문양](/ko/theme/patterns) 참고)은 기본적으로 **활성화되지 않습니다**. 활성화하면 배경에 영향을 주므로, 모든 컴포넌트에 적합한 것은 아닙니다(표의 배경에 매화를 찍으면 어지러워집니다).

`patternComponents`가 어느 컴포넌트에 문양을 적용할지 제어합니다:

```vue
<lh-config-provider
  :pattern-components="['card', 'dialog', 'drawer']"
  pattern="plum"
>
  <App />
</lh-config-provider>
```

화이트리스트 안의 컴포넌트만 문양을 가집니다. 구체적인 props 이름은 각 UI 라이브러리의 ConfigProvider 문서를 기준으로 합니다.

## 四、프리셋 + 맞춤 설정의 겹침

셋은 겹칠 수 있으며, 우선순위는 "자손이 조상을 덮어씀, 구체적인 것이 전역을 덮어씀"입니다:

```vue
<lh-config-provider
  theme="cerblue"
  :theme-vars="{ 'border-radius-base': '4px' }"
>
  <!-- 먼저 青花瓷 프리셋을 적용한 뒤, themeVars로 모서리 둥글기를 미세 조정 -->
  <App />
</lh-config-provider>
```

## 五、어두운색과 맞춤 설정의 관계

맞춤 설정한 `themeVars`가 주입된 요소의 부분 트리만, 그 부분 트리의 밝고 어두움에 영향을 줍니다:

```vue
<!-- 이 구획은 어두운색으로 강제 -->
<div data-theme="dark">
  <lh-button>어두운색 버튼</lh-button>
</div>
```

- 어두운색 스위치는 `[data-theme='dark']` 또는 `.dark` 클래스(`var-dark.scss`의 선택자)입니다.
- **`themeVars`를 `documentElement`의 인라인 style에 쓰지 마세요** —— 인라인 style의 명시도가 `var-dark.scss`의 어두운색 변수 전체보다 높아, 다크 모드의 색 배합이 왜곡됩니다([테마 개요의 주입 제약](/ko/theme/overview#주입-제약-style만-허용-인라인-style-금지) 참고).

## 六、런타임에 바꿀 수 없는 것

| 바꾸고 싶은 것 | 가능 여부 | 대안 |
| --- | --- | --- |
| 주색, 글자색, 모서리 둥글기, 간격 등의 토큰 | ✅ `themeVars` | — |
| 단일 컴포넌트의 토큰 | ✅ `componentTheme` | — |
| 문양 | ✅ `pattern` + `patternComponents` | — |
| 컴포넌트 높이(input 37px 등) | ⚠️ 제한적 | 높이 토큰이 아직 통일되지 않음, [알려진 토큰 갭](/ko/theme/tokens#알려진-토큰-갭) 참고 |
| 컴포넌트 DOM 구조 / 클래스명 | ❌ | [pt 투과 전달](/ko/core/pt) 또는 슬롯 사용 |
| 섀도의 계층 합성 | ❌ 컴파일 타임 | `$lh-*` SCSS 변수를 덮어쓰고 재컴파일 |
| 애니메이션 곡선 | ✅ `--lh-animation-timing-function` | — |

## 예시: 완전한 테마 설정

```vue
<template>
  <lh-config-provider
    theme="songhua"
    :theme-vars="{
      'border-radius-base': '8px',
      'font-size-base': '15px',
    }"
    :component-theme="{
      button: { 'border-radius': '999px' },
    }"
    :pattern-components="['card', 'dialog']"
  >
    <App />
  </lh-config-provider>
</template>
```

## 주의 사항

- **약식 키에 접두사를 중복해서 붙이지 마세요**: `'--lh-primary-color'`가 아니라 `'primary-color'`(멱등이긴 하지만, 약식으로 통일하는 편이 깔끔합니다).
- **유효 범위 새어 나감**: `themeVars`는 자손 컴포넌트에만 영향을 줍니다; 반대로 **조상** ConfigProvider의 변수는 자손의 것에 의해 덮어씌워집니다(CSS 계단식 규칙).
- **주입 위치**: ConfigProvider는 감싸는 요소에 주입하고(`documentElement`가 아님), 제거 가능하고 부분화 가능함을 보장합니다.
- **SSR**: 주입하는 것은 일반 CSS 변수이며, 서버 사이드 렌더링은 인라인 style을 출력하고 클라이언트 수화 후에 일치합니다.

## 관련 문서

- [테마 시스템 개요](/ko/theme/overview)
- [테마 프리셋](/ko/theme/presets)
- [디자인 토큰](/ko/theme/tokens)
- [중국풍 문양](/ko/theme/patterns)
- [cssVars 유틸리티 함수](/ko/reference/utils#cssvars의-3개-세트)
