import { describe, it, expect } from 'vitest';
import { formatRD, formatPrecioGalon, formatFechaLarga } from './format';

describe('formatRD', () => {
  it('formatea con dos decimales y prefijo RD$', () => {
    expect(formatRD(290.1)).toBe('RD$290.10');
  });

  it('agrupa miles al estilo es-DO (coma miles, punto decimal)', () => {
    expect(formatRD(1234.5)).toBe('RD$1,234.50');
    expect(formatRD(1000000)).toBe('RD$1,000,000.00');
  });

  it('redondea a dos decimales', () => {
    expect(formatRD(247.205)).toBe('RD$247.21');
  });

  it('degrada con guion ante valores no finitos', () => {
    expect(formatRD(Number.NaN)).toBe('RD$—');
    expect(formatRD(Infinity)).toBe('RD$—');
  });
});

describe('formatPrecioGalon', () => {
  it('añade la unidad "/ galón"', () => {
    expect(formatPrecioGalon(290.1)).toBe('RD$290.10 / galón');
  });
});

describe('formatFechaLarga', () => {
  it('formatea una fecha ISO en español largo', () => {
    expect(formatFechaLarga('2026-06-14')).toBe('14 de junio de 2026');
  });

  it('no retrocede un día por zona horaria (se ancla a mediodía UTC)', () => {
    expect(formatFechaLarga('2026-01-01')).toBe('1 de enero de 2026');
  });

  it('acepta un objeto Date', () => {
    expect(formatFechaLarga(new Date('2026-12-25T12:00:00Z'))).toBe('25 de diciembre de 2026');
  });

  it('devuelve cadena vacía ante una fecha inválida', () => {
    expect(formatFechaLarga('no-es-fecha')).toBe('');
  });
});
