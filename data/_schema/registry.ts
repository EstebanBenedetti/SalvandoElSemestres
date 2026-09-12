import type { ZodObject, ZodRawShape } from "zod";
import { exampleRecordSchema } from "./example.schema";

export const schemaRegistry: Record<string, ZodObject<ZodRawShape>> = {
  example: exampleRecordSchema,
};

export function getSchema(collection: string): ZodObject<ZodRawShape> | null {
  return schemaRegistry[collection] ?? null;
}
