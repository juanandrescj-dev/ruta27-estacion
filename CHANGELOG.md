# Changelog

Todos los cambios notables de este proyecto se documentan aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## [Unreleased]

### Added

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
