import type { Page } from '@playwright/test';

/** Secciones del embudo (single-page), en el orden del DOM de index.astro (§9.1). */
export const SECTION_IDS = [
  'inicio',
  'combustibles',
  'servicios',
  'nosotros',
  'beneficios',
  'galeria',
  'ubicacion',
  'horarios',
  'faq',
  'contacto',
] as const;

/**
 * Navega fijando el tema vía localStorage ANTES de cargar, para que el script anti-FOUC
 * (`is:inline` de BaseLayout) lo aplique antes del primer paint — sin flash y de forma
 * determinista, sin depender de `prefers-color-scheme` del runner.
 *
 * Emula además `prefers-reduced-motion: reduce` con `page.emulateMedia` (NO con `test.use`,
 * que en este proyecto no propaga la emulación al `matchMedia` que lee el script de motion).
 * Así el script anti-FOUC no añade `motion-ready` y los scroll-reveals quedan VISIBLES
 * (sin `autoAlpha:0`/`visibility:hidden` de GSAP): axe evalúa toda la página y las capturas
 * visuales son deterministas.
 */
export async function gotoWithTheme(
  page: Page,
  theme: 'light' | 'dark',
  path = '/',
): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('theme', t);
    } catch {
      /* almacenamiento no disponible */
    }
  }, theme);
  await page.goto(path);
}
