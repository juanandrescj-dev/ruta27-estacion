---
name: quality-audit
description: >
  Auditoria de calidad (QA) transversal del sitio "Ruta 27": revisa que el proyecto cumpla
  buenas practicas y flujos correctos a nivel de DATOS/contenido (YAML + Zod), estructura
  FRONTEND (Astro 6, islas React minimas, tokens), componentes visuales/UX (accesibilidad
  WCAG AA en ambos temas, dark mode, anti-IA), SEO (JSON-LD GasStation, meta/OG, sitemap) y
  PERFORMANCE (Core Web Vitals). Detecta riesgos e inconsistencias y entrega un reporte
  priorizado por severidad. Puede orquestar agentes Explore y las skills playwright-mcp /
  perf-a11y-gate / anti-ia-design-review.
  TRIGGER when: el usuario diga «haz QA», «audita la calidad», «revisa buenas practicas»,
  «esta bien hecho esto?», «revisa el flujo de X», «checa que cumpla las convenciones», o pida
  una revision de calidad del sitio. Usar /quality-audit.
user-invocable: true
---

# Ruta 27 — Auditoría de Calidad (QA)

Revisión de calidad transversal del sitio contra sus propias convenciones (definidas en
`CLAUDE.md` y los tokens del proyecto) y buenas prácticas generales. **No reescribe a ciegas:
detecta, prioriza y propone**, y entrega un reporte accionable.

> **Adaptación importante:** Ruta 27 es un **sitio estático** (Astro, sin adapter). **NO hay
> base de datos ni backend** — esas capas del QA genérico no aplican. El "modelo de datos" del
> proyecto son los **YAML de `src/data/` validados con Zod** en `content.config.ts`.

## Cuándo usar

- Revisión de salud antes de un PR/deploy de fase.
- Auditar una sección/feature recién terminada (hero, combustibles, mapa, formulario).
- Validar un flujo (cambio de tema persiste, navegación por anclas, envío del formulario).
- Verificar que un cambio no rompió convenciones (tokens, anti-IA, a11y, dark mode).

## Cómo opera (orquestación)

1. **Define alcance** con el usuario: ¿todo el sitio o una sección/capa concreta?
2. **Explora en paralelo** (agentes `Explore`) las capas para no leer todo secuencialmente.
3. **Contrasta** lo hallado con las convenciones de `CLAUDE.md` y los tokens (`src/styles/tokens.css`).
4. **Valida en vivo** (opcional) invocando `playwright-mcp` (flujos/interacción) y `perf-a11y-gate` (Lighthouse/axe).
5. **Reporta** hallazgos priorizados por severidad y propone fixes (sin aplicarlos salvo que el usuario lo pida).

> **Trazabilidad:** cita la **fuente** de cada convención: «fuente: `CLAUDE.md`», «fuente: `tokens.css`»,
> «fuente: `content.config.ts`», o «fuente: código `archivo:línea`». Nunca reportes un
> incumplimiento citando una regla que el proyecto no escribió.

## Alcance por capa y checklist

### 1. Datos / contenido (YAML + Zod)

- [ ] **Validación**: cada `src/data/*.yaml` tiene su esquema Zod en `content.config.ts`; el build falla si un dato es inválido (precio, fecha de vigencia, geo).
- [ ] **Coherencia**: `horarios.yaml` ↔ `openingHoursSpecification` del JSON-LD coinciden exacto.
- [ ] **Dinero**: precios RD$ con `vigencia`; formateo con `lib/utils/format.ts` (Intl `es-DO`), no hardcodeado.
- [ ] **Sin texto inventado** fuera del microcopy del proyecto; voz dominicana concreta; **sin testimonios falsos**.

### 2. Estructura frontend (Astro 6)

- [ ] **Zero-JS por defecto**: solo son islas el mapa, el menú móvil y el toggle de tema; con `client:visible`/`client:idle` (nunca `client:load` salvo el toggle).
- [ ] **Organización**: componentes en `ui`/`sections`/`layout`/`interactive`; nombres de dominio en español; PascalCase.
- [ ] **Tipado**: TypeScript `strict`; props con `interface Props`; sin `any` injustificado; `astro check` limpio.
- [ ] **lib/**: utilidades puras (`format.ts`, `horarios.ts`) con tests Vitest; sin lógica de negocio en el markup.
- [ ] **Tokens**: **ningún color hardcodeado** fuera de `tokens.css`; espaciado/radios/sombras desde tokens.

### 3. Componentes visuales / UX / Accesibilidad (WCAG 2.2 AA)

- [ ] **Semántica**: landmarks, un solo `<h1>`, skip link, `<button>` reales, `<details>` para FAQ.
- [ ] **Foco**: `:focus-visible` siempre (nunca `outline:none` sin reemplazo); `scroll-margin-top` por el header sticky.
- [ ] **Contraste AA en AMBOS temas**: ojo el ámbar (`--accent-text` para texto pequeño) y el dark mode.
- [ ] **Dark mode** por luminosidad (no inversión); `@theme inline` presente (reactivo en runtime); sin flash (anti-FOUC `is:inline` + `astro:after-swap`).
- [ ] **Targets ≥ 24px**; `alt` correctos; menú móvil y lightbox con teclado (Escape, foco atrapado).
- [ ] **Anti-IA**: deriva a `anti-ia-design-review` para la checklist de 14 tells.
- [ ] **Responsive**: deriva a `responsive-audit` para la auditoría por breakpoint.
- [ ] **`prefers-reduced-motion`** respetado.

### 4. SEO técnico

- [ ] **`site`** en `astro.config.mjs` (sin él se rompen sitemap/canonical/OG).
- [ ] **JSON-LD `GasStation`** con address/telephone/geo/openingHoursSpecification (= horarios) + `FAQPage`.
- [ ] **Meta + OG + Twitter**; `<html lang="es-DO">`; canonical; `robots.txt`; `@astrojs/sitemap`.
- [ ] **OG image** 1200×630 presente; `theme-color` por tema.

### 5. Performance (Core Web Vitals)

- [ ] **Fuentes** self-host woff2 subset + preload de la del hero; fallback métricamente ajustado (sin CLS).
- [ ] **Imágenes** AVIF/WebP con `width`/`height`; hero `eager`+`fetchpriority="high"`, resto `lazy`.
- [ ] **Mapa** fuera del critical path (lazy on-interaction); `aspect-ratio` reservado (CLS=0).
- [ ] **JS mínimo**: solo islas. Presupuesto: LCP < 2.5s, INP < 200ms, CLS < 0.1. Deriva a `perf-a11y-gate`.

### 6. Flujos correctos (en vivo con `playwright-mcp`)

- [ ] **Tema**: alternar claro/oscuro persiste (localStorage) y NO hace flash al recargar/navegar.
- [ ] **Navegación**: las anclas del nav llevan a la sección con `scroll-margin-top` correcto.
- [ ] **Menú móvil**: abre/cierra, atrapa foco, cierra con Escape.
- [ ] **Formulario** (Fase 3): valida, envía a Web3Forms, muestra éxito/error con `aria-live`.
- [ ] **Mapa** (Fase 3): carga sin errores de consola/CSP; botones Waze/Google Maps funcionan.

## Reporte de hallazgos (formato)

Para cada hallazgo: **Severidad** (`Crítico` seguridad/build roto · `Alto` bug/convención rota ·
`Medio` deuda/UX · `Bajo` cosmético) · **Capa** (Datos/Frontend/UI/SEO/Perf/Flujo) ·
**Ubicación** (`archivo:línea`) · **Qué** y **por qué** · **Fix propuesto** (conciso).

Ordena de Crítico a Bajo. Resume al final con conteo por severidad y los 3 fixes de mayor impacto.

## Integración

- `CLAUDE.md` + `tokens.css` + `content.config.ts`: fuente de verdad de las convenciones.
- `anti-ia-design-review`: la auditoría anti-IA detallada se delega ahí.
- `responsive-audit`: la auditoría responsive por breakpoint se delega ahí.
- `perf-a11y-gate`: Lighthouse + axe contra el presupuesto.
- `playwright-mcp`: validación de flujos reales en el sitio corriendo.
- Agentes `Explore`: barrido paralelo del código por capa.

## NO hacer

- NO auditar db/backend: no existen en este proyecto estático.
- NO aplicar cambios sin que el usuario apruebe el reporte (QA audita; corregir es un paso aparte).
- NO reportar como bug una convención deliberada del proyecto sin verificarla contra `CLAUDE.md`/tokens.
- NO duplicar aquí la auditoría anti-IA, responsive o de performance: derívalas a sus skills.
- NO inflar el reporte con ruido cosmético cuando hay riesgos altos sin resolver: prioriza.
