import "server-only";

import { createServerClient } from "@supabase/ssr";
import { io } from "next/cache";
import { cookies } from "next/headers";

import type { Database } from "@/lib/database.types";
import { supabaseEnv } from "@/lib/supabase/env";

/** Cliente do Supabase para Server Components, Server Actions e Route Handlers. */
export async function createClient() {
  const cookieStore = await cookies();
  // O supabase-js lê o relógio (Date.now) para checar a validade do token.
  // Com Cache Components, isso precisa ficar fora da pré-renderização.
  await io();
  const { url, key } = supabaseEnv();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Chamado de um Server Component, onde cookies são só leitura.
          // O proxy renova a sessão, então pode ser ignorado.
        }
      },
    },
  });
}
