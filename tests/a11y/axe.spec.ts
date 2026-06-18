import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gotoWithTheme } from '../helpers';

/**
 * Cero violaciones WCAG 2.2 AA en AMBOS temas (§9.4). `gotoWithTheme` emula
 * `prefers-reduced-motion: reduce`, de modo que los scroll-reveals quedan visibles (sin el
 * `autoAlpha:0`/`visibility:hidden` de GSAP) y axe evalúa TODA la página, no solo lo ya animado.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function loadDeferred(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let y = 0;
        const step = () => {
          window.scrollTo(0, y);
          y += window.innerHeight;
          if (y < document.body.scrollHeight) requestAnimationFrame(step);
          else {
            window.scrollTo(0, 0);
            resolve();
          }
        };
        step();
      }),
  );
  // Mejor esfuerzo: dar tiempo al mapa a inicializar (no bloquea si la red externa tarda).
  await page.locator('#ubicacion').scrollIntoViewIfNeeded();
  await page
    .getByText('Cargando mapa interactivo', { exact: false })
    .waitFor({ state: 'hidden', timeout: 8000 })
    .catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 0));
}

for (const theme of ['light', 'dark'] as const) {
  test(`sin violaciones WCAG 2.2 AA — tema ${theme}`, async ({ page }) => {
    await gotoWithTheme(page, theme);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await loadDeferred(page);

    const results = await new AxeBuilder({ page })
      .withTags(TAGS)
      // El canvas y los controles de MapLibre son de terceros (sin texto propio); se excluyen
      // del barrido para no auditar markup que no controlamos.
      .exclude('.maplibregl-map')
      .analyze();

    const resumen = results.violations
      .map(
        (v) =>
          `• [${v.impact}] ${v.id}: ${v.help}\n    nodos: ${v.nodes
            .map((n) => n.target.join(' '))
            .join('\n           ')}`,
      )
      .join('\n');

    expect(results.violations, `Violaciones axe (tema ${theme}):\n${resumen}`).toEqual([]);
  });
}
