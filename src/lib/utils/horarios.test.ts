import { describe, it, expect } from 'vitest';
import { estaAbiertoAhora, formatHora12, type DiaHorario } from './horarios';

const DIAS: { id: string; dia: string }[] = [
  { id: 'dom', dia: 'Domingo' },
  { id: 'lun', dia: 'Lunes' },
  { id: 'mar', dia: 'Martes' },
  { id: 'mie', dia: 'Miércoles' },
  { id: 'jue', dia: 'Jueves' },
  { id: 'vie', dia: 'Viernes' },
  { id: 'sab', dia: 'Sábado' },
];

/** Construye un horario uniforme (los 7 días iguales) para que el día de la semana no importe. */
function uniforme(extra: Omit<DiaHorario, 'id' | 'dia'>): DiaHorario[] {
  return DIAS.map((d) => ({ ...d, ...extra }));
}

// Constructor local (año, mesIndex, día, hora, min): los componentes coinciden con lo pasado
// sin importar la zona horaria del runner de CI.
const at = (y: number, m: number, d: number, h: number, min = 0) => new Date(y, m - 1, d, h, min);

describe('formatHora12', () => {
  it('convierte 24h a 12h con periodo en español', () => {
    expect(formatHora12('06:00')).toBe('6:00 a. m.');
    expect(formatHora12('00:00')).toBe('12:00 a. m.');
    expect(formatHora12('12:00')).toBe('12:00 p. m.');
    expect(formatHora12('23:30')).toBe('11:30 p. m.');
  });
});

describe('estaAbiertoAhora — 24/7', () => {
  const h = uniforme({ abierto24h: true });

  it('siempre está abierto con etiqueta de 24 horas', () => {
    const estado = estaAbiertoAhora(h, at(2026, 6, 17, 3, 15));
    expect(estado.abierto).toBe(true);
    expect(estado.etiqueta).toBe('Abierto ahora · 24 horas');
  });
});

describe('estaAbiertoAhora — horario comercial (06:00–22:00)', () => {
  const h = uniforme({ abierto24h: false, apertura: '06:00', cierre: '22:00' });

  it('abierto dentro del rango', () => {
    expect(estaAbiertoAhora(h, at(2026, 6, 17, 10, 0)).abierto).toBe(true);
  });

  it('justo en la apertura está abierto; justo en el cierre, cerrado', () => {
    expect(estaAbiertoAhora(h, at(2026, 6, 17, 6, 0)).abierto).toBe(true);
    expect(estaAbiertoAhora(h, at(2026, 6, 17, 22, 0)).abierto).toBe(false);
  });

  it('cerrado de madrugada → indica que abre HOY', () => {
    const estado = estaAbiertoAhora(h, at(2026, 6, 17, 5, 0));
    expect(estado.abierto).toBe(false);
    expect(estado.etiqueta).toBe('Cerrado · abre 6:00 a. m.');
    expect(estado.detalle).toContain('hoy');
  });

  it('cerrado de noche → indica que abre el día siguiente', () => {
    const estado = estaAbiertoAhora(h, at(2026, 6, 17, 23, 0));
    expect(estado.abierto).toBe(false);
    expect(estado.etiqueta).toBe('Cerrado · abre 6:00 a. m.');
    expect(estado.detalle).not.toContain('hoy');
  });

  it('abierto incluye la hora de cierre en la etiqueta', () => {
    expect(estaAbiertoAhora(h, at(2026, 6, 17, 10, 0)).etiqueta).toBe(
      'Abierto ahora · cierra 10:00 p. m.',
    );
  });
});

describe('estaAbiertoAhora — overnight (18:00–02:00)', () => {
  const h = uniforme({ abierto24h: false, apertura: '18:00', cierre: '02:00' });

  it('abierto en el tramo de la noche (después de la apertura)', () => {
    expect(estaAbiertoAhora(h, at(2026, 6, 17, 20, 0)).abierto).toBe(true);
  });

  it('abierto en la madrugada por ARRASTRE del día anterior', () => {
    expect(estaAbiertoAhora(h, at(2026, 6, 17, 1, 0)).abierto).toBe(true);
  });

  it('cerrado en el hueco diurno', () => {
    expect(estaAbiertoAhora(h, at(2026, 6, 17, 10, 0)).abierto).toBe(false);
  });

  it('justo en el cierre (02:00) ya está cerrado', () => {
    expect(estaAbiertoAhora(h, at(2026, 6, 17, 2, 0)).abierto).toBe(false);
  });
});

describe('estaAbiertoAhora — datos incompletos', () => {
  it('sin entrada para el día → cerrado sin romper', () => {
    const soloLunes: DiaHorario[] = [{ id: 'lun', dia: 'Lunes', abierto24h: true }];
    const estado = estaAbiertoAhora(soloLunes, at(2026, 6, 17, 12, 0)); // 17 jun 2026 = miércoles
    expect(estado.abierto).toBe(false);
  });
});
