import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { ESTADO_HTTP, ErrorDeNegocio, MENSAJES, type CodigoError } from "@/lib/reglas/errores";

type ErrorPostgres = {
  code?: string;
  constraint?: string;
};

function esErrorPostgres(error: unknown): error is ErrorPostgres {
  return typeof error === "object" && error !== null && "code" in error;
}

function respuestaError(codigo: CodigoError, detalles: unknown = null) {
  return NextResponse.json(
    {
      ok: false,
      error: { codigo, mensaje: MENSAJES[codigo], detalles },
    },
    {
      status: ESTADO_HTTP[codigo],
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export function responderOk<T>(datos: T, estado = 200) {
  return NextResponse.json(
    { ok: true, datos },
    { status: estado, headers: { "Cache-Control": "no-store" } },
  );
}

export function responderError(error: unknown) {
  if (error instanceof ErrorDeNegocio) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          codigo: error.codigo,
          mensaje: error.message,
          detalles: error.detalles ?? null,
        },
      },
      {
        status: ESTADO_HTTP[error.codigo],
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  if (error instanceof ZodError) {
    return respuestaError("DATOS_INVALIDOS", error.flatten());
  }

  if (esErrorPostgres(error)) {
    if (error.code === "23505" && error.constraint === "ux_estudiantes_nombre") {
      return respuestaError("NOMBRE_DUPLICADO");
    }
    if (error.code === "23503" && error.constraint === "cortes_estudiante_id_fkey") {
      return respuestaError("ESTUDIANTE_CON_CORTES");
    }
    if (error.code === "23514") {
      return respuestaError("DATOS_INVALIDOS");
    }
  }

  console.error("Error interno de la API:", error);
  return respuestaError("ERROR_INTERNO");
}

type ManejadorAPI<TArgs extends unknown[]> = (...args: TArgs) => Response | Promise<Response>;

export function conManejoDeErrores<TArgs extends unknown[]>(
  manejador: ManejadorAPI<TArgs>,
): (...args: TArgs) => Promise<Response> {
  return async (...args) => {
    try {
      return await manejador(...args);
    } catch (error) {
      return responderError(error);
    }
  };
}

export async function leerCuerpo<T>(request: Request, esquema: ZodType<T>): Promise<T> {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    throw new ErrorDeNegocio("DATOS_INVALIDOS");
  }
  return esquema.parse(cuerpo);
}
