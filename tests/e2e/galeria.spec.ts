import { test, expect } from '@playwright/test';

// Movimiento reducido: el grid vive en un `data-reveal-group` (GSAP lo oculta con autoAlpha
// hasta animar); con `reduce` queda visible y los disparadores son operables de inmediato.
// Se usa `emulateMedia` (no `test.use`, que no propaga la emulación en este proyecto).
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('Galería · lightbox accesible', () => {
  test('abre con teclado, navega con flechas y cierra con Escape devolviendo el foco', async ({
    page,
  }) => {
    await page.goto('/#galeria');
    const firstTrigger = page.locator('[data-lightbox-trigger]').first();
    await firstTrigger.scrollIntoViewIfNeeded();
    await firstTrigger.focus();
    await page.keyboard.press('Enter');

    const dialog = page.locator('#galeria-lightbox');
    await expect(dialog).toBeVisible();
    // El foco entra en el diálogo, en el botón de cierre (punto de entrada predecible).
    await expect(dialog.locator('[data-lb-close]')).toBeFocused();

    const counter = dialog.locator('[data-lb-counter]');
    await expect(counter).toHaveText(/^1 \/ \d+$/);
    await page.keyboard.press('ArrowRight');
    await expect(counter).toHaveText(/^2 \/ \d+$/);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(firstTrigger).toBeFocused();
  });
});
