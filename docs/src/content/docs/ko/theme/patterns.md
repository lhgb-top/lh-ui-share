---
title: 국풍 문양
description: '유엽 / 운문 / 수파 / 설화 / 매화 / 죽엽 여섯 가지 인라인 SVG 문양과 apply-pattern mixin'
---

국풍은 lh-ui의 장식이 아니라 설계 주장 중 하나입니다. `styles/theme/common/patterns.scss`가 여섯 가지 전통 문양을 제공하고, 선택적인 배경 층으로 주입합니다.

## 6가지 문양

| 문양 | CSS 변수 | 설명 |
| --- | --- | --- |
| 柳叶纹 (유엽문) | `--lh-pattern-willow` | 가늘고 긴 버드나무 잎, 밀도의 균형, 바람에 가볍게 흩날리는 |
| 云纹 (운문) | `--lh-pattern-cloud` | 祥云 (상운)이 펼쳐지며 굽이쳐 흐르는 |
| 水波纹 (수파문) | `--lh-pattern-water` | 잔물결이 미세하게 흔들리며 겹겹이 쌓이는 |
| 雪花纹 (설화문) | `--lh-pattern-snow` | 육각의 눈꽃, 가는 가지가 갈라지는 |
| 梅花纹 (매화문) | `--lh-pattern-plum` | 다섯 꽃잎이 펼쳐지고 수술심이 또렷한 |
| 竹叶纹 (죽엽문) | `--lh-pattern-bamboo` | 바소꼴 대나무 잎, 중맥이 선명하고 어우러져 늘어선 |

모두 `data:image/svg+xml`로 **인라인**되어 있습니다(외부 리소스를 끌어오지 않아 네트워크 의존도와 CORS 문제가 없습니다), `!default`로 사용자가 덮어쓸 수 있습니다. 또한 `--lh-pattern-none: none`(명시적인 문양 없음)이 있습니다.

## 문양 켜기

문양은**기본으로 켜지지 않습니다**(`--lh-bg-pattern: none`). 3가지 활성화 방법:

### 1. 컴포넌트 / 페이지 안에 직접 쓰기

```scss
.my-card {
  --lh-bg-pattern: var(--lh-pattern-plum);
}
```

### 2. ConfigProvider의 themeVars

```vue
<lh-config-provider :theme-vars="{ 'bg-pattern': 'var(--lh-pattern-plum)' }">
  <App />
</lh-config-provider>
```

약식 표기 `'bg-pattern'`이 자동으로 `--lh-bg-pattern`으로 보충됩니다.

### 3. pattern prop + 화이트리스트

```vue
<lh-config-provider
  pattern="plum"
  :pattern-components="['card', 'dialog', 'drawer']"
>
  <App />
</lh-config-provider>
```

문양은 배경에 영향을 주므로 모든 컴포넌트에 어울리는 것은 아닙니다(표 배경에 매화를 인쇄하면 어수선해집니다). `patternComponents` 화이트리스트가 어느 컴포넌트에 문양을 입힐지 제어합니다. 자세한 내용은 [런타임 맞춤 설정](/ko/theme/customization#三patterncomponents--문양-화이트리스트)을 참조하세요.

## 제어 토큰

```scss
:root {
  --lh-bg-pattern: none;                                     // 기본 비활성화
  --lh-bg-pattern-repeat: repeat;                            // 타일링 방식
  --lh-bg-pattern-size: 40px;                                // 유닛 크기(기본 40px은 버튼 높이에 맞춰 도안이 잘리지 않게 함)
  --lh-bg-pattern-opacity: 0.15;                             // 불투명도
  --lh-bg-pattern-color: var(--lh-decoration-color, rgba(184, 134, 11, 0.12));  // 색상
  --lh-bg-pattern-blend: soft-light;                         // 혼합 모드
}
```

모두 `!default`로 덮어쓸 수 있습니다. 가장 자주 쓰는 두 개의 다이얼:

- **`--lh-bg-pattern-size`**: 40px은「버튼 높이 안에 완전한 문양 하나가 들어가는」크기입니다; 큰 블록의 배경에서는 80px 이상으로 올려 문양을 널찍하게 펼칠 수 있습니다.
- **`--lh-bg-pattern-opacity`**: 0.15는「존재하지만 눈에 띄지 않는」기본값입니다; 더 뚜렷한 국풍 분위기가 필요하면 0.25까지 올릴 수 있습니다.

## apply-pattern mixin

```scss
// styles/theme/common/patterns.scss
@mixin apply-pattern {
  background-image: var(--lh-bg-pattern);              // /* no-fallback */
  background-repeat: var(--lh-bg-pattern-repeat);      // /* no-fallback */
  background-size: var(--lh-bg-pattern-size);          // /* no-fallback */
  background-blend-mode: var(--lh-bg-pattern-blend, normal);  // fallback 있음
  @content;
}
```

컴포넌트에서 `@include`하기만 하면 문양 배경 능력을 얻습니다:

```scss
@use 'theme/common/patterns' as *;

.lh-card--patterned {
  @include apply-pattern;
}
```

**왜 앞의 3개에 fallback을 쓰지 않는가**: 문양은 기본으로 비활성화되고, 이 3개의 토큰은 사용자 / ConfigProvider가 전달합니다; 생략 시 문양 없음(`background-image: none`으로의 되돌림은 토큰 자신의 기본값이 제공합니다)이 되며, fallback을 고정하면 오히려「문양 미설정」과「문양 명시적 끄기」를 구별할 수 없게 됩니다.

## 문양과 어두운색

문양의 `--lh-bg-pattern-color`는 기본적으로 `--lh-decoration-color`(장식색)를 참조하고, 후자는 `var-dark.scss`에 어두운색 덮어쓰기가 있습니다——따라서 문양 색상은 어두운색을 따라 자동으로 조정됩니다.

문양 색상을 맞춤 설정할 때는 어두운색 쪽도 함께 조정하는 것을 잊지 마세요:

```scss
[data-theme='dark'],
.dark {
  --lh-bg-pattern-color: rgba(255, 255, 255, 0.08);
}
```

## 주의 사항

- **기본 꺼짐은 의도적입니다**: 문양은 분위기이지 정보가 아니며, 기본으로 켜두면 모든 사용자의 화면을 어지럽힙니다. 전역 문양을 원하는 사용자 측에서 자체적으로 ConfigProvider로 켜세요.
- **인라인 SVG의 크기**: 6개 문양 모두 최소화된 패스이며, 하나당 수백 바이트, CSS에 인라인화해도 추가 요청은 발생하지 않습니다.
- **`!default` 덮어쓰기**: 자신만의 문양으로 바꾸려면 프로젝트에서 `--lh-pattern-plum: url('data:image/svg+xml,...')`을 덮어쓰거나, 직접 `--lh-bg-pattern`을 설정하세요.
- **인쇄 장면**: 문양은 인쇄 시 표시되지 않을 수 있습니다(브라우저의 `background-image` 인쇄 처리를 이유로)——콘텐츠 층이 문양에 의존해 정보를 전달해서는 안 됩니다.

## 관련 문서

- [테마 시스템 총관](/ko/theme/overview)
- [런타임 맞춤 설정](/ko/theme/customization)
- [디자인 토큰](/ko/theme/tokens)
- [스타일 원천](/ko/reference/styles)
