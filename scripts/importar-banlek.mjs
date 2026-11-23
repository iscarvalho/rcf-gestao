#!/usr/bin/env node
// Importa os eventos da Banlek ("Meus eventos") a partir do JSON exportado do painel.
//
// Lê supabase/carga/banlek-eventos.json (lista de { id, slug, titulo, data, local, bairro,
// cidade, uf, faturamento, fotos, status }) e imprime o SQL que cria/atualiza locais,
// eventos e o faturamento acumulado. A chave do evento é o id da Banlek (banlek_id).
// Rodar de novo é seguro: nada duplica e do faturamento só entra a diferença.
//
//   node scripts/importar-banlek.mjs supabase/carga/banlek-eventos.json supabase/carga/banlek-divisao.json > /tmp/banlek.sql
//   supabase db query --linked -f /tmp/banlek.sql

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

// Mapeamentos (nomes reais de locais e da equipe) ficam em supabase/carga/mapeamento.json,
// ao lado do JSON dos eventos; supabase/carga/mapeamento.example.json mostra o formato.
//   locais               nome do local no título (maiúsculas, espaços simples) → nome no cadastro
//   locais_por_endereco  quando o título não começa pelo local, o endereço da Banlek → local
//   titulo_e_evento      títulos que começam pelo nome do evento: o evento fica com o título todo
//   responsavel_por_uf   responsável padrão por estado (nome exato em Pessoas), só sem responsável
//   pessoas_por_id_banlek id de fotógrafo na Banlek → nome exato em Pessoas
//   prefixos_compostos   redes cujo título separa a unidade: "REDE | Unidade" → "REDE UNIDADE"
const arquivoEventos = process.argv[2];
const mapeamento = JSON.parse(
  readFileSync(join(dirname(arquivoEventos ?? "."), "mapeamento.json"), "utf8"),
);
const LOCAIS = mapeamento.locais;
const LOCAIS_POR_ENDERECO = mapeamento.locais_por_endereco;
const TITULO_E_EVENTO = new Set(mapeamento.titulo_e_evento);
const RESPONSAVEL_POR_UF = mapeamento.responsavel_por_uf;
const PESSOAS_POR_ID_BANLEK = mapeamento.pessoas_por_id_banlek;
const PREFIXOS_COMPOSTOS = new Set((mapeamento.prefixos_compostos ?? []).map((p) => p.toUpperCase()));

const SIGLAS = new Set(["WOD", "HYROX", "BH", "CF", "CT", "MURPH"]);

const sql = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const chave = (s) => s.replace(/\s+/g, " ").trim().toUpperCase();

function nomeDoEvento(partes) {
  const texto = partes.join(" · ").replace(/\s+/g, " ").toLowerCase();
  const comSiglas = texto.replace(/\p{L}+/gu, (p) => (SIGLAS.has(p.toUpperCase()) ? p.toUpperCase() : p));
  return comSiglas.charAt(0).toUpperCase() + comSiglas.slice(1);
}

// Erros de digitação recorrentes nos títulos da Banlek; só afetam o nome do evento
// (a galeria guarda o título original).
const CORRECOES = [
  [/DOM\|NGO/gi, "DOMINGO"],
  [/HOR[ÁA]RIOSL\b/gi, "HORÁRIOS"],
];

function interpretar(e) {
  const titulo = CORRECOES.reduce((t, [de, para]) => t.replace(de, para), e.titulo);
  // Títulos sem "|" usam " - " como separador.
  const separador = titulo.includes("|") ? "|" : " - ";
  let partes = titulo
    .split(separador)
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => chave(p) !== "RIO CROSSFOTO");
  if (partes.length === 0) throw new Error(`Título vazio: ${e.titulo}`);

  // Redes com unidades em segmentos separados ("REDE | Unidade | ...") viram um local só
  // ("REDE UNIDADE"); as redes ficam em mapeamento.prefixos_compostos.
  if (PREFIXOS_COMPOSTOS.has(chave(partes[0])) && partes.length > 1) {
    partes = [`${partes[0]} ${partes[1]}`, ...partes.slice(2)];
  }

  const primeira = chave(partes[0]);
  const pelotitulo = TITULO_E_EVENTO.has(primeira) ? undefined : LOCAIS[primeira];
  const local = pelotitulo ?? LOCAIS_POR_ENDERECO[chave(e.local)];
  if (!local) {
    throw new Error(
      `Local desconhecido em "${e.titulo}" (endereço: ${e.local}). Inclua em LOCAIS ou LOCAIS_POR_ENDERECO.`,
    );
  }

  // Com o local tirado do título, o evento é o resto; senão, o título todo.
  const resto = pelotitulo ? partes.slice(1) : partes;
  return { local, nome: nomeDoEvento(resto.length ? resto : partes) };
}

const arquivo = arquivoEventos;
if (!arquivo) {
  console.error("Uso: node scripts/importar-banlek.mjs <arquivo.json>");
  process.exit(1);
}

const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

const eventos = JSON.parse(readFileSync(arquivo, "utf8")).map((e) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.data)) throw new Error(`Data inválida em ${e.id}: ${e.data}`);
  return {
    ...e,
    ...interpretar(e),
    // Evento futuro entra como agendado; o resto já foi fotografado e publicado.
    status: e.data > hoje ? "agendado" : "publicado",
  };
});

const locais = new Map();
for (const e of eventos) {
  const k = `${e.local}|${e.cidade}`;
  if (!locais.has(k)) locais.set(k, e);
}

const out = ["-- Gerado por scripts/importar-banlek.mjs. Não editar à mão.", "begin;", ""];

out.push("insert into public.locais (nome, tipo, bairro, cidade, uf) values");
out.push(
  [...locais.values()]
    .map((e) => `  (${sql(e.local)}, 'box', ${sql(e.bairro)}, ${sql(e.cidade)}, ${sql(e.uf)})`)
    .join(",\n"),
);
out.push("on conflict (lower(nome), lower(coalesce(cidade, ''))) do update set");
out.push("  bairro = coalesce(public.locais.bairro, excluded.bairro),");
out.push("  uf = coalesce(public.locais.uf, excluded.uf);", "");

const localId = (e) =>
  `(select id from public.locais where lower(nome) = lower(${sql(e.local)}) and lower(coalesce(cidade, '')) = lower(${sql(e.cidade)}))`;
const responsavelId = (e) => {
  const nome = RESPONSAVEL_POR_UF[e.uf];
  return nome ? `(select id from public.pessoas where nome = ${sql(nome)})` : "null";
};

out.push(
  "insert into public.eventos (banlek_id, banlek_slug, nome, local_id, data, status, galeria_banlek, fotos, responsavel_id) values",
);
out.push(
  eventos
    .map(
      (e) =>
        `  (${sql(e.id)}, ${sql(e.slug)}, ${sql(e.nome)}, ${localId(e)}, ${sql(e.data)}, ${sql(e.status)}, ${sql(e.titulo)}, ${e.fotos ?? "null"}, ${responsavelId(e)})`,
    )
    .join(",\n"),
);
// Nome, local e status editados no app são mantidos; título, data e fotos seguem a Banlek.
out.push("on conflict (banlek_id) do update set");
out.push("  banlek_slug = excluded.banlek_slug,");
out.push("  galeria_banlek = excluded.galeria_banlek,");
out.push("  data = excluded.data,");
out.push("  fotos = excluded.fotos,");
out.push("  responsavel_id = coalesce(public.eventos.responsavel_id, excluded.responsavel_id);", "");

// Faturamento acumulado → só a diferença para o que já está registrado.
// Primeira carga do evento: venda com a data do evento; depois, com a de hoje.
const comVenda = eventos.filter((e) => e.faturamento > 0);
out.push("insert into public.vendas (evento_id, valor, data, origem, chave_externa)");
out.push("select");
out.push("  e.id,");
out.push("  v.valor - coalesce(s.total, 0),");
out.push("  case when s.total is null then e.data else current_date end,");
out.push("  case when s.total is null then 'carga_inicial'::public.origem_venda else 'banlek' end,");
out.push("  'banlek:' || v.banlek_id || ':' || v.valor");
out.push("from (values");
out.push(comVenda.map((e) => `  (${sql(e.id)}, ${e.faturamento.toFixed(2)})`).join(",\n"));
out.push(") as v (banlek_id, valor)");
out.push("join public.eventos e on e.banlek_id = v.banlek_id");
out.push(
  "left join (select evento_id, sum(valor) as total from public.vendas group by evento_id) s on s.evento_id = e.id",
);
out.push("where v.valor - coalesce(s.total, 0) > 0");
out.push("on conflict (chave_externa) do nothing;", "");

// Divisão do faturamento (opcional): supabase/carga/banlek-divisao.json, da aba
// Colaboradores de cada evento. O faturamento da Banlek já vem sem a taxa dela; o
// resto se divide entre administrador(es), fotógrafo(s) e a empresa, que fica com a
// sobra (a parte dela e a de fotos enviadas pela própria conta da Rio CrossFoto).
// Percentuais sobre o valor bruto (com a taxa da Banlek), para somarem 100%.
const arquivoDivisao = process.argv[3];
let comDivisao = 0;
if (arquivoDivisao) {
  const centavos = (v) => Math.round(v * 100) / 100;
  const porEvento = new Map(eventos.map((e) => [e.id, e]));
  const linhas = [];
  const divisoes = JSON.parse(readFileSync(arquivoDivisao, "utf8"));
  for (const d of divisoes) {
    const e = porEvento.get(d.id);
    if (!e || e.faturamento <= 0) continue;
    const base = e.faturamento;
    const bruto = base / ((100 - d.taxas.banlek) / 100);
    const pct = (v) => centavos((v / bruto) * 100);
    const partes = [{ papel: "banlek", nome: "Banlek", valor: centavos(bruto - base) }];
    for (const a of d.administradores) {
      partes.push({ papel: "administrador", nome: a.nome, banlekId: a.banlek_id, valor: centavos((bruto * a.taxa) / 100) });
    }
    for (const f of d.fotografos) {
      // A conta da própria Rio CrossFoto como fotógrafa entra na parte da empresa.
      if (f.vendas > 0 && f.banlek_id !== d.organizador_banlek_id) {
        partes.push({ papel: "fotografo", nome: f.nome, banlekId: f.banlek_id, valor: f.vendas });
      }
    }
    const repassado = partes.filter((p) => p.papel !== "banlek").reduce((s, p) => s + p.valor, 0);
    partes.push({ papel: "empresa", nome: "Rio CrossFoto", valor: centavos(Math.max(0, base - repassado)) });
    for (const p of partes) linhas.push({ ...p, evento: d.id, percentual: pct(p.valor) });
    comDivisao++;
  }

  // Pessoas da equipe pelo id delas na Banlek (fotógrafos de fora ficam só com o nome).
  const pessoaId = (banlekId) => {
    const nome = PESSOAS_POR_ID_BANLEK[banlekId];
    return nome ? `(select id from public.pessoas where nome = ${sql(nome)})` : "null";
  };

  out.push("-- Divisão: refeita do zero a cada importação para os eventos do arquivo.");
  out.push("delete from public.divisoes where evento_id in (select id from public.eventos where banlek_id in (");
  out.push(divisoes.map((d) => `  ${sql(d.id)}`).join(",\n"));
  out.push("));");
  out.push("insert into public.divisoes (evento_id, papel, nome, pessoa_id, percentual, valor)");
  out.push("select e.id, v.papel::public.papel_divisao, v.nome, v.pessoa_id, v.percentual, v.valor from (values");
  out.push(
    linhas
      .map(
        (l) =>
          `  (${sql(l.evento)}, ${sql(l.papel)}, ${sql(l.nome)}, ${l.banlekId ? pessoaId(l.banlekId) : "null::uuid"}, ${l.percentual.toFixed(2)}, ${l.valor.toFixed(2)})`,
      )
      .join(",\n"),
  );
  out.push(") as v (banlek_id, papel, nome, pessoa_id, percentual, valor)");
  out.push("join public.eventos e on e.banlek_id = v.banlek_id;", "");
}

out.push("commit;");

console.log(out.join("\n"));
console.error(
  `${locais.size} locais, ${eventos.length} eventos (${eventos.filter((e) => e.status === "agendado").length} agendados), ` +
    `${comVenda.length} com faturamento (R$ ${comVenda.reduce((s, e) => s + e.faturamento, 0).toFixed(2)}), ` +
    `${comDivisao} com divisão.`,
);
