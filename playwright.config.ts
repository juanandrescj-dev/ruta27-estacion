import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright (§4, §9.4 del plan). Tres proyectos:
 *  - `desktop` / `mobile`: pruebas funcionales (e2e) y de accesibilidad (axe) en dos viewports
 *     y en ambos temas. Ignoran los specs visuales.
 *  - `visual`: regresión visual por snapshots (claro/oscuro). Sus baselines se generan en
 *     Linux (CI / Docker) para que coincidan pixel a pixel con el runner de GitHub Actions;
 *     por eso `pnpm test:e2e` NO los corre (ver scripts) y se aíslan en su propio proyecto.
 *
 * Las pruebas se ejecutan contra el BUILD real (`pnpm preview`), no el dev server.
 */
const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;
const VISUAL = /\.visual\.spec\.ts$/;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  // Baselines visuales deterministas: ruta explícita bajo tests/visual, organizada por archivo,
  // con sufijo de plataforma (linux en CI/Docker) para no mezclar capturas de distintos SO.
  snapshotPathTemplate: 'tests/visual/__screenshots__/{testFileName}/{arg}-{platform}{ext}',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  expect: {
    // Tolerancia mínima al ruido de antialiasing; animaciones congeladas en cada captura.
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled', caret: 'hide' },
  },
  // Arranca el sitio compilado (build estático) para los tests.
  webServer: {
    command: 'pnpm preview',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: VISUAL,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 900 } },
    },
    {
      name: 'mobile',
      testIgnore: VISUAL,
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'visual',
      testMatch: VISUAL,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
});
