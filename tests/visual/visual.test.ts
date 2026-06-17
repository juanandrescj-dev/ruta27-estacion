import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Asegurarse de que el directorio qa-screenshots exista
const screenshotsDir = path.join(process.cwd(), 'qa-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe('Visual QA - Mapa y Formulario', () => {
  // Ajustamos el timeout ya que la carga del mapa por primera vez puede demorar unos segundos
  test.setTimeout(30000);

  const breakpoints = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
  ];

  const themes = ['light', 'dark'] as const;

  for (const bp of breakpoints) {
    for (const theme of themes) {
      test(`Captura visual en ${bp.name} - tema ${theme}`, async ({ page }) => {
        // Establecer viewport
        await page.setViewportSize({ width: bp.width, height: bp.height });

        // Navegar a la página
        await page.goto('/');

        // Cambiar el tema directamente en el elemento html
        await page.evaluate((t) => {
          document.documentElement.dataset.theme = t;
        }, theme);

        // Esperar un momento para transiciones de tema
        await page.waitForTimeout(500);

        // --- VERIFICAR SECCIÓN UBICACIÓN Y MAPA ---
        const ubicacionSection = page.locator('#ubicacion');
        await expect(ubicacionSection).toBeVisible();

        // Scroll hasta el mapa para activar IntersectionObserver (rootMargin 200px)
        await ubicacionSection.scrollIntoViewIfNeeded();

        // Esperar a que el mapa termine de cargar (cuando el texto de carga ya no esté visible)
        const loadingText = page.locator('text=Cargando mapa interactivo...');
        await expect(loadingText).toBeHidden({ timeout: 15000 });

        // Hacer una pausa mínima para el renderizado final del canvas del mapa
        await page.waitForTimeout(1000);

        // Capturar sección de ubicación/mapa
        await ubicacionSection.screenshot({
          path: path.join(screenshotsDir, `ubicacion-${bp.name}-${theme}.png`),
        });

        // --- VERIFICAR SECCIÓN CONTACTO y FORMULARIO ---
        const contactoSection = page.locator('#contacto');
        await expect(contactoSection).toBeVisible();

        // Scroll al formulario
        await contactoSection.scrollIntoViewIfNeeded();

        // Verificar accesibilidad de los inputs del formulario
        const nameInput = page.locator('#form-name');
        const emailInput = page.locator('#form-email');
        const phoneInput = page.locator('#form-phone');
        const messageInput = page.locator('#form-message');
        const botcheckInput = page.locator('input[name="botcheck"]');

        await expect(nameInput).toBeVisible();
        await expect(nameInput).toHaveAttribute('autocomplete', 'name');
        await expect(emailInput).toBeVisible();
        await expect(emailInput).toHaveAttribute('autocomplete', 'email');
        await expect(phoneInput).toBeVisible();
        await expect(phoneInput).toHaveAttribute('autocomplete', 'tel');
        await expect(messageInput).toBeVisible();

        // Verificar que el honeypot no es enfocable y está oculto
        await expect(botcheckInput).toBeHidden();
        await expect(botcheckInput).toHaveAttribute('tabindex', '-1');

        // Capturar sección de contacto/formulario
        await contactoSection.screenshot({
          path: path.join(screenshotsDir, `contacto-${bp.name}-${theme}.png`),
        });
      });
    }
  }

  test('Envío exitoso de formulario de contacto (asíncrono)', async ({ page }) => {
    await page.goto('/');

    // Scroll a sección contacto
    const contactoSection = page.locator('#contacto');
    await contactoSection.scrollIntoViewIfNeeded();

    // Completar el formulario
    await page.fill('#form-name', 'Test Usuario');
    await page.fill('#form-email', 'test@example.com');
    await page.fill('#form-phone', '809-555-0123');
    await page.fill(
      '#form-message',
      'Esta es una prueba de envío asíncrono para Web3Forms en Ruta 27.',
    );

    // Interceptar la llamada a Web3Forms para simular una respuesta exitosa
    await page.route('https://api.web3forms.com/submit', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Form submitted successfully' }),
      });
    });

    // Enviar el formulario
    await page.click('#form-submit');

    // Verificar el mensaje de éxito accesible (aria-live)
    const statusDiv = page.locator('#form-status');
    await expect(statusDiv).toBeVisible();
    await expect(statusDiv).toHaveAttribute('aria-live', 'polite');
    await expect(statusDiv).toContainText('¡Gracias! Tu mensaje ha sido enviado correctamente.');
  });
});
