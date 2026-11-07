ALTER TABLE public.cortes
  ADD COLUMN IF NOT EXISTS registrado_por TEXT;

COMMENT ON COLUMN public.cortes.registrado_por IS
  'Correo de la sesión que registró el corte; NULL para registros anteriores o de scripts.';