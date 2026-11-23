import { z } from "zod";

import type { Enums } from "@/lib/database.types";

export const STATUS_EVENTO = {
  agendado: "Agendado",
  fotografado: "Fotografado",
  publicado: "Publicado na Banlek",
  fechado: "Fechado",
} as const satisfies Record<Enums<"status_evento">, string>;

export const TIPO_CUSTO = {
  inscricao: "Inscrição",
  deslocamento: "Deslocamento",
  alimentacao: "Alimentação",
  outros: "Outros",
} as const satisfies Record<Enums<"tipo_custo">, string>;

export const TIPO_LOCAL = {
  box: "Box",
  organizador: "Organizador",
} as const satisfies Record<Enums<"tipo_local">, string>;

export const PAPEL_PESSOA = {
  socio: "Sócio(a)",
  fotografo: "Fotógrafo(a)",
  administrador: "Administrador(a)",
} as const satisfies Record<Enums<"papel_pessoa">, string>;

export const CATEGORIA_DESPESA = {
  equipamento: "Equipamento",
  software: "Software e assinaturas",
  marketing: "Marketing",
  transporte: "Transporte",
  impostos: "Impostos",
  outros: "Outros",
} as const satisfies Record<Enums<"categoria_despesa">, string>;

export const ORIGEM_VENDA = {
  manual: "Atualização manual",
  banlek: "Carga da Banlek",
  carga_inicial: "Carga inicial",
} as const satisfies Record<Enums<"origem_venda">, string>;

const chaves = <T extends Record<string, string>>(obj: T) =>
  Object.keys(obj) as [keyof T & string, ...(keyof T & string)[]];

/** Campo de texto opcional: string vazia vira null. */
const textoOpcional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional()
  .transform((v) => v ?? null);

const textoObrigatorio = (campo: string) =>
  z.string({ error: `Informe ${campo}.` }).trim().min(1, `Informe ${campo}.`);

const idOpcional = z
  .string()
  .transform((v) => (v === "" ? null : v))
  .pipe(z.uuid().nullable())
  .optional()
  .transform((v) => v ?? null);

/**
 * Converte valores digitados em reais para número.
 * Aceita "1.234,56", "1234,56", "1234.56", "1.234" (milhar) e "R$ 120".
 */
export function parseReais(entrada: string): number | null {
  const limpo = entrada.replace(/R\$|\s/g, "");
  if (limpo === "") return null;
  const soMilhar = /^\d{1,3}(\.\d{3})+$/.test(limpo);
  const normalizado = limpo.includes(",") || soMilhar
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo;
  if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) return null;
  return Number(normalizado);
}

const reais = z
  .string({ error: "Informe o valor." })
  .transform((v, ctx) => {
    const valor = parseReais(v);
    if (valor === null || valor <= 0) {
      ctx.addIssue({ code: "custom", message: "Valor inválido. Use, por exemplo, 120,50." });
      return z.NEVER;
    }
    return valor;
  });

const dataISO = z.iso.date({ error: "Informe uma data válida." });

export const localSchema = z.object({
  nome: textoObrigatorio("o nome do local"),
  tipo: z.enum(chaves(TIPO_LOCAL)),
  bairro: textoOpcional,
  cidade: textoOpcional,
  uf: z
    .string()
    .trim()
    .toUpperCase()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.string().regex(/^[A-Z]{2}$/, "Use a sigla do estado, ex.: MG.").nullable())
    .optional()
    .transform((v) => v ?? null),
  contato_nome: textoOpcional,
  contato_telefone: textoOpcional,
  contato_email: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.email("E-mail inválido.").nullable())
    .optional()
    .transform((v) => v ?? null),
  instagram: textoOpcional,
  observacoes: textoOpcional,
});

export const pessoaSchema = z.object({
  nome: textoObrigatorio("o nome"),
  papel: z.enum(chaves(PAPEL_PESSOA)),
});

export const eventoSchema = z.object({
  nome: textoObrigatorio("o nome do evento"),
  local_id: z.uuid("Escolha o local."),
  data: dataISO,
  responsavel_id: idOpcional,
  status: z.enum(chaves(STATUS_EVENTO)),
  galeria_banlek: textoOpcional,
  observacoes: textoOpcional,
});

export const custoSchema = z.object({
  evento_id: z.uuid(),
  tipo: z.enum(chaves(TIPO_CUSTO)),
  descricao: textoOpcional,
  valor: reais,
  data: dataISO,
});

export const despesaSchema = z.object({
  descricao: textoObrigatorio("a descrição"),
  categoria: z.enum(chaves(CATEGORIA_DESPESA)),
  valor: reais,
  data: dataISO,
});

/** Novo total acumulado de um evento, como aparece no painel da Banlek. */
export const totalVendasSchema = z.object({
  evento_id: z.uuid(),
  total: reais,
});

const brl =new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatarReais = (valor: number) => brl.format(valor);

/** "Lourdes · Belo Horizonte/MG", omitindo o que estiver vazio. */
export function enderecoLocal(l: { bairro?: string | null; cidade?: string | null; uf?: string | null }) {
  const cidade = [l.cidade, l.uf].filter(Boolean).join("/");
  return [l.bairro, cidade].filter(Boolean).join(" · ");
}

/** Datas do banco vêm como "AAAA-MM-DD"; formata sem passar por fuso horário. */
export function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** Links do evento na Banlek: o álbum público (para compartilhar) e a página no painel. */
export function linksBanlek(e: { banlek_id: string | null; banlek_slug: string | null }) {
  return {
    album: e.banlek_slug ? `https://banlek.com/album/${e.banlek_slug}` : null,
    painel: e.banlek_id ? `https://banlek.com/dashboard/events/${e.banlek_id}` : null,
  };
}
