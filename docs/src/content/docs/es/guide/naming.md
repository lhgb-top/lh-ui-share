---
title: Convenciones de naming
description: 'La raíz de dominio inverso top.lhgb, los cuatro niveles de prefijos LH / Lh / lh / lh- y las tres exenciones registradas'
---

# Convenciones de naming

La normativa de naming de toda la familia está unificada y alineada con `docs/project/development-guide.md`
del repositorio plus.

## Raíz de dominio inverso

**`top.lhgb`** (escritura inversa de `www.lhgb.top`) es la raíz de naming de todos los repositorios de la familia lh-ui.

- **Lado JS / npm**: el nombre del paquete mantiene el scope `@lh-ui/*` — los nombres de paquete npm no admiten
  puntos, de modo que `top.lhgb` no se puede usar directamente como nombre de paquete. El dominio inverso cae en la
  **capa de metainformación**: `homepage` / `repository` / `author` de `package.json` usan uniformemente `lhgb.top`.
- **Lado nativo**: los applicationId / bundleId / package de `lh-ui-android` / `lh-ui-ios` / `lh-ui-harmony` /
  `lh-ui-c` sí usan la forma `top.lhgb.*` (no están en este repositorio).

## Los cuatro niveles del prefijo LH

**Los símbolos no terceros deben llevar el prefijo `LH`**; al añadir constantes / tipos / interfaces nuevas se
cumple desde el principio, sin dejarlo para una unificación posterior:

| Nivel | Forma | Ejemplos |
| --- | --- | --- |
| Constante | `LH_XXX` (mayúsculas y subrayado) | `LH_SIZE_DEFAULT`, `LH_LANGUAGE_DEFAULT`, `LH_THEME_PRESETS` |
| Tipo / interfaz | `LhXxx` (UpperCamelCase) | `LhThemePreset`, `LhSxProps`, `LhVirtualRange` |
| Singleton de módulo / objeto en minúsculas | `lhXxx` (lowerCamelCase) | `lhlocale` |
| Clase BEM / name del componente | `lh-xxx` / `LhXxx` | `.lh-button--primary`, `name: 'LhButton'` |

La estructura del nombre de las constantes es **`LH_<módulo>_<concepto>`**, y las constantes de valor por defecto
utilizan `DEFAULT` como sufijo:

- `LH_DRAWER_DIRECTION_DEFAULT` (no `LH_DEFAULT_DRAWER_DIRECTION`)
- `LH_DROPDOWN_PLACEMENT_DEFAULT`, `LH_POPCONFIRM_TYPE_DEFAULT`

En coerencia con los ya existentes `LH_SIZE_DEFAULT` / `LH_LANGUAGE_DEFAULT`.

## Registro de exenciones

Convenciones consolidadas en las que no se obliga a añadir el prefijo. **Antes de cambiarlas, registra aquí el motivo**:

| Símbolo | Razón |
| --- | --- |
| Exportación de paquetes de idioma `zhCN` / `enUS` | Naming de locale estándar, y reexportada como API pública por `@lh-ui/vue3` / `@lh-ui/vue2` / uniapp; el radio de ruptura de un renombrado es demasiado grande |
| Los **valores de string** de los nombres de preset (`name: 'cerblue'`, etc.) | Son valores de configuración que los usuarios escriben en el `theme` del ConfigProvider; cambiarlos rompería la configuración de todos los usuarios finales; el **identificador TS** correspondiente sí lleva prefijo (`LhCerblue`) |
| Símbolos exportados por dependencias terceras (utilidades importadas además de `deepMerge`) | No se obliga |

## El renombrado de 0.4.0

Antes de 0.4.0 este repositorio no había seguido la normativa de prefijos de la familia; esta versión ha puesto
al día su propio lado. Todo son reemplazos mecánicos a nivel de identificador;
la tabla de correspondencias está en la [Guía de migración a 0.4.0](/es/guide/migration-04).
