UPDATE public.cortes
SET resultado = CASE WHEN promedio >= 3.00 THEN 'Aprobó' ELSE 'Perdió' END
WHERE resultado IS DISTINCT FROM
  CASE WHEN promedio >= 3.00 THEN 'Aprobó' ELSE 'Perdió' END;