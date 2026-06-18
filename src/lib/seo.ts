/**
 * seo.ts — metadatos y datos estructurados (JSON-LD) del sitio (§9.3).
 * ─────────────────────────────────────────────────────────────────────────────────────
 * Genera el bloque `GasStation` y el `FAQPage` a partir de los MISMOS datos que pinta la UI
 * (estacion.yaml, horarios.yaml, faq.yaml). Así el dato estructurado y el visible nunca se
 * desincronizan: el `openingHoursSpecification` se deriva de los horarios reales, y el
 * `FAQPage` de las mismas preguntas del acordeón.
 */
import type { DiaHorario } from './utils/horarios';

/** Forma mínima del registro de estación que necesita el SEO (subconjunto de estacion.yaml). */
export interface EstacionSEO {
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  geo: { lat: number; lng: number };
  redes: Record<string, string>;
}

/** Une un path con el `site` para obtener una URL absoluta (OG, canonical, JSON-LD). */
export function absoluteUrl(path: string, site: string | URL | undefined): string {
  const base = site ? new URL(site).origin : '';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Mapea la clave de día de horarios.yaml al nombre de día de schema.org. */
const DIA_SCHEMA: Record<string, string> = {
  lun: 'Monday',
  mar: 'Tuesday',
  mie: 'Wednesday',
  jue: 'Thursday',
  vie: 'Friday',
  sab: 'Saturday',
  dom: 'Sunday',
};

interface OpeningHours {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

/** Orden canónico de la semana (lunes primero) para presentar dayOfWeek de forma estable. */
const ORDEN_DIAS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Construye `openingHoursSpecification` a partir de los horarios, agrupando los días que
 * comparten el mismo tramo. Para un día 24h se emite `opens === closes === '00:00'`, que es la
 * forma canónica de schema.org/Google para "abierto las 24 horas" (un rango 00:00–23:59 dejaría
 * el negocio técnicamente cerrado el último minuto).
 */
export function buildOpeningHours(horarios: DiaHorario[]): OpeningHours[] {
  const grupos = new Map<string, OpeningHours>();
  for (const h of horarios) {
    const dia = DIA_SCHEMA[h.id];
    if (!dia) continue;
    const opens = h.abierto24h ? '00:00' : (h.apertura ?? '00:00');
    const closes = h.abierto24h ? '00:00' : (h.cierre ?? '23:59');
    const clave = `${opens}-${closes}`;
    const existente = grupos.get(clave);
    if (existente) existente.dayOfWeek.push(dia);
    else
      grupos.set(clave, { '@type': 'OpeningHoursSpecification', dayOfWeek: [dia], opens, closes });
  }
  const specs = [...grupos.values()];
  for (const s of specs) {
    s.dayOfWeek.sort((a, b) => ORDEN_DIAS.indexOf(a) - ORDEN_DIAS.indexOf(b));
  }
  return specs;
}

/** Descompone la dirección "calle, localidad, país" en una PostalAddress de schema.org. */
function postalAddress(direccion: string) {
  const partes = direccion.split(',').map((s) => s.trim());
  return {
    '@type': 'PostalAddress' as const,
    streetAddress: partes[0] ?? direccion,
    addressLocality: partes[1] ?? 'Santiago de los Caballeros',
    addressRegion: 'Santiago',
    postalCode: '51000',
    addressCountry: 'DO',
  };
}

/**
 * JSON-LD `@type: GasStation` con dirección, teléfono, geo, horarios (coincidentes con
 * horarios.yaml), rango de precio y redes (`sameAs`, sin placeholders "#").
 */
export function buildGasStationJsonLd(opts: {
  estacion: EstacionSEO;
  horarios: DiaHorario[];
  site: string | URL | undefined;
  imagePath: string;
}): string {
  const { estacion, horarios, site, imagePath } = opts;
  const sameAs = Object.values(estacion.redes ?? {}).filter((u) => u && u !== '#');

  const data = {
    '@context': 'https://schema.org',
    '@type': 'GasStation',
    name: `${estacion.nombre} — Estación de Servicio`,
    description: estacion.descripcion,
    url: absoluteUrl('/', site),
    image: absoluteUrl(imagePath, site),
    telephone: estacion.telefono,
    // priceRange: indicador relativo de coste según convención de Google ('$$' = gama media).
    // La moneda concreta va en currenciesAccepted ('DOP').
    priceRange: '$$',
    currenciesAccepted: 'DOP',
    paymentAccepted: 'Efectivo, Tarjeta de débito, Tarjeta de crédito',
    address: postalAddress(estacion.direccion),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: estacion.geo.lat,
      longitude: estacion.geo.lng,
    },
    openingHoursSpecification: buildOpeningHours(horarios),
    ...(sameAs.length ? { sameAs } : {}),
  };

  return JSON.stringify(data);
}

/** JSON-LD `@type: FAQPage` a partir de las mismas preguntas del acordeón visible. */
export function buildFaqJsonLd(faq: { pregunta: string; respuesta: string }[]): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: f.respuesta },
    })),
  };
  return JSON.stringify(data);
}
