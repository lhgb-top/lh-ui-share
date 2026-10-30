---
title: transition-mixins —— кросс-платформенные переходные классы
description: 'Три mixin-а lh-enter-both / lh-leave-both / lh-transition-ends собирают различия переходных классов Vue2 и Vue3/React'
---

Файл `styles/theme/common/transition.scss` — **единый источник** переходных классов для всех платформ. Он решает реальную боль:

Переходные классы во Vue2 — `<name>-enter` / `<name>-leave` (**начальное состояние** входа / выхода), а в Vue3 и React они стали `<name>-enter-from` / `<name>-leave-from`. На обеих платформах смысл один и тот же («начальное состояние входа» / «начальное состояние выхода»), различаются только имена. Раньше 16 компонентов писали двойные селекторы вручную в каждом файле, и правка в одном месте приводила к пропуску в другом.

## Три mixin-а

| Mixin | Параметры | Создаёт классы | Назначение |
| --- | --- | --- | --- |
| `lh-enter-both` | `$selector` (обязательный), `$child` (необязательный) | `#{$selector}-enter`, `#{$selector}-enter-from` | Двойная запись начального состояния входа |
| `lh-leave-both` | `$selector`, `$child`? | `#{$selector}-leave`, `#{$selector}-leave-from` | Двойная запись начального состояния выхода |
| `lh-transition-ends` | `$selector`, `$child`? | `#{$selector}-enter`, `#{$selector}-enter-from`, `#{$selector}-leave-to` | Переходные состояния начала и конца (двойная запись начала входа + одинаково называемое на обеих платформах конечное состояние выхода) |

Все три принимают блок стилей через `@content`.

### Параметр `$child`

Если переходное состояние нужно навесить на **дочерний узел**, передаётся второй параметр — созданные селекторы получают суффикс ` #{$child}`:

```scss
// Без $child: состояние навешивается на сам селектор
@include lh-enter-both('.lh-backtop-fade') { ... }
// → .lh-backtop-fade-enter, .lh-backtop-fade-enter-from { ... }

// С $child: состояние навешивается на внутреннюю панель
@include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') { ... }
// → .lh-drawer-fade-enter .lh-drawer__panel--right,
//   .lh-drawer-fade-enter-from .lh-drawer__panel--right { ... }
```

## Почему именно эти три

- `-enter-to` / `-leave-to` **на обеих платформах называются одинаково** — двойная запись не нужна.
- Двойная запись нужна только **парным начальным состояниям**: `-enter` / `-enter-from` и `-leave` / `-leave-from`.
- `lh-transition-ends` покрывает частый случай «начальная точка входа и конечная точка выхода совпадают» (затухание: прозрачность 0 → 1 → 0) — один mixin одновременно даёт двойную запись начального состояния входа и конечное состояние выхода.

## Примеры использования

### Обычный переход (затухание backtop)

```scss
.lh-backtop-fade {
  @include lh-transition-ends('.lh-backtop-fade') {
    opacity: 0;
  }
}
```

Результат компиляции:

```scss
.lh-backtop-fade-enter,
.lh-backtop-fade-enter-from,
.lh-backtop-fade-leave-to {
  opacity: 0;
}
```

### Только начальное состояние входа (затухание dialog, конечное состояние не нужно)

```scss
.lh-dialog-fade {
  @include lh-enter-both('.lh-dialog-fade') {
    opacity: 0;
    transform: scale(0.9);
  }
}
```

### Состояние на внутренней панели (выезд drawer)

```scss
.lh-drawer-fade {
  @include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') {
    transform: translateX(100%);
  }
}
```

Vue3 в `<transition name="lh-drawer-fade">` добавляет класс `lh-drawer-fade-enter-from` на **корневой элемент** во время фазы enter; селектор по потомку находит панель, и смещается панель — сам корневой элемент остаётся неподвижным, что избегает влияния transform корневого узла teleport на позиционирование.

## Как использовать в компонентах

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

Слой UI (Vue3):

```vue
<transition name="lh-drawer-fade">
  <div v-if="visible" class="lh-drawer">...</div>
</transition>
```

Слой UI (Vue2):

```vue
<transition name="lh-drawer-fade">
  <div v-show="visible" class="lh-drawer">...</div>
</transition>
```

**На обеих платформах используется одно и то же имя `name`**, а двойные селекторы, сгенерированные mixin-ами, каждый раз попадают по классам своей платформы. Это и есть воплощение принципа «инъекция распределена, содержимое — в едином источнике» применительно к переходным классам.

## Примечания

- **В компонентных стилях повторно писать двойные переходные классы вручную запрещено** — только `@include` ([красная линия 2](/ru/development/contribution#шесть-красных-линий)). Пункт 5 проверки `verify:styles` (единый источник переходных классов) сканирует буквальные записи `-enter-from` / `-leave-from`, написанные вручную.
- **Путь `@use`**: `@use 'theme/common/transition' as *;` (относительный путь в компонентных scss или bare specifier на этапе сборки — определяется [стратегией инъекции](/ru/guide/injection)).
- **Сценарий React**: версия React использует headless-переходы (className, управляемый состоянием); сгенерированные mixin-ом классы `-enter-from` точно так же подходят.
- **Суффикс `$child` — это селектор по потомку**: он не склеивается через `&`; созданный селектор имеет вид `.parent-enter .child` и рассчитывает на то, что корневой элемент несёт переходный класс.

## Связанные документы

- [Стратегии инъекции стилей](/ru/guide/injection) — различия стилевых артефактов двух платформ
- [Тёмная тема](/ru/theme/dark-mode) — токены: runtime против этапа компиляции
- [Источник стилей](/ru/reference/styles) — каталог `styles/` и соглашения BEM
