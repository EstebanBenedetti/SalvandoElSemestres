CREATE TABLE IF NOT EXISTS public.restablecimientos_contrasena (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expira_en TIMESTAMPTZ NOT NULL,
  usado_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restablecimientos_contrasena_usuario_id
  ON public.restablecimientos_contrasena (usuario_id);

ALTER TABLE public.restablecimientos_contrasena ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.restablecimientos_contrasena TO service_role;

CREATE OR REPLACE FUNCTION public.contar_solicitudes_rest_contrasena(p_usuario_id UUID)
RETURNS BIGINT
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT count(*)
  FROM public.restablecimientos_contrasena
  WHERE usuario_id = p_usuario_id
    AND creado_en >= now() - interval '15 minutes';
$$;

CREATE OR REPLACE FUNCTION public.buscar_token_rest_contrasena_vigente(p_token_hash TEXT)
RETURNS TABLE (id UUID, usuario_id UUID)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT r.id, r.usuario_id
  FROM public.restablecimientos_contrasena AS r
  WHERE r.token_hash = p_token_hash
    AND r.usado_en IS NULL
    AND r.expira_en > now()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.marcar_token_rest_contrasena_usado(p_token_id UUID)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE public.restablecimientos_contrasena
  SET usado_en = now()
  WHERE id = p_token_id
    AND usado_en IS NULL
    AND expira_en > now();

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.completar_rest_contrasena(
  p_token_id UUID,
  p_usuario_id UUID,
  p_password_hash TEXT
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  usuario_token UUID;
BEGIN
  SELECT r.usuario_id
    INTO usuario_token
  FROM public.restablecimientos_contrasena AS r
  WHERE r.id = p_token_id
    AND r.usuario_id = p_usuario_id
    AND r.usado_en IS NULL
    AND r.expira_en > now()
  FOR UPDATE;

  IF usuario_token IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.usuarios
  SET password_hash = p_password_hash
  WHERE id = p_usuario_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE public.restablecimientos_contrasena
  SET usado_en = now()
  WHERE id = p_token_id
    AND usado_en IS NULL
    AND expira_en > now();

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE public.restablecimientos_contrasena
  SET usado_en = now()
  WHERE usuario_id = p_usuario_id
    AND usado_en IS NULL;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.contar_solicitudes_rest_contrasena(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.buscar_token_rest_contrasena_vigente(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.marcar_token_rest_contrasena_usado(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.completar_rest_contrasena(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.contar_solicitudes_rest_contrasena(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.buscar_token_rest_contrasena_vigente(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.marcar_token_rest_contrasena_usado(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.completar_rest_contrasena(UUID, UUID, TEXT) TO service_role;

NOTIFY pgrst, 'reload schema';
