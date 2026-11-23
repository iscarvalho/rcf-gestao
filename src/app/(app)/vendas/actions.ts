"use server";

import { revalidatePath } from "next/cache";

import { clienteAutenticado, erroDoBanco, validar, type EstadoForm } from "@/lib/acao";
import { formatarReais, parseReais, totalVendasSchema } from "@/lib/dominio";

type Supabase = Awaited<ReturnType<typeof clienteAutenticado>>;

/** Hoje no fuso da empresa, como "AAAA-MM-DD". */
const hoje = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

function revalidarVendas(eventoIds: string[]) {
  revalidatePath("/vendas");
  revalidatePath("/eventos");
  revalidatePath("/painel");
  for (const id of eventoIds) revalidatePath(`/eventos/${id}`);
}

async function totaisAtuais(supabase: Supabase, eventoIds: string[]) {
  const { data, error } = await supabase
    .from("vendas")
    .select("evento_id, valor")
    .in("evento_id", eventoIds);
  if (error) throw error;
  const totais = new Map<string, number>();
  for (const v of data) totais.set(v.evento_id, (totais.get(v.evento_id) ?? 0) + Number(v.valor));
  return totais;
}

/**
 * Registra a diferença entre o novo total acumulado e o que já está no sistema,
 * datada de hoje. Assim o gráfico mensal mostra quando o dinheiro entrou.
 */
async function registrarNovosTotais(supabase: Supabase, novos: Map<string, number>) {
  const atuais = await totaisAtuais(supabase, [...novos.keys()]);
  const linhas = [];
  const menores: string[] = [];
  for (const [eventoId, total] of novos) {
    const diferenca = Math.round((total - (atuais.get(eventoId) ?? 0)) * 100) / 100;
    if (diferenca > 0) {
      linhas.push({ evento_id: eventoId, valor: diferenca, data: hoje(), origem: "manual" as const });
    } else if (diferenca < 0) {
      menores.push(eventoId);
    }
  }
  if (linhas.length) {
    const { error } = await supabase.from("vendas").insert(linhas);
    if (error) return { erro: erroDoBanco(error), atualizados: 0, menores };
  }
  return { erro: null, atualizados: linhas.length, menores, atuais };
}

/** Atualiza o total de um evento (página do evento). */
export async function atualizarTotalEvento(
  _: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const v = validar(totalVendasSchema, formData);
  if ("estado" in v) return v.estado;

  const supabase = await clienteAutenticado();
  const r = await registrarNovosTotais(supabase, new Map([[v.dados.evento_id, v.dados.total]]));
  if (r.erro) return r.erro;
  if (r.menores.length) {
    const atual = r.atuais?.get(v.dados.evento_id) ?? 0;
    return {
      campos: {
        total: [`O total já registrado é ${formatarReais(atual)}. Remova um lançamento para reduzir.`],
      },
    };
  }

  revalidarVendas([v.dados.evento_id]);
  return {
    ok: true,
    mensagem: r.atualizados ? "Faturamento atualizado." : "O total já estava em dia.",
  };
}

/** Atualiza vários eventos de uma vez (tela de vendas). Campos: total_<eventoId>. */
export async function atualizarTotaisEmLote(
  _: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const novos = new Map<string, number>();
  const campos: Record<string, string[]> = {};

  for (const [chave, bruto] of formData.entries()) {
    if (!chave.startsWith("total_") || typeof bruto !== "string" || !bruto.trim()) continue;
    const valor = parseReais(bruto);
    if (valor === null) {
      campos[chave] = ["Valor inválido."];
      continue;
    }
    novos.set(chave.slice("total_".length), valor);
  }

  if (Object.keys(campos).length) return { erro: "Confira os valores destacados.", campos };
  if (!novos.size) return { erro: "Preencha o novo total de pelo menos um evento." };

  const supabase = await clienteAutenticado();
  const r = await registrarNovosTotais(supabase, novos);
  if (r.erro) return r.erro;

  revalidarVendas([...novos.keys()]);

  if (r.menores.length) {
    for (const id of r.menores) {
      campos[`total_${id}`] = ["Menor que o total já registrado."];
    }
    return {
      erro: `${r.atualizados} evento(s) atualizado(s). ${r.menores.length} ficaram de fora por ter total menor que o registrado.`,
      campos,
    };
  }

  return {
    ok: true,
    mensagem:
      r.atualizados === 0
        ? "Nenhuma mudança: os totais já estavam em dia."
        : `${r.atualizados} evento(s) atualizado(s).`,
  };
}

export async function removerVenda(eventoId: string, vendaId: string) {
  const supabase = await clienteAutenticado();
  const { error } = await supabase
    .from("vendas")
    .delete()
    .eq("id", vendaId)
    .eq("evento_id", eventoId);
  if (error) throw new Error(erroDoBanco(error).erro);
  revalidarVendas([eventoId]);
}
