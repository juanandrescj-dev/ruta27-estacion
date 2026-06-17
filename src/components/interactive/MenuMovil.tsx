import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * MenuMovil — isla React del menú de navegación en móvil (§9.4).
 * Un botón hamburguesa que abre un panel deslizante accesible:
 *  - `aria-expanded` / `aria-controls` en el disparador.
 *  - Cierre con Escape, con clic en el backdrop y al pulsar un enlace.
 *  - Trampa de foco (Tab cicla dentro del panel) y retorno del foco al disparador al cerrar.
 *  - Bloqueo del scroll del fondo mientras está abierto.
 * El grueso del sitio es estático; esta es una de las pocas islas (client:idle).
 */

interface NavItem {
  label: string;
  href: string;
}

interface Props {
  items: NavItem[];
  ctaHref: string;
  ctaLabel: string;
  class?: string;
}

function IconMenu() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3.5" y1="7" x2="20.5" y2="7" />
      <line x1="3.5" y1="12" x2="20.5" y2="12" />
      <line x1="3.5" y1="17" x2="20.5" y2="17" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

export default function MenuMovil({ items, ctaHref, ctaLabel, class: className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  // Bloqueo de scroll + foco inicial al abrir; al cerrar, devuelve el foco al disparador.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Enfoca el primer enlace del panel tras pintar.
    const firstLink = panelRef.current?.querySelector<HTMLElement>('a, button');
    firstLink?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  // Escape global + trampa de foco con Tab dentro del panel.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [close],
  );

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Abrir el menú de navegación"
        className="inline-flex size-10 items-center justify-center rounded-sm border border-line bg-surface text-ink shadow-1 transition duration-200 ease-spring hover:border-line-strong hover:text-brand motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0"
      >
        <IconMenu />
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          // El overlay se monta en <body> con un portal: si quedara dentro del <header> (que
          // usa backdrop-filter), ese filtro crearía un bloque contenedor y atraparía el
          // position:fixed dentro de los 72px del header. El portal lo evita.
          <div className="fixed inset-0 z-[60]" onKeyDown={onKeyDown} role="presentation">
            {/* Backdrop: clic para cerrar. El panel sí captura el foco/teclado. */}
            <button
              type="button"
              aria-label="Cerrar el menú"
              tabIndex={-1}
              onClick={close}
              className="absolute inset-0 size-full cursor-default bg-[color-mix(in_oklab,var(--color-carbon-950)_55%,transparent)] backdrop-blur-sm"
            />

            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Navegación"
              className="absolute inset-y-0 right-0 flex w-[min(20rem,82vw)] flex-col gap-1 overflow-y-auto border-l border-line bg-surface p-5 shadow-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-display text-h3 leading-none font-semibold text-brand">
                  Ruta 27
                </span>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Cerrar el menú"
                  className="inline-flex size-10 items-center justify-center rounded-sm border border-line bg-surface text-ink transition duration-200 hover:border-line-strong hover:text-brand"
                >
                  <IconClose />
                </button>
              </div>

              <nav className="flex flex-col">
                {items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className="border-b border-line py-3.5 font-display text-h3 font-semibold text-ink transition-colors last:border-0 hover:text-brand"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-5 py-3 font-sans font-semibold text-on-accent shadow-1 transition duration-200 ease-spring hover:shadow-3 motion-safe:hover:-translate-y-0.5"
              >
                {ctaLabel}
              </a>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
