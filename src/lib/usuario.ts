import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type Usuario = {
  /** Nome em Pessoas (se o login tiver cadastro) ou o do perfil; null se nenhum. */
  nome: string | null;
  email: string;
  /** Cadastro em Pessoas ligado a este login, se houver. */
  pessoaId: string | null;
};

/**
 * Quem está logado. O e-mail vem da sessão. O nome vem do cadastro em Pessoas
 * ligado ao login (user_id); sem cadastro, do nome salvo no perfil
 * (user_metadata.nome). Null sem sessão. Em cache por requisição.
 */
export const usuarioAtual = cache(async (): Promise<Usuario | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;

  const { data: pessoa } = await supabase
    .from("pessoas")
    .select("id, nome")
    .eq("user_id", claims.sub)
    .maybeSingle();

  const nomePerfil = (claims.user_metadata as { nome?: unknown } | undefined)?.nome;
  return {
    nome: pessoa?.nome ?? (typeof nomePerfil === "string" && nomePerfil ? nomePerfil : null),
    email: String(claims.email ?? ""),
    pessoaId: pessoa?.id ?? null,
  };
});

/** Iniciais para o avatar: primeira e última palavra do nome, ou a 1ª letra do e-mail. */
export function iniciais({ nome, email }: Pick<Usuario, "nome" | "email">) {
  const partes = (nome ?? "").trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return email.slice(0, 1).toUpperCase();
  const [primeira, ultima] = [partes[0], partes.length > 1 ? partes.at(-1)! : ""];
  return (primeira[0] + (ultima[0] ?? "")).toUpperCase();
}
