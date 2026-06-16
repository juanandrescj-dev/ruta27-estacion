---
name: component-scaffold
description: >-
  Crea componentes nuevos para "Ruta 27" siguiendo las convenciones del proyecto. Úsala
  cuando vayas a añadir un componente .astro (ui/sections/layout) o una isla React. Genera
  el archivo en la carpeta correcta, mobile-first, usando SOLO tokens (cero colores
  hardcodeados), con light/dark por tokens, semántica HTML correcta y estados
  hover/focus/active/disabled. Evita el "look IA" desde el primer commit.
---

# Scaffold de componentes (Ruta 27)

Genera componentes consistentes con el sistema de diseño y las reglas anti-IA. **No**
inventa estilos sueltos: todo sale de `src/styles/tokens.css`.

## Dónde va cada cosa

| Tipo                           | Carpeta                       | Ejemplos                                          |
| ------------------------------ | ----------------------------- | ------------------------------------------------- |
| Átomos/moléculas agnósticos    | `src/components/ui/`          | `Button`, `Card`, `Badge`, `Container`, `Eyebrow` |
| Iconos de dominio (SVG inline) | `src/components/ui/icons/`    | `Surtidor`, `Lavado`, `GLP`, `Aire`               |
| Secciones de la página         | `src/components/sections/`    | `Hero`, `Combustibles`, `Servicios`…              |
| Layout                         | `src/components/layout/`      | `Header`, `Nav`, `Footer`, `ThemeToggle`          |
| Islas interactivas (React)     | `src/components/interactive/` | `MapaInteractivo.tsx`, `MenuMovil.tsx`            |

## Reglas (obligatorias)

- **Astro por defecto.** React (`.tsx`) **solo** si necesita interactividad real; entonces
  hidrata con `client:visible`/`client:idle` (nunca `client:load` salvo el toggle de tema).
- **Nombres**: componentes/layouts en `PascalCase`; dominio en **español**
  (`Combustibles.astro`). Iconos de dominio a 24×24, `stroke-width: 1.75` (igualar a Lucide).
- **Solo tokens**: colores, espaciado, radios, sombras y tipografía vienen de tokens/Tailwind.
  **Cero hex/rgb hardcodeados.** Light/dark salen solos vía `data-theme` (no dupliques estilos).
- **Mobile-first**: estilos base para móvil, `min-width` para subir.
- **Semántica + a11y**: etiquetas correctas (`<button>` real, `<nav>`, `<section>` con
  encabezado), `:focus-visible` siempre, `alt`/`aria-*` donde toque, targets ≥ 24px.
- **Estados**: define `hover` / `focus-visible` / `active` / `disabled` con intención
  (botón sube 2px + sombra un nivel; link con subrayado que crece desde la izquierda).
- **Props tipadas** (TS) con `interface Props`; valores por defecto sensatos.
- **Motion**: solo `transform`/`opacity`; respeta `prefers-reduced-motion`.

## Procedimiento

1. Pregunta (o deduce) tipo, nombre y props del componente.
2. Crea el archivo en la carpeta correcta con la plantilla mínima (frontmatter/Props,
   markup semántico, clases Tailwind/tokens, estados).
3. Verifica que no haya colores hardcodeados ni emojis-icono.
4. Sugiere añadirlo al `/styleguide` (Fase 1) o a la sección que lo consume, y pasa
   `anti-ia-design-review` si aporta UI visible.
