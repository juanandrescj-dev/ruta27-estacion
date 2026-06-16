// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // `site` es OBLIGATORIO: sin él se rompen sitemap, canonical y OG absolutas (§9.3).
  site: 'https://ruta27-estacion.pages.dev',
  // Sitio 100% estático: SIN adapter. Cloudflare Pages sirve `dist/` directamente (§4, §12).
  output: 'static',
  // React solo para las islas interactivas (mapa, menú móvil, toggle de tema).
  integrations: [react()],
  vite: {
    // Tailwind v4 vía el plugin de Vite (NO @astrojs/tailwind, NO tailwind.config.js).
    plugins: [tailwindcss()],
  },
});
