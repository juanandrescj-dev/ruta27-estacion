# Changelog

Todos los cambios notables de este proyecto se documentan aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

### Added

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
