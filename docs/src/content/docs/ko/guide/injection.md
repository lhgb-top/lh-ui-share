---
title: 각 단말의 스타일 주입 전략
description: share는 스타일 내용만 제공하고, 주입 방식은 각 UI 라이브러리가 선택합니다 —— 양 단말 전략이 다른 설계상의 이유
---

# 각 단말의 스타일 주입 전략

**share는 스타일 내용만 제공합니다**(SCSS 소스 + 토큰). **주입 방식은 각 UI 라이브러리가 선택합니다**.
두 단말의 전략이 다른 것은 결함이 아니라 설계입니다. 어떤 단말도 이 때문에 로컬에 컴포넌트 scss 사본을 가져서는 안 됩니다(레드라인 2).

## 두 단말 비교

| | lh-ui-plus(Vue3) | lh-ui-vue2 |
| --- | --- | --- |
| 라이브러리 진입점 주입 | 전체 side-effect: `src/index.ts`가 컴포넌트마다 `import '@lh-ui/share/styles/<name>'`하여, 라이브러리를 import하면 모든 스타일을 얻음 | 주입하지 않고, 사용자가 필요에 따라 `@lh-ui/vue2/theme.css` + `@lh-ui/vue2/style/<name>`을 import |
| 스타일 산출물 | `es\|lib/<name>/style/index.css` + `es/<name>/style/index.scss`(scss 소스는 산출물과 함께 배포, `@use`를 bare specifier로 재작성) | `es\|lib/components/<name>/style/index.css`(css만) |
| 테마 산출물 | `theme/index.css` + `dist/index.css`(테마 + 전체) | `dist/theme/index.css`(밝은색) + `dist/theme/index-dark.css`(어두운색) |
| 필요에 따른 하위 경로 | `./style/*` → `es/*/style/index.scss`; `./style-css/*` → `es/*/style/index.css` | `./style/*` → `es/components/*/style/index.css`; `./theme.css`, `./theme-dark.css` |
| 빌드 스크립트 | `lh-ui-plus/scripts/build-styles.mjs`(컴포넌트 목록을 `packages/components`에서 스캔) | `lh-ui-vue2/scripts/build-styles.mjs`(`src/components`에서 스캔, share에 스타일 소스가 없는 컴포넌트는 자동으로 건너뜀) |

## 왜 두 단말이 다른가

- **Vue3 단말**은 "라이브러리를 import하면 바로 쓰는" 다수를 대상으로 합니다: vite 생태계는 side-effect 스타일 주입에 우호적이며, 전체 주입이 사용자의 필요에 따른 설정 비용을 없애줍니다; tree-shaking은 스타일에는 애초에 효과가 없으므로 전체가 오히려 편합니다.
- **Vue2 단말**은 기존 프로젝트와 크기에 민감한 시나리오를 대상으로 합니다: webpack 4 시대에는 side-effect 주입이 설정을 잘못하기 쉬웠고, 필요에 따른 import(두 줄)가 더 제어하기 쉬우며 사용자가 밝은색만 또는 어두운색만 불러올 수도 있습니다.

## 새 컴포넌트 추가 시의 다루기

새 컴포넌트를 추가할 때 **양 단말의 빌드 스크립트 모두 자동으로 다룹니다**(각자의 컴포넌트 디렉터리를 스캔), 단 share의 `styles/`에 대응하는 `<name>/index.scss`가 있어야 합니다 —— 그렇지 않으면 해당 컴포넌트는 어느 한 단말에서 스타일 산출물이 없습니다(**조용히 건너뛰며**, 오류를 내지 않습니다). 이것이 "스타일 유일 소스" 레드라인이 주는 직접적인 제약입니다: 먼저 share에 스타일을 만들고, 그 다음 각 단말에 컴포넌트를 만듭니다.

## 단말 간 전환 클래스명: 3개 mixin이 통합

Vue2의 전환 클래스명은 `-enter` / `-leave`이고, Vue3 / React는 `-enter-from` / `-leave-from`입니다(`-leave-to`는 양 단말이 같은 이름). 두 벌의 클래스명을 손으로 쓰면 반드시 어긋나므로, 항상 `@include`로 작성합니다:

```scss
@use '@lh-ui/share/styles/theme/common/transition' as *;

.lh-dialog-fade {
  @include lh-enter-both;          // -enter + -enter-from(Vue3)
  @include lh-leave-both;          // -leave + -leave-from
  @include lh-transition-ends;     // -enter-to + -leave-to(양 단말이 같은 이름)
}
```

상태를 **자손 노드**에 걸어야 할 때는 두 번째 매개변수를 전달합니다:

```scss
@include lh-transition-ends('.lh-drawer-fade', '.lh-drawer__panel--right');
```

컴포넌트 스타일에서는 **두 벌의 전환 클래스명을 다시 손으로 쓰는 것이 금지됩니다**.

## 테마 맞춤 설정 산출물의 주입 제약

`buildPresetStyleText(vars)`는 주입 가능한 `<style>` 텍스트(`:root` + 어두운색 블록)를 만들어냅니다.
UI 계층이 채택할 때 **`<style>` 요소만 작성할 수 있고, `documentElement`의 인라인 style에 작성하면 안 됩니다**:

> 인라인 style의 명시도가 `var-dark.scss`의 어두운색 변수 전체보다 높아, 다크 모드의 색 배합이 왜곡됩니다.

자세한 내용은 [런타임 맞춤 설정](/ko/theme/customization)을 참고하세요.
