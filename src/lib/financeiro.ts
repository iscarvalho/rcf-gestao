import "server-only";

import { cache } from "react";

import type { ResumoEvento } from "@/lib/resumo";
import { createClient } from "@/lib/supabase/server";

export const PERIODOS = {
  "3m": { rotulo: "3 meses", meses: 3 },
  "6m": { rotulo: "6 meses", meses: 6 },
  "12m": { rotulo: "12 meses", meses: 12 },
} as const;

export type Periodo = keyof typeof PERIODOS;
export const PERIODO_PADRAO: Periodo = "6m";
export const ehPeriodo = (v: unknown): v is Periodo => typeof v === "string" && v in PERIODOS;

export type Mes = { chave: string; rotulo: string; faturamento: number; saidas: number };
export type ResultadoLocal = { local: string; faturamento: number; custos: number; resultado: number };
/** Quanto do faturamento do período vai para uma pessoa (administração e/ou fotos). */
export type Repasse = { nome: string; equipe: boolean; administrador: number; fotografo: number; total: number };

const FUSO = "America/Sao_Paulo";
const soma = (valores: number[]) => Math.round(valores.reduce((a, b) => a + b, 0) * 100) / 100;

/** "AAAA-MM-DD" de hoje no fuso da empresa. */
const hojeISO = () => new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }).format(new Date());

/** Ano e mês de hoje no fuso da empresa. */
function mesAtual() {
  const [ano, mes] = hojeISO().split("-");
  return { ano: Number(ano), mes: Number(mes) };
}

/**
 * Evento fotografado e ainda não publicado na Banlek: tem custos, mas ainda
 * não teve chance de vender. A margem dele não é prejuízo.
 */
export const aguardandoVendas = (e: Pick<ResumoEvento, "status">) => e.status === "fotografado";

const PROXIMOS_NO_PAINEL = 8;

/** Os últimos `quantidade` meses (o atual incluído), do mais antigo ao mais recente. */
function ultimosMeses(quantidade: number) {
  const { ano, mes } = mesAtual();
  const nomes = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" });
  return Array.from({ length: quantidade }, (_, i) => {
    const d = new Date(Date.UTC(ano, mes - 1 - (quantidade - 1 - i), 1));
    const chave = d.toISOString().slice(0, 7);
    const rotulo = nomes.format(d).replace(".", "");
    return { chave, rotulo: `${rotulo}/${String(d.getUTCFullYear()).slice(2)}` };
  });
}

/**
 * Números do painel para o período: KPIs, série mensal, margem por local e
 * por evento. O saldo de caixa considera todo o histórico (entradas − saídas).
 *
 * KPIs e série mensal contam o dinheiro pela data em que entrou ou saiu. A
 * margem por evento e por local é a de todo o histórico dos eventos com data
 * no período (vendas − custos do evento), sem despesas gerais.
 */
// cache: o cabeçalho e o corpo do painel leem os mesmos números na mesma requisição.
export const carregarPainel = cache(async (periodo: Periodo) => {
  const supabase = await createClient();
  const meses = ultimosMeses(PERIODOS[periodo].meses);
  const inicio = `${meses[0].chave}-01`;
  const hoje = hojeISO();

  const [vendas, custos, despesas, eventos, proximos, divisoes] = await Promise.all([
    supabase.from("vendas").select("valor, data, evento_id"),
    supabase.from("custos").select("valor, data"),
    supabase.from("despesas").select("valor, data"),
    supabase
      .from("eventos_resumo")
      .select("*")
      .gte("data", inicio)
      .order("data", { ascending: false })
      .overrideTypes<ResumoEvento[], { merge: false }>(),
    supabase
      .from("eventos_resumo")
      .select("*")
      .eq("status", "agendado")
      .gte("data", hoje)
      .order("data", { ascending: true })
      .limit(PROXIMOS_NO_PAINEL)
      .overrideTypes<ResumoEvento[], { merge: false }>(),
    supabase
      .from("divisoes")
      .select("evento_id, papel, nome, valor, pessoa:pessoas(nome)")
      .neq("papel", "banlek"),
  ]);
  for (const r of [vendas, custos, despesas, eventos, proximos, divisoes]) if (r.error) throw r.error;

  const noPeriodo = (data: string) => data >= inicio;
  const valores = (linhas: { valor: number; data: string }[] | null, filtro = noPeriodo) =>
    (linhas ?? []).filter((l) => filtro(l.data)).map((l) => Number(l.valor));
  const sempre = () => true;

  const faturamento = soma(valores(vendas.data));
  const custosEventos = soma(valores(custos.data));
  const despesasGerais = soma(valores(despesas.data));
  const saldoCaixa = soma([
    soma(valores(vendas.data, sempre)),
    -soma(valores(custos.data, sempre)),
    -soma(valores(despesas.data, sempre)),
  ]);

  const porMes = new Map(meses.map((m) => [m.chave, { ...m, faturamento: 0, saidas: 0 }]));
  const acumular = (
    linhas: { valor: number; data: string }[] | null,
    campo: "faturamento" | "saidas",
  ) => {
    for (const l of linhas ?? []) {
      const mes = porMes.get(l.data.slice(0, 7));
      if (mes) mes[campo] = soma([mes[campo], Number(l.valor)]);
    }
  };
  acumular(vendas.data, "faturamento");
  acumular(custos.data, "saidas");
  acumular(despesas.data, "saidas");

  // Última data com venda registrada: as vendas são datadas no dia em que o
  // total da Banlek é atualizado, então isso diz quão frescos estão os números.
  const ultimaVenda = (vendas.data ?? []).reduce<string | null>(
    (max, v) => (max === null || v.data > max ? v.data : max),
    null,
  );

  // Divisão: cada venda do período é repartida na proporção da divisão do evento
  // (empresa, administrador, fotógrafos). Vendas de evento sem divisão ficam de fora.
  const partesPorEvento = new Map<string, { papel: string; nome: string; equipe: boolean; fracao: number }[]>();
  const totalPorEvento = new Map<string, number>();
  for (const d of divisoes.data ?? []) {
    totalPorEvento.set(d.evento_id, (totalPorEvento.get(d.evento_id) ?? 0) + Number(d.valor));
  }
  for (const d of divisoes.data ?? []) {
    const total = totalPorEvento.get(d.evento_id) ?? 0;
    if (total <= 0) continue;
    const lista = partesPorEvento.get(d.evento_id) ?? [];
    lista.push({ papel: d.papel, nome: d.pessoa?.nome ?? d.nome, equipe: d.pessoa !== null, fracao: Number(d.valor) / total });
    partesPorEvento.set(d.evento_id, lista);
  }
  let parteEmpresa = 0;
  let semDivisao = 0;
  const repasses = new Map<string, Repasse>();
  for (const v of (vendas.data ?? []).filter((v) => noPeriodo(v.data))) {
    const partes = partesPorEvento.get(v.evento_id);
    if (!partes) {
      semDivisao += Number(v.valor);
      continue;
    }
    for (const p of partes) {
      const valor = Number(v.valor) * p.fracao;
      if (p.papel === "empresa") {
        parteEmpresa += valor;
        continue;
      }
      const r = repasses.get(p.nome) ?? { nome: p.nome, equipe: p.equipe, administrador: 0, fotografo: 0, total: 0 };
      if (p.papel === "administrador") r.administrador += valor;
      else r.fotografo += valor;
      r.total += valor;
      repasses.set(p.nome, r);
    }
  }
  const arredonda = (n: number) => Math.round(n * 100) / 100;

  const realizados = (eventos.data ?? []).filter((e) => e.status !== "agendado");

  // Por local, só eventos que já puderam vender; os que aguardam vendas
  // apareceriam como prejuízo.
  const locais = new Map<string, ResultadoLocal>();
  for (const e of realizados.filter((e) => !aguardandoVendas(e))) {
    const atual = locais.get(e.local_id) ?? { local: e.local_nome, faturamento: 0, custos: 0, resultado: 0 };
    atual.faturamento = soma([atual.faturamento, Number(e.total_vendas)]);
    atual.custos = soma([atual.custos, Number(e.total_custos)]);
    atual.resultado = soma([atual.faturamento, -atual.custos]);
    locais.set(e.local_id, atual);
  }

  return {
    kpis: {
      faturamento,
      custosEventos,
      despesasGerais,
      resultado: soma([faturamento, -custosEventos, -despesasGerais]),
      saldoCaixa,
      parteEmpresa: arredonda(parteEmpresa),
      semDivisao: arredonda(semDivisao),
    },
    // Quem recebe mais primeiro; a equipe (com cadastro em Pessoas) é destacada na tela.
    repasses: [...repasses.values()]
      .map((r) => ({
        ...r,
        administrador: arredonda(r.administrador),
        fotografo: arredonda(r.fotografo),
        total: arredonda(r.total),
      }))
      .filter((r) => r.total > 0)
      .sort((a, b) => b.total - a.total) satisfies Repasse[],
    inicioRotulo: meses[0].rotulo,
    ultimaVenda,
    mensal: [...porMes.values()] satisfies Mes[],
    porLocal: [...locais.values()].sort((a, b) => b.resultado - a.resultado),
    // Os que aguardam vendas vão para o fim, depois dos que já venderam.
    eventos: realizados.sort(
      (a, b) =>
        Number(aguardandoVendas(a)) - Number(aguardandoVendas(b)) ||
        Number(b.resultado) - Number(a.resultado),
    ),
    proximos: proximos.data ?? [],
  };
});
