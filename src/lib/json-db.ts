import { mkdir, readFile, rename, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import type { BaseRecord, CollectionFile, QueryOptions, QueryResult } from "@/lib/types";
import { generateId, now, safeJsonParse } from "@/lib/utils";

export class JsonDBError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "DUPLICATE_ID" | "VALIDATION_ERROR" | "IO_ERROR",
  ) {
    super(message);
    this.name = "JsonDBError";
  }
}

export class ReadOnlyError extends Error {
  constructor() {
    super("Las escrituras están deshabilitadas en producción.");
    this.name = "ReadOnlyError";
  }
}

const locks = new Map<string, Promise<void>>();
const dataDirectory = path.resolve(process.env.DATA_DIR ?? path.join(process.cwd(), "data"));

function resolveCollectionPath(name: string): string {
  if (!/^[a-z0-9-]+$/.test(name)) {
    throw new JsonDBError("Nombre de colección inválido.", "VALIDATION_ERROR");
  }
  return path.join(dataDirectory, `${name}.json`);
}

async function readCollection<T extends BaseRecord = BaseRecord>(name: string): Promise<CollectionFile<T>> {
  try {
    const raw = await readFile(resolveCollectionPath(name), "utf8");
    const parsed = safeJsonParse<CollectionFile<T>>(raw);
    if (!parsed || !Array.isArray(parsed.records) || !parsed._meta) {
      throw new JsonDBError("La colección no tiene un formato válido.", "VALIDATION_ERROR");
    }
    return parsed;
  } catch (error) {
    if (error instanceof JsonDBError) throw error;
    throw new JsonDBError(`Colección no encontrada: ${name}`, "NOT_FOUND");
  }
}

async function writeCollection<T extends BaseRecord>(name: string, data: CollectionFile<T>): Promise<void> {
  if (process.env.NODE_ENV === "production") throw new ReadOnlyError();
  const collectionPath = resolveCollectionPath(name);
  const previous = locks.get(collectionPath) ?? Promise.resolve();
  const next = previous.then(async () => {
    await mkdir(dataDirectory, { recursive: true });
    try {
      await mkdir(path.join(dataDirectory, "_backups"), { recursive: true });
      await copyFile(collectionPath, path.join(dataDirectory, "_backups", `${name}_${Date.now()}.json`));
    } catch {
      // A first write has no previous file to back up.
    }
    const temporaryPath = `${collectionPath}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(data, null, 2), "utf8");
    await rename(temporaryPath, collectionPath);
  });
  locks.set(collectionPath, next.then(() => undefined, () => undefined));
  try {
    await next;
  } catch {
    throw new JsonDBError("No se pudo escribir la colección.", "IO_ERROR");
  } finally {
    if (locks.get(collectionPath) === next) locks.delete(collectionPath);
  }
}

export async function getAll<T extends BaseRecord>(name: string, options: QueryOptions = {}): Promise<QueryResult<T>> {
  const collection = await readCollection<T>(name);
  const offset = Math.max(0, options.offset ?? 0);
  const limit = Math.max(1, options.limit ?? 50);
  const records = [...collection.records];
  if (options.sortBy) {
    records.sort((left, right) => {
      const leftValue = String(left[options.sortBy as keyof T] ?? "");
      const rightValue = String(right[options.sortBy as keyof T] ?? "");
      return options.sortOrder === "desc" ? rightValue.localeCompare(leftValue) : leftValue.localeCompare(rightValue);
    });
  }
  return { data: records.slice(offset, offset + limit), total: records.length, limit, offset };
}

export async function getById<T extends BaseRecord>(name: string, id: string): Promise<T | null> {
  const collection = await readCollection<T>(name);
  return collection.records.find((record) => record.id === id) ?? null;
}

export async function create<T extends BaseRecord>(name: string, input: Omit<T, keyof BaseRecord>): Promise<T> {
  const collection = await readCollection<T>(name);
  const prefix = name.slice(0, 3);
  const record = { ...input, id: generateId(prefix), createdAt: now(), updatedAt: now() } as T;
  collection.records.push(record);
  collection._meta.lastModified = now();
  await writeCollection(name, collection);
  return record;
}

export async function update<T extends BaseRecord>(name: string, id: string, partial: Partial<Omit<T, keyof BaseRecord>>): Promise<T> {
  const collection = await readCollection<T>(name);
  const index = collection.records.findIndex((record) => record.id === id);
  if (index < 0) throw new JsonDBError(`Registro no encontrado: ${id}`, "NOT_FOUND");
  const current = collection.records[index];
  const updated = { ...current, ...partial, id, updatedAt: now() } as T;
  collection.records[index] = updated;
  collection._meta.lastModified = now();
  await writeCollection(name, collection);
  return updated;
}

export async function remove(name: string, id: string): Promise<boolean> {
  const collection = await readCollection(name);
  const nextRecords = collection.records.filter((record) => record.id !== id);
  if (nextRecords.length === collection.records.length) throw new JsonDBError(`Registro no encontrado: ${id}`, "NOT_FOUND");
  collection.records = nextRecords;
  collection._meta.lastModified = now();
  await writeCollection(name, collection);
  return true;
}

export async function query<T extends BaseRecord>(name: string, filter: (record: T) => boolean): Promise<T[]> {
  const collection = await readCollection<T>(name);
  return collection.records.filter(filter);
}

export async function count(name: string): Promise<number> {
  const collection = await readCollection(name);
  return collection.records.length;
}
