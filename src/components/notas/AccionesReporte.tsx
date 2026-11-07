"use client";

export function AccionesReporte() {
  return (
    <div className="no-imprimir flex flex-wrap gap-3">
      <a
        href="/api/notas/exportar"
        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-borde bg-superficie px-4 py-2.5 text-sm font-semibold text-texto shadow-sm hover:bg-fondo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
      >
        Descargar CSV
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primario px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#244b8c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
      >
        Guardar como PDF o imprimir
      </button>
    </div>
  );
}