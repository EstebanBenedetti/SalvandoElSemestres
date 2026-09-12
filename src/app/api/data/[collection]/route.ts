import { NextResponse } from "next/server";
import { getSchema } from "@data/_schema/registry";
import { create, getAll, getById, remove, update, JsonDBError, ReadOnlyError } from "@/lib/json-db";
import type { BaseRecord, QueryOptions } from "@/lib/types";

interface RouteContext {
  params: Promise<{ collection: string }>;
}

function success<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data, timestamp: new Date().toISOString() }, { status });
}

function failure(error: unknown): NextResponse {
  if (error instanceof ReadOnlyError) {
    return NextResponse.json({ success: false, error: error.message, code: "READ_ONLY", timestamp: new Date().toISOString() }, { status: 405 });
  }
  if (error instanceof JsonDBError) {
    const status = error.code === "NOT_FOUND" ? 404 : error.code === "VALIDATION_ERROR" ? 400 : 500;
    return NextResponse.json({ success: false, error: error.message, code: error.code, timestamp: new Date().toISOString() }, { status });
  }
  return NextResponse.json({ success: false, error: "Internal Server Error", code: "INTERNAL", timestamp: new Date().toISOString() }, { status: 500 });
}

async function collectionName(context: RouteContext): Promise<string> {
  const { collection } = await context.params;
  if (!getSchema(collection)) throw new JsonDBError(`Colección no registrada: ${collection}`, "NOT_FOUND");
  return collection;
}

export async function GET(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const collection = await collectionName(context);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (id) return success(await getById(collection, id));
    const options: QueryOptions = {
      limit: Number(url.searchParams.get("limit") ?? 50),
      offset: Number(url.searchParams.get("offset") ?? 0),
      sortOrder: url.searchParams.get("sortOrder") === "desc" ? "desc" : "asc",
    };
    const sortBy = url.searchParams.get("sortBy");
    if (sortBy) options.sortBy = sortBy;
    return success(await getAll(collection, options));
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const collection = await collectionName(context);
    const schema = getSchema(collection);
    const body = await request.json();
    const parsed = schema?.omit({ id: true, createdAt: true, updatedAt: true }).safeParse(body);
    if (!parsed?.success) throw new JsonDBError("Datos inválidos.", "VALIDATION_ERROR");
    return success(await create(collection, parsed.data as Omit<BaseRecord, keyof BaseRecord>), 201);
  } catch (error) {
    return failure(error);
  }
}

export async function PUT(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const collection = await collectionName(context);
    const schema = getSchema(collection);
    const body = await request.json() as { id?: string } & Record<string, unknown>;
    if (!body.id || !schema) throw new JsonDBError("El id es obligatorio.", "VALIDATION_ERROR");
    const { id, ...partial } = body;
    const parsed = schema.partial().omit({ id: true, createdAt: true, updatedAt: true }).safeParse(partial);
    if (!parsed.success) throw new JsonDBError("Datos inválidos.", "VALIDATION_ERROR");
    return success(await update(collection, id, parsed.data));
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const collection = await collectionName(context);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) throw new JsonDBError("El id es obligatorio.", "VALIDATION_ERROR");
    return success(await remove(collection, id));
  } catch (error) {
    return failure(error);
  }
}
