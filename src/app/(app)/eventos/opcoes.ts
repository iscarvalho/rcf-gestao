import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Locais e pessoas ativas para os selects do formulário de evento.
 * Administradores não fotografam, então ficam fora da lista de responsáveis.
 * `manterPessoaId` garante que o responsável atual apareça mesmo se estiver
 * inativo (ou se for administrador).
 */
export async function opcoesDoEvento(manterPessoaId?: string | null) {
  const supabase = await createClient();
  const [locais, pessoas] = await Promise.all([
    supabase.from("locais").select("id, nome, cidade").order("nome"),
    supabase.from("pessoas").select("id, nome, ativo, papel").order("nome"),
  ]);
  if (locais.error) throw locais.error;
  if (pessoas.error) throw pessoas.error;

  return {
    locais: locais.data.map((l) => ({
      valor: l.id,
      rotulo: l.cidade ? `${l.nome} (${l.cidade})` : l.nome,
    })),
    pessoas: pessoas.data
      .filter((p) => (p.ativo && p.papel !== "administrador") || p.id === manterPessoaId)
      .map((p) => ({ valor: p.id, rotulo: p.nome })),
  };
}
