---
name: playwright-mcp
description: >
  Motor de pruebas visuales y funcionales potentes del sitio "Ruta 27" con Playwright MCP
  (@playwright/mcp de Microsoft, 100% local, SIN API key). Navega, interactua, captura
  screenshots multi-viewport, inspecciona consola/red, hace aserciones, traza performance,
  graba video y alterna tema claro/oscuro. Es el MOTOR que usan las skills
  responsive-audit, qa-visual-playwright y quality-audit.
  TRIGGER when: el usuario diga «prueba el sitio», «haz un smoke test», «captura la vista X»,
  «verifica el menu movil / el toggle de tema / el formulario / el mapa», «toma screenshots en
  varios tamanos», «revisa errores de consola o requests», «mide performance», o cualquier
  prueba E2E/visual del frontend.
user-invocable: true
---

# Ruta 27 — Pruebas con Playwright MCP (motor)

Esta skill explota **Playwright MCP** (servidor `@playwright/mcp` de Microsoft) para probar el
sitio de Ruta 27 sin limitaciones. Es 100% local, **no requiere API key** ni cuenta cloud.
Ruta 27 es un sitio **estático y público** (sin login), así que NO hay flujos de autenticación:
el foco es UI, responsividad, **modo claro/oscuro**, consola/red, performance e interacción
(menú móvil, toggle de tema, FAQ `<details>`, formulario, mapa).

## Cuándo usar

- Smoke tests de las rutas (`/`, `/styleguide`, y en fases siguientes secciones y `/404`).
- Capturas deterministas, multi-viewport y en **ambos temas** (`data-theme="light|dark"`).
- Regresión visual (antes/después de un cambio de UI).
- Inspección de errores de consola y requests de red (mapa MapLibre, fuentes, Web3Forms).
- Aserciones automáticas (texto/elemento visible, valor de input).
- Performance (traces) y grabación de video de una interacción.
- Sirve como **motor de capturas** de `responsive-audit` y `qa-visual-playwright`.

## Requisitos previos

1. **El sitio debe estar corriendo.** Dos modos:
   - Desarrollo: `pnpm dev` → **http://localhost:4321**.
   - Build real (para probar CSP del mapa, `_headers`, preview): `pnpm build && pnpm preview` → **http://localhost:4321**.
     Espera a que responda antes de navegar (`browser_wait_for` o navega y verifica).
2. **Navegador:** Playwright MCP descarga Chromium automáticamente en el primer uso. Si aparece
   _"browser is not installed"_, ejecuta una vez: `pnpm exec playwright install chromium`.
3. **Reinicio:** si acabas de cambiar `.mcp.json`, Claude Code debe reiniciarse para que
   `mcp__playwright__*` aparezca. Verifica con `/mcp`.

## Configuración del servidor (ya aplicada en `.mcp.json`)

```json
"playwright": {
  "command": "cmd",
  "args": ["/c", "npx", "-y", "@playwright/mcp@latest",
    "--caps", "vision,pdf,devtools,testing",
    "--viewport-size", "1440x900",
    "--save-session",
    "--output-dir", "./.playwright-mcp"]
}
```

| Flag                                                | Para qué                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| `cmd /c npx`                                        | Forma **Windows** (evita el bug de `npx` directo en MCP, issue #1540).   |
| `--caps vision,pdf,devtools,testing`                | Habilita capabilities extra (ver tabla). `core` siempre activo.          |
| `--viewport-size 1440x900`                          | Viewport inicial; se cambia en runtime con `browser_resize`.             |
| `--save-session` + `--output-dir ./.playwright-mcp` | Guarda sesión y artefactos (carpeta ya gitignored).                      |
| `--isolated`                                        | (opcional) Perfil limpio en memoria por sesión → pruebas reproducibles.  |
| `--headless`                                        | (NO puesto) Corre **headed** (ventana visible). Añádelo para background. |

## Tools disponibles (aparecen como `mcp__playwright__<tool>`)

**CORE (siempre activa):**
| Tool | Uso |
|---|---|
| `browser_navigate` / `browser_navigate_back` | Ir a una URL / volver. |
| `browser_snapshot` | **Árbol de accesibilidad** con `ref`s. Úsalo ANTES de click/type (no adivines selectores). |
| `browser_take_screenshot` | PNG/JPEG. Soporta `fullPage`, elemento por `ref`, `filename`. |
| `browser_click` / `browser_hover` / `browser_drag` / `browser_drop` | Interacciones por `ref`. |
| `browser_type` / `browser_fill_form` / `browser_select_option` / `browser_press_key` | Entrada de datos. |
| `browser_wait_for` | Espera por texto/condición (evita esperas frágiles por tiempo). |
| `browser_console_messages` | Mensajes de consola (errores, warnings de hidratación de islas). |
| `browser_network_requests` / `browser_network_request` | Requests / detalle (status 4xx/5xx, lentos). |
| `browser_evaluate` | Evalúa una función sobre la página/elemento (lectura segura del DOM; ideal para cambiar `data-theme`). |
| `browser_run_code_unsafe` | JS arbitrario. **Cuidado**: solo cuando `browser_evaluate` no alcanza. |
| `browser_tabs` / `browser_handle_dialog` / `browser_file_upload` / `browser_close` | Pestañas, diálogos, archivos, cerrar. |

**TESTING (`--caps testing`):** `browser_verify_element_visible`, `browser_verify_list_visible`, `browser_verify_text_visible`, `browser_verify_value`, `browser_generate_locator` → aserciones explícitas.

**DEVTOOLS (`--caps devtools`):** `browser_start_tracing`/`browser_stop_tracing`, `browser_start_video`/`browser_stop_video`, `browser_highlight`/`browser_annotate`.

**VISION (`--caps vision`):** `browser_mouse_click_xy`, `browser_mouse_move_xy`, `browser_mouse_wheel`… → clicks por coordenadas (útil para el mapa/canvas MapLibre).

**PDF (`--caps pdf`):** `browser_pdf_save`.

## Recetas

### 1. Smoke test de una ruta

```
browser_navigate → http://localhost:4321/
browser_snapshot                 // estructura + refs
browser_console_messages         // confirmar 0 errores
browser_take_screenshot          // evidencia
```

### 2. Probar el modo claro/oscuro (clave en este proyecto)

```
browser_navigate → /
browser_take_screenshot (filename: home-light.png)
browser_evaluate → () => document.documentElement.setAttribute('data-theme','dark')
browser_wait_for (breve, por el repaint)
browser_take_screenshot (filename: home-dark.png)
```

> Verifica que NO haya flash de tema al cargar (anti-FOUC) y que el contraste pase en ambos.

### 3. Captura multi-viewport (insumo de responsividad)

Para cada ancho: `browser_resize` → `browser_take_screenshot (fullPage)`.
Anchos recomendados: **360, 375, 390, 414, 768, 1024, 1280, 1440**.

> `browser_resize` solo cambia el tamaño. Para **fidelidad de dispositivo** (DPR, touch, UA móvil)
> usa la emulación de `chrome-devtools` (ver `responsive-audit`).

### 4. Interacciones del sitio

- **Menú móvil** (isla React): resize a 375 → `browser_click` en el botón → verificar foco/Escape.
- **Toggle de tema** (isla React): `browser_click` → confirmar `data-theme` y persistencia.
- **FAQ** `<details>`: `browser_click` en `<summary>` → `browser_verify_text_visible`.
- **Formulario** (Web3Forms, Fase 3): `browser_fill_form` → `browser_click` enviar → `aria-live`.
- **Mapa** (MapLibre, Fase 3): esperar carga, `browser_console_messages` (CSP), captura.

### 5. Consola y red

```
browser_console_messages   // errores JS, warnings de hidratación
browser_network_requests   // 4xx/5xx, fuentes woff2, tiles del mapa, envío del form
```

### 6. Performance / video

- Video de una interacción: `browser_start_video` … acciones … `browser_stop_video`.
- Trace de Playwright: `browser_start_tracing` … `browser_stop_tracing`.
- Para **Core Web Vitals** (LCP/CLS/INP) usa mejor `chrome-devtools` (`performance_start_trace`), ver `perf-a11y-gate` / `responsive-audit`.

## Buenas prácticas

- **Snapshot antes de interactuar:** `browser_snapshot` da `ref`s estables.
- **Esperas deterministas:** `browser_wait_for` por texto/estado, nunca esperas fijas.
- **Evidencia siempre:** screenshots a `./.playwright-mcp` (o `qa-screenshots/` para QA).
- **Ambos temas:** cualquier captura de UI se hace en claro Y oscuro.
- **Cierra el ciclo:** tras un cambio de UI, repite captura y compara antes/después.
- **Build real para CSP/mapa:** el mapa y `_headers` se prueban en `pnpm build && pnpm preview`, no solo en dev.

## NO hacer

- NO asumir API key/login: es local, gratis y el sitio es público.
- NO usar `browser_run_code_unsafe` cuando `browser_evaluate` basta.
- NO mezclar separadores: `--caps` por comas; las origins (si se usan) por punto y coma.
- NO confundir el paquete oficial `@playwright/mcp` con clones (`playwright-mcp` a secas).
- NO probar sin el sitio levantado (`pnpm dev` o `pnpm preview`).

## Integración

- `responsive-audit` y `qa-visual-playwright` usan esta skill como motor de capturas/regresión.
- `quality-audit` la invoca para validar flujos reales.
- `perf-a11y-gate` complementa con Lighthouse/axe (vía `chrome-devtools`).
