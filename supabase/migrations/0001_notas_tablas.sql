-- M1: tablas del Sistema de Registro y Cálculo de Notas

CREATE TABLE IF NOT EXISTS estudiantes (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        VARCHAR(120)  NOT NULL,
  activo        BOOLEAN       NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),   -- fecha de registro
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT estudiantes_nombre_minimo CHECK (char_length(btrim(nombre)) >= 2)   -- RN-01
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_estudiantes_nombre ON estudiantes (lower(btrim(nombre)));  -- RN-02

CREATE TABLE IF NOT EXISTS cortes (
  id             BIGSERIAL     PRIMARY KEY,
  estudiante_id  UUID          NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT,  -- RN-11
  parcial1       NUMERIC(3,2)  NOT NULL,
  parcial2       NUMERIC(3,2)  NOT NULL,
  examen_final   NUMERIC(3,2)  NOT NULL,
  promedio       NUMERIC(3,2)  NOT NULL,
  resultado      VARCHAR(7)    NOT NULL,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),   -- fecha del corte
  CONSTRAINT cortes_parcial1_rango  CHECK (parcial1 >= 0 AND parcial1 <= 5),     -- RN-03
  CONSTRAINT cortes_parcial2_rango  CHECK (parcial2 >= 0 AND parcial2 <= 5),
  CONSTRAINT cortes_final_rango     CHECK (examen_final >= 0 AND examen_final <= 5),
  CONSTRAINT cortes_promedio_rango  CHECK (promedio >= 0 AND promedio <= 5),
  CONSTRAINT cortes_resultado_valido CHECK (resultado IN ('Aprobó', 'Perdió'))   -- RN-05
);
CREATE INDEX IF NOT EXISTS idx_cortes_estudiante ON cortes (estudiante_id, created_at DESC);

CREATE OR REPLACE FUNCTION notas_actualizar_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_estudiantes_updated_at ON estudiantes;
CREATE TRIGGER trg_estudiantes_updated_at BEFORE UPDATE ON estudiantes
  FOR EACH ROW EXECUTE FUNCTION notas_actualizar_updated_at();
