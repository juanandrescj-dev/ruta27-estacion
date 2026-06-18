/**
 * motion.ts — controlador de animación del sitio (FASE 4, §6.4).
 * ─────────────────────────────────────────────────────────────────────────────────────
 * Motion ARTESANAL, no de plantilla. Reúne en un solo módulo:
 *   1. Lenis (smooth scroll) con su rAF conducido por `gsap.ticker` (un único bucle) y
 *      `ScrollTrigger.update` enganchado al evento `scroll` de Lenis.
 *   2. Scroll reveals sutiles (opacidad + translateY, SOLO transform/opacity → 60fps) con
 *      stagger entre los hijos de cada grupo. Easings y duraciones salen de los tokens (§6.4).
 *   3. SplitText en el H1 del hero (entrada por palabras).
 *   4. Parallax del hero, muy por debajo del techo de 0.85× del scroll (sutil).
 *
 * prefers-reduced-motion (§9.4): bajo `reduce` NO se crea Lenis ni animación decorativa
 * alguna; el contenido se muestra tal cual (el CSS de `global.css` solo oculta los reveals
 * cuando hay `.motion-ready` Y `no-preference`). Si GSAP fallara, el `catch` retira
 * `.motion-ready` para que nada quede atrapado invisible.
 *
 * View Transitions (Astro <ClientRouter/>): `setup` corre en cada `astro:page-load` (carga
 * inicial y navegación) y `cleanup` desmonta TODO en `astro:before-swap` (animaciones, splits
 * y la instancia de Lenis). Lenis se recrea por página porque el swap reinicia las clases de
 * <html> de las que depende su CSS (ver `createLenis`).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

/**
 * Easings = espejo EXACTO de los tokens (§6.4). Un `cubic-bezier(x1,y1,x2,y2)` equivale a una
 * curva cúbica con puntos de control (0,0) (x1,y1) (x2,y2) (1,1) → ruta SVG `M0,0 C…`.
 * Así GSAP usa la MISMA curva que las transiciones CSS (botones, links), sin duplicar valores.
 */
const EASE_OUT_SOFT = CustomEase.create('rt27-out-soft', 'M0,0 C0.22,1 0.36,1 1,1');

/** Lee una duración de los tokens CSS (fuente única de verdad). `"600ms"` → `0.6` s. */
function dur(token: string, fallback: number): number {
  const ms = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(token));
  return Number.isFinite(ms) && ms > 0 ? ms / 1000 : fallback;
}

const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

// Estado a nivel de módulo (persiste entre navegaciones de View Transitions).
let lenis: Lenis | null = null;
let tickerFn: ((time: number) => void) | null = null;
let pageCtx: gsap.Context | null = null;
let splits: SplitText[] = [];
let montado = false; // ¿hay animaciones montadas para la página actual?

/**
 * Crea Lenis y lo engancha a gsap.ticker. Se recrea EN CADA página: las View Transitions
 * reinician los atributos/clases de <html> (borran las `lenis`/`lenis-smooth` que Lenis añade
 * y de las que depende su CSS), así que persistir una sola instancia las dejaría sin efecto y
 * además acumularía listeners. Recrear por página mantiene el estado y las clases correctos.
 */
function createLenis(): void {
  if (lenis) return; // `cleanup` ya la destruyó antes de cada page-load; guarda por si acaso
  lenis = new Lenis({
    autoRaf: false, // el rAF lo conduce gsap.ticker; evitamos un segundo bucle
    lerp: 0.1,
    smoothWheel: true,
    // Los anclas (#combustibles…) las suaviza Lenis y aterrizan bajo el header sticky
    // (mismo offset que el `scroll-mt-[calc(var(--header-h)+1rem)]` del proyecto: 72px+16px).
    anchors: { offset: -88 },
  });
  lenis.on('scroll', ScrollTrigger.update);
  tickerFn = (time: number) => lenis?.raf(time * 1000); // gsap da segundos; Lenis quiere ms
  gsap.ticker.add(tickerFn);
  gsap.ticker.lagSmoothing(0);
}

/** Destruye Lenis y suelta el ticker (entre páginas y al pasar a reduce). */
function destroyLenis(): void {
  if (tickerFn) gsap.ticker.remove(tickerFn);
  lenis?.destroy(); // quita sus listeners y las clases que añadió a <html>
  lenis = null;
  tickerFn = null;
}

/** Entrada editorial del hero: palabras del H1 + escalonado de los demás bloques. */
function buildHero(): void {
  const hero = document.getElementById('inicio');
  if (!hero) return;

  const durBase = dur('--dur-base', 0.32);
  const title = hero.querySelector<HTMLElement>('[data-hero-title]');
  const intro = hero.querySelector<HTMLElement>('[data-hero-intro]');
  // Los "pasos" son los hijos del bloque de intro salvo el H1 (que entra por palabras aparte).
  const steps = intro
    ? gsap.utils
        .toArray<HTMLElement>(intro.children)
        .filter((el) => !el.hasAttribute('data-hero-title'))
    : [];

  const tl = gsap.timeline({ defaults: { ease: EASE_OUT_SOFT, duration: durBase } });

  if (title) {
    // `aria: 'auto'` (por defecto) deja el texto legible para lectores de pantalla.
    const split = SplitText.create(title, { type: 'words', wordsClass: 'rt-word' });
    splits.push(split);
    gsap.set(title, { autoAlpha: 1 }); // el H1 se muestra; entran sus palabras
    tl.from(split.words, { yPercent: 45, autoAlpha: 0, stagger: 0.05 }, 0);
  }
  if (steps.length) {
    // fromTo con destino EXPLÍCITO (autoAlpha:1). Los `steps` son hijos directos de
    // [data-hero-intro], que el CSS oculta a opacity:0 bajo `.motion-ready`. Un `.from()`
    // tomaría ese 0 como estado final (anima 0→0) y los dejaría invisibles; el `.fromTo`
    // garantiza que terminen visibles, igual que los reveals de scroll (buildReveals).
    tl.fromTo(
      steps,
      { y: 18, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.09 },
      title ? '-=0.15' : 0,
    );
  }
}

/** Reveals al hacer scroll: elementos sueltos y grupos con stagger entre hijos. */
function buildReveals(): void {
  const durSlow = dur('--dur-slow', 0.6);

  // Elemento suelto: viaja un poco más (22px) para marcar jerarquía de encabezados.
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    const y = Number(el.dataset.revealY ?? 22);
    gsap.fromTo(
      el,
      { autoAlpha: 0, y },
      {
        autoAlpha: 1,
        y: 0,
        duration: durSlow,
        ease: EASE_OUT_SOFT,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      },
    );
  });

  // Grupo: los hijos directos entran escalonados (70ms, dentro del rango 60–80ms del plan).
  gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
    const kids = gsap.utils.toArray<HTMLElement>(group.children);
    if (!kids.length) return;
    const y = Number(group.dataset.revealY ?? 16);
    gsap.fromTo(
      kids,
      { autoAlpha: 0, y },
      {
        autoAlpha: 1,
        y: 0,
        duration: durSlow,
        ease: EASE_OUT_SOFT,
        stagger: 0.07,
        scrollTrigger: { trigger: group, start: 'top 82%', once: true },
      },
    );
  });
}

/** Parallax del hero: el figure se rezaga muy levemente (≪ techo de 0.85× del scroll). */
function buildParallax(): void {
  const target = document.querySelector<HTMLElement>('[data-hero-parallax]');
  const hero = document.getElementById('inicio');
  if (!target || !hero) return;
  gsap.fromTo(
    target,
    { yPercent: 0 },
    {
      yPercent: 10, // se desplaza ~10% de su alto a lo largo de todo el hero: deliberadamente sutil
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    },
  );
}

/** Monta TODAS las animaciones de la página actual dentro de un contexto desechable. */
function setup(): void {
  if (montado) return; // idempotente: cubre import-inicial + primer `astro:page-load`
  if (reduceMQ.matches) {
    // Bajo reduce: nada de smooth scroll ni reveals. El CSS ya deja el contenido visible.
    destroyLenis();
    return;
  }
  montado = true;
  document.documentElement.classList.add('motion-ready');
  try {
    createLenis();
    pageCtx = gsap.context(() => {
      buildHero();
      buildReveals();
      buildParallax();
    });
    ScrollTrigger.refresh();
  } catch {
    // Si algo falla, revela todo (quita el ocultado por CSS) y desmonta el smooth scroll.
    document.documentElement.classList.remove('motion-ready');
    cleanup();
  }
}

/** Desmonta las animaciones de la página saliente antes de un View Transition. */
function cleanup(): void {
  montado = false;
  splits.forEach((s) => s.revert());
  splits = [];
  pageCtx?.revert(); // mata tweens/ScrollTriggers y restaura los estilos inline que puso GSAP
  pageCtx = null;
  destroyLenis(); // se recrea fresca en el siguiente page-load (clases de <html> correctas)
}

document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', cleanup);

// Arranque inmediato: el módulo llega por import() diferido y podría cargar DESPUÉS del primer
// `astro:page-load`. La bandera `montado` evita la doble corrida si el evento aún está por venir.
setup();

// Si el usuario cambia su preferencia de movimiento en vivo, reacciona sin recargar.
reduceMQ.addEventListener('change', () => {
  if (reduceMQ.matches) {
    cleanup(); // el media query de CSS ya revela el contenido
  } else {
    setup();
  }
});
