---
title: Scripts de build y herramientas
description: 'Las responsabilidades de los 13 scripts mjs de scripts/: build-styles / sync-exports / verify-* / gen-docs-data / push-release'
---

`scripts/` es la capa motor del build y la verificación. La mayoría de los comandos de `package.json` son
envoltorios finos sobre estos scripts; ejecutar el script directamente permite añadir parámetros para depurar.

## Resumen de los scripts

| Script | Comando | Responsabilidad |
| --- | --- | --- |
| `build-styles.mjs` | `pnpm build:styles` | Compila el scss de share → `dist/theme/` + `dist/styles/` |
| `sync-exports.mjs` | `pnpm sync:exports` (incluido en `pnpm build`) | Genera el exports de `package.json` a partir de la estructura de directorios del código fuente |
| `verify-dts.mjs` | `pnpm verify:dts` | Los dts de los artefactos coinciden con los tipos del código fuente |
| `verify-styles.mjs` | `pnpm verify:styles` | Seis verificaciones de scss (véase [Sistema de verificación](/es/development/verification)) |
| `verify-theme-contrast.mjs` | `pnpm verify:theme` | Gate de contraste AA 4.5:1 del tema |
| `check-version-sync.mjs` | `pnpm verify:versions` | El rango de dependencias de cada biblioteca UI cubre la versión actual de share |
| `gen-docs-data.mjs` | `pnpm docs:data` | Parsea tokens / iconos / clases → `docs/src/data/*.json` |
| `push-release.mjs` | `pnpm release:push` | Empuja master + tag a GitHub y desencadena el archivo del release |
| `release-notes.mjs` | — | Genera las notas de la versión |
| `extract-from-plus.mjs` | `pnpm extract` | **Script de un solo uso**: extracción de la capa compartida del repositorio plus (histórico) |
| `normalize-styles.mjs` | — | Normalización de estilos (histórico, de un solo uso) |
| `patch-var-fallbacks.mjs` | — | Añade en lote los valores de respaldo de `var()` (histórico, de un solo uso) |

## sync-exports.mjs —— el generador de las claves exports

**Este es el script que más fácilmente da problemas**.

El `package.json` de `@lh-ui/share` tiene 77 claves exports (subrutas del tipo `./core/button/*`), todas
generadas por este script **escaneando** la estructura de directorios de `src/` y `styles/`.

**Flujo**: los artefactos de `vite build` caen a disco → `sync:exports` escanea la estructura del directorio
`es/` → reescribe los campos `exports` / `files` de `package.json`.

**Por qué es importante**:

- Si se añade `src/core/foo/bar.ts`, en dev (que va por el alias del código fuente) está disponible de inmediato,
  pero **en el lado npm no existe la clave exports correspondiente** — el `pnpm up` de quien depende dará
  MODULE_NOT_FOUND.
- **Antes de publicar hay que ejecutar sí o sí el `pnpm build` completo** (que incluye sync:exports), no basta
  con ejecutar `build:dts`.

**Ten en cuenta que modifica `package.json`**: al terminar, `git diff` mostrará cambios en exports; es lo normal
y hay que entregarlos.

## build-styles.mjs —— los artefactos de estilos

Compila el código fuente SCSS de `styles/` a css:

```
dist/
├── theme/
│   ├── index.css          # tokens de tema (claro)
│   └── index-dark.css     # sobrescritura oscura
└── styles/
    └── index.css          # agregado completo (tokens + todos los componentes)
```

**También genera el archivo de agregado completo `styles/index.scss`** (escaneando `styles/*/index.scss`); la
verificación 4 de `verify:styles` comprueba su consistencia — **no lo edites a mano**.

Cada biblioteca UI tiene su propio `build-styles.mjs` (la versión de plus escanea `packages/components`, la de
vue2 escanea `src/components`); los componentes sin fuente de estilos en share se **saltan silenciosamente** —
por eso share tiene que tener el scss correspondiente, si no ese componente se queda sin artefacto de estilos en
alguna de las plataformas.

## gen-docs-data.mjs —— generación de datos de la documentación

```bash
pnpm docs:data
```

Parsea cuatro fuentes → `docs/src/data/*.json`:

| Salida | Origen | Contenido |
| --- | --- | --- |
| `tokens.json` | `var.scss` + `var-dark.scss` + `variables.scss` | 185 tokens claros + 118 oscuros + 183 variables SCSS, agrupados por dominio semántico |
| `icons.json` | `src/.../icon/svgs.ts` | 37 iconos integrados |
| `classes.json` | `styles/*/index.scss` | 58 listados de clases BEM de componentes |

**Lleva aserciones de cantidad**: si el conteo parseado no coincide con lo esperado (185 / 118 / 183 / 37 / 58)
se lanza un error directamente. Es la primera línea de defensa frente a «un token borrado por error / un
componente borrado por error».

**Idempotente**: se puede ejecutar libremente; solo modifica los json cuando cambia el contenido. Tras cambiar un
token o un nombre de clase, ejecútalo una vez para refrescar los datos de la documentación.

## push-release.mjs —— el empuje del release

```bash
pnpm release:push
```

Se ejecuta después de `pnpm release` (publicación npm + creación local del tag):

1. Empuja master a `github-lhgb`
2. Empuja el tag de esta versión a `github-lhgb`
3. Dispara `.github/workflows/release.yml`: descarga el tarball ya publicado de npm → crea el GitHub Release
   (adjuntando `lh-ui-share-<version>.tgz`) → empuja el tag a Gitee y llama a la API de Gitee para crear la versión

**Solo se empuja a GitHub; no empujes el tag a Gitee a mano** — los tags / releases de Gitee los gestiona
uniformemente release.yml; la doble escritura entraría en conflicto.

## verify-theme-contrast.mjs —— el gate de contraste

Lee los artefactos de `es/` (por eso **hay que ejecutar antes `pnpm build``**), y utiliza los
`getRelativeLuminance` / `getContrastRatio` exportados por `src/theme/themes/index.ts` para calcular el contraste
WCAG de cada pareja «texto / fondo»; por debajo de 4.5:1, falla.

Para depurar una sola paleta se pueden llamar directamente esas dos funciones en node, sin necesidad de ejecutar
la verificación completa.

## Scripts históricos de un solo uso

| Script | Descripción |
| --- | --- |
| `extract-from-plus.mjs` | En la creación del repositorio share extrajo la capa compartida de lh-ui-plus. **Se conserva como constancia, ya no se ejecuta** — share ya es la única fuente (línea roja 2). |
| `normalize-styles.mjs` | Normalización temprana de estilos (unificación de la forma de referenciar los tokens). Misión cumplida. |
| `patch-var-fallbacks.mjs` | Añadía en lote valores de respaldo a `var(--lh-*)`. Es la herramienta de migración anterior al punto 2 de verify:styles (var fallback) — **el código nuevo debe escribir el fallback a mano, sin contar con este script como red de seguridad**. |

## El sitio docs no es un artefacto npm

El campo `files` de `package.json`, `files: ["es", "lib", "dist", "styles"]`, **no incluye `docs/`**. El sitio de
documentación se construye con `pnpm docs:build` en `docs/dist/` y se despliega a mano en el nginx de la familia
(el contrato está en `lh-ui/docs/部署/nginx-lhui.conf.md`, otro repositorio). Véase [Flujo de publicación](/es/development/release).

## Documentos relacionados

- [Lista de comandos](/es/development/commands) —— el comando pnpm correspondiente a cada script
- [Sistema de verificación](/es/development/verification) —— la lógica de comprobación de cada script verify
- [Flujo de publicación](/es/development/release) —— push-release y el archivo CI
- [Entradas del paquete y subrutas](/es/guide/exports) —— las 77 claves que genera sync-exports
