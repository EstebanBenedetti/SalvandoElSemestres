"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { esquemaEstudiante } from "@/lib/validacion/esquemas";

export function FormularioEstudiante() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [errorCampo, setErrorCampo] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");
    setErrorCampo("");

    const validacion = esquemaEstudiante.safeParse({ nombre });
    if (!validacion.success) {
      setErrorCampo(z.flattenError(validacion.error).fieldErrors.nombre?.[0] ?? "Revisa el nombre.");
      return;
    }

    setCargando(true);
    try {
      const respuesta = await fetch("/api/notas/estudiantes", {
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
        resultado.datos === null ||
        !("id" in resultado.datos) ||
        typeof resultado.datos.id !== "string"
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
            : "No se pudo guardar el estudiante.";

        if (/duplicado|ya existe|unique/i.test(mensaje)) {
          setErrorCampo("Ese nombre ya está registrado. Prueba con otro.");
        }

        throw new Error(mensaje);
      }

      router.push(`/notas/estudiantes/${resultado.datos.id}`);
      router.refresh();
    } catch (errorEnvio) {
      setError(errorEnvio instanceof Error ? errorEnvio.message : "No se pudo guardar el estudiante.");
      setCargando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="grid gap-5">
      {error ? <Aviso tipo="error">{error}</Aviso> : null}
      <Campo
        etiqueta="Nombre del estudiante"
        name="nombre"
        autoComplete="name"
        maxLength={120}
        value={nombre}
        onChange={(evento) => {
          setNombre(evento.target.value);
          setErrorCampo("");
        }}
        error={errorCampo}
        required
      />
      <div className="flex flex-wrap gap-3">
        <Boton type="submit" cargando={cargando}>
          Guardar estudiante
        </Boton>
        <Boton variante="secundario" onClick={() => router.push("/notas")}>
          Cancelar
        </Boton>
      </div>
    </form>
  );
}
