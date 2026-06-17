/**
 * site.ts — constantes globales del sitio (URL, locale, textos y SEO por defecto).
 * Fuente única para SEO/metadatos: BaseLayout y lib/seo.ts leen de aquí.
 */
export const SITE = {
  url: 'https://ruta27-estacion.pages.dev',
  name: 'Ruta 27',
  titleDefault: 'Ruta 27 — Estación de Servicio en la Autopista Duarte, Santiago',
  description:
    'Estación de servicio en la Autopista Duarte (Santiago, RD). Abierta 24/7: gasolina y ' +
    'gasoil de calidad certificada, tienda de conveniencia y el mejor servicio de la zona.',
  locale: 'es-DO',
  lang: 'es-DO',
  /** OG por defecto (1200×630). La imagen real de marca se genera en la Fase 5. */
  ogImage: '/og-image.jpg',
  ogImageAlt: 'Ruta 27 — Estación de Servicio en la Autopista Duarte, Santiago.',
} as const;
