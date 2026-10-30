---
title: Estructura del paquete
description: 'Las responsabilidades de los directorios src / styles / tests / scripts, y el criterio de los dos conteos de componentes: 56 y 58'
---

# Estructura del paquete

## El lado del código fuente

```
lh-ui-share/
├── src/
│   ├── core/                  capa de funciones puras de componentes (sin importaciones de framework, gate CI de grep)
│   │   ├── <componente>/      el trío logic.ts / types.ts / index.ts
│   │   └── shared/            núcleo compartido entre componentes (12 módulos, normalizados como <name>/index.ts)
│   ├── theme/                 lado TS del tema: types + 5 presets + primitivas en tiempo de ejecución
│   ├── constants/             constantes LH_* (LH_SIZE_DEFAULT / LH_LANGUAGE_DEFAULT …)
│   ├── locales/               LhLocale (emitter puro) + lang/ diez paquetes de idioma completos
│   ├── types/                 tipos públicos (locale / components)
│   ├── utils/                 utilidades puras (createNamespace / deepMerge …)
│   └── index.ts               entrada de agregado completo
├── styles/                    única fuente de los estilos BEM de componentes
│   ├── <componente>/index.scss      58 conjuntos de estilos de componentes
│   └── theme/
│       ├── common/
│       │   ├── var.scss       tokens claros (:root, 185 variables --lh-*)
│       │   ├── var-dark.scss  sobrescritura oscura ([data-theme='dark'], .dark, 118 entradas)
│       │   ├── variables.scss 183 variables SCSS $lh-* (!default)
│       │   ├── patterns.scss  6 mixins de patrones chinos
│       │   ├── transition.scss tres mixins de clases de transición (recogen las diferencias entre plataformas)
│       │   └── a11y.scss      estilos de apoyo de accesibilidad
│       └── index.scss         agregado del tema
│   └── index.scss             agregado completo (tokens + todos los componentes, generado por script, no editar a mano)
├── tests/unit/                la única copia de las pruebas unitarias de core (compartida por tres bibliotecas, sin copias)
├── scripts/                   scripts de build y de verificación
├── docs/                      este sitio de documentación (Astro Starlight)
└── .changeset/                changesets pendientes de publicación
```

## Responsabilidades de cada directorio

| Directorio | Responsabilidad | Línea roja |
| --- | --- | --- |
| `src/core/<name>/` | Funciones puras del componente: cálculo de clases / máquina de estados / paquete de atributos aria | Prohibido `import 'vue' \| 'react' \| '@dcloudio/*'` |
| `src/core/shared/` | Núcleo compartido entre componentes, reutilizado directamente por cada plataforma | Ídem; ya normalizado como `<name>/index.ts` |
| `styles/` | **Única fuente** de los estilos BEM de componentes | Prohibido copiar los estilos a una biblioteca UI y modificarlos; clases `lh-*`; colores siempre `var(--lh-*, fallback)` |
| `tests/unit/` | **Una sola copia** de las pruebas unitarias de core | Las bibliotecas UI no pueden duplicarla |
| `scripts/` | extract-from-plus (un solo uso histórico) / build-styles / verify-* / release | — |

## Criterio del conteo de componentes: 56 o 58

Ambos números son correctos; simplemente no cuentan la misma cosa:

| Criterio | Número | Origen |
| --- | --- | --- |
| Componentes con funciones puras de core | **56** | Directorios de componentes bajo `src/core/` (sin contar `shared/`) |
| Conjuntos de estilos de componentes | **58** | Directorios de componentes bajo `styles/` (sin contar `theme/`) |

La diferencia son estos tres:

| Nombre | core | styles | Razón |
| --- | --- | --- | --- |
| `layout` | — | ✅ | Contenedor de layout; toda la lógica está en la capa UI (cableado de breakpoints responsivos de row/col) |
| `tree-select` | — | ✅ | El cableado del selector está en la capa del framework; la lógica de datos del árbol reutiliza `core/tree` |
| `config` ↔ `config-provider` | `config` | `config-provider` | La misma cosa con dos nombres de directorio |

## Artefactos de build

`pnpm build` produce cuatro directorios, y `files` solo publica esos cuatro:

| Artefacto | Estructura | Descripción |
| --- | --- | --- |
| `es/` | preserveModules reflejando `src/` | ESM, subrutas archivo a archivo y a demanda |
| `lib/` | Ídem | CJS (condición `require`) |
| `dist/` | `dist/theme/*.css` `dist/styles/index.css` | Artefactos de estilos agregados |
| `styles/` | Se publica tal cual | **Código fuente SCSS**, para que el proyecto lo compile |

Los artefactos mantienen **cero dependencias de framework**: `verify:dts` escanea `es/**/*.d.ts` y falla en
cuanto aparece cualquier importación de un framework.

## Aspecto del artefacto de un componente (ejemplo con button)

```
es/button/
├── index.d.ts        tipos
├── index.js          ESM
├── logic.d.ts
├── logic.js
├── types.d.ts
└── style/
    ├── index.css     estilos del componente compilados (forma de la plataforma plus)
    └── index.scss    código fuente (@use ya reescrito como bare specifier, distribuido con el artefacto)
```

`lib/button/` es isomorfo. Las bibliotecas UI de ambas plataformas vuelven a envolverlo una capa más:
`es/components/<name>/style/index.css` (la plataforma vue2 solo publica css, no scss).
