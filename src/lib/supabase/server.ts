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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
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