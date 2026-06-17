# Guía de Skills, Agentes, MCP y Rules — Ruta 27

Este documento es el **índice operativo** del proyecto: qué skill, agente, servidor MCP o regla
cargar según la tarea. Un hook (`UserPromptSubmit`) recuerda consultarlo en cada prompt.

> **Cómo usar esta guía:** ante un pedido, ubica el tipo de tarea en el «Mapa rápido de decisión»,
> carga las piezas indicadas y procede. Si no encaja, usa el catálogo detallado de abajo.

> **Contexto del proyecto:** Ruta 27 es una **landing estática** (Astro 6 sin adapter, Tailwind v4,
> islas React mínimas). **No hay base de datos ni backend.** El "modelo de datos" son los YAML de
> `src/data/` validados con Zod. Las convenciones viven en `CLAUDE.md`.

---

## Mapa rápido de decisión

| Si la tarea es…                                                                    | Carga / usa                                     | Notas                                                                       |
| ---------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| Contexto, stack, convenciones, reglas anti-IA                                      | `CLAUDE.md`                                     | Fuente de verdad dentro del repo.                                           |
| **Crear un componente** (`ui`/`sections`/`layout`/isla)                            | skill `component-scaffold` + Context7           | Solo tokens, light/dark por tokens, mobile-first, estados.                  |
| **Mejorar responsividad** de una o más vistas/secciones                            | skill `responsive-audit`                        | Orquesta Context7 + `chrome-devtools` + `playwright-mcp`.                   |
| **Probar el sitio** (smoke, capturas, consola/red, interacción, video)             | skill `playwright-mcp` (MCP `playwright`)       | El sitio debe correr (`pnpm dev` / `pnpm preview`).                         |
| **QA visual rápida** de una sección (3 bp × 2 temas, tabla PASA/FALLA)             | skill `qa-visual-playwright`                    | Receta rápida; usa `playwright-mcp` por debajo.                             |
| **Auditar calidad** (datos/frontend/UI/SEO/perf/flujos)                            | skill `quality-audit`                           | Orquesta `Explore` + las otras skills.                                      |
| **Auditar anti-IA** (14 tells, ¿parece IA?)                                        | skill `anti-ia-design-review`                   | Bloquea PR si hay ≥1 hallazgo ALTO.                                         |
| **Performance + accesibilidad** (Lighthouse + axe, ambos temas)                    | skill `perf-a11y-gate` (MCP `chrome-devtools`)  | Contra el presupuesto CWV del proyecto.                                     |
| Emular un móvil fiel / Core Web Vitals / throttling puntual                        | MCP `chrome-devtools` directo                   | Diagnóstico aislado; si es mejora de varias vistas, usa `responsive-audit`. |
| Documentación FRESCA de una librería (Astro 6, Tailwind v4, Lenis, MapLibre, GSAP) | MCP `context7`                                  | Automático antes de tocar APIs de terceros (ver Rules).                     |
| Dudas sobre Claude Code / API de Anthropic                                         | agente `claude-code-guide` / skill `claude-api` | Features de la herramienta o la API.                                        |
| Buscar/instalar una skill nueva                                                    | skill `find-skills`                             | Descubre skills del registro.                                               |
| Configurar la herramienta (permisos, hooks, env, settings)                         | skill `update-config`                           | Cambios a `settings.json`/`settings.local.json`.                            |

---

## Catálogo de Skills (proyecto)

Viven en `.claude/skills/<nombre>/SKILL.md`. Se invocan con `/<nombre>` o se activan por su `TRIGGER when`.

| Skill                   | Para qué                                                                                             | Depende de                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `component-scaffold`    | Crear componentes con las convenciones (solo tokens, light/dark, mobile-first, semántica + estados). | Context7                                                                                               |
| `playwright-mcp`        | **Motor** de pruebas visuales/funcionales potentes (todas las tools del MCP, recetas, config).       | MCP `playwright` (sitio corriendo)                                                                     |
| `qa-visual-playwright`  | **Receta rápida** de QA visual: matriz 3 breakpoints × 2 temas + tabla PASA/FALLA.                   | skill `playwright-mcp`                                                                                 |
| `responsive-audit`      | **Mejora responsividad** de vistas/secciones. Orquestador (5 fases).                                 | Context7, MCP `chrome-devtools`, skill `playwright-mcp`                                                |
| `anti-ia-design-review` | Auditoría contra los 14 "tells" de IA del proyecto.                                                  | — (revisa código/capturas)                                                                             |
| `perf-a11y-gate`        | Lighthouse + axe (ambos temas) contra el presupuesto CWV; propone/aplica fixes.                      | MCP `chrome-devtools`                                                                                  |
| `quality-audit`         | **Auditoría de calidad transversal** (datos/frontend/UI/SEO/perf/flujos).                            | agentes `Explore`, skills `playwright-mcp`/`perf-a11y-gate`/`anti-ia-design-review`/`responsive-audit` |

---

## Servidores MCP

Definidos en `.mcp.json` (versionado, **sin secretos**). Secreto y permisos en `.claude/settings.local.json` (gitignored).

| MCP               | Qué aporta                                                                                                                                                                                                    | Estado / requisitos                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `playwright`      | Navegación, interacción, screenshots multi-viewport, snapshot de accesibilidad, consola/red, aserciones, traces, video. Config potente: `--caps vision,pdf,devtools,testing --save-session`. **Sin API key.** | Local (`@playwright/mcp`). Descarga Chromium al primer uso. **Requiere reiniciar** Claude Code tras tocar `.mcp.json`. Sitio corriendo para probarlo.                          |
| `chrome-devtools` | Emulación FIEL de dispositivos (`emulate`: DPR/touch/UA móvil), throttling red/CPU, `resize_page`, Core Web Vitals (`performance_start_trace`), `lighthouse_audit` (a11y/SEO).                                | Local. Usa el Chrome instalado. **Requiere reiniciar** Claude Code.                                                                                                            |
| `context7`        | **Documentación oficial y actualizada** de librerías (Astro 6, Tailwind v4, Lenis, MapLibre, GSAP).                                                                                                           | HTTP vía npx. API key (`CONTEXT7_API_KEY`) en el bloque `env` de `settings.local.json`; `.mcp.json` la expande como `${CONTEXT7_API_KEY}`. **Requiere reiniciar** Claude Code. |

> **chrome-devtools vs playwright (decisión vigente): NO se unifican.** Playwright = **banco de
> pruebas** (matriz de capturas, regresión, interacción, multi-navegador). chrome-devtools =
> **microscopio** (emulación de dispositivo fiel, Core Web Vitals, throttling, Lighthouse). La skill
> `responsive-audit` usa ambos; cada uno es mejor en su rol y juntos cubren más que cualquiera solo.

> **Secretos vs versionado:** `.claude/settings.local.json` está **gitignored** — aquí viven el
> secreto (`CONTEXT7_API_KEY` en `env`), el `enableAllProjectMcpServers` y los permisos. `.mcp.json`
> y `.claude/settings.json` **se versionan** (sin secretos). **Nunca** pongas el API key en `.mcp.json`,
> `settings.json` ni en esta guía.

---

## Agentes / Subagentes

Se lanzan con la herramienta `Agent`. Útiles para paralelizar y aislar contexto.

| Agente              | Para qué                                                                                |
| ------------------- | --------------------------------------------------------------------------------------- |
| `Explore`           | Búsqueda read-only amplia: barrer muchos archivos/convenciones y devolver conclusiones. |
| `Plan`              | Diseñar estrategia de implementación paso a paso.                                       |
| `general-purpose`   | Investigación/búsqueda multi-paso cuando no hay un agente más específico.               |
| `claude-code-guide` | Preguntas sobre Claude Code / Agent SDK / API de Anthropic.                             |
| `claude`            | Catch-all para tareas que no encajan en uno específico.                                 |

> Para trabajos grandes (auditar muchas secciones, verificación adversarial), `quality-audit` y
> `responsive-audit` pueden usar un **workflow** de fan-out — solo si el usuario lo pide explícitamente.

---

## Rules activas (CLAUDE.md y hooks)

| Regla                         | Dónde                                             | Resumen                                                                                                                  |
| ----------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Anti-IA** (14 tells)        | `CLAUDE.md`                                       | Paleta verde-petróleo/ámbar, dos fuentes, asimetría, sin emojis-icono, microcopy dominicano, etc.                        |
| **Solo tokens**               | `CLAUDE.md`                                       | Ningún color hardcodeado fuera de `src/styles/tokens.css`.                                                               |
| **Dark mode**                 | `CLAUDE.md`                                       | `data-theme` + `@theme inline` obligatorio; anti-FOUC `is:inline`.                                                       |
| **Commits**                   | `CLAUDE.md`                                       | Conventional Commits, español, ramas por fase + PR.                                                                      |
| **Context7 híbrido**          | `CLAUDE.md`                                       | Automático antes de tocar APIs de librerías externas (con duda de API/versión) + bajo demanda si se menciona `context7`. |
| **Recordatorio de esta guía** | `.claude/settings.json` (hook `UserPromptSubmit`) | En cada prompt inyecta: «consulta GUIA-SKILLS-AGENTES-RULES.md…». Para desactivarlo, quita el hook de ese archivo.       |

---

## Flujos compuestos frecuentes

- **«Mejora la responsividad del hero / combustibles / footer»** → `responsive-audit`: Context7 (F1) →
  auditoría con `chrome-devtools` + `playwright-mcp` en ambos temas (F2) → diagnóstico (F3) → fixes
  Tailwind v4 con tokens (F4) → re-verificación con capturas antes/después (F5).
- **«Haz QA de la sección X»** → `quality-audit`: barrido con `Explore` por capa → contrastar con
  `CLAUDE.md`/tokens → validar flujo con `playwright-mcp` → derivar anti-IA/responsive/perf a sus
  skills → reporte priorizado.
- **«Construye la sección X»** → `component-scaffold` + Context7; al terminar, `qa-visual-playwright`
  para la matriz rápida, `responsive-audit` si hay dudas en móvil, y `anti-ia-design-review` antes del PR.
- **«Revisa que no parezca IA / performance antes del deploy»** → `anti-ia-design-review` + `perf-a11y-gate`.

---

## Mantenimiento de esta guía

Cuando se agregue/cambie una skill, MCP, agente o regla:

1. Crear/editar el artefacto (skill en `.claude/skills/`, MCP en `.mcp.json`, regla en `CLAUDE.md`, hook en `.claude/settings.json`).
2. **Actualizar esta guía**: añadir/editar la fila en el catálogo y, si aplica, en el «Mapa rápido de decisión».
3. Si introduce dependencias entre piezas, reflejarlas en «Depende de» y en «Flujos compuestos».

Mantener esta guía sincronizada es lo que hace útil el recordatorio del hook.
