---
title: 명명 규칙
description: top.lhgb 역도메인 루트, LH / Lh / lh / lh-의 4단계 접두사와 세 가지 예외 등록
---

# 명명 규칙

패밀리 전체의 명명 규칙은 통일되어 있으며, plus 저장소의 `docs/project/development-guide.md`에 맞춰져 있습니다.

## 역도메인 루트

**`top.lhgb`**(`www.lhgb.top`을 뒤집은 것)은 lh-ui 패밀리의 모든 저장소가 사용하는 명명의 뿌리입니다.

- **JS / npm 측**: 패키지 이름은 `@lh-ui/*` scope를 유지합니다 —— npm 패키지 이름에는 마침표가 허용되지 않아, `top.lhgb`를
  패키지 이름으로 직접 쓸 수 없습니다. 역도메인은 **메타정보 계층**에 적용됩니다: `package.json`의 `homepage` / `repository` /
  `author`는 모두 `lhgb.top`을 사용합니다.
- **네이티브 측**: `lh-ui-android` / `lh-ui-ios` / `lh-ui-harmony` / `lh-ui-c`의
  applicationId / bundleId / package에서만 `top.lhgb.*` 형식을 사용합니다(이 저장소에는 해당하지 않음).

## LH 접두사 4단계

**서드파티가 아닌 심볼에는 반드시 `LH` 접두사**가 있어야 합니다. 새로운 상수 / 타입 / 인터페이스를 만들 때 바로 지키고, 사후 일괄 수정으로 남기지 마세요:

| 단계 | 형태 | 예 |
| --- | --- | --- |
| 상수 | `LH_XXX`(모두 대문자 + 밑줄) | `LH_SIZE_DEFAULT`, `LH_LANGUAGE_DEFAULT`, `LH_THEME_PRESETS` |
| 타입 / 인터페이스 | `LhXxx`(대문자 카멜 케이스) | `LhThemePreset`, `LhSxProps`, `LhVirtualRange` |
| 모듈 수준 싱글톤 / 소문자 객체 | `lhXxx`(소문자 카멜 케이스) | `lhlocale` |
| BEM 클래스명 / 컴포넌트 name | `lh-xxx` / `LhXxx` | `.lh-button--primary`, `name: 'LhButton'` |

상수 명명 구조는 **`LH_<모듈>_<개념>`**이며, 기본값 상수는 `DEFAULT`를 접미사로 씁니다:

- `LH_DRAWER_DIRECTION_DEFAULT`(`LH_DEFAULT_DRAWER_DIRECTION`이 아님)
- `LH_DROPDOWN_PLACEMENT_DEFAULT`, `LH_POPCONFIRM_TYPE_DEFAULT`

기존의 `LH_SIZE_DEFAULT` / `LH_LANGUAGE_DEFAULT`와 일관성을 유지합니다.

## 예외 등록

관례적으로 굳어져 접두사를 강제하지 않습니다. **변경 전에 먼저 여기에 이유를 등록하세요**:

| 심볼 | 이유 |
| --- | --- |
| 언어 팩 내보내기 `zhCN` / `enUS` | 표준 locale 명명이며, `@lh-ui/vue3` / `@lh-ui/vue2` / uniapp이 공개 API로 재내보내기하여 개명의 파괴 범위가 너무 큼 |
| 테마 프리셋 이름의 **문자열 값**(`name: 'cerblue'` 등) | 사용자가 ConfigProvider의 `theme`에 작성하는 설정값이며, 바꾸면 모든 하위 사용자 설정이 망가짐; 대응하는 **TS 식별자**에는 여전히 접두사가 붙음(`LhCerblue`) |
| 서드파티 의존성의 내보내기 심볼(예: `deepMerge` 외부에서 도입한 유틸리티) | 강제하지 않음 |

## 0.4.0의 개명

0.4.0 이전에 이 저장소는 패밀리 접두사 규칙을 따르지 않았고, 이번에 자신 측을 보완했습니다. 전부 식별자 수준의 기계적 치환이며,
매핑 표는 [0.4.0 마이그레이션 가이드](/ko/guide/migration-04)를 참고하세요.
