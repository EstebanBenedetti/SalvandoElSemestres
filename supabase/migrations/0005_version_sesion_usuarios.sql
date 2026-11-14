-- The isolated academic E2E database has no auth table; Supabase owns usuarios.
ALTER TABLE IF EXISTS public.usuarios
  ADD COLUMN IF NOT EXISTS session_version UUID NOT NULL DEFAULT gen_random_uuid();

CREATE OR REPLACE FUNCTION public.usuarios_rotar_version_sesion()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.password_hash IS DISTINCT FROM OLD.password_hash
    OR NEW.rol IS DISTINCT FROM OLD.rol
    OR NEW.activo IS DISTINCT FROM OLD.activo THEN
    NEW.session_version = gen_random_uuid();
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.usuarios') IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_usuarios_rotar_version_sesion ON public.usuarios';
    EXECUTE 'CREATE TRIGGER trg_usuarios_rotar_version_sesion
      BEFORE UPDATE OF password_hash, rol, activo ON public.usuarios
      FOR EACH ROW
      EXECUTE FUNCTION public.usuarios_rotar_version_sesion()';
  END IF;
END;
$$;