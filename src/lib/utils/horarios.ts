/**
 * horarios.ts — lógica de "¿abierto ahora?" a partir de los horarios del negocio.
 * Soporta días 24h, rangos normales (apertura < cierre) y rangos que cruzan medianoche
 * (overnight, p. ej. 18:00 → 02:00), incluyendo el arrastre de la madrugada del día anterior.
 *
 * El `Date` actual se inyecta como parámetro para que las pruebas sean deterministas.
 */

export interface DiaHorario {
  /** Clave estable del día: 'dom' | 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab'. */
  id: string;
  /** Etiqueta para mostrar: "Lunes". */
  dia: string;
  abierto24h: boolean;
  /** "HH:MM" (24h). Requerido si `abierto24h` es false. */
  apertura?: string;
  /** "HH:MM" (24h). Requerido si `abierto24h` es false. */
  cierre?: string;
}

export interface EstadoApertura {
  abierto: boolean;
  /** Texto compacto para el badge: "Abierto ahora · 24 horas", "Cerrado · abre 6:00 a. m." */
  etiqueta: string;
  /** Frase descriptiva para lectores de pantalla / detalle. */
  detalle: string;
}

/** getDay() devuelve 0=domingo … 6=sábado; este orden mapea ese índice a la clave del día. */
const DIA_IDS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'] as const;

/** Orden de presentación de la semana (lunes primero), para la tabla y el JSON-LD. */
const ORDEN_SEMANA = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];

/**
 * Ordena los horarios de lunes a domingo. `getCollection` los devuelve por id alfabético, así
 * que este sort es necesario para que la tabla y el openingHoursSpecification salgan en orden.
 */
export function ordenarSemana<T extends { id: string }>(horarios: T[]): T[] {
  return [...horarios].sort((a, b) => ORDEN_SEMANA.indexOf(a.id) - ORDEN_SEMANA.indexOf(b.id));
}

const aMinutos = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** "06:00" → "6:00 a. m." · "23:30" → "11:30 p. m." */
export function formatHora12(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const periodo = h < 12 ? 'a. m.' : 'p. m.';
  const hora12 = ((h + 11) % 12) + 1;
  return `${hora12}:${String(m).padStart(2, '0')} ${periodo}`;
}

/** ¿La ventana propia de `entry` (la que arranca ese mismo día) cubre `nowMin`? */
function abreEseDia(entry: DiaHorario, nowMin: number): boolean {
  if (entry.abierto24h) return true;
  if (!entry.apertura || !entry.cierre) return false;
  const a = aMinutos(entry.apertura);
  const c = aMinutos(entry.cierre);
  if (c > a) return nowMin >= a && nowMin < c; // rango normal, mismo día
  if (c < a) return nowMin >= a; // overnight: tramo de hoy [apertura, 24:00)
  return false; // apertura == cierre → indefinido, lo tratamos como cerrado
}

/** ¿Un día overnight del día ANTERIOR sigue abierto en esta madrugada? */
function arrastreDeAyer(entry: DiaHorario, nowMin: number): boolean {
  if (entry.abierto24h || !entry.apertura || !entry.cierre) return false;
  const a = aMinutos(entry.apertura);
  const c = aMinutos(entry.cierre);
  return c < a && nowMin < c; // overnight: tramo [00:00, cierre) que pertenece a ayer
}

function buscar(horarios: DiaHorario[], id: string): DiaHorario | undefined {
  return horarios.find((h) => h.id === id);
}

/** Próxima apertura a partir de "ahora" (para el mensaje de "Cerrado · abre …"). */
function proximaApertura(
  horarios: DiaHorario[],
  ahora: Date,
): { dia: string; hora: string; esHoy: boolean } | null {
  const startIdx = ahora.getDay();
  const nowMin = ahora.getHours() * 60 + ahora.getMinutes();
  // 1. ¿Abre aún MÁS TARDE hoy? (tiene prioridad sobre los días siguientes)
  const hoy = buscar(horarios, DIA_IDS[startIdx]);
  if (hoy && !hoy.abierto24h && hoy.apertura && aMinutos(hoy.apertura) > nowMin) {
    return { dia: hoy.dia, hora: hoy.apertura, esHoy: true };
  }
  // 2. Próximos días (mañana en adelante)
  for (let d = 1; d <= 7; d++) {
    const entry = buscar(horarios, DIA_IDS[(startIdx + d) % 7]);
    if (!entry) continue;
    if (entry.abierto24h) return { dia: entry.dia, hora: '00:00', esHoy: false };
    if (entry.apertura) return { dia: entry.dia, hora: entry.apertura, esHoy: false };
  }
  return null;
}

export function estaAbiertoAhora(horarios: DiaHorario[], ahora: Date = new Date()): EstadoApertura {
  const idx = ahora.getDay();
  const hoy = buscar(horarios, DIA_IDS[idx]);
  const ayer = buscar(horarios, DIA_IDS[(idx + 6) % 7]);
  const nowMin = ahora.getHours() * 60 + ahora.getMinutes();

  const abiertoHoy = hoy ? abreEseDia(hoy, nowMin) : false;
  const abiertoArrastre = ayer ? arrastreDeAyer(ayer, nowMin) : false;
  const abierto = abiertoHoy || abiertoArrastre;

  if (abierto && hoy?.abierto24h) {
    return {
      abierto: true,
      etiqueta: 'Abierto ahora · 24 horas',
      detalle: 'Estamos abiertos las 24 horas, todos los días.',
    };
  }

  if (abierto) {
    const cierre = abiertoHoy ? hoy?.cierre : ayer?.cierre;
    const sufijo = cierre ? ` · cierra ${formatHora12(cierre)}` : '';
    return {
      abierto: true,
      etiqueta: `Abierto ahora${sufijo}`,
      detalle: cierre ? `Abierto ahora. Cierra a las ${formatHora12(cierre)}.` : 'Abierto ahora.',
    };
  }

  const prox = proximaApertura(horarios, ahora);
  if (prox) {
    const cuando = prox.esHoy ? 'hoy' : prox.dia.toLowerCase();
    const hora = formatHora12(prox.hora);
    return {
      abierto: false,
      etiqueta: `Cerrado · abre ${hora}`,
      detalle: `Cerrado ahora. Abre ${cuando} a las ${hora}.`,
    };
  }

  return { abierto: false, etiqueta: 'Cerrado', detalle: 'Cerrado ahora.' };
}
