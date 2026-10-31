"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { Modal } from "@/components/ui/Modal";

export function DesactivarEstudiante({ estudianteId }: { estudianteId: string }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function confirmarDesactivacion() {
    setCargando(true);
    setError("");
    try {
      const respuesta = await fetch(`/api/notas/estudiantes/${estudianteId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ activo: false }),
      });
      const resultado: unknown = await respuesta.json();
      if (!respuesta.ok) {
        const mensaje =
          typeof resultado === "object" &&
          resultado !== null &&
          "error" in resultado &&
          typeof resultado.error === "object" &&
          resultado.error !== null &&
          "mensaje" in resultado.error &&
          typeof resultado.error.mensaje === "string"
            ? resultado.error.mensaje
            : "No se pudo desactivar el estudiante.";
        throw new Error(mensaje);
      }

      setAbierto(false);
      router.refresh();
    } catch (errorPeticion) {
      setError(errorPeticion instanceof Error ? errorPeticion.message : "No se pudo desactivar el estudiante.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      {error ? <Aviso tipo="error">{error}</Aviso> : null}
      <Boton variante="peligro" onClick={() => setAbierto(true)}>
        Desactivar estudiante
      </Boton>
      <Modal
        abierto={abierto}
        titulo="Desactivar estudiante"
        alCerrar={() => {
          if (!cargando) setAbierto(false);
        }}
        acciones={
          <>
            <Boton variante="secundario" disabled={cargando} onClick={() => setAbierto(false)}>
              Cancelar
            </Boton>
            <Boton variante="peligro" cargando={cargando} onClick={confirmarDesactivacion}>
              Confirmar desactivación
            </Boton>
          </>
        }
      >
        <p className="text-sm leading-6 text-texto-suave">
          El estudiante dejará de aparecer entre los activos, pero su historial de cortes se conservará.
        </p>
      </Modal>
    </>
  );
}
