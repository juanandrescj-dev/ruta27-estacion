# Changelog

Todos los cambios notables de este proyecto se documentan aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

### Added

- **Fase 6 — QA, accesibilidad, performance y documentación.**
  - Suite **Playwright**: e2e (`home`, `theme` persiste tras recargar, `contacto` con envío
    mockeado y caso de error, `galeria` con lightbox operable por teclado), **accesibilidad** con
    `@axe-core/playwright` (**0 violaciones WCAG 2.2 AA en claro y oscuro**, escaneando la página
    con movimiento reducido para no omitir contenido con scroll-reveal) y **regresión visual** por
    snapshots claro/oscuro con _baselines_ Linux reproducibles (generadas en la imagen oficial de
    Playwright).
  - **CI** en GitHub Actions (`ci.yml`) en tres trabajos: calidad (lint + `format:check` +
    `astro check` + build), e2e/a11y/visual dentro de la imagen de Playwright fijada a la versión
    del proyecto, y presupuesto **Lighthouse** (`lighthouserc.json` + `treosh/lighthouse-ci-action`,
    métricas estables como error y FCP/TBT/LCP como advertencia, `numberOfRuns: 3`).
  - **Lighthouse móvil 96 / 100 / 100 / 100** (Performance/Accessibility/Best-Practices/SEO),
    CLS 0 y TBT 20 ms sobre el build de producción.
  - Fuentes de marca self-host (**Clash Display** + **Switzer** de Fontshare) añadidas a
    `public/fonts/`: se eliminan los 404 de consola y el sitio recupera sus dos voces tipográficas.
  - README profesional (banner, badges reales, stack con porqués, decisiones de diseño, tabla
    Lighthouse, mención de «Biome evaluado y descartado por cobertura `.astro`») y
    `.github/PULL_REQUEST_TEMPLATE.md`.

### Fixed

- **(Fase 6)** Contraste WCAG AA de los `Button` primario/secundario: un conflicto de
  `tailwind-merge` clasificaba `text-on-accent`/`text-on-brand` en el mismo grupo que el
  `font-size` `text-body` y descartaba el color, dejando el texto en `--ink` (1.3–2.5:1). Se
  configuró el grupo `font-size` con las escalas custom en `lib/utils/cn.ts`.
- **(Fase 6)** Placeholders del formulario (`placeholder:text-ink-muted/50` → sólido) para pasar
  4.5:1; rojo de texto de señal (`--color-red-700`) endurecido para pasar AA también sobre el
  tinte del badge «Precio sujeto a cambio».
- **(Fase 6)** `theme-color` del navegador ahora **sigue al tema elegido** (`data-theme`/
  `localStorage`) en vez del `prefers-color-scheme` del sistema operativo.
- **(Fase 6)** JSON-LD `GasStation`: `openingHoursSpecification` 24 h en forma canónica
  (`opens = closes = 00:00`), `name` derivado de `estacion.yaml` y `priceRange` informativo.
- **(Fase 6)** Detalles a11y/anti-IA: bento de Diferenciadores con pesos visuales distintos,
  `role="status"` en el feedback del formulario, foco de entrada del lightbox al botón de cierre y
  `backdrop-filter` retirado de la miniatura de la galería (solo navbar/modales).

### Added (fases previas)

- **Fase 5 — Imágenes y optimización visual.**
  - Ocho fotografías dirigidas con IA, integradas con `astro:assets` (`<Picture>` AVIF/WebP
    responsivos): hero con `loading="eager"` + `fetchpriority="high"`, el resto `lazy`.
  - Galería con _masonry_ ligero y lightbox accesible; `og-image.jpg` 1200×630 y set completo de
    favicons/manifest, con `theme-color` por tema.
- **Fase 4 — Motion y microinteracciones.**
  - GSAP 3 (ScrollTrigger + SplitText) + Lenis: reveals con _stagger_, _split_ de titulares y
    parallax sutil del hero; View Transitions entre páginas. Todo se desactiva (y ni se descarga)
    bajo `prefers-reduced-motion: reduce`.
- **Fase 3 — Mapa, formulario y seguridad.**
  - Isla `MapaInteractivo` (MapLibre GL v5 + OpenFreeMap, sin API key) con carga diferida por
    `IntersectionObserver`, estilo sincronizado con el tema, marcador de marca, popup con Google
    Maps/Waze y fallback accesible si la red falla.
  - Formulario de contacto Web3Forms (sin backend) con honeypot, `autocomplete`, envío asíncrono y
    feedback `aria-live`, más WhatsApp como canal primario.
  - `public/_headers` con CSP endurecida que permite OpenFreeMap y Web3Forms.
- **Fase 2 — Layout, secciones de contenido y SEO base.**
  - `layout/Header.astro` sticky (logo, nav ancla con subrayado animado, `ThemeToggle`, CTA
    «Cómo llegar») e isla React `MenuMovil` accesible: portal a `<body>` (evita el atrapamiento
    de `position:fixed` por el `backdrop-filter` del header), trampa de foco, cierre con `Escape`,
    bloqueo de scroll y retorno de foco.
  - Secciones de contenido consumiendo los YAML: `Hero` (asimétrico 7/5, eyebrow «00 / Inicio»,
    H1 dominicano, hueco de imagen con caja reservada), `Combustibles` (bento asimétrico + precios
    RD$ con `format.ts` y nota de vigencia), `Servicios` (lista editorial, iconos de dominio +
    Lucide), `SobreLaEstacion`, `Diferenciadores`, `Horarios` (tabla + «Abierto ahora» con
    `horarios.ts` y realce de «Hoy» por visitante) y `FAQ` (`<details>/<summary>` nativo).
  - `layout/Footer.astro` con dirección, RNC, contacto, WhatsApp, redes y el **disclaimer de demo**;
    isla de tema fija (siempre verde petróleo) por reasignación local de tokens.
  - Primitivo `ui/Section.astro` con ritmo vertical **variable** y alternancia de superficie
    (anti-IA); ≥50 % de secciones asimétricas y numeración editorial 01–06.
  - SEO base: `lib/seo.ts` con JSON-LD `GasStation` (cuyo `openingHoursSpecification` se deriva de
    `horarios.yaml`) y `FAQPage` (mismas preguntas que el acordeón visible); Open Graph + Twitter
    Card + canonical en `BaseLayout`; `@astrojs/sitemap`, `robots.txt` y `404.astro`.
  - Nuevos datos `faq.yaml` y `diferenciadores.yaml` (Zod) y campo `orden` en servicios/FAQ/
    diferenciadores para fijar el orden (getCollection ordena por id alfabético).
  - Eliminada la página temporal `/styleguide` (cumplió su rol en la Fase 1).
  - QA: matriz Playwright 3 breakpoints × 2 temas, auditoría anti-IA (0 hallazgos altos) y
    validación mental del JSON-LD; sin overflow horizontal ni errores de consola (salvo los 404
    de las fuentes aún por subir).

- **Fase 1 — Sistema de diseño, modo claro/oscuro y datos.**
  - `tokens.css` como fuente única de verdad: 3 capas (primitivos en OKLCH `@theme`,
    semánticos por tema en `:root`/`[data-theme]`, y puente `@theme inline` para que el dark
    mode cambie en runtime). Tokens de color, tipografía fluida, espaciado, radios y sombras.
  - Modo claro/oscuro por atributo `data-theme` con script anti-FOUC `is:inline` (+ reaplicación
    en `astro:after-swap`) e isla React `ThemeToggle` de 3 estados (claro/oscuro/sistema) accesible.
  - Tipografía self-host Clash Display + Switzer (`@font-face` con `font-display: swap`, preload del
    hero y fallback métricamente ajustado).
  - Componentes `ui/` base: `Button`, `Card`, `Badge`, `Container`, `Eyebrow` (numeración editorial)
    e iconos de dominio SVG inline (`Surtidor`, `Lavado`, `GLP`, `Aire`); `@lucide/astro` para UI.
  - Datos del negocio en `src/data/*.yaml` validados con Zod en `content.config.ts` (build falla si
    el contenido es inválido). Utilidades `lib/utils` (`cn`, `format` RD$/es-DO, `horarios`
    «¿abierto ahora?») con 21 pruebas Vitest.
  - Página temporal `/styleguide` (vitrina del sistema en ambos temas, se elimina en la Fase 2).
  - Contraste verificado WCAG 2.2 AA en ambos temas (ámbar y rojo de texto ajustados a tokens
    AA-safe sin perder identidad de marca).

- **Fase 0 — Entorno y andamiaje.**
  - Proyecto Astro 6 (estático, sin adapter) con TypeScript en modo `strict`.
  - Integración de React 19 para las futuras islas interactivas.
  - Tailwind CSS v4 vía `@tailwindcss/vite` (CSS-first, sin `tailwind.config.js`).
  - Tooling de calidad: ESLint 9 (flat config) + `eslint-plugin-astro` + `jsx-a11y`,
    Prettier 3 (`prettier-plugin-astro` + `prettier-plugin-tailwindcss`), Husky 9 +
    lint-staged + commitlint (Conventional Commits), EditorConfig y `.gitattributes`.
  - Estructura de carpetas del proyecto (§5 del plan) y tokens base de la paleta de marca.
  - Página placeholder «Ruta 27 — próximamente» para validar build y despliegue.
  - `CLAUDE.md` con stack, comandos, convenciones y reglas anti-IA.
  - Configuración para despliegue estático en Cloudflare Pages (`site`, `output: 'static'`).
