---
title: Patrones de estilo chino
description: 'Seis patrones SVG en línea (hojas de sauce, nubes, ondas de agua, copos de nieve, flores de ciruelo, hojas de bambú) y el mixin apply-pattern'
---

El estilo chino no es un adorno de lh-ui, es una de sus propuestas de diseño. `styles/theme/common/patterns.scss`
ofrece seis motivos tradicionales como capa de fondo opcional que se inyecta.

## Los seis patrones

| Patrón | Variable CSS | Descripción |
| --- | --- | --- |
| 柳叶纹 (motivo de hojas de sauce) | `--lh-pattern-willow` | Hojas de sauce largas y finas, espaciadas con ritmo, que se mecen al viento |
| 云纹 (motivo de nubes) | `--lh-pattern-cloud` | Nubes auspiciosas que se despliegan y serpentean |
| 水波纹 (motivo de ondas de agua) | `--lh-pattern-water` | Ondulaciones leves, capa sobre capa |
| 雪花纹 (motivo de copos de nieve) | `--lh-pattern-snow` | Copos hexagonales con ramificaciones finas |
| 梅花纹 (motivo de flores de ciruelo) | `--lh-pattern-plum` | Cinco pétalos desplegados, con el corazón de la flor bien definido |
| 竹叶纹 (motivo de hojas de bambú) | `--lh-pattern-bamboo` | Hojas de bambú lanceoladas, con la nervadura central nítida y dispuestas con gracia |

Todos van **en línea** como `data:image/svg+xml` (sin recursos externos, sin dependencias de red ni problemas de
CORS) y llevan `!default`, de modo que el usuario los puede sobrescribir. Además existe `--lh-pattern-none: none`
(sin patrón, de forma explícita).

## Activar los patrones

Los patrones **no están activados por defecto** (`--lh-bg-pattern: none`). Tres formas de activarlos:

### 1. Escribirlos directamente en un componente / página

```scss
.my-card {
  --lh-bg-pattern: var(--lh-pattern-plum);
}
```

### 2. Los themeVars del ConfigProvider

```vue
<lh-config-provider :theme-vars="{ 'bg-pattern': 'var(--lh-pattern-plum)' }">
  <App />
</lh-config-provider>
```

La abreviatura `'bg-pattern'` se completa automáticamente como `--lh-bg-pattern`.

### 3. La prop pattern + lista blanca

```vue
<lh-config-provider
  pattern="plum"
  :pattern-components="['card', 'dialog', 'drawer']"
>
  <App />
</lh-config-provider>
```

Los patrones afectan al fondo, y no a todos los componentes les sientan bien (imprimir flores de ciruelo sobre
el fondo de una tabla quedaría muy recargado). La lista blanca de `patternComponents` controla a qué componentes
se les aplica. Véase [Personalización en tiempo de ejecución](/es/theme/customization#tres-patterncomponents--la-lista-blanca-de-patrones).

## Los tokens de control

```scss
:root {
  --lh-bg-pattern: none;                                     // por defecto, desactivado
  --lh-bg-pattern-repeat: repeat;                            // forma de alicatado
  --lh-bg-pattern-size: 40px;                                // tamaño de la celda (40px por defecto, para que encaje con la altura del botón y el motivo no quede cortado)
  --lh-bg-pattern-opacity: 0.15;                             // opacidad
  --lh-bg-pattern-color: var(--lh-decoration-color, rgba(184, 134, 11, 0.12));  // color
  --lh-bg-pattern-blend: soft-light;                         // modo de mezcla
}
```

Todas llevan `!default` y son sobrescribibles. Los dos diales más utilizados:

- **`--lh-bg-pattern-size`**: 40px es la medida para que «dentro de la altura del botón quepa un motivo
  completo»; en fondos de bloques grandes se puede subir a 80px+ para que el motivo respire.
- **`--lh-bg-pattern-opacity`**: 0.15 es el valor por defecto de «presente pero discreto»; si se quiere una
  atmósfera de estilo chino más marcada, se puede subir hasta 0.25.

## El mixin apply-pattern

```scss
// styles/theme/common/patterns.scss
@mixin apply-pattern {
  background-image: var(--lh-bg-pattern);              // /* no-fallback */
  background-repeat: var(--lh-bg-pattern-repeat);      // /* no-fallback */
  background-size: var(--lh-bg-pattern-size);          // /* no-fallback */
  background-blend-mode: var(--lh-bg-pattern-blend, normal);  // con fallback
  @content;
}
```

Dentro de un componente, un `@include` le da la capacidad del fondo con patrón:

```scss
@use 'theme/common/patterns' as *;

.lh-card--patterned {
  @include apply-pattern;
}
```

**Por qué los tres primeros no llevan fallback**: los patrones están desactivados por defecto y esos tres tokens
los pasa el usuario / el ConfigProvider; el valor por defecto es «sin patrón» (la caída de `background-image:
none` la proporciona el valor por defecto del propio token); codificar un fallback rígido impediría distinguir
entre «patrón no configurado» y «patrón cerrado de forma explícita».

## Los patrones y el modo oscuro

El `--lh-bg-pattern-color` de los patrones referencia por defecto a `--lh-decoration-color` (el color
decorativo), que en `var-dark.scss` tiene su sobrescritura oscura — de modo que el color del patrón se ajusta
automáticamente al modo oscuro.

Si personalizas el color del patrón, acuérdate de ajustarlo también para el modo oscuro:

```scss
[data-theme='dark'],
.dark {
  --lh-bg-pattern-color: rgba(255, 255, 255, 0.08);
}
```

## Notas

- **El cierre por defecto es deliberado**: el patrón es atmósfera, no información; tenerlo activado por defecto
  contaminaría la interfaz de todos los usuarios. La aplicación que quiera un patrón global lo activa ella misma
  en el ConfigProvider.
- **El tamaño del SVG en línea**: los seis motivos son rutas simplificadas de unos pocos cientos de bytes cada
  una; al insertarlas en línea en el CSS no se generan peticiones extra.
- **La sobrescritura de `!default`**: para poner tus propios motivos, sobrescribe en el proyecto con
  `--lh-pattern-plum: url('data:image/svg+xml,...')`, o define directamente `--lh-bg-pattern`.
- **Escenario de impresión**: los patrones pueden no aparecer al imprimir (el tratamiento que hacen los
  navegadores del `background-image` en impresión); la capa de contenido no debe depender de los patrones para
  transmitir información.

## Documentos relacionados

- [Resumen del sistema de temas](/es/theme/overview)
- [Personalización en tiempo de ejecución](/es/theme/customization)
- [Tokens de diseño](/es/theme/tokens)
- [Fuente de estilos](/es/reference/styles)
