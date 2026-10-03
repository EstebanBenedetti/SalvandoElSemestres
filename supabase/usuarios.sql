-- Ejecutar en el SQL Editor del proyecto Supabase.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL CHECK (char_length(trim(nombre)) BETWEEN 1 AND 120),
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'usuario'
    CHECK (rol IN ('admin', 'usuario', 'coordinador')),
  activo BOOLEAN NOT NULL DEFAULT true,
  ultimo_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Evita duplicados aunque el email cambie de mayúsculas/minúsculas.
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email_lower
  ON public.usuarios (lower(email));

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.usuarios_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER trg_usuarios_updated_at
BEFORE UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.usuarios_set_updated_at();

-- No se crean políticas para anon/authenticated: la tabla debe consultarse
-- desde un backend confiable, nunca exponiendo la service_role key al cliente.
