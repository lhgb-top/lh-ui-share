---
title: Estrategia de inyección de estilos por plataforma
description: 'share solo proporciona el contenido de los estilos; la forma de inyectarlos la elige cada biblioteca UI — razones de diseño de la diferencia entre las dos plataformas'
---

# Estrategia de inyección de estilos por plataforma

**share solo proporciona el contenido de los estilos** (código fuente SCSS + tokens); **la forma de inyectarlos
la elige cada biblioteca UI**. Las dos plataformas siguen estrategias distintas: es una decisión de diseño, no un
defecto. Ninguna de las dos puede, por este motivo, tener una copia local del scss de componentes (línea roja 2).

## Comparación de las dos plataformas

| | lh-ui-plus (Vue3) | lh-ui-vue2 |
| --- | --- | --- |
| Inyección en la entrada de la biblioteca | Completa por side-effect: `src/index.ts` importa componente a componente `@lh-ui/share/styles/<name>`; al importar la biblioteca se obtienen todos los estilos | No inyecta; el usuario importa a demanda `@lh-ui/vue2/theme.css` + `@lh-ui/vue2/style/<name>` |
| Artefactos de estilos | `es\|lib/<name>/style/index.css` + `es/<name>/style/index.scss` (el código fuente scss se distribuye con el artefacto, `@use` reescrito como bare specifier) | `es\|lib/components/<name>/style/index.css` (solo css) |
| Artefactos de tema | `theme/index.css` + `dist/index.css` (tema + completo) | `dist/theme/index.css` (claro) + `dist/theme/index-dark.css` (oscuro) |
| Subrutas a demanda | `./style/*` → `es/*/style/index.scss`; `./style-css/*` → `es/*/style/index.css` | `./style/*` → `es/components/*/style/index.css`; `./theme.css`, `./theme-dark.css` |
| Scripts de build | `lh-ui-plus/scripts/build-styles.mjs` (la lista de componentes se escanea desde `packages/components`) | `lh-ui-vue2/scripts/build-styles.mjs` (se escanea desde `src/components`; los componentes sin fuente de estilos en share se saltan automáticamente) |

## Por qué las dos plataformas no son iguales

- **La plataforma Vue3** se dirige a la mayoría «importa la biblioteca y úsala»: el ecosistema vite es amistoso
  con la inyección de estilos por side-effect, y la inyección completa ahorra al usuario el coste de configurar el
  import a demanda; de todas formas el tree-shaking no funciona con los estilos, así que el import completo es el
  más cómodo.
- **La plataforma Vue2** se dirige a proyectos antiguos y a escenarios sensibles al tamaño: en la era de webpack 4
  la inyección por side-effect es fácil de configurar mal; el import a demanda (dos import) es más controlable y
  además permite al usuario importar solo el tema claro o solo el oscuro.

## Cobertura al añadir un componente nuevo

Al añadir un componente nuevo, **los scripts de build de ambas plataformas lo cubren automáticamente** (cada uno
escaneando su propio directorio de componentes), pero en `styles/` de share tiene que existir el `<name>/index.scss`
correspondiente — de lo contrario ese componente no tendrá artefacto de estilos en alguna de las plataformas
(**salto silencioso**, no da error). Esta es la restricción directa que impone la línea roja de «única fuente de
estilos»: primero crea los estilos en share, luego crea el componente en cada plataforma.

## Clases de transición multiplataforma: tres mixins

Las clases de transición de Vue2 son `-enter` / `-leave`; las de Vue3 / React son `-enter-from` / `-leave-from`
(`-leave-to` tiene el mismo nombre en ambas). Escribir las dos clases a mano termina desincronizándose, así que
siempre se usa `@include`:

```scss
@use '@lh-ui/share/styles/theme/common/transition' as *;

.lh-dialog-fade {
  @include lh-enter-both;          // -enter + -enter-from (Vue3)
  @include lh-leave-both;          // -leave + -leave-from
  @include lh-transition-ends;     // -enter-to + -leave-to (mismo nombre en ambas plataformas)
}
```

Cuando haya que colgar el estado en un **nodo descendiente**, se pasa el segundo parámetro:

```scss
@include lh-transition-ends('.lh-drawer-fade', '.lh-drawer__panel--right');
```

Los estilos de componentes **tienen prohibido volver a escribir a mano las clases de transición por duplicado**.

## Restricción de inyección de los artefactos de personalización de tema

`buildPresetStyleText(vars)` produce texto `<style>` inyectable (bloque `:root` + bloque oscuro).
Al adoptarlo en la capa UI **solo se puede escribir un elemento `<style>`, no un inline style en
`documentElement`**:

> La especificidad del inline style es mayor que la del bloque entero de variables oscuras de `var-dark.scss`,
> lo que distorsiona la paleta del modo oscuro.

Véase [Personalización del tema](/es/theme/customization).
