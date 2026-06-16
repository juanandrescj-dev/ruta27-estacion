---
name: anti-ia-design-review
description: >-
  Audita una página de "Ruta 27" contra el catálogo de 14 "tells" de IA del plan (§3) y
  la checklist "no parece IA". Úsala antes de cada PR/deploy de una fase con UI. Recorre
  el código y/o los screenshots y reporta hallazgos clasificados por severidad; bloquea
  el PR si hay ≥1 hallazgo ALTO. Para sitios que deben verse hechos por un equipo de
  diseño real, no por un generador.
---

# Revisión anti-IA (Ruta 27)

La tesis del proyecto: un sitio se delata como IA cuando es _competente pero promedio_.
Regla mental: **"si esto pudiera salir por defecto de un generador, cámbialo"**. Esta
skill audita contra los 14 tells de §3 del plan.

## Cómo auditar

Revisa el código fuente (componentes, `tokens.css`, CSS) y, si hay, los screenshots de
`qa-visual-playwright`. Por cada ítem decide PASA / HALLAZGO y asigna severidad
**ALTO / MEDIO / BAJO**.

## Catálogo de 14 tells → antídoto

1. **Morado/índigo** → cero morado; verde-petróleo `#0E3B32` + ámbar `#F4A521`. (Gradientes solo intra-familia.)
2. **Inter / una sola fuente** → Clash Display + Switzer (dos voces con contraste).
3. **Todo centrado** → izquierda dominante; hero asimétrico 7/5; ≥50% secciones asimétricas.
4. **Hero con blob/orbe degradado** → foto real + numeración editorial "00 / Inicio".
5. **3 cards idénticas en grid de 3** → bento asimétrico, pesos visuales distintos.
6. **Emojis como iconos** → set de línea coherente (Lucide + SVG propios). Cero emojis.
7. **Glassmorphism en todo** → `backdrop-filter` solo navbar/modales; resto sólido + borde 1px.
8. **Sombras suaves uniformes** → 3 elevaciones direccionales con tinte verde. En dark, elevar = aclarar.
9. **Copys vacíos** ("Empower your business") → microcopy dominicano concreto (RD$, Autopista Duarte, 24/7).
10. **Spacing perezoso/uniforme** → ritmo vertical variable según importancia.
11. **Simetría total sin jerarquía** → escala modular agresiva; un elemento dominante por sección.
12. **Bordes pill en todo** → radios contenidos y variados (6/10–14/0px; pill solo badges).
13. **Stock genérica / IA plástica** → foto real curada + grano + duotono de marca.
14. **Cero textura, todo plano** → grano/ruido sutil (3–5%), líneas finas, numeración "01 → 06", un detalle humano.

## Checks adicionales

- **Ningún color hardcodeado** fuera de `tokens.css`.
- Dos fuentes con contraste; **Inter solo como fallback**.
- **Sin testimonios inventados.**
- Dark mode por **luminosidad**, no inversión; `@theme inline` presente.
- Historial Git incremental con Conventional Commits.

## Salida y gate

Tabla `| # | Tell | Estado | Severidad | Evidencia | Fix |`. Resume: nº de ALTOS/MEDIOS/
BAJOS. **Si hay ≥1 ALTO, marca el PR como BLOQUEADO** y lista los fixes mínimos para
desbloquear. Sé específico: cita archivo y línea/token.
