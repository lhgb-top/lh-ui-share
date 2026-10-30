---
title: Referencia de comandos
description: 'Tabla completa de pnpm build / build:styles / build:dts / test / lint / typecheck / verify:* / changeset / release'
---

Todas las tareas de desarrollo se exponen mediante los scripts del `package.json` raíz; el gestor de paquetes es siempre `pnpm`.

## Construcción

| Tarea | Comando | Producto / Acción |
| --- | --- | --- |
| Construir | `pnpm build` | `es/` + `lib/` (estructura espejo preserveModules) + estilos + dts + `sync:exports` |
| Producto de estilos | `pnpm build:styles` | `dist/theme/` (css de los temas claro y oscuro) + `dist/styles/` (agregado completo) |
| dts | `pnpm build:dts` | Declaraciones de tipos emitidas directamente por el espejo de `tsc` |

`pnpm build` es el flujo de construcción completo y ya incluye `build:styles` y `build:dts`. **Nota**: `sync:exports` **reescribe el campo exports del `package.json`**: tras cambiar la estructura de directorios del código fuente, es obligatorio ejecutar una vez el build completo; de lo contrario, tras un `pnpm up` de los niveles inferiores, aparece un MODULE_NOT_FOUND.

## Pruebas y calidad

| Tarea | Comando | Acción |
| --- | --- | --- |
| Pruebas unitarias | `pnpm test` | vitest, `tests/unit/` (**la copia única de las pruebas de core**, las tres bibliotecas comparten los resultados) |
| Lint | `pnpm lint` | eslint, solo escanea `src` / `tests` / `scripts` / `vite.config.ts` / `vitest.config.ts` |
| Tipos | `pnpm typecheck` | tsc, el include es únicamente `src/**/*` |

## Verificación

| Tarea | Comando | Acción |
| --- | --- | --- |
| Verificación de dts | `pnpm verify:dts` | Verifica que el dts del producto coincide con los tipos del código fuente |
| Verificación de scss | `pnpm verify:styles` | Seis comprobaciones (véase más abajo) |
| Contraste del tema | `pnpm verify:theme` | Gate de AA 4.5:1, lee el producto `es/` (**requiere `pnpm build` antes**) |
| Consistencia de versiones | `pnpm verify:versions` | El rango de dependencias de cada biblioteca de UI cubre la versión actual de share |

### Las seis comprobaciones de verify:styles

1. **Paleta EP**: conformidad de la escala de color / semántica de los valores de color
2. **var fallback**: en los componentes, `var(--lh-*)` debe llevar un valor de respaldo
3. **@use de tokens**: el scss del componente debe importar los tokens mediante `@use`, sin referenciar literales hexadecimales
4. **Consistencia del agregado**: `styles/index.scss` coincide con el resultado del escaneo de los directorios de componentes (evita que falte algo en el agregado)
5. **Fuente única de las clases de transición**: prohibido escribir a mano `-enter-from` / `-leave-from`; todo a través del [transition mixin](/es/reference/transition-mixins)
6. **Accesibilidad del modo oscuro**: los tokens fijados en el tema claro tienen una contrapartida en `var-dark.scss` (véase [Modo oscuro](/es/theme/dark-mode) para más detalle)

## Releases

| Tarea | Comando | Acción |
| --- | --- | --- |
| Escribir los cambios | `pnpm changeset` | Genera de forma interactiva `.changeset/*.md` |
| Consumir el changeset | `pnpm changeset:version` | Cambia el número de versión, escribe el CHANGELOG y borra los changesets pendientes |
| Publicar | `pnpm release` | `changeset publish`: primero `prepublishOnly` (build + verify:dts + verify:styles), luego publica en npm y crea el tag localmente |
| Empujar para el archivo | `pnpm release:push` | Empuja master + el tag de esta vez a GitHub, lo que dispara el archivado automático |

El flujo completo de release está en [Proceso de publicación](/es/development/release).

## El sitio de documentación

| Tarea | Comando | Acción |
| --- | --- | --- |
| Generación de datos | `pnpm docs:data` | `scripts/gen-docs-data.mjs` analiza tokens / iconos / nombres de clase → `docs/src/data/*.json` |
| Desarrollo local | `pnpm docs:dev` | Astro dev server (`http://localhost:5180/lhui/share/`) |
| Construcción | `pnpm docs:build` | Construcción de producción hacia `docs/dist/` |
| Previsualización | `pnpm docs:preview` | Previsualiza el producto de la construcción |

**Nota**: `pnpm docs:data` es idempotente y lleva aserciones de cantidad (claro 185 / oscuro 118 / SCSS 183 / iconos 37 / nombres de clase 58); si los números del análisis no cuadran, lanza un error directamente.

## Flujos de trabajo típicos

### Modificar un componente de core

```bash
pnpm test                                    # Pasar las pruebas unitarias (primero se escriben)
pnpm lint && pnpm typecheck                  # Calidad
pnpm build                                   # Construcción completa (incluye sync:exports)
pnpm verify:dts && pnpm verify:styles        # Verificación del producto y los estilos
pnpm changeset                               # Escribir los cambios
git add -A && git commit                     # Consignar (más tarde se fusiona en master)
```

### Cambiar estilos

```bash
# Solo se cambia styles/; no hace falta ejecutar la parte js del build
pnpm verify:styles                           # Las seis comprobaciones
pnpm build:styles                            # Genera el producto en dist
pnpm docs:data                               # Refrescar los datos de la tabla de tokens (solo si cambiaron)
```

### Añadir un componente nuevo

```bash
# 1. El trío de archivos
#    src/core/<name>/{logic,types,index}.ts
#    tests/unit/core/<name>.spec.ts
#    styles/<name>/index.scss
# 2. Añadir la exportación en src/core/index.ts
# 3. Verificar
pnpm test && pnpm lint && pnpm typecheck
pnpm build                                   # sync:exports genera las nuevas claves de exports
pnpm verify:dts && pnpm verify:styles
# 4. changeset (minor: componente nuevo)
pnpm changeset
```

**Lo clave**: si no se ejecuta `sync:exports`, el lado de npm no tiene la clave de exports correspondiente: antes de un release, ejecuta siempre el `pnpm build` completo. Tras añadir `styles/<name>/index.scss`, los scripts de construcción de ambos extremos lo cubren automáticamente (cada cual escanea su propio directorio de componentes), pero en share **debe** existir el scss correspondiente; de lo contrario, ese componente se queda sin producto de estilos en alguno de los extremos (omisión silenciosa).

## Qué ejecuta la CI

`.github/workflows/ci.yml` ejecuta en cada PR / push a master: install → lint → typecheck → test → build → verify:dts → verify:styles (+ `docs:build` a partir del lote E).

**Lo que no ejecuta**: `verify:theme` (el gate de contraste, custodiado manualmente en local) ni `verify:versions` (la consistencia de versiones, que los niveles inferiores tratan tras el release).

## Dependencias y cadena de herramientas

- Gestor de paquetes: `pnpm` (el lockfile debe consignarse)
- Construcción: `vite` + `rollup` (preserveModules)
- Tipos: `tsc` (`tsconfig.build.json` emite el espejo de dts directamente)
- Pruebas: `vitest`
- Estilos: `sass` (`api: 'modern'`)
- changeset: `@changesets/cli`
- Sitio de documentación: `astro` + `@astrojs/starlight`

## Documentación relacionada

- [Sistema de verificación](/es/development/verification): qué comprueba cada una de las seis verificaciones
- [Scripts de construcción](/es/development/scripts): `build-styles.mjs` / `gen-docs-data.mjs` y demás
- [Proceso de publicación](/es/development/release): los seis pasos del release
- [Guía de contribución](/es/development/contribution): las líneas rojas y la lista de comprobaciones antes de abrir la PR
