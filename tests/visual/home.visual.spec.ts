import { test, expect } from '@playwright/test';
import { gotoWithTheme } from '../helpers';

/**
 * Regresión visual de secciones estables (sin canvas ni relojes en vivo) en claro y oscuro.
 * `gotoWithTheme` emula movimiento reducido y, con `animations: 'disabled'` (config), las capturas
 * son deterministas. Las baselines se generan en Linux (CI / Docker) para casar con el runner;
 * ver README → "Regresión visual".
 */
for (const theme of ['light', 'dark'] as const) {
  test(`Hero — tema ${theme}`, async ({ page }) => {
    await gotoWithTheme(page, theme);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await page.evaluate(() => document.fonts.ready);
    const hero = page.locator('#inicio');
    await expect(hero).toBeVisible();
    await expect(hero).toHaveScreenshot(`hero-${theme}.png`);
  });

  test(`Combustibles — tema ${theme}`, async ({ page }) => {
    await gotoWithTheme(page, theme);
    await page.evaluate(() => document.fonts.ready);
    const combustibles = page.locator('#combustibles');
    await combustibles.scrollIntoViewIfNeeded();
    await expect(combustibles).toBeVisible();
    await expect(combustibles).toHaveScreenshot(`combustibles-${theme}.png`);
  });
}
