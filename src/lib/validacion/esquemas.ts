import { z } from "zod";

export const esquemaId = z.uuid();

export const esquemaNota = z.coerce
  .number({ error: "La nota debe ser un número." })
  .min(0, { error: "La nota debe estar entre 0.0 y 5.0." })
  .max(5, { error: "La nota debe estar entre 0.0 y 5.0." })
  .finite({ error: "La nota debe ser un número finito." });

export const esquemaEstudiante = z.object({
  nombre: z
    .string({ error: "El nombre debe ser texto." })
    .trim()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres." })
    .max(120, { error: "El nombre no puede superar 120 caracteres." }),
});

export const esquemaCorte = z.object({
  parcial1: esquemaNota,
  parcial2: esquemaNota,
  examenFinal: esquemaNota,
});

export const esquemaDesactivar = z.object({
  activo: z.literal(false),
});

export const esquemaFiltrosEstudiantes = z.object({
  incluirInactivos: z
    .enum(["true", "false"])
    .optional()
    .transform((valor) => valor === "true"),
  busqueda: z
    .string()
    .max(120, { error: "La búsqueda no puede superar 120 caracteres." })
    .optional(),
});

export type EsquemaNota = z.infer<typeof esquemaNota>;
export type EsquemaEstudiante = z.infer<typeof esquemaEstudiante>;
export type EsquemaCorte = z.infer<typeof esquemaCorte>;
export type EsquemaDesactivar = z.infer<typeof esquemaDesactivar>;
export type EsquemaFiltrosEstudiantes = z.infer<typeof esquemaFiltrosEstudiantes>;
