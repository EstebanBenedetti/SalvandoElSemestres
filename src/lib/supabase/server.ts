import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type UserRole = "admin" | "usuario" | "coordinador";
type UserRow = {
  id: string;
  nombre: string;
  email: string;
  password_hash: string;
  rol: UserRole;
  activo: boolean;
  ultimo_login: string | null;
  created_at: string;
  updated_at: string;
};

type PasswordResetRow = {
  id: string;
  usuario_id: string;
  token_hash: string;
  expira_en: string;
  usado_en: string | null;
  creado_en: string;
};

type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: UserRow;
        Insert: Omit<UserRow, "id" | "ultimo_login" | "created_at" | "updated_at"> & {
          id?: string;
          ultimo_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<UserRow>;
        Relationships: [];
      };
      restablecimientos_contrasena: {
        Row: PasswordResetRow;
        Insert: Omit<PasswordResetRow, "id" | "usado_en" | "creado_en"> & {
          id?: string;
          usado_en?: string | null;
          creado_en?: string;
        };
        Update: Partial<PasswordResetRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      contar_solicitudes_rest_contrasena: {
        Args: { p_usuario_id: string };
        Returns: number;
      };
      buscar_token_rest_contrasena_vigente: {
        Args: { p_token_hash: string };
        Returns: { id: string; usuario_id: string }[];
      };
      marcar_token_rest_contrasena_usado: {
        Args: { p_token_id: string };
        Returns: boolean;
      };
      completar_rest_contrasena: {
        Args: { p_token_id: string; p_usuario_id: string; p_password_hash: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let adminClient: SupabaseClient<Database> | undefined;

export function getSupabaseAdmin() {
  if (adminClient) return adminClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Falta configurar la conexión privada de Supabase.");
  }

  adminClient = createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}