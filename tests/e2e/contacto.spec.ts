import { test, expect } from '@playwright/test';

// Movimiento reducido: GSAP oculta los scroll-reveals con `autoAlpha:0` (visibility:hidden)
// hasta animarlos; con `reduce` quedan visibles y `fill`/`click` no esperan a una animación.
// Se usa `emulateMedia` (no `test.use`, que no propaga la emulación en este proyecto).
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('Formulario de contacto', () => {
  test('campos con label, autocomplete correcto y honeypot oculto', async ({ page }) => {
    await page.goto('/#contacto');
    await page.locator('#contacto').scrollIntoViewIfNeeded();

    await expect(page.locator('#form-name')).toHaveAttribute('autocomplete', 'name');
    await expect(page.locator('#form-email')).toHaveAttribute('autocomplete', 'email');
    await expect(page.locator('#form-phone')).toHaveAttribute('autocomplete', 'tel');

    for (const id of ['form-name', 'form-email', 'form-phone', 'form-message']) {
      await expect(page.locator(`label[for="${id}"]`), `falta <label for="${id}">`).toHaveCount(1);
    }

    const honeypot = page.locator('input[name="botcheck"]');
    await expect(honeypot).toBeHidden();
    await expect(honeypot).toHaveAttribute('tabindex', '-1');
  });

  test('envío correcto muestra confirmación accesible (Web3Forms mockeado)', async ({ page }) => {
    await page.route('https://api.web3forms.com/submit', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'ok' }),
      }),
    );

    await page.goto('/#contacto');
    await page.fill('#form-name', 'Test Usuario');
    await page.fill('#form-email', 'test@example.com');
    await page.fill('#form-message', 'Prueba de envío asíncrono para Ruta 27.');
    await page.click('#form-submit');

    const status = page.locator('#form-status');
    await expect(status).toBeVisible();
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).toHaveAttribute('aria-live', 'polite');
    await expect(status).toContainText(/enviado correctamente/i);
  });

  test('fallo del servidor muestra mensaje de error accesible (mock 500)', async ({ page }) => {
    await page.route('https://api.web3forms.com/submit', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'fail' }),
      }),
    );

    await page.goto('/#contacto');
    await page.fill('#form-name', 'Test');
    await page.fill('#form-email', 'a@b.com');
    await page.fill('#form-message', 'Mensaje de prueba para el caso de error.');
    await page.click('#form-submit');

    await expect(page.locator('#form-status')).toContainText(/error/i);
  });
});
