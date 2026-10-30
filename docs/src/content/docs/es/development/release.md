---
title: Proceso de publicación
description: 'Release en seis pasos: changeset → fusionar en master → changeset:version → commit → release → release:push, más el archivado automático de la CI'
---

El release de share es una **pipeline de seis pasos custodiada manualmente**: la publicación en npm se completa en local (las verificaciones las ejecuta una persona), y las etiquetas y los releases de GitHub / Gitee los archiva automáticamente la CI.

## Los seis pasos

### 1. Escribir el changeset

```bash
pnpm changeset
```

Selección interactiva del alcance del cambio (major / minor / patch) y redacción de una descripción del cambio; genera `.changeset/<nombre-aleatorio>.md`. **Se acumulan antes de fusionar en master**: un changeset, un tema.

Convención de niveles:

| Nivel | Cuándo usarlo |
| --- | --- |
| `major` | Cambios disruptivos (renombrar, eliminar una API, cambiar el comportamiento). También se marca con seriedad en la fase 0.x: el nivel inferior decide si tiene que tocar su código |
| `minor` | Funcionalidad nueva (componente nuevo, preset nuevo, exportación nueva) |
| `patch` | Corrección de bugs, ajustes de estilos |

### 2. Consignar y fusionar en master

```bash
git add -A
git commit -m "feat: ..."      # El mensaje de commit se redacta detalladamente en markdown
# Y luego PR / fusión directa en master
```

### 3. Consumir el changeset

```bash
pnpm changeset:version
```

Hace tres cosas: fusionar todos los changeset pendientes en la descripción del cambio de versión → cambiar el número de versión del `package.json` → escribir el CHANGELOG.md, y **borra los archivos changeset ya consumidos**.

El número de versión lo decide el nivel más alto de entre todos los changeset pendientes (por ejemplo, de 9 changeset el más alto es minor → `0.3.0` → `0.4.0`).

### 4. Consignar el número de versión

```bash
git add -A
git commit -m "chore(release): 0.4.0"
```

**Por qué se consigna a mano**: el `commit: false` del `.changeset/config.json` hace que changeset no haga el git commit por sí mismo. El mensaje de commit de este paso se escribe por convención como `chore(release): x.y.z` + descripción detallada en markdown del contenido de este release.

### 5. Publicar en npm y crear la etiqueta local

```bash
pnpm release
```

Es decir, `changeset publish`, en este orden:

1. Ejecuta `prepublishOnly`: `pnpm build` + `pnpm verify:dts` + `pnpm verify:styles`
2. Publica en npm (`npm publish`)
3. Crea **en local** la etiqueta `@lh-ui/share@x.y.z` (solo la crea, no la empuja)

**Condición previa**: `npm login` hecho. Es una operación de credenciales; la IA no la hace en tu lugar.

**Atención: prepublishOnly solo ejecuta tres verificaciones** —— test / lint / typecheck / verify:theme hay que pasarlos explícitamente a mano antes del release (véase [la lista de verificación completa](/es/development/verification#verificación-completa)).

### 6. Empujar y archivar

```bash
pnpm release:push
```

Empuja master + la etiqueta de esta vez a `github-lhgb`, lo que dispara automáticamente `.github/workflows/release.yml`.

## Archivado automático de la CI (release.yml)

```
tarball ya publicado en npm
  → crea el GitHub Release (adjuntando lh-ui-share-<version>.tgz; se puede instalar sin conexión con npm i ./xxx.tgz)
  → empuja la etiqueta a Gitee
  → llama a la API de Gitee para crear el release (el cuerpo incluye el enlace de descarga del tgz de GitHub)
```

**Decisión clave**: release.yml **no vuelve a construir**, sino que toma directamente el tarball ya publicado en npm; es idéntico byte a byte al que el usuario instala con `npm i`. La construcción y las dos verify las ejecuta una vez cada uno el `pnpm release` local (prepublishOnly) y la `ci.yml`.

Gracias a esto, reconstruir un release histórico temprano tampoco falla aunque al commit antiguo le falte el `pnpm-lock.yaml` o los scripts: **basta con empujar la etiqueta que falta a GitHub** y el mismo flujo lo archiva automáticamente.

## Seguimiento del nivel inferior (línea roja 5)

**Restricción estricta del orden de publicación: primero share publica, luego las bibliotecas de UI.**

Tras la publicación de share 0.4.0:

```bash
# Repositorio lh-ui-plus
pnpm up @lh-ui/share@0.4.0
pnpm test          # regresión

# Repositorio lh-ui-vue2
pnpm up @lh-ui/share@0.4.0
pnpm test          # regresión
```

Solo entonces `pnpm verify:versions` vuelve a pasar (antes del release, el rango de dependencias de los dos repositorios hermanos sigue siendo `^0.3.0`; es lo esperado).

## Notas

- **En local solo se empuja a GitHub (`github-lhgb`)**, **no empujar etiquetas a Gitee a mano**: las etiquetas / releases de Gitee las gestiona centralizadamente release.yml; la doble escritura entra en conflicto.
- **`npm login` es un paso manual**: si `npm whoami` devuelve 401 es que no hay sesión; inicia sesión antes de `pnpm release`.
- **Reconstruir un release histórico**: `git push github-lhgb @lh-ui/share@0.2.0` es suficiente; release.yml es idempotente (si el Release ya existe, solo vuelve a subir el tarball). Si la creación del release falla, se puede reejecutar desde la página de Actions con `workflow_dispatch` pasando la etiqueta.
- **El release de Gitee depende del Secret `GITEE_TOKEN`** (token de acceso personal de Gitee con el permiso releases marcado), configurado en Settings → Secrets del repositorio de GitHub.
- **No tocar el código fuente a mitad del release**: el prepublishOnly de `pnpm release` vuelve a ejecutar build; en ese momento el espacio de trabajo debe estar limpio.
- **Herencia histórica de 0.3.0**: el número de versión quedó entonces absorbido en un commit de corrección (`791ff32`) y no hay un commit `chore(release)` independiente. A partir de este release se recupera la convención; no se reescribe la historia.

## Despliegue (otro repositorio)

El sitio de documentación se despliega en el nginx de la familia; el contrato está en `lh-ui/docs/部署/nginx-lhui.conf.md` (**en otro repositorio**): añadir `location ^~ /lhui/share/` y actualizar la lista de ocho sitios a nueve. El repositorio share solo se encarga de que el producto de `pnpm docs:build` sea utilizable.

## Documentación relacionada

- [Referencia de comandos](/es/development/commands)
- [Sistema de verificación](/es/development/verification)
- [Scripts de construcción y herramientas](/es/development/scripts)
- [Guía de contribución](/es/development/contribution)
- [Cómo lo consumen los extremos](/es/guide/consumption) —— cómo sigue el nivel inferior a las versiones nuevas
