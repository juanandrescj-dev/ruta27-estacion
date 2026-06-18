import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * `cn` — combina clases condicionales (clsx) y resuelve conflictos de Tailwind (tailwind-merge).
 * Útil para componentes con variantes: `cn('px-4 py-2', isActive && 'bg-brand', className)`.
 *
 * IMPORTANTE: tailwind-merge no conoce los tokens custom de `tokens.css`. Por defecto clasifica
 * `text-body` (un FONT-SIZE del proyecto) y `text-on-accent` (un COLOR) en el MISMO grupo `text-*`
 * y, al fusionar, descarta el que aparece antes. Eso hacía que los `Button` perdieran
 * `text-on-accent`/`text-on-brand` (el color va antes que `text-body` en el merge) y el texto
 * cayera a `--ink` → contraste insuficiente sobre ámbar/verde. Registramos las escalas custom en
 * el grupo `font-size` para que convivan con los colores de texto.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['eyebrow', 'small', 'body', 'lead', 'h3', 'h2', 'h1', 'display'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
