import { test, expect } from '@playwright/test';

test.describe('Tema claro/oscuro', () => {
  test('el toggle cambia a oscuro y la elección persiste tras recargar', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const toggle = page.getByRole('button', { name: /tema .* activo/i });
    await expect(toggle).toBeVisible();

    // Cicla hasta llegar a oscuro. `toPass` tolera el retardo de hidratación de la isla
    // `client:idle`: los clics previos a la hidratación no hacen nada y se reintenta; una vez
    // hidratada, el ciclo claro→oscuro→sistema alcanza "dark" en pocos clics.
    await expect(async () => {
      await toggle.click();
      await expect(html).toHaveAttribute('data-theme', 'dark', { timeout: 1000 });
    }).toPass({ timeout: 15000 });

    await expect(toggle).toHaveAttribute('aria-label', /oscuro activo/i);
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');

    // Tras recargar, el script anti-FOUC re-aplica "dark" antes del primer paint (sin flash)…
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    // …y el theme-color del chrome del navegador queda sincronizado con el tema elegido.
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0b1512');
  });
});
