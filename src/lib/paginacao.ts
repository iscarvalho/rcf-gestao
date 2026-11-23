import { redirect } from "next/navigation";

/** Quantos itens por página o usuário pode escolher, e o padrão. */
export const TAMANHOS_PAGINA = [10, 20, 50, 100] as const;
export const POR_PAGINA_PADRAO = 20;

type Busca = Record<string, string | string[] | undefined>;

const inteiro = (v: string | string[] | undefined) => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

/**
 * Lê `?pagina=` e `?por=` da URL. Valores inválidos voltam ao padrão.
 * `de` e `ate` já vêm no formato do `.range()` do Supabase (inclusivo).
 */
export function lerPaginacao(busca: Busca) {
  const por = inteiro(busca.por);
  const porPagina = TAMANHOS_PAGINA.includes(por as (typeof TAMANHOS_PAGINA)[number])
    ? (por as number)
    : POR_PAGINA_PADRAO;
  const pagina = inteiro(busca.pagina) ?? 1;
  const de = (pagina - 1) * porPagina;
  return { pagina, porPagina, de, ate: de + porPagina - 1 };
}

export type Paginacao = ReturnType<typeof lerPaginacao>;

/** Última página para `total` itens (no mínimo 1). */
export const ultimaPagina = (total: number, porPagina: number) =>
  Math.max(1, Math.ceil(total / porPagina));

/** URL de uma página da lista, mantendo os filtros da tela (`params`). */
export function hrefPagina(
  caminho: string,
  params: Record<string, string | null | undefined>,
  pagina: number,
  porPagina: number,
) {
  const busca = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) busca.set(k, v);
  if (pagina > 1) busca.set("pagina", String(pagina));
  if (porPagina !== POR_PAGINA_PADRAO) busca.set("por", String(porPagina));
  const s = busca.toString();
  return s ? `${caminho}?${s}` : caminho;
}

/** Página além do fim (ex.: depois de remover itens) leva à última que existe. */
export function exigirPaginaValida(
  total: number,
  { pagina, porPagina }: Paginacao,
  caminho: string,
  params: Record<string, string | null | undefined> = {},
) {
  const ultima = ultimaPagina(total, porPagina);
  if (pagina > ultima) redirect(hrefPagina(caminho, params, ultima, porPagina));
}

/**
 * O PostgREST recusa um offset além do fim (PGRST103) em vez de devolver uma
 * lista vazia. Nesse caso volta para a página 1, mantendo os filtros.
 * Chame antes de lançar o erro da consulta.
 */
export function tratarForaDoFim(
  erro: { code?: string } | null,
  { porPagina }: Paginacao,
  caminho: string,
  params: Record<string, string | null | undefined> = {},
) {
  if (erro?.code === "PGRST103") redirect(hrefPagina(caminho, params, 1, porPagina));
}
