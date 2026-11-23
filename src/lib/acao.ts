import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";
import type { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type EstadoForm = {
  erro?: string;
  campos?: Record<string, string[] | undefined>;
  ok?: boolean;
  /** Texto mostrado ao lado do botão depois de salvar. */
  mensagem?: string;
};

export type Acao = (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;

/** Valida o FormData com um schema Zod e devolve os dados ou o estado de erro. */
export function validar<S extends z.ZodType>(
  schema: S,
  formData: FormData,
): { dados: z.output<S> } | { estado: EstadoForm } {
  const resultado = schema.safeParse(Object.fromEntries(formData));
  if (resultado.success) return { dados: resultado.data };

  const campos: Record<string, string[]> = {};
  for (const issue of resultado.error.issues) {
    const chave = String(issue.path[0] ?? "_");
    (campos[chave] ??= []).push(issue.message);
  }
  return { estado: { erro: "Confira os campos destacados.", campos } };
}

/** Cliente do Supabase com usuário garantido; Server Actions não passam pelo proxy de forma confiável. */
export async function clienteAutenticado() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) throw new Error("Sessão expirada. Entre de novo.");
  return supabase;
}

export function erroDoBanco(erro: PostgrestError): EstadoForm {
  if (erro.code === "23505") return { erro: "Já existe um registro com esses dados." };
  if (erro.code === "23503") {
    return { erro: "Este registro está ligado a outros e não pode ser removido." };
  }
  console.error(erro);
  return { erro: "Não foi possível salvar. Tente de novo." };
}
