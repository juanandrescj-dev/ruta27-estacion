import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * `cn` — combina clases condicionales (clsx) y resuelve conflictos de Tailwind (tailwind-merge).
 * Útil para componentes con variantes: `cn('px-4 py-2', isActive && 'bg-brand', className)`.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
