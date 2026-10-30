---
title: 'transition-mixins —— Clases de transición multiplataforma'
description: 'Los tres mixins lh-enter-both / lh-leave-both / lh-transition-ends recogen las diferencias de clases de transición entre Vue2 y Vue3 / React'
---

`styles/theme/common/transition.scss` es la **fuente única** de las clases de transición multiplataforma. Resuelve
un dolor real:

Las clases de transición de Vue2 son `<name>-enter` / `<name>-leave` (el **estado inicial** de entrada / salida), y
Vue3 y React las cambiaron a `<name>-enter-from` / `<name>-leave-from`. Ambas plataformas comparten la semántica
(«estado inicial de entrada» / «estado inicial de salida»), solo cambian los nombres. Antes, 16 componentes
escribían a mano la pareja de selectores archivo por archivo, y cada arreglo se dejaba alguno.

## Los tres mixins

| Mixin | Parámetros | Clases generadas | Uso |
| --- | --- | --- | --- |
| `lh-enter-both` | `$selector` (obligatorio), `$child` (opcional) | `#{$selector}-enter`, `#{$selector}-enter-from` | Escritura doble del estado inicial de entrada |
| `lh-leave-both` | `$selector`, `$child`? | `#{$selector}-leave`, `#{$selector}-leave-from` | Escritura doble del estado inicial de salida |
| `lh-transition-ends` | `$selector`, `$child`? | `#{$selector}-enter`, `#{$selector}-enter-from`, `#{$selector}-leave-to` | Estados de inicio y fin de la transición (doble escritura del inicio de entrada + el estado final de salida, que tiene el mismo nombre en ambas plataformas) |

Los tres reciben el bloque de estilos mediante `@content`.

### El parámetro `$child`

Cuando el estado de transición hay que colgarlo en un **nodo descendiente**, se pasa el segundo parámetro y el
selector generado lleva el sufijo ` #{$child}`:

```scss
// sin $child: el estado se cuelga del propio selector
@include lh-enter-both('.lh-backtop-fade') { ... }
// → .lh-backtop-fade-enter, .lh-backtop-fade-enter-from { ... }

// con $child: el estado se cuelga del panel interno
@include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') { ... }
// → .lh-drawer-fade-enter .lh-drawer__panel--right,
//   .lh-drawer-fade-enter-from .lh-drawer__panel--right { ... }
```

## Por qué son tres

- `-enter-to` / `-leave-to` **tienen el mismo nombre en ambas plataformas** y no hace falta duplicarlos.
- Lo único que necesita escritura doble son los **estados iniciales emparejados**: `-enter` / `-enter-from` y
  `-leave` / `-leave-from`.
- `lh-transition-ends` cubre la escena habitual de «el inicio de la entrada y el final de la salida comparten
  cuerpo» (fundido encadenado: opacidad 0 → 1 → 0): un solo mixin cubre a la vez la doble escritura del estado
  inicial de entrada y el estado final de salida.

## Ejemplos de uso

### Transición convencional (fundido de backtop)

```scss
.lh-backtop-fade {
  @include lh-transition-ends('.lh-backtop-fade') {
    opacity: 0;
  }
}
```

Resultado de la compilación:

```scss
.lh-backtop-fade-enter,
.lh-backtop-fade-enter-from,
.lh-backtop-fade-leave-to {
  opacity: 0;
}
```

### Solo el estado inicial de entrada (fundido de dialog; el estado final no hace falta)

```scss
.lh-dialog-fade {
  @include lh-enter-both('.lh-dialog-fade') {
    opacity: 0;
    transform: scale(0.9);
  }
}
```

### El estado se cuelga del panel interno (deslizamiento de drawer)

```scss
.lh-drawer-fade {
  @include lh-enter-both('.lh-drawer-fade', '.lh-drawer__panel--right') {
    transform: translateX(100%);
  }
}
```

El `<transition name="lh-drawer-fade">` de Vue3 añade, en la fase enter, `lh-drawer-fade-enter-from` al
**elemento raíz**; el selector descendente alcanza al panel, y el panel es el que se desplaza — el elemento raíz
no se mueve, evitando que el transform del nodo raíz teletransportado afecte al posicionamiento.

## Cómo se usa dentro de un componente

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

Capa UI (Vue3):

```vue
<transition name="lh-drawer-fade">
  <div v-if="visible" class="lh-drawer">...</div>
</transition>
```

Capa UI (Vue2):

```vue
<transition name="lh-drawer-fade">
  <div v-show="visible" class="lh-drawer">...</div>
</transition>
```

**Ambas plataformas usan el mismo `name`**, y los selectores duplicados que genera el mixin dan cada uno en la
plataforma que toca. Esta es la materialización, en las clases de transición, del principio «la inyección está
dispersa, el contenido tiene una sola fuente».

## Notas

- **Los estilos de componente tienen prohibido volver a escribir a mano las clases de transición por duplicado**;
  siempre `@include` ([línea roja 2](/es/development/contribution#las-seis-líneas-rojas)). La verificación 5 de
  `verify:styles` (fuente única de las clases de transición) escanea los literales `-enter-from` / `-leave-from`
  escritos a pelo.
- **La ruta del `@use`**: `@use 'theme/common/transition' as *;` (la ruta relativa de cada scss de componente o
  el bare specifier en tiempo de build los decide la [Estrategia de inyección](/es/guide/injection)).
- **Escenario React**: la versión de React usa transiciones headless (className dirigido por estado), y las clases
  `-enter-from` que genera el mixin también le sirven.
- **El sufijo `$child` es un selector descendiente**: no es una concatenación con `&`; el selector generado es
  `.parent-enter .child`, y depende de que el elemento raíz lleve la clase de transición.

## Documentos relacionados

- [Estrategia de inyección](/es/guide/injection) —— las diferencias de los artefactos de estilos entre las dos plataformas
- [Modo oscuro](/es/theme/dark-mode) —— los tokens en tiempo de ejecución frente a tiempo de compilación
- [Fuente de estilos](/es/reference/styles) —— el directorio `styles/` y las convenciones BEM
