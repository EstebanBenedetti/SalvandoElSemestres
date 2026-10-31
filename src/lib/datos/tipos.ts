import type { Resultado } from "@/lib/reglas/nota";

export interface DatosCorte {
  estudianteId: string;
  parcial1: number;
  parcial2: number;
  examenFinal: number;
}

export interface FilaEstudiante {
  id: string;
  nombre: string;
  activo: boolean;
  totalCortes: number;
  ultimoCorte: {
    promedio: number;
    resultado: Resultado;
    fecha: string;
  } | null;
}

export interface Corte {
  id: number;
  estudianteId: string;
  parcial1: number;
  parcial2: number;
  examenFinal: number;
  promedio: number;
  resultado: Resultado;
  fecha: string;
}

export interface DetalleEstudiante {
  estudiante: {
    id: string;
    nombre: string;
    activo: boolean;
    fechaRegistro: string;
    totalCortes: number;
  };
  cortes: Corte[];
}

export interface ExtremosGrupo {
  masAltos: Array<{ nombre: string; promedio: number }>;
  masBajos: Array<{ nombre: string; promedio: number }>;
  totalEnGrupo: number;
}
