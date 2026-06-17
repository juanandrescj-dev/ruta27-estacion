/**
 * site.ts — constantes globales del sitio (URL, locale, textos por defecto).
 * Fuente única para SEO/metadatos. El SEO completo (OG, JSON-LD) llega en la Fase 2.
 */
export const SITE = {
  url: 'https://ruta27-estacion.pages.dev',
  name: 'Ruta 27',
  titleDefault: 'Ruta 27 — Estación de Servicio',
  description:
    'Estación de servicio en la Autopista Duarte (Santiago, RD). Abierta 24/7: gasolina y ' +
    'gasoil de calidad certificada, tienda de conveniencia y el mejor servicio de la zona.',
  locale: 'es-DO',
  lang: 'es-DO',
} as const;
