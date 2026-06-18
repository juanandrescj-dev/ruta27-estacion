<!--
  Gracias por tu PR. Conventional Commits en el título (feat:, fix:, perf:, docs:, chore:, ci:,
  refactor:, test:, style:). Describe el QUÉ y el PORQUÉ, no solo el cómo.
-->

## Qué cambia

<!-- Resumen breve del cambio y su motivación. Enlaza la fase o el issue si aplica. -->

## Cómo probarlo

<!-- Pasos para verificar en local: rutas, secciones, interacciones, breakpoints. -->

```bash
pnpm install && pnpm dev
```

## Capturas

<!-- Antes/después en claro y oscuro (móvil + escritorio) si hay cambios de UI. -->

|            | Claro | Oscuro |
| ---------- | ----- | ------ |
| Móvil      |       |        |
| Escritorio |       |        |

## Checklist

- [ ] **Conventional Commits** y rama por fase/tema (sin «initial commit» gigante).
- [ ] `pnpm lint`, `pnpm format:check` y `pnpm typecheck` pasan.
- [ ] `pnpm test`, `pnpm test:e2e` (e2e + axe) pasan; regresión visual sin diffs inesperados.
- [ ] **Accesibilidad WCAG 2.2 AA** verificada en **ambos temas** (contraste, foco, teclado).
- [ ] **Sin colores hardcodeados** fuera de `src/styles/tokens.css`.
- [ ] **Dark mode** correcto (`@theme inline` presente, sin FOUC) y `prefers-reduced-motion` respetado.
- [ ] **Anti-IA**: nada que «pudiera salir por defecto de un generador» (paleta, tipografía,
      asimetría, microcopy dominicano, iconos de línea — ver `CLAUDE.md` §3).
- [ ] Sin errores de consola; Lighthouse dentro del presupuesto si tocaste perf/imágenes/JS.
- [ ] Disclaimer de demo intacto (footer) si tocaste el footer o el contenido.
