---
title: Introducción al proyecto
description: 'Qué es @lh-ui/share, qué problema resuelve y su lugar en la familia lh-ui'
---

# Introducción al proyecto

**`@lh-ui/share` es la única capa compartida independiente del framework de la familia de componentes lh-ui.**

Extrae a un repositorio separado «la mitad del trabajo de una biblioteca de componentes que no depende del framework»:
cálculo de clases, máquinas de estado, paquetes de atributos de accesibilidad, motor de posicionamiento,
desplazamiento virtual, tokens de tema, textos de internacionalización y fuente de los estilos de componentes.
Las bibliotecas UI de cada plataforma (lh-ui-plus / lh-ui-vue2 / lh-ui-react / lh-ui-uniapp) consumen este paquete
como dependencia npm en su versión publicada; dentro de la familia, el desarrollo local modifica el código fuente
de este repositorio y surte efecto de inmediato en cada biblioteca UI, sin necesidad de compilar ni publicar.

## Por qué hace falta esta capa

En realidad, solo una pequeña parte de la lógica de una biblioteca de componentes depende de verdad de la
reactividad del framework:

- Si una clase debe añadirse o no, es un cálculo puro `(size, disabled) => string`.
- Hacia qué lado debe voltearse un panel desplegable, es un cálculo geométrico.
- Qué filas debe renderizar una lista, es un cálculo de intervalos de índices.
- El texto del botón «Confirmar», es una búsqueda en el paquete de idioma.

Al consolidar todo esto en funciones puras, las cuatro plataformas **no tienen que escribirlo cada una, equivocarse
cada una y arreglarlo cada una**. A la capa del framework le queda una sola tarea: vincular la salida de las
funciones puras a la plantilla y devolver la entrada del usuario a las funciones puras.

## Qué hay en el repositorio

| Capa | Contenido | Conteo |
| --- | --- | --- |
| `src/core/<componente>/` | Funciones puras de componentes (logic.ts / types.ts), sin importaciones de framework | 56 componentes |
| `src/core/shared/` | Núcleo compartido entre componentes (popper / virtual / sx / keyboard / focus-trap …) | 12 módulos |
| `src/theme/` | Lado TS del tema: tipos + 5 presets + primitivas en tiempo de ejecución | — |
| `styles/` | **Única fuente** de los estilos BEM de componentes + tokens de `theme/common/*.scss` | 58 conjuntos de estilos |
| `src/locales/` | Internacionalización (LhLocale es un emisor de eventos puro) + diez paquetes de idioma completos | — |
| `src/constants/` `src/types/` `src/utils/` | Constantes / tipos / utilidades puras (incluye createNamespace) | — |

> **Criterio de conteo**: core son 56 directorios de componentes y styles son 58 conjuntos — `layout` /
> `tree-select` tienen fuente de estilos pero toda su lógica está en la capa UI (contenedores de layout, el cableado
> del framework para el selector de árbol), y `config` se llama `config-provider` dentro del directorio de estilos.
> Véase [Estructura del paquete](/es/guide/structure) para más detalles.

## Principios de diseño

1. **Cero dependencias de framework**: dentro de `src/` está prohibido `import 'vue' | 'react' | '@dcloudio/*'`,
   custodiado por un gate CI de grep. Este paquete usa `external: []` y se empaqueta con cero dependencias.
2. **Fuente única de estilos**: `styles/` es la única fuente de los estilos BEM de los componentes de toda la
   familia; ninguna biblioteca UI puede tener una copia local de scss de componentes. Las diferencias de clases
   de transición entre plataformas se recogen con los tres mixins de `transition.scss`.
3. **Una sola copia de pruebas unitarias**: las pruebas de core solo están en `tests/unit/` de este repositorio;
   las tres bibliotecas comparten este resultado, sin copiarlo.
4. **La reactividad pertenece a la capa UI**: core solo produce datos; las suscripciones y el cableado reactivo
   son cosa de cada biblioteca UI. Por eso LhLocale es un emitter puro: utiliza el autoincremento de `version`
   para que cada plataforma vuelva a renderizar con su propio mecanismo.
5. **Claro y oscuro al mismo nivel**: todos los componentes soportan por defecto los modos claro y oscuro; los
   componentes solo pueden consumir tokens con `var(--lh-*, fallback)`, y la completitud del modo oscuro la
   custodia el punto 7 de `verify:styles`.

## Lo que no es

- **No es una biblioteca UI**: este paquete no renderiza nada, no hay runtime de componentes. Para componentes
  listos para usar, instala las bibliotecas de cada plataforma: `@lh-ui/vue3` / `@lh-ui/vue2`, etc.
- **No depende de ninguna biblioteca UI ni de ningún framework**: es la capa más baja, es dependida y no depende de nadie.
- **No se encarga del despliegue**: la personalización de temas produce texto `<style>` y variables CSS; cómo se
  inyectan en el DOM lo decide el ConfigProvider de cada plataforma.

## Disposición de la familia

```
lh-ui/
├── lh-ui-share/      ← este repositorio: capa compartida independiente del framework (core / theme / styles / locales)
├── lh-ui-plus/       plataforma Vue3 (inyección completa de estilos por side-effect)
├── lh-ui-vue2/       plataforma Vue2 (import a demanda de theme.css + style/<name>)
├── lh-ui-react/      plataforma React
├── lh-ui-uniapp/     plataforma uniapp
├── docs/             sitio de documentación de la familia (otro repositorio)
└── native/           plataformas nativas (android / ios / harmony, applicationId usa top.lhgb.*)
```

El orden de publicación es una restricción estricta: **share se publica primero, las bibliotecas UI le siguen**.
Cambio en share → escribir el changeset → publicar → cada biblioteca hace `pnpm up @lh-ui/share` y la regresión.

## Próximos pasos

- [Primeros pasos](/es/guide/getting-started) —— instala el paquete, importa los estilos, ejecuta la primera función pura
- [Entradas del paquete y subrutas](/es/guide/exports) —— cómo elegir entre las 77 claves de exportación
- [Cómo consume cada plataforma](/es/guide/consumption) —— ejemplos de cableado para Vue3 / Vue2 / React / uniapp
