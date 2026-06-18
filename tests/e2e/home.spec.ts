import { test, expect } from '@playwright/test';
import { SECTION_IDS } from '../helpers';

/** Recorre la página de arriba abajo para disparar islas (`client:visible`) y contenido lazy. */
async function scrollThrough(page: import('@playwright/test').Page): Promise<void> {
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
}

test.describe('Home', () => {
  test('carga sin excepciones ni errores de consola propios', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      // Se ignora el ruido de red de servicios externos (tiles del mapa, Web3Forms) y de
      // recursos sueltos: no son bugs del sitio. Los errores de JS propios sí cuentan.
      if (/openfreemap|web3forms|favicon|Failed to load resource|net::|ERR_/i.test(text)) return;
      errors.push(`console.error: ${text}`);
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/Ruta 27/);
    await scrollThrough(page);
    await page.waitForTimeout(800);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('un solo h1 y todas las secciones del embudo presentes', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText('Santiago');
    for (const id of SECTION_IDS) {
      await expect(page.locator(`#${id}`), `falta la sección #${id}`).toBeAttached();
    }
    await expect(page.locator('main#main')).toBeVisible();
    await expect(page.locator('body > footer')).toBeAttached();
  });

  test('el skip-link recibe foco al tabular y apunta al contenido', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.locator('a.skip-link');
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute('href', '#main');
  });

  test('el disclaimer de demo está visible en el footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body > footer')).toContainText(/marca ficticia/i);
  });
});

test.describe('Navegación', () => {
  test('escritorio: los enlaces de ancla apuntan a secciones existentes', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'navegación de escritorio');
    await page.goto('/');
    const links = page.locator('header nav[aria-label="Principal"] a');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(6);
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toMatch(/^#/);
      await expect(page.locator(href!)).toBeAttached();
    }
  });

  test('móvil: el menú abre, mueve el foco al panel y cierra con Escape', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'menú móvil');
    await page.goto('/');
    const trigger = page.getByRole('button', { name: /abrir el menú/i });
    await expect(trigger).toBeVisible();

    const dialog = page.getByRole('dialog', { name: 'Navegación' });
    // `toPass` tolera el retardo de hidratación de la isla `client:idle`: si el clic ocurre
    // antes de hidratar no abre nada y se reintenta hasta que el panel aparece.
    await expect(async () => {
      await trigger.click();
      await expect(dialog).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10000 });
    // El primer foco entra al panel (botón de cierre).
    await expect(dialog.getByRole('button', { name: /cerrar el menú/i })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    // El foco vuelve al disparador (retorno de foco).
    await expect(trigger).toBeFocused();
  });
});
