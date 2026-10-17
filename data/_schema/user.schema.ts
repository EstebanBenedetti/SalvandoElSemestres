import { z } from "zod";
import { baseRecordSchema } from "./base.schema";

export const userRecordSchema = baseRecordSchema.extend({
  nombre: z.string().min(1).max(120),
  email: z.string().email(),
  passwordHash: z.string().min(8),
  rol: z.enum(["admin", "usuario", "coordinador"]).default("usuario"),
  activo: z.boolean().default(true),
  ultimoLogin: z.string().datetime().nullable().optional(),
});

export type UserRecord = z.infer<typeof userRecordSchema>;
