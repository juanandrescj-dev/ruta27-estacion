import { useEffect, useRef, useState } from 'react';
import type { Map } from 'maplibre-gl';

interface Props {
  lat: number;
  lng: number;
  nombre: string;
  direccion: string;
}

export default function MapaInteractivo({ lat, lng, nombre, direccion }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(false);
  const mapRef = useRef<Map | null>(null);

  // 1. Sincronización de tema
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
      setTheme(currentTheme);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  // 2. IntersectionObserver para carga diferida (rootMargin 200px)
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 3. Inicializar el mapa
  useEffect(() => {
    if (!inView || typeof window === 'undefined') return;

    let active = true;
    let loadTimeout: ReturnType<typeof setTimeout> | undefined;

    async function initMap() {
      // Importación dinámica para evitar que pete en SSR de Astro.
      // Si falla (sin red / chunk inaccesible) mostramos el fallback en vez de cargar sin fin.
      const maplibregl = await import('maplibre-gl').catch((err: unknown) => {
        console.error('[MapaInteractivo] No se pudo cargar MapLibre:', err);
        return null;
      });
      if (!maplibregl) {
        if (active) setError(true);
        return;
      }

      if (!active || !mapContainerRef.current) return;

      const styleUrl =
        theme === 'dark'
          ? 'https://tiles.openfreemap.org/styles/dark'
          : 'https://tiles.openfreemap.org/styles/liberty';

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: styleUrl,
        center: [lng, lat],
        zoom: 15,
        attributionControl: false,
      });

      mapRef.current = map;

      // Controles
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

      // Marcador personalizado
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.innerHTML = `
        <div class="relative flex items-center justify-center size-9 rounded-full bg-[var(--brand)] text-[var(--on-brand)] shadow-3 border-2 border-[var(--surface)] transition duration-200 hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="size-4 shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
      `;

      // Popup accesible con botones para Google Maps y Waze
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="p-1 font-sans text-ink">
          <h4 class="font-display font-semibold text-small mb-1 text-ink">${nombre}</h4>
          <p class="text-xs text-ink-muted leading-relaxed mb-3">${direccion}</p>
          <div class="flex gap-2">
            <a href="https://maps.google.com/?q=${lat},${lng}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-2.5 py-1.5 text-xs font-semibold bg-[var(--brand)] text-[var(--on-brand)] rounded-sm hover:opacity-90 transition duration-200">
              Google Maps
            </a>
            <a href="https://waze.com/ul?ll=${lat},${lng}&navigate=yes" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-2.5 py-1.5 text-xs font-semibold bg-[var(--surface-sunken)] text-ink border border-line rounded-sm hover:border-line-strong transition duration-200">
              Waze
            </a>
          </div>
        </div>
      `);

      new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).setPopup(popup).addTo(map);

      map.on('load', () => {
        if (!active) return;
        if (loadTimeout) clearTimeout(loadTimeout);
        setError(false);
        setMapLoaded(true);
      });

      // MapLibre emite 'error' también por incidencias menores (un icono de sprite ausente,
      // un tile suelto): solo lo registramos. Si el fallo es fatal, lo detecta el timeout.
      map.on('error', (ev) => {
        console.warn('[MapaInteractivo] Error de MapLibre:', ev.error?.message ?? ev);
      });

      // Red caída / CSP / tiles inaccesibles: si en 10 s el mapa no terminó de cargar,
      // mostramos un fallback con enlaces directos en vez de girar indefinidamente.
      loadTimeout = setTimeout(() => {
        if (active && !map.loaded()) setError(true);
      }, 10000);
    }

    initMap();

    return () => {
      active = false;
      if (loadTimeout) clearTimeout(loadTimeout);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // Deps = [inView] a propósito: el tema NO recrea el mapa (lo actualiza el efecto #4 con
    // setStyle); recrearlo en cada toggle sería más costoso y perdería el estado de cámara.
  }, [inView]);

  // 4. Sincronizar estilo en runtime al alternar data-theme
  useEffect(() => {
    if (!mapRef.current) return;
    const styleUrl =
      theme === 'dark'
        ? 'https://tiles.openfreemap.org/styles/dark'
        : 'https://tiles.openfreemap.org/styles/liberty';

    mapRef.current.setStyle(styleUrl);
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl border border-line bg-surface-sunken shadow-2"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Contenedor del mapa */}
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

      {/* Placeholder con loader antes de cargar y mientras renderiza */}
      {!error && (!inView || !mapLoaded) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface-sunken p-6 text-center">
          <div className="flex animate-pulse flex-col items-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-brand/20 bg-brand/10 text-brand">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="size-6"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <p className="font-display text-body font-semibold text-ink">
              Cargando mapa interactivo...
            </p>
            <p className="mt-1 max-w-xs text-small text-ink-muted">{direccion}</p>
          </div>
        </div>
      )}

      {/* Fallback accesible si el mapa no carga (red caída, CSP o tiles inaccesibles):
          el usuario nunca queda sin opción para llegar a la estación. */}
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-surface-sunken p-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full border border-line bg-surface text-ink-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="size-6"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
              <line x1="3" y1="3" x2="21" y2="21"></line>
            </svg>
          </div>
          <div>
            <p className="font-display text-body font-semibold text-ink">
              No pudimos cargar el mapa
            </p>
            <p className="mt-1 max-w-xs text-small text-ink-muted">{direccion}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href={`https://maps.google.com/?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-sm bg-brand px-3 py-2 text-small font-semibold text-on-brand transition duration-200 hover:opacity-90"
            >
              Abrir en Google Maps
            </a>
            <a
              href={`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-sm border border-line bg-surface px-3 py-2 text-small font-semibold text-ink transition duration-200 hover:border-line-strong"
            >
              Waze
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
