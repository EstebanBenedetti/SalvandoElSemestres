import { useId, type InputHTMLAttributes } from "react";

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  error?: string;
  ayuda?: string;
}

export function Campo({ etiqueta, error, ayuda, id, className = "", ...props }: CampoProps) {
  const idGenerado = useId();
  const identificador = id ?? idGenerado;
  const idDescripcion = error ? `${identificador}-error` : ayuda ? `${identificador}-ayuda` : undefined;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={identificador} className="text-sm font-medium text-texto">
        {etiqueta}
      </label>
      <input
        id={identificador}
        aria-invalid={Boolean(error)}
        aria-describedby={idDescripcion}
        className={`min-h-11 w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-texto outline-none placeholder:text-texto-suave focus-visible:border-primario focus-visible:ring-2 focus-visible:ring-primario/30 ${error ? "border-perdio" : ""} ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${identificador}-error`} className="text-sm font-medium text-perdio">
          {error}
        </p>
      ) : ayuda ? (
        <p id={`${identificador}-ayuda`} className="text-sm text-texto-suave">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}
