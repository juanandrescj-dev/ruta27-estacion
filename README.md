# Ruta 27 — Estación de Servicio

> _Energía para seguir tu ruta._

Landing corporativa de una sola página para **Ruta 27**, una estación de servicio
(gasolinera) en la Autopista Duarte, Santiago, República Dominicana. Build moderno,
estático y accesible, con modo claro/oscuro y mapa interactivo.

**Demo en vivo:** https://ruta27-estacion.pages.dev _(placeholder durante el desarrollo)_

> ⚠️ **Sitio demostrativo de portafolio.** «Ruta 27» es una marca **ficticia**; el
> nombre, los datos, los precios y las imágenes son ilustrativos y no representan a
> ningún negocio real.

---

## Estado

🚧 **En construcción** — el proyecto se desarrolla por fases (ver _Hoja de ruta_). La
URL de arriba muestra por ahora una página _placeholder_ que valida el pipeline de
build y despliegue continuo.

## Stack

- **[Astro 6](https://astro.build/)** — estático (`output: 'static'`), sin adapter, zero-JS por defecto.
- **TypeScript** en modo `strict`.
- **[Tailwind CSS v4](https://tailwindcss.com/)** vía `@tailwindcss/vite` (CSS-first, sin `tailwind.config.js`).
- **React 19** solo para las islas interactivas (mapa, menú móvil, toggle de tema).
- **ESLint 9+ (flat) + Prettier 3**, **Husky + lint-staged + commitlint** (Conventional Commits).
- **Playwright** (e2e/visual/a11y) — se añade en fases posteriores.
- Despliegue en **Cloudflare Pages**.

Stack, convenciones y decisiones de diseño detalladas en [`CLAUDE.md`](./CLAUDE.md).

## Requisitos

- **Node 22 LTS** (ver `.nvmrc`).
- **pnpm 11** (`corepack enable pnpm`).

## Empezar

```bash
pnpm install      # instala dependencias
pnpm dev          # servidor de desarrollo en http://localhost:4321
```

### Scripts

| Script                              | Qué hace                                        |
| ----------------------------------- | ----------------------------------------------- |
| `pnpm dev`                          | Servidor de desarrollo.                         |
| `pnpm build`                        | Build estático a `dist/`.                       |
| `pnpm preview`                      | Sirve el build localmente.                      |
| `pnpm typecheck`                    | `astro check` (diagnósticos de tipos).          |
| `pnpm lint`                         | ESLint sobre todo el proyecto.                  |
| `pnpm format` / `pnpm format:check` | Prettier (escribe / verifica).                  |
| `pnpm test:e2e`                     | Playwright (tests llegan en fases posteriores). |

## Estructura

```text
src/
├── components/   # ui · sections · layout · interactive (islas React)
├── layouts/      # BaseLayout (SEO, OG, JSON-LD)
├── pages/        # index.astro · 404.astro
├── data/         # contenido editable (YAML)
├── styles/       # tokens.css (fuente única de verdad) · global.css
├── lib/          # utils (format RD$, horarios) · seo
└── config/       # constantes del sitio
```

## Hoja de ruta

| Fase     | Entregable                                              |
| -------- | ------------------------------------------------------- |
| **0** ✅ | Entorno, andamiaje, tooling, repo y deploy placeholder. |
| 1        | Design system, modo claro/oscuro y datos.               |
| 2        | Layout y secciones de contenido + SEO base.             |
| 3        | Mapa interactivo, formulario y CSP.                     |
| 4        | Motion y microinteracciones (GSAP + Lenis).             |
| 5        | Imágenes y optimización visual.                         |
| 6        | QA, accesibilidad, performance y README final.          |
| 7        | Deploy final, dominio y entrega.                        |

## Autor

**Juan Andrés** — Frontend Developer · [github.com/juanandrescj-dev](https://github.com/juanandrescj-dev)

## Licencia

[MIT](./LICENSE) © 2026 Juan Andrés.
