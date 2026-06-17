---
name: qa-visual-playwright
description: >-
  QA visual del sitio "Ruta 27" con el MCP de Playwright. Úsala cuando termines una
  sección o página y quieras verificar cómo se ve en mobile/tablet/desktop y en modo
  claro/oscuro. Arranca el dev server, captura screenshots en los 3 breakpoints × 2 temas,
  los guarda y evalúa contra criterios de calidad (overflow, contraste, spacing,
  hover/focus, menú móvil). Reporta una tabla PASA/FALLA con el fix sugerido.
---

# QA visual con Playwright (Ruta 27)

Objetivo: cerrar el loop _"generé UI → la vi y mido que está bien"_ en los breakpoints y
temas reales. Requiere el **MCP de Playwright** instalado (`/mcp` debe listar `playwright`).

> **Relación con otras skills:** esta es la **receta rápida** de QA visual (matriz fija
> 3 breakpoints × 2 temas + tabla PASA/FALLA). El **motor completo** de Playwright MCP (todas
> las tools, recetas de interacción, consola/red, performance) está en la skill
> [`playwright-mcp`]. Para una mejora responsive a fondo por dispositivo, usa
> [`responsive-audit`]; para auditoría de calidad transversal, [`quality-audit`].

## Procedimiento

1. **Arranca el servidor.** Prefiere el build real cuando pruebes CSP/preview:
   - Desarrollo: `pnpm dev` (http://localhost:4321).
   - Producción local: `pnpm build && pnpm preview`.
     Espera a que responda antes de navegar.
2. **Navega** a la URL/sección a revisar con el MCP de Playwright.
3. **Captura la matriz** breakpoint × tema y guarda en `qa-screenshots/` con nombres
   `‹seccion›-‹bp›-‹tema›.png`:

   | Breakpoint | Ancho | Temas         |
   | ---------- | ----- | ------------- |
   | mobile     | 375   | claro, oscuro |
   | tablet     | 768   | claro, oscuro |
   | desktop    | 1440  | claro, oscuro |

   Para cambiar de tema, alterna `data-theme` en `<html>` (toggle de la UI o vía script)
   y espera el repaint. Para mobile, prueba además abrir/cerrar el **menú móvil**.

4. **Evalúa** cada captura contra los criterios y arma la tabla.

## Criterios (PASA / FALLA)

- **Sin overflow horizontal** (nada se sale del viewport; sin scroll-x).
- **Contraste AA** en ambos temas — ojo el ámbar sobre claro (usa `--accent-text`) y el dark.
- **Spacing y jerarquía** coherentes; sin solapes ni texto cortado; line-height legible.
- **Targets ≥ 24px**; estados **hover/focus-visible** presentes en links y botones.
- **Menú móvil** abre/cierra, atrapa foco y cierra con `Escape`.
- **Imágenes** con dimensiones reservadas (sin CLS); el mapa con `aspect-ratio` reservado.
- **Sin errores de consola** durante la navegación.

## Salida

Una tabla `| Criterio | mobile | tablet | desktop | claro | oscuro | Nota/Fix |` con
PASA/FALLA, las rutas de los screenshots, y para cada FALLA un **fix concreto** (qué
archivo/token tocar). No marques PASA sin haber mirado la captura.

> Complemento opcional: la skill pública `webapp-testing` (de `anthropics/skills`) para
> testing funcional. Descúbrela con la skill `find-skills`.
