"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { VistaPreviaPromedio } from "@/components/notas/VistaPreviaPromedio";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { InsigniaResultado } from "@/components/notas/InsigniaResultado";
import { formatearNota } from "@/lib/formato";
import type { Corte } from "@/lib/datos/tipos";
import { esquemaCorte } from "@/lib/validacion/esquemas";

type CamposCorte = {
  parcial1: string;
  parcial2: string;
  examenFinal: string;
};

type ErroresCampo = Partial<Record<keyof CamposCorte, string>>;

export function FormularioCorte({ estudianteId }: { estudianteId: string }) {
  const router = useRouter();
  const [campos, setCampos] = useState<CamposCorte>({
    parcial1: "",
    parcial2: "",
    examenFinal: "",
  });
  const [errores, setErrores] = useState<ErroresCampo>({});
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [corteGuardado, setCorteGuardado] = useState<Corte | null>(null);

  function actualizarCampo(campo: keyof CamposCorte, valor: string) {
    setCampos((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actual) => ({ ...actual, [campo]: "" }));
    setError("");
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");

    const validacion = esquemaCorte.safeParse({
      parcial1: campos.parcial1,
      parcial2: campos.parcial2,
      examenFinal: campos.examenFinal,
    });

    if (!validacion.success) {
      const erroresPlano = z.flattenError(validacion.error).fieldErrors;
      setErrores({
        parcial1: erroresPlano.parcial1?.[0] ?? "",
        parcial2: erroresPlano.parcial2?.[0] ?? "",
        examenFinal: erroresPlano.examenFinal?.[0] ?? "",
      });
      setError("Revisa los datos del corte antes de guardarlo.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(`/api/notas/estudiantes/${estudianteId}/cortes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validacion.data),
      });

      const resultado: unknown = await respuesta.json();

      if (
        !respuesta.ok ||
        typeof resultado !== "object" ||
        resultado === null ||
        !("ok" in resultado) ||
        resultado.ok !== true ||
        !("datos" in resultado) ||
        typeof resultado.datos !== "object" ||
        resultado.datos === null
      ) {
        const mensaje =
          typeof resultado === "object" &&
          resultado !== null &&
          "error" in resultado &&
          typeof resultado.error === "object" &&
          resultado.error !== null &&
          "mensaje" in resultado.error &&
          typeof resultado.error.mensaje === "string"
            ? resultado.error.mensaje
            : "No se pudo registrar el corte.";

        throw new Error(mensaje);
      }

      const corte = resultado.datos as Corte;
      setCorteGuardado(corte);
      setCargando(false);
      router.refresh();
    } catch (errorEnvio) {
      setError(
        errorEnvio instanceof Error ? errorEnvio.message : "No se pudo registrar el corte.",
      );
      setCargando(false);
    }
  }

  if (corteGuardado) {
    return (
      <div className="grid gap-5 rounded-xl border border-borde bg-superficie p-6">
        <div>
          <p className="text-sm font-medium text-texto-suave">Corte registrado</p>
          <p className="mt-2 text-4xl font-bold text-texto">{formatearNota(corteGuardado.promedio)}</p>
        </div>
        <InsigniaResultado resultado={corteGuardado.resultado} />
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/notas/estudiantes/${estudianteId}`}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-transparent bg-primario px-4 py-2 text-sm font-semibold text-white hover:bg-[#244b8c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
          >
            Ver historial
          </Link>
          <Boton
            variante="secundario"
            onClick={() => {
              setCorteGuardado(null);
              setCampos({ parcial1: "", parcial2: "", examenFinal: "" });
              setErrores({});
              setError("");
            }}
          >
            Registrar otro corte
          </Boton>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="grid gap-5 rounded-xl border border-borde bg-superficie p-6">
      {error ? <Aviso tipo="error">{error}</Aviso> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Campo
          etiqueta="Parcial 1"
          name="parcial1"
          type="text"
          inputMode="decimal"
          value={campos.parcial1}
          onChange={(evento) => actualizarCampo("parcial1", evento.target.value)}
          error={errores.parcial1 || ""}
          ayuda="Entre 0.0 y 5.0"
        />
        <Campo
          etiqueta="Parcial 2"
          name="parcial2"
          type="text"
          inputMode="decimal"
          value={campos.parcial2}
          onChange={(evento) => actualizarCampo("parcial2", evento.target.value)}
          error={errores.parcial2 || ""}
          ayuda="Entre 0.0 y 5.0"
        />
        <Campo
          etiqueta="Examen final"
          name="examenFinal"
          type="text"
          inputMode="decimal"
          value={campos.examenFinal}
          onChange={(evento) => actualizarCampo("examenFinal", evento.target.value)}
          error={errores.examenFinal || ""}
          ayuda="Entre 0.0 y 5.0; pesa el doble"
        />
      </div>

      <div className="rounded-xl border border-dashed border-borde bg-fondo p-4">
        <p className="text-sm font-semibold text-texto">Vista previa del promedio</p>
        <div className="mt-3">
          <VistaPreviaPromedio
            parcial1={campos.parcial1}
            parcial2={campos.parcial2}
            examenFinal={campos.examenFinal}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Boton type="submit" cargando={cargando} textoCargando="Guardando corte...">
          Guardar corte
        </Boton>
        <Link
          href={`/notas/estudiantes/${estudianteId}`}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-borde bg-superficie px-4 py-2 text-sm font-semibold text-texto hover:bg-fondo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
