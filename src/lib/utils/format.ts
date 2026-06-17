/**
 * format.ts — formateadores localizados para República Dominicana (es-DO).
 * Mantiene la moneda y los números coherentes en toda la UI (precios de combustible, etc.).
 */

/** Formateador base: 2 decimales, agrupación de miles es-DO (coma miles, punto decimal). */
const nfDOP = new Intl.NumberFormat('es-DO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formatea un monto en pesos dominicanos con el prefijo "RD$".
 * Usamos prefijo manual (en vez de `style: 'currency'`) para un resultado estable y
 * predecible en cualquier ICU/runtime: `formatRD(290.1) → "RD$290.10"`,
 * `formatRD(1234.5) → "RD$1,234.50"`.
 */
export function formatRD(amount: number): string {
  if (!Number.isFinite(amount)) return 'RD$—';
  return `RD$${nfDOP.format(amount)}`;
}

/** Precio por galón, con la unidad: `formatPrecioGalon(290.1) → "RD$290.10 / galón"`. */
export function formatPrecioGalon(amount: number): string {
  return `${formatRD(amount)} / galón`;
}

/**
 * Fecha larga en español: `formatFechaLarga('2026-06-14') → "14 de junio de 2026"`.
 * Acepta `Date` o string ISO (`YYYY-MM-DD`). Se ancla a mediodía UTC para evitar que el
 * desfase de zona horaria "retroceda" un día al renderizar.
 */
export function formatFechaLarga(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(`${input}T12:00:00Z`) : input;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-DO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
