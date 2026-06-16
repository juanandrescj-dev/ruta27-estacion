---
name: perf-a11y-gate
description: >-
  Gate de performance y accesibilidad para "Ruta 27". Úsala antes de un PR/deploy para
  medir Lighthouse (vía MCP de Chrome DevTools) y accesibilidad con axe en AMBOS temas,
  comparar contra el presupuesto Core Web Vitals del plan (§9.4/§9.5), proponer y aplicar
  fixes, y re-auditar hasta cumplir. Cierra el loop de "se ve bien Y mide bien".
---

# Gate de performance + accesibilidad (Ruta 27)

Requiere el **MCP de Chrome DevTools** (Lighthouse, traces) y, para a11y, axe
(`@axe-core/playwright` en tests o el MCP de Playwright). Prueba sobre el **build real**
(`pnpm build && pnpm preview`), no solo `dev`.

## Presupuesto (objetivo p75, móvil)

| Métrica                   | Umbral                       |
| ------------------------- | ---------------------------- |
| Lighthouse Performance    | ≥ 90                         |
| Lighthouse Accessibility  | ≥ 95                         |
| Lighthouse SEO            | ≥ 95                         |
| LCP                       | < 2.5 s                      |
| INP                       | < 200 ms                     |
| CLS                       | < 0.1                        |
| Violaciones axe (WCAG AA) | **0**, en claro **y** oscuro |

## Procedimiento

1. **Build + preview** y arranca Chrome para el MCP de DevTools.
2. **Lighthouse móvil** sobre la(s) ruta(s) clave; registra Performance/A11y/SEO y CWV.
3. **axe en ambos temas**: ejecuta el análisis con `data-theme="light"` y `="dark"`.
   Presta atención al **contraste del ámbar** (usa `--accent-text` para texto pequeño) y
   al dark mode (suele fallar contraste).
4. **Diagnostica** cada métrica/violación fuera de umbral con un trace si hace falta
   (LCP element, long tasks, CLS shifts).
5. **Aplica fixes** concretos (preload de fuente del hero, `width/height` en imágenes,
   `loading`/`fetchpriority`, reducir JS de islas, corregir labels/roles/contraste) y
   **re-audita** hasta que todo esté en verde.

## Salida

Tabla `| Métrica | Valor | Umbral | Estado |` + lista de violaciones axe (tema, regla,
nodo) con su fix. Si algo no cumple tras los fixes, dilo explícitamente y propone el
siguiente paso; no reportes verde sin la medición que lo respalde.
