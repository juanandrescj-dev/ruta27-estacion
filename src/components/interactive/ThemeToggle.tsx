import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * ThemeToggle — isla React del cambio de tema (§7). Un único <button> que CICLA 3 estados:
 * claro → oscuro → sistema. Accesible (aria-label dinámico, focus-visible global), persiste
 * la elección en localStorage y, en modo "sistema", sigue los cambios del SO en vivo.
 *
 * No produce flash: el script anti-FOUC `is:inline` ya fijó `data-theme` antes del primer
 * paint; este componente NO re-aplica en el montaje inicial (solo ante cambios reales).
 */

type Theme = 'light' | 'dark' | 'system';

const ORDER: Theme[] = ['light', 'dark', 'system'];
const STORAGE_KEY = 'theme';

const systemPrefersDark = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

const resolve = (theme: Theme): 'light' | 'dark' =>
  theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme;

const apply = (theme: Theme): void => {
  document.documentElement.dataset.theme = resolve(theme);
};

const META: Record<Theme, { estado: string; accion: string }> = {
  light: { estado: 'Tema claro activo', accion: 'Cambiar a oscuro' },
  dark: { estado: 'Tema oscuro activo', accion: 'Cambiar al tema del sistema' },
  system: { estado: 'Tema del sistema activo', accion: 'Cambiar a claro' },
};

function ThemeIcon({ theme }: { theme: Theme }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (theme === 'light') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    );
  }
  if (theme === 'dark') {
    return (
      <svg {...common}>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

export default function ThemeToggle({ class: className = '' }: { class?: string }) {
  const [theme, setTheme] = useState<Theme>('system');
  const firstApply = useRef(true);

  // 1. Reflejar la preferencia guardada tras montar (estado inicial 'system' = determinista
  //    en SSR, así no hay desajuste de hidratación; aquí se sincroniza con lo real).
  useEffect(() => {
    let stored: Theme = 'system';
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'light' || v === 'dark' || v === 'system') stored = v;
    } catch {
      /* localStorage no disponible (modo privado) → 'system' */
    }
    setTheme(stored);
  }, []);

  // 2. Aplicar + persistir SOLO ante cambios reales (se omite el primer run del montaje
  //    porque el inline script ya dejó `data-theme` correcto → cero flash).
  useEffect(() => {
    if (firstApply.current) {
      firstApply.current = false;
      return;
    }
    apply(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* no-op */
    }
  }, [theme]);

  // 3. En modo "sistema", seguir los cambios del SO en vivo.
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => apply('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const cycle = useCallback(() => {
    setTheme((t) => ORDER[(ORDER.indexOf(t) + 1) % ORDER.length]);
  }, []);

  const { estado, accion } = META[theme];
  const label = `${estado}. ${accion}.`;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className={`inline-flex size-10 items-center justify-center rounded-sm border border-line bg-surface text-ink shadow-1 transition duration-200 ease-spring hover:border-line-strong hover:text-brand motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 ${className}`}
    >
      <ThemeIcon theme={theme} />
    </button>
  );
}
