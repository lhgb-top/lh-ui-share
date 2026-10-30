---
title: Список команд
description: 'Полная таблица pnpm build / build:styles / build:dts / test / lint / typecheck / verify:* / changeset / release'
---

Все задачи разработки открыты через scripts в корневом `package.json`; пакетный менеджер зафиксирован на `pnpm`.

## Сборка

| Задача | Команда | Артефакт / назначение |
| --- | --- | --- |
| Сборка | `pnpm build` | `es/` + `lib/` (зеркальная структура preserveModules) + стили + dts + `sync:exports` |
| Артефакты стилей | `pnpm build:styles` | `dist/theme/` (css светлой / тёмной темы) + `dist/styles/` (полная агрегация) |
| dts | `pnpm build:dts` | декларации типов, которые `tsc` выдаёт прямо из зеркальной структуры |

`pnpm build` — полная цепочка, она уже включает `build:styles` и `build:dts`. **Внимание**: `sync:exports` **перезаписывает поле exports в `package.json`** — после изменения структуры каталогов исходников обязательно нужно один раз выполнить полную сборку, иначе после `pnpm up` на стороне downstream возникнет MODULE_NOT_FOUND.

## Тесты и качество

| Задача | Команда | Назначение |
| --- | --- | --- |
| Unit-тесты | `pnpm test` | vitest, `tests/unit/` (**единственная копия unit-тестов core**, результат разделяют три библиотеки) |
| Lint | `pnpm lint` | eslint, проверяет только `src` / `tests` / `scripts` / `vite.config.ts` / `vitest.config.ts` |
| Типы | `pnpm typecheck` | tsc, include охватывает только `src/**/*` |

## Проверки

| Задача | Команда | Назначение |
| --- | --- | --- |
| Проверка dts | `pnpm verify:dts` | согласованность артефакта dts с типами в исходниках |
| Проверка scss | `pnpm verify:styles` | шесть пунктов (см. ниже) |
| Контрастность темы | `pnpm verify:theme` | гейт AA 4.5:1, читает артефакты `es/` (**требуется предварительный `pnpm build`**) |
| Согласованность версий | `pnpm verify:versions` | диапазоны зависимостей UI-библиотек покрывают текущую версию share |

### Шесть пунктов verify:styles

1. **Палитра EP** —— цветовые значения соответствуют цветовой шкале / семантике
2. **var fallback** —— у `var(--lh-*)` в компонентах обязательно должно быть резервное значение
3. **@use токены** —— scss компонентов должен ссылаться на токены через `@use`, без hex-литералов
4. **Согласованность агрегации** —— `styles/index.scss` совпадает с результатом сканирования каталога компонентов (защита от пропущенной агрегации)
5. **Единый источник transition-классов** —— запрещено писать `-enter-from` / `-leave-from` напрямую; используется только [transition mixin](/ru/reference/transition-mixins)
6. **Доступность в тёмной теме** —— токены, зафиксированные в светлой теме, имеют переопределения в `var-dark.scss` (подробнее см. [тёмный режим](/ru/theme/dark-mode))

## Релизы

| Задача | Команда | Назначение |
| --- | --- | --- |
| Записать изменения | `pnpm changeset` | интерактивно генерирует `.changeset/*.md` |
| Потребить changeset | `pnpm changeset:version` | меняет номер версии, пишет CHANGELOG, удаляет changeset'ы, ожидающие релиза |
| Опубликовать | `pnpm release` | `changeset publish`: сначала `prepublishOnly` (build + verify:dts + verify:styles), затем публикация в npm и создание локального тега |
| Отправить и заархивировать | `pnpm release:push` | отправляет master + текущий тег в GitHub, запускает автоматическое архивирование |

Полный процесс релиза см. в [процессе выпуска релиза](/ru/development/release).

## Сайт документации

| Задача | Команда | Назначение |
| --- | --- | --- |
| Генерация данных | `pnpm docs:data` | `scripts/gen-docs-data.mjs` разбирает токены / иконки / class-имена → `docs/src/data/*.json` |
| Локальная разработка | `pnpm docs:dev` | dev-сервер Astro (`http://localhost:5180/lhui/share/`) |
| Сборка | `pnpm docs:build` | производственная сборка в `docs/dist/` |
| Предпросмотр | `pnpm docs:preview` | предпросмотр собранных артефактов |

**Внимание**: `pnpm docs:data` идемпотентен и снабжён assertions на количество (светлая 185 / тёмная 118 / SCSS 183 / иконки 37 / class-имена 58 шт.); если число распознанных элементов не сходится — сразу возникает ошибка.

## Типичные рабочие процессы

### Изменение компонента core

```bash
pnpm test                                    # unit-тесты (сначала пишем тесты)
pnpm lint && pnpm typecheck                  # качество
pnpm build                                   # полная сборка (включая sync:exports)
pnpm verify:dts && pnpm verify:styles        # проверка артефактов и стилей
pnpm changeset                               # записать изменения
git add -A && git commit                     # коммит (затем попадает в master)
```

### Изменение стилей

```bash
# Правится только styles/, js-часть build запускать не нужно
pnpm verify:styles                           # шесть проверок
pnpm build:styles                            # генерация dist-артефактов
pnpm docs:data                               # обновление данных таблицы токенов (нужно только если токены изменились)
```

### Добавление нового компонента

```bash
# 1. Трёхэлементный набор
#    src/core/<name>/{logic,types,index}.ts
#    tests/unit/core/<name>.spec.ts
#    styles/<name>/index.scss
# 2. Добавить экспорт в src/core/index.ts
# 3. Проверки
pnpm test && pnpm lint && pnpm typecheck
pnpm build                                   # sync:exports генерирует новый ключ exports
pnpm verify:dts && pnpm verify:styles
# 4. changeset (minor: добавление компонента)
pnpm changeset
```

**Ключевое**: если `sync:exports` не выполнен, на стороне npm не будет соответствующего ключа exports — перед релизом обязательно проходите полный `pnpm build`. После добавления `styles/<name>/index.scss` сценарии сборки на обоих концах подхватят его автоматически (каждый сканирует свой каталог компонентов), но в share **обязательно** должен быть соответствующий scss, иначе у компонента не окажется стилевого артефакта на одном из концов (молчаливый пропуск).

## Что выполняет CI

`.github/workflows/ci.yml` при каждом PR / push в master выполняет: install → lint → typecheck → test → build → verify:dts → verify:styles (+ `docs:build`, начиная с партии E).

**Что не выполняет**: `verify:theme` (гейт контрастности, его держат локально вручную) и `verify:versions` (согласованность версий, обрабатывается downstream после релиза).

## Зависимости и инструментарий

- Пакетный менеджер: `pnpm` (lockfile обязательно фиксируется в репозитории)
- Сборка: `vite` + `rollup` (preserveModules)
- Типы: `tsc` (`tsconfig.build.json` напрямую выдаёт dts из зеркальной структуры)
- Тесты: `vitest`
- Стили: `sass` (`api: 'modern'`)
- changeset: `@changesets/cli`
- Сайт документации: `astro` + `@astrojs/starlight`

## Связанные документы

- [Система проверок](/ru/development/verification) —— что именно проверяет каждая из шести проверок
- [Сценарии сборки](/ru/development/scripts) —— `build-styles.mjs` / `gen-docs-data.mjs` и др.
- [Процесс выпуска релиза](/ru/development/release) —— релиз из шести шагов
- [Руководство по участию](/ru/development/contribution) —— красные линии и чек-лист перед PR
