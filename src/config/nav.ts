/**
 * nav.ts — navegación del sitio (single-page). Fuente única para el Header (escritorio) y el
 * MenuMovil (isla React), para que ambos no se desincronicen.
 *
 * Solo se listan las secciones que existen en esta fase. Ubicación (#ubicacion) y Contacto
 * (#contacto) llegan en la Fase 3 (mapa + formulario) y se añadirán aquí entonces.
 */
export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Combustibles', href: '#combustibles' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Beneficios', href: '#beneficios' },
  { label: 'Horarios', href: '#horarios' },
  { label: 'Preguntas', href: '#faq' },
];

/** Enlace "Cómo llegar": indicaciones en Google Maps a partir de las coordenadas (geo). */
export function comoLlegarUrl(geo: { lat: number; lng: number }): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${geo.lat},${geo.lng}`;
}
