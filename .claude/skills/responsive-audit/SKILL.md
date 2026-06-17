---
name: responsive-audit
description: >
  Mejora la responsividad (RESPONSIVE: PC, tablets y SOBRE TODO móviles) de las vistas/secciones
  del sitio "Ruta 27" orquestando varias herramientas: Context7 para buenas practicas frescas de
  Astro 6 / Tailwind v4, el MCP chrome-devtools para emulacion FIEL de moviles (DPR/touch/UA) y
  Core Web Vitals, y la skill playwright-mcp para capturas multi-viewport y regresion visual en
  ambos temas. Audita como se rompe, corrige con patrones mobile-first verificados y vuelve a probar.
  TRIGGER when: el usuario diga «mejora la responsividad de X», «esto se ve mal en movil»,
  «hazla responsive», «arregla el layout en celular/tablet», «se desborda en pantallas chicas»,
  o liste secciones a mejorar (ej. hero, combustibles, footer). Usar /responsive-audit.
user-invocable: true
---

# Ruta 27 — Mejora de Responsividad (orquestador)

Toma una o varias secciones/vistas y mejora su comportamiento responsive de forma **medida y
verificada**: primero observa cómo se rompen en distintos tamaños y **en ambos temas**, consulta
buenas prácticas frescas, corrige con patrones mobile-first de Tailwind v4 (usando los tokens del
proyecto), y vuelve a probar. Orquesta 3 herramientas.

## Cómo se invoca

> «Vamos a mejorar la responsividad de estas vistas: el hero, la sección de combustibles y el footer»

Procesa cada objetivo por el mismo pipeline. Rutas actuales del proyecto:

| Vista       | Ruta          | Notas                                                   |
| ----------- | ------------- | ------------------------------------------------------- |
| Home        | `/`           | Compone las secciones.                                  |
| Style guide | `/styleguide` | Vitrina de tokens/componentes (temporal, útil para QA). |

> Las **secciones** (`Hero`, `Combustibles`, `Servicios`, `Ubicacion`, `Horarios`, `FAQ`, `Contacto`,
> `Footer`…) viven en `src/components/sections|layout/` y se integran desde la Fase 2 en adelante.
> Apunta a la sección por su componente y por su ancla (`#combustibles`, `#ubicacion`, …).

## Las 3 herramientas que orquesta (división de labores)

**Decisión de arquitectura: NO se unifican `chrome-devtools` y `playwright`; se usan en conjunto,
cada uno para lo que es mejor.**

| Herramienta                                     | Rol                        | Cuándo                                                                                                                                                   |
| ----------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Context7** (`mcp__context7__*`)               | Conocimiento fresco        | Docs actuales de Tailwind v4 (breakpoints, container queries, `@theme`) y Astro 6 antes de tocar código. No responder de memoria sobre APIs de terceros. |
| **chrome-devtools** (`mcp__chrome-devtools__*`) | Microscopio de dispositivo | Emulación **fiel** de móviles (DPR, touch, UA), throttling de red/CPU, Core Web Vitals, `lighthouse_audit` (a11y/SEO).                                   |
| **playwright-mcp** (skill)                      | Banco de pruebas           | Matriz de **capturas** multi-viewport y **en ambos temas**, regresión visual antes/después, interacción (menú móvil, toggle).                            |

Regla práctica: **playwright** para la matriz rápida de screenshots y regresión; **chrome-devtools**
para fidelidad de dispositivo real y rendimiento; **Context7** siempre antes de escribir el fix.

## Pipeline (5 fases)

### Fase 1 — Conocimiento fresco (Context7)

Trae con Context7 la doc relevante: Tailwind v4 (responsive, breakpoints, **container queries**,
`@theme`/`@theme inline`), Astro 6 (islas, `client:*`). Resuelve el id de librería y pide solo la
sección concreta.

### Fase 2 — Auditoría (observar cómo se rompe)

1. Levanta el sitio (`pnpm dev`, puerto 4321). Para tocar CSP/mapa, usa `pnpm build && pnpm preview`.
2. **Matriz de capturas** con `playwright-mcp`: por cada ancho, `browser_resize` → `browser_take_screenshot(fullPage)`, **en claro y oscuro** (alterna `data-theme`).
3. **Emulación fiel** con chrome-devtools en los móviles clave (formato del viewport string):
   ```
   emulate({ viewport: "360x740x3,mobile,touch" })   // Android chico (el caso más exigente)
   emulate({ viewport: "390x844x3,mobile,touch" })   // iPhone 12-14
   emulate({ viewport: "768x1024x2,mobile,touch" })  // iPad portrait (= md)
   take_screenshot({ fullPage: true })
   ```
   > El `viewport` es UN string: `"<ancho>x<alto>x<DPR>[,mobile][,touch][,landscape]"`. `resize_page` NO emula dispositivo (no toca DPR/touch/UA).
4. Consola y red: `browser_console_messages` + `browser_network_requests`.

### Fase 3 — Diagnóstico (checklist verificado)

- [ ] **Overflow horizontal** (scroll lateral): anchos fijos `w-[NNNpx]`, flex sin `min-w-0`, grids con columnas muy anchas, texto largo sin `break-words`.
- [ ] **Mobile-first invertido**: clases con prefijo (`sm:`/`md:`) que deberían ser base. El prefijo aplica **hacia arriba**, NO en móvil.
- [ ] **Touch targets**: íconos-botón sin padding. Mínimo AA 24px (WCAG 2.5.8) → `min-h-11 min-w-11` cómodo; el toggle de tema y el menú móvil son críticos.
- [ ] **Tipografía fluida**: que el `clamp()` de la escala modular no deje el `--fs-display` gigante en 360px.
- [ ] **Imágenes**: `max-w-full h-auto`; el hero con `width/height` reservados (CLS=0).
- [ ] **`100vh`** en móvil → usar `min-h-dvh`/`h-dvh`.
- [ ] **Flex sin `flex-wrap`** en filas de chips/botones (CTAs del hero, badges de combustibles).
- [ ] **`truncate` sin `min-w-0`** en el ancestro flex.
- [ ] **Mapa** (Fase 3): `aspect-ratio` reservado; no romper en chico.
- [ ] **Ambos temas**: que el fix no rompa el contraste en dark (ojo el ámbar → usar `--accent-text`).
- [ ] **`prefers-reduced-motion`**: animaciones decorativas desactivadas.

### Fase 4 — Mejoras (Tailwind v4 mobile-first, SOLO tokens)

- Mobile-first: utilidad **sin prefijo** = móvil; el prefijo escala hacia arriba.
- Preferir `max-w-* + w-full` y medidas relativas sobre anchos fijos.
- **Container queries** (`@container` + `@sm`/`@md`) para componentes reutilizables (cards de combustible, de servicio) que dependen del ancho de su **contenedor**, no del viewport.
- **Ningún color hardcodeado**: todo sale de `src/styles/tokens.css`. Light/dark salen solos por `data-theme` (no dupliques estilos por tema).
- NO crear `tailwind.config.js`: la config vive en `@theme` dentro de `src/styles/` (Tailwind v4 CSS-first).

### Fase 5 — Re-verificación (cerrar el ciclo)

1. Repite la **matriz de capturas** (playwright, ambos temas) y la **emulación móvil** (chrome-devtools).
2. Compara **antes/después** por breakpoint y por tema.
3. Confirma 0 overflow horizontal y 0 errores de consola nuevos.
4. (Opcional) `performance_start_trace` (chrome-devtools) para CWV si se tocó layout pesado; `lighthouse_audit({ device: "mobile" })` para a11y. Cruza con `perf-a11y-gate`.

## Matriz de dispositivos recomendada

| Clase            | `emulate`                                 | Para                                     |
| ---------------- | ----------------------------------------- | ---------------------------------------- |
| Móvil chico      | `360x740x3,mobile,touch`                  | Android estrecho — el caso más exigente. |
| Móvil estándar   | `390x844x3,mobile,touch`                  | iPhone 12-14.                            |
| Móvil grande     | `414x896x3,mobile,touch`                  | phablets.                                |
| Tablet portrait  | `768x1024x2,mobile,touch`                 | iPad — coincide con `md`.                |
| Tablet landscape | `1024x768x2,mobile,touch,landscape`       | borde `lg`.                              |
| Desktop          | `resize_page(1280)` y `resize_page(1440)` | `xl`/`2xl`.                              |

Breakpoints Tailwind v4 (defaults): `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`.

## Patrones de fix (Tailwind v4, mobile-first, con tokens)

```html
<!-- Hero asimétrico 7/5 que colapsa a 1 columna en móvil -->
<div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
  <div class="lg:col-span-7"><!-- texto --></div>
  <div class="lg:col-span-5"><!-- imagen, con width/height reservados --></div>
</div>

<!-- Bento de combustibles: 1 col móvil → 2/3 desde sm/lg (no 3 cards idénticas) -->
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">...</div>

<!-- CTAs del hero: apilan en móvil, fila desde sm, con wrap -->
<div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">...</div>

<!-- Card que se adapta a su contenedor (container query) -->
<article class="@container rounded-lg border border-[var(--border)]">
  <div class="flex flex-col gap-3 p-4 @md:flex-row @md:items-center">...</div>
</article>

<!-- Touch target accesible (toggle de tema / botón de menú) -->
<button class="inline-flex h-11 min-w-11 items-center justify-center">...</button>

<!-- Altura móvil correcta -->
<section class="min-h-dvh">...</section>
```

## Específicos de Ruta 27

- **Tailwind v4 CSS-first**: la config vive en `src/styles/` dentro de `@theme`/`@theme inline` (NO hay `tailwind.config.js`). Tokens en OKLCH, semánticos por `data-theme`.
- **Dark mode por `data-theme`**: prueba SIEMPRE responsive en claro Y oscuro; un fix que se ve bien en claro puede romper contraste en dark.
- **Islas React** (menú móvil, toggle de tema): el responsive del markup es de clases Tailwind; la lógica de la isla no cambia. El menú móvil debe atrapar foco y cerrar con Escape.
- **Cero colores hardcodeados** fuera de `tokens.css`; cruza con `anti-ia-design-review`.

## NO hacer

- NO escribir CSS responsive «de memoria»: Tailwind v4 cambió respecto a v3 → Context7 primero.
- NO usar `sm:`/`md:` pensando que aplican «en móvil» (aplican hacia arriba).
- NO probar solo con `resize_page`: para móviles reales usa `emulate` (DPR/touch/UA).
- NO crear `tailwind.config.js` (v4 lo ignora salvo `@config` explícito).
- NO hardcodear colores ni meter `overflow-x-hidden` global como «solución»: arregla la causa.
- NO dar por terminado sin la re-verificación (Fase 5) con capturas antes/después en ambos temas.
