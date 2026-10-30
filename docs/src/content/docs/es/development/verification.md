---
title: Sistema de verificación
description: 'Qué comprueba cada uno — verify:dts / las seis verificaciones de verify:styles / el gate AA de verify:theme / verify:versions — y cómo leer su salida'
---

La «verificación» de lh-ui no es un trámite: cada una bloquea un tipo de regresión **que de verdad ha ocurrido en
el pasado**. Este documento explica, punto por punto, qué se comprueba y cómo leer la salida cuando falla.

## verify:dts —— consistencia de tipos entre artefactos

```bash
pnpm verify:dts
```

**Qué comprueba**: que los `.d.ts` compilados en `es/` / `lib/` coinciden con las declaraciones de tipos del
código fuente, y que los archivos a los que apuntan las claves exports existen de verdad.

**Fallos típicos**:

- Se ha cambiado un tipo del código fuente pero no se ha vuelto a ejecutar `pnpm build` (los artefactos están
  desfasados)
- `sync:exports` ha generado una clave exports, pero el archivo correspondiente no se ha construido (ruta mal
  compuesta)
- Se ha escrito `import` en lugar de `import type`, y el artefacto lleva encima una copia extra de código en
  tiempo de ejecución

**Cómo arreglarlo**: vuelve a ejecutar `pnpm build` completo y después `pnpm verify:dts`.

## verify:styles —— seis verificaciones

```bash
pnpm verify:styles
```

Script: `scripts/verify-styles.mjs`. Las seis verificaciones se ejecutan en orden; cualquier fallo interrumpe.

### 1. Paleta EP

Control de lista negra: si alguno de los 9 valores de color heredados de EP (Element Plus) (`#409eff`, `#e6a23c`,
`#f56c6c`, `#67c23a`, `#909399`, `#606266`, `#303133`, `#ebeef5`, `#c0c4cc`) aparece en los archivos scss de
`styles/`, la verificación falla. Es la barrera de regresión tras la limpieza D2, para evitar el regreso de los
colores del sistema antiguo — los colores de lh-ui provienen siempre de las definiciones de tokens de
`styles/theme/common/variables.scss`.

### 2. var fallback

Comprueba que cada `var(--lh-*)` del scss de componentes lleva valor de respaldo:

```scss
// ✅ pasa
color: var(--lh-text-primary, rgba(0, 0, 0, 0.88));

// ❌ falla
color: var(--lh-text-primary);
```

**Por qué**: cuando falta un token (el usuario solo usa parte de los estilos, o el token no existe en una versión
antigua), un `var()` sin respaldo se resuelve a un valor no válido y la propiedad se descarta — el texto se vuelve
negro por defecto, el borde desaparece. Llevar respaldo garantiza una «degradación utilizable».

### 3. @use de tokens

Comprueba que el scss de componentes referencia la capa de tokens con `@use`, en lugar de esparcir literales hex:

```scss
// ✅ pasa
@use 'theme/common/var' as *;
.lh-card { background: var(--lh-bg-color, #fff); }

// ❌ falla
.lh-card { background: #ffffff; }
```

**Exención**: el valor de respaldo de un `var()` puede escribirse como hex (sirve para la degradación). El mensaje
de fallo lista el archivo y el número de línea.

### 4. Consistencia del agregado

Comprueba que `styles/index.scss` (el agregado completo) coincide con «la lista de componentes obtenida al
escanear `styles/*/index.scss`**. **`styles/index.scss` lo genera `scripts/build-styles.mjs`; no lo edites a
mano** — si tras añadir un directorio de componente no se vuelve a ejecutar la generación, se queda inconsistente.

### 5. Fuente única de las clases de transición

Comprueba que el scss de componentes no escribe **literalmente** `-enter-from` / `-leave-from` a pelo:

```scss
// ❌ falla: clases de transición escritas a mano por duplicado
.lh-dialog-fade-enter-from { opacity: 0; }

// ✅ pasa: con mixin
@include lh-enter-both('.lh-dialog-fade') { opacity: 0; }
```

**Por qué**: Vue2 usa `-enter` y Vue3/React usan `-enter-from`; escribirlo a mano termina dejando una de las dos
plataformas olvidada (véase [transition-mixins](/es/reference/transition-mixins)). En cierta ocasión 16
componentes tenían cada uno su pareja escrita a mano, y cada arreglo se dejaba alguno.

### 6. Accesibilidad del modo oscuro

Comprueba que los tokens de `var.scss` cuyo valor tiene la forma `#{$lh-foo}` (horneado en tiempo de compilación
a un valor claro) **tienen su sobrescritura correspondiente** en `var-dark.scss`.

**Esta es la verificación más crítica**. Huecos de este tipo hicieron en su momento que el texto de menús /
tablas / timelines, en modo oscuro, siguiera usando los valores claros y quedara **invisible** (texto negro sobre
fondo negro). Véase [La trampa del horneado en tiempo de compilación en Modo oscuro](/es/theme/dark-mode#la-trampa-del-horneado-en-tiempo-de-compilación).

**Nota**: hubo en su día una corrección de un falso positivo — un desajuste del índice de verify:styles reportaba
por error líneas eximidas de `no-fallback` (commit `791ff32`). Si el mensaje de fallo parece ilógico (sigue
dando error en una línea eximida), confirma primero si es este problema conocido.

## verify:theme —— el gate de contraste AA

```bash
pnpm build          # ← hay que ejecutarlo antes: lee los artefactos de es/
pnpm verify:theme
```

Script: `scripts/verify-theme-contrast.mjs`.

**Qué comprueba**: que en los cinco temas integrados (y sus variantes oscuras), todas las parejas
«texto / fondo» tienen un contraste WCAG **≥ 4.5:1** (nivel AA).

**Por qué hay que leer los artefactos de es/**: los vars de los presets de tema solo alcanzan su forma final
después del build (los resultados de la derivación de `buildPresetDarkVars` también están en los artefactos).

**Fallos típicos**:

- Un preset nuevo con un color principal claro al que no se le ha dado `--lh-color-on-primary` (texto blanco
  sobre color principal claro llega solo a 3.x:1)
- El color de texto del estado seleccionado (`--lh-selected-color`) no tiene contraste suficiente sobre el fondo
  del estado hover

**Cómo arreglarlo**: oscurece / aclara los colores implicados hasta que el contraste alcance el nivel.
`getContrastRatio()` y `getRelativeLuminance()` (exportados por `src/theme/themes/index.ts`) se pueden calcular
localmente, sin necesidad de ejecutar el gate completo cada vez.

**CI no ejecuta esta verificación** — necesita un build previo y consume bastante. Es el guardián manual antes
de publicar.

## verify:versions —— consistencia de versiones

```bash
pnpm verify:versions
```

Script: `scripts/check-version-sync.mjs`.

**Qué comprueba**: que el rango de dependencia de `@lh-ui/share` en el `package.json` de lh-ui-plus /
lh-ui-vue2 **cubre la versión actual de share**.

**Estado actual**: pasa mientras share está en `0.3.0`. **Después de publicar 0.4.0 fallará** — porque el rango
de dependencia de las dos bibliotecas UI sigue siendo `^0.3.0`. Es el **comportamiento esperado**: según la
[línea roja 5](/es/development/contribution#las-seis-líneas-rojas) (share se publica primero, las bibliotecas UI
le siguen), tras la publicación hay que ir a cada uno de los dos repositorios hermanos, ejecutar
`pnpm up @lh-ui/share@0.4.0` y hacer la regresión.

## lint y typecheck

| Comando | Alcance del escaneo |
| --- | --- |
| `pnpm lint` | `src` / `tests` / `scripts` / `vite.config.ts` / `vitest.config.ts` |
| `pnpm typecheck` | `src/**/*` (el include de `tsconfig.json`) |

**`docs/` no está dentro del alcance del escaneo** — el sitio de documentación es un proyecto Astro independiente
cuya calidad custodia `pnpm docs:build`. Por la misma razón `styles/` no está dentro del alcance del typecheck
(el SCSS lo gestiona verify:styles).

**El gate de dependencias de framework del lint**: CI hace grep sobre `src/` para comprobar que no aparezca
`import 'vue'` / `import 'react'` / `@dcloudio/*` — es la [línea roja 1](/es/development/contribution#las-seis-líneas-rojas):
core debe ser independiente del framework.

## Pruebas

```bash
pnpm test
```

`tests/unit/` es **la única copia de las pruebas unitarias de core** (línea roja 3): tres bibliotecas comparten
el resultado y las bibliotecas UI no pueden duplicarlo. Probar funciones puras no necesita renderizar
componentes — se construyen literales rect y se afirman las salidas, y las cuatro plataformas comparten el mismo
conjunto de aserciones.

Archivos de prueba clave:

| Archivo | Cobertura |
| --- | --- |
| `theme.spec.ts` | Consistencia de presets (sincronización de doble fuente entre los vars JS y las variables SCSS) |
| `core/*.spec.ts` | La lógica de cada componente core |
| `shared/*.spec.ts` | Algoritmos del núcleo compartido (popper / keyboard / virtual, etc.) |

## Verificación completa

La lista completa antes de un release:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build                    # ten en cuenta que sync:exports modifica package.json
pnpm verify:dts
pnpm verify:styles            # las seis verificaciones
pnpm verify:theme             # necesita build previo
pnpm verify:versions          # tras el release pasa a ser gestión de quien depende
pnpm docs:build               # el sitio de documentación
```

`prepublishOnly` (que `pnpm release` dispara) solo incluye build + verify:dts + verify:styles. Por eso
**test / lint / typecheck / verify:theme hay que ejecutarlos explícitamente a mano**.

## Documentos relacionados

- [Lista de comandos](/es/development/commands)
- [Scripts de build](/es/development/scripts)
- [Flujo de publicación](/es/development/release)
- [Modo oscuro](/es/theme/dark-mode)
- [Fuente de estilos](/es/reference/styles)
