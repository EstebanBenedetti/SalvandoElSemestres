import Link from "next/link";

interface EstadoVacioProps {
  titulo: string;
  descripcion?: string;
  href?: string;
  accion?: string;
}

export function EstadoVacio({ titulo, descripcion, href, accion }: EstadoVacioProps) {
  return (
    <div className="grid justify-items-center gap-3 px-5 py-12 text-center">
      <h2 className="text-lg font-semibold text-texto">{titulo}</h2>
      {descripcion ? <p className="max-w-md text-sm text-texto-suave">{descripcion}</p> : null}
      {href && accion ? (
        <Link
          href={href}
          className="mt-2 inline-flex min-h-10 items-center rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white hover:bg-[#244b8c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
        >
          {accion}
        </Link>
      ) : null}
    </div>
  );
}
