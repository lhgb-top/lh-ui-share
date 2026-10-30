---
title: Personalización en tiempo de ejecución
description: 'themeVars abreviado con prefijo, componentTheme por componente, patternComponents lista blanca de patrones'
---

La personalización en tiempo de ejecución es la capacidad central del sistema de temas de lh-ui: **sin
recompilar los estilos**, cambia en tiempo de ejecución el aspecto de los componentes. Tres API, una por capa.

## Una, themeVars —— la sobrescritura global de tokens

El ConfigProvider recibe `themeVars`, con claves **abreviadas**:

```vue
<lh-config-provider
  :theme-vars="{
    'primary-color': '#1677ff',
    'border-radius-base': '8px',
  }"
>
  <App />
</lh-config-provider>
```

### La abreviatura recibe el prefijo

`'primary-color'` se completa automáticamente como `--lh-primary-color`. La completación la hace
[toCssVarName](/es/reference/utils#el-trío-de-cssvars) y es **idempotente** (las claves que ya llevan el prefijo
se devuelven tal cual, sin convertirse en `--lh---lh-...`).

También se puede escribir el nombre completo directamente:

```ts
{ '--lh-primary-color': '#1677ff' }   // equivalente
```

La implementación de bajo nivel es `cssVars(themeVars)`, que convierte las parejas clave-valor en un objeto de
variables CSS que se puede vincular directamente a `:style`.

### El alcance es un subárbol del DOM

Las variables CSS cascandan de forma natural: el ConfigProvider las inyecta en el elemento contenedor y **solo
los componentes descendientes consumen los nuevos valores**. Esto permite cambiar la piel de una zona:

```vue
<lh-config-provider :theme-vars="brandVars">
  <Header />
</lh-config-provider>

<lh-config-provider :theme-vars="neutralVars">
  <Content />
</lh-config-provider>
```

### Lo que exporta el sitio docs es exactamente lo mismo

El texto `:root { --lh-*: ... }` que exporta la página de personalización de tema de docs y los `themeVars` son
**la misma cosa** volcada a un archivo — se puede pegar directamente en la entrada del proyecto:

```css
/* Entrada del proyecto */
:root {
  --lh-primary-color: #2B4C7C;
  --lh-primary-color-hover: #3D649E;
  /* ... */
}
```

## Dos, componentTheme —— la sobrescritura por componente

`themeVars` es global; a veces solo quieres cambiar los tokens de un componente (por ejemplo, el radio de todos
los botones, pero manteniendo el de los demás componentes).

```vue
<lh-config-provider
  :component-theme="{
    button: { 'border-radius': '20px' },
    input: { 'control-height-medium': '40px' },
  }"
>
  <App />
</lh-config-provider>
```

La clave es el nombre del componente (el nombre del directorio bajo `styles/`) y el valor es el `themeVars` del
alcance de ese componente. Al inyectar, las variables llevan el prefijo de alcance del componente y solo afectan
al componente indicado. El nombre de la clave debe coincidir con el nombre del token
(`control-height-medium` → `--lh-control-height-medium`) — la escala por defecto de `input` es medium, y un
`control-height` sin sufijo de escala no lo consume ningún componente.

**Nota**: los tokens a nivel de componente dependen de que el SCSS de ese componente consuma los tokens
correspondientes con `var(--lh-<name>-*)` — no todos los componentes tienen todos sus puntos de estilo
convertidos a tokens; lo que se puede cambiar se rige por el comportamiento de ese componente en la tabla de
[Tokens de diseño](/es/theme/tokens).

## Tres, patternComponents —— la lista blanca de patrones

Los patrones chinos (véase [Patrones de estilo chino](/es/theme/patterns)) **no están activados por defecto**. Al
activarlos afectan al fondo, y no a todos los componentes les sienta bien (imprimir flores de ciruelo sobre el
fondo de una tabla quedaría muy recargado).

`patternComponents` controla qué componentes reciben el patrón:

```vue
<lh-config-provider
  :pattern-components="['card', 'dialog', 'drawer']"
  pattern="plum"
>
  <App />
</lh-config-provider>
```

Solo los componentes de la lista blanca llevan el patrón. Los nombres concretos de las props se rigen por la
documentación del ConfigProvider de cada biblioteca UI.

## Cuatro, la superposición de preset + personalización

Los tres se pueden superponer; la prioridad es «el descendiente sobrescribe al ancestro y lo concreto sobrescribe
a lo global»:

```vue
<lh-config-provider
  theme="cerblue"
  :theme-vars="{ 'border-radius-base': '4px' }"
>
  <!-- primero se aplica el preset 青花瓷 (porcelana azul), luego los themeVars ajustan el radio -->
  <App />
</lh-config-provider>
```

## Cinco, la relación entre el modo oscuro y la personalización

Los `themeVars` personalizados se inyectan en el elemento que sea y solo afectan al claro y al oscuro de ese
subárbol:

```vue
<!-- este bloque fuerza el modo oscuro -->
<div data-theme="dark">
  <lh-button>Botón oscuro</lh-button>
</div>
```

- El interruptor del modo oscuro es el atributo `[data-theme='dark']` o la clase `.dark` (los selectores de
  `var-dark.scss`).
- **No pongas los `themeVars` en el inline style del `documentElement`** — la especificidad del inline style es
  mayor que la del bloque entero de variables oscuras de `var-dark.scss` y distorsiona la paleta del modo oscuro
  (véase [la restricción de inyección del resumen de temas](/es/theme/overview#restricción-de-inyección-solo-se-puede-escribir-style-nunca-inline-style)).

## Seis, lo que no se puede cambiar en tiempo de ejecución

| Lo que quieres cambiar | ¿Se puede? | Alternativa |
| --- | --- | --- |
| Tokens: color principal, color de texto, radio, espaciado, etc. | ✅ `themeVars` | — |
| Los tokens de un solo componente | ✅ `componentTheme` | — |
| Los patrones | ✅ `pattern` + `patternComponents` | — |
| La altura de los componentes (input 37px, etc.) | ⚠️ de forma limitada | Los tokens de altura todavía no están unificados; véanse los [huecos conocidos](/es/theme/tokens#brechas-de-tokens-conocidas) |
| La estructura del DOM / las clases de un componente | ❌ | Usar el [pase a través de pt](/es/core/pt) o los slots |
| La composición de capas de las sombras | ❌ tiempo de compilación | Sobrescribir las variables SCSS `$lh-*` y recompilar |
| La curva de animación | ✅ `--lh-animation-timing-function` | — |

## Ejemplo: configuración completa del tema

```vue
<template>
  <lh-config-provider
    theme="songhua"
    :theme-vars="{
      'border-radius-base': '8px',
      'font-size-base': '15px',
    }"
    :component-theme="{
      button: { 'border-radius': '999px' },
    }"
    :pattern-components="['card', 'dialog']"
  >
    <App />
  </lh-config-provider>
</template>
```

## Notas

- **Las claves abreviadas no deben llevar el prefijo duplicado**: `'primary-color'` y no `'--lh-primary-color'`
  (aunque sea idempotente, usar uniformemente la abreviatura queda más limpio).
- **Fuga de alcance**: los `themeVars` solo afectan a los componentes descendientes; a la inversa, las variables
  del ConfigProvider **ancestro** las sobrescribe el descendiente (regla de cascada CSS).
- **El punto de inyección**: el ConfigProvider inyecta en el elemento contenedor (no en el `documentElement`),
  para garantizar que se puede quitar y que se puede acotar.
- **SSR**: lo que se inyecta son variables CSS normales; la renderización del lado del servidor emite un inline
  style y, tras la hidratación del cliente, coinciden.

## Documentos relacionados

- [Resumen del sistema de temas](/es/theme/overview)
- [Presets de tema](/es/theme/presets)
- [Tokens de diseño](/es/theme/tokens)
- [Patrones de estilo chino](/es/theme/patterns)
- [Las utilidades cssVars](/es/reference/utils#el-trío-de-cssvars)
