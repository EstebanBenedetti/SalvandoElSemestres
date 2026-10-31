-- M2: vista del corte más reciente por estudiante y cierre de acceso público

CREATE OR REPLACE VIEW v_ultimo_corte
WITH (security_invoker = true) AS
SELECT DISTINCT ON (c.estudiante_id)
  c.estudiante_id,
  e.nombre            AS estudiante_nombre,
  c.id                AS corte_id,
  c.parcial1, c.parcial2, c.examen_final,
  c.promedio, c.resultado,
  c.created_at
FROM cortes c
JOIN estudiantes e ON e.id = c.estudiante_id
WHERE e.activo = true
ORDER BY c.estudiante_id, c.created_at DESC, c.id DESC;   -- RN-08: desempata por id si coinciden los timestamps

ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cortes      ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON estudiantes, cortes FROM anon, authenticated;
REVOKE ALL ON v_ultimo_corte FROM anon, authenticated;
