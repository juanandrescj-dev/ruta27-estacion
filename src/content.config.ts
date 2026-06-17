/*
 * content.config.ts — Content Layer de Astro 6 (§5, §10).
 * Carga los datos de /src/data/*.yaml con el loader file() y los valida con Zod EN BUILD:
 * si un precio es negativo o falta un campo, el build falla (contenido siempre consistente).
 */
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

/** Tokens de marca admitidos como "swatch" de un combustible (NO HEX crudos — ver §3). */
export const SWATCHES = ['brand', 'brand-strong', 'accent', 'accent-text', 'signal'] as const;

/** Claves de icono admitidas (dominio propio + Lucide). */
export const ICONOS = [
  'surtidor',
  'lavado',
  'glp',
  'aire',
  'tienda',
  'aceite',
  'cafe',
  'cajero',
  'wifi',
  'bano',
  'ev',
] as const;

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

// estacion.yaml es un registro único (clave "ruta27") → una sola entrada en la colección.
const estacion = defineCollection({
  loader: file('src/data/estacion.yaml'),
  schema: z.object({
    nombre: z.string().min(1),
    eslogan: z.string().min(1),
    descripcion: z.string().min(1),
    direccion: z.string().min(1),
    telefono: z.string().min(1),
    whatsapp: z.string().regex(/^\d{10,15}$/, 'WhatsApp en formato internacional sin signos'),
    rnc: z.string().min(1),
    geo: z.object({ lat: z.number(), lng: z.number() }),
    redes: z.object({
      facebook: z.string(),
      instagram: z.string(),
      tiktok: z.string().optional(),
    }),
  }),
});

const combustibles = defineCollection({
  loader: file('src/data/combustibles.yaml'),
  schema: z.object({
    nombre: z.string().min(1),
    octanaje: z.number().int().positive().optional(),
    precioRD: z.number().positive('El precio debe ser mayor que 0'),
    vigencia: z.coerce.date(),
    swatch: z.enum(SWATCHES),
  }),
});

const servicios = defineCollection({
  loader: file('src/data/servicios.yaml'),
  schema: z.object({
    titulo: z.string().min(1),
    descripcion: z.string().min(1),
    icono: z.enum(ICONOS),
  }),
});

const horarios = defineCollection({
  loader: file('src/data/horarios.yaml'),
  schema: z
    .object({
      dia: z.string().min(1),
      abierto24h: z.boolean().default(false),
      apertura: z.string().regex(HHMM, 'Hora en formato HH:MM (24h)').optional(),
      cierre: z.string().regex(HHMM, 'Hora en formato HH:MM (24h)').optional(),
    })
    .refine((d) => d.abierto24h || (Boolean(d.apertura) && Boolean(d.cierre)), {
      message: 'Si el día no es 24h, "apertura" y "cierre" son obligatorios',
    }),
});

export const collections = { estacion, combustibles, servicios, horarios };
