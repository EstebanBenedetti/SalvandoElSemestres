"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  abierto: boolean;
  titulo: string;
  alCerrar: () => void;
  children: ReactNode;
  acciones?: ReactNode;
}

export function Modal({ abierto, titulo, alCerrar, children, acciones }: ModalProps) {
  const dialogoRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;

    const elementoAnterior = document.activeElement;
    cerrarRef.current?.focus();
    const manejarEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") alCerrar();
      if (evento.key !== "Tab") return;

      const interactivos = dialogoRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!interactivos?.length) return;
      const primero = interactivos[0];
      const ultimo = interactivos[interactivos.length - 1];
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo?.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero?.focus();
      }
    };
    document.addEventListener("keydown", manejarEscape);

    return () => {
      document.removeEventListener("keydown", manejarEscape);
      if (elementoAnterior instanceof HTMLElement) elementoAnterior.focus();
    };
  }, [abierto, alCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-4"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) alCerrar();
      }}
    >
      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        tabIndex={-1}
        className="w-full max-w-lg rounded-lg border border-borde bg-superficie p-6 text-texto shadow-xl focus:outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-titulo" className="text-xl font-bold">
            {titulo}
          </h2>
          <button
            ref={cerrarRef}
            type="button"
            aria-label="Cerrar diálogo"
            onClick={alCerrar}
            className="rounded px-2 py-1 text-texto-suave hover:bg-fondo focus-visible:outline-2 focus-visible:outline-primario"
          >
            Cerrar
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {acciones ? <div className="mt-6 flex justify-end gap-3">{acciones}</div> : null}
      </div>
    </div>
  );
}
