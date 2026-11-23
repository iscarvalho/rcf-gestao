#!/usr/bin/env node
// Generates the SQL for the public demo: fictional venues, people, events, sales,
// revenue splits, costs and expenses, plus the demo login. Nothing here is real.
//
// Deterministic (seeded) data, with dates relative to the day it runs, so the
// dashboard always has the last months filled in and upcoming events ahead.
//
//   node scripts/gerar-demo.mjs > /tmp/demo.sql
//   supabase --workdir demo db query --linked -f /tmp/demo.sql
//
// Wipes the business tables first. It refuses to run on a database that has
// events imported from Banlek (that is, the real one).

import { randomUUID } from "node:crypto";

export const DEMO_EMAIL = "demo@rcfgestao.example";
export const DEMO_SENHA = "demo-rcf-2026";

// mulberry32: small seeded PRNG, so every run produces the same demo.
let semente = 20261123;
const aleatorio = () => {
  semente |= 0;
  semente = (semente + 0x6d2b79f5) | 0;
  let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const escolher = (lista) => lista[Math.floor(aleatorio() * lista.length)];
const entre = (min, max) => min + aleatorio() * (max - min);
const centavos = (v) => Math.round(v * 100) / 100;
const sql = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);

const hoje = new Date(`${new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date())}T12:00:00Z`);
const dia = (deslocamento) => {
  const d = new Date(hoje);
  d.setUTCDate(d.getUTCDate() + deslocamento);
  return d.toISOString().slice(0, 10);
};

// ---------------------------------------------------------------- people
const usuarioDemo = randomUUID();
const pessoas = {
  marina: { id: randomUUID(), nome: "Marina Costa", papel: "socio", login: true },
  rafael: { id: randomUUID(), nome: "Rafael Lima", papel: "socio" },
  bruno: { id: randomUUID(), nome: "Bruno Alves", papel: "fotografo" },
};
// Freelancers appear only in the revenue split (they have no record in Pessoas).
const freelas = ["Carla Mendes", "Diego Rocha", "Elisa Prado", "Felipe Nunes", "Helena Duarte", "Igor Matos"];

// ---------------------------------------------------------------- venues
const locais = [
  ["Box Aurora", "Savassi", "Belo Horizonte", "MG"],
  ["CF Monte Verde", "Buritis", "Belo Horizonte", "MG"],
  ["Arena Lagoa Training", "Pampulha", "Belo Horizonte", "MG"],
  ["Estação Cross", "Funcionários", "Belo Horizonte", "MG"],
  ["Forja Training", "Santa Efigênia", "Belo Horizonte", "MG"],
  ["CF Atlas", "Lourdes", "Belo Horizonte", "MG"],
  ["Kettle House", "Vila da Serra", "Nova Lima", "MG"],
  ["Box Alvorada", "Eldorado", "Contagem", "MG"],
  ["CT Granito", "Castelo", "Belo Horizonte", "MG"],
  ["Cross Litoral", "Botafogo", "Rio de Janeiro", "RJ"],
  ["CF Ponta Norte", "Tijuca", "Rio de Janeiro", "RJ"],
  ["Box Vértice", "Méier", "Rio de Janeiro", "RJ"],
].map(([nome, bairro, cidade, uf], i) => ({
  id: randomUUID(),
  nome,
  bairro,
  cidade,
  uf,
  // The first ones are the most frequent and best-selling, so the ranking has a shape.
  peso: 1 / (1 + i * 0.35),
}));

const NOMES_EVENTO = [
  "Turmas manhã",
  "Turmas tarde e noite",
  "Todos os horários",
  "Treino de sábado",
  "Team WOD",
  "WOD especial",
  "Open interno",
  "Murph",
  "Festival de verão",
  "Desafio de duplas",
  "Aulão de aniversário",
  "HYROX simulado",
];

function escolherLocal() {
  const total = locais.reduce((s, l) => s + l.peso, 0);
  let r = aleatorio() * total;
  for (const l of locais) if ((r -= l.peso) <= 0) return l;
  return locais[0];
}

// ---------------------------------------------------------------- events
const eventos = [];
const vendas = [];
const divisoes = [];
const custos = [];

// From ~8 months ago to 6 weeks ahead, 2 to 4 events per week.
for (let semana = -34; semana <= 6; semana++) {
  const quantos = 2 + Math.floor(aleatorio() * 3);
  for (let k = 0; k < quantos; k++) {
    const desloc = semana * 7 + Math.floor(aleatorio() * 7);
    const local = escolherLocal();
    const data = dia(desloc);
    const futuro = desloc > 0;
    const recente = desloc <= 0 && desloc > -4;
    const status = futuro ? "agendado" : recente ? "fotografado" : desloc < -150 ? "fechado" : "publicado";
    const responsavel = local.uf === "RJ" ? pessoas.rafael : escolher([pessoas.marina, pessoas.marina, pessoas.bruno]);
    const fotos = futuro || recente ? null : Math.round(entre(300, 4500));
    const evento = {
      id: randomUUID(),
      nome: escolher(NOMES_EVENTO),
      local,
      data,
      status,
      responsavel,
      fotos,
      galeria: `| RIO CROSSFOTO | ${local.nome.toUpperCase()} | ${escolher(NOMES_EVENTO).toUpperCase()} |`,
    };
    eventos.push(evento);
    if (status !== "publicado" && status !== "fechado") continue;

    // Sales: most of it in the first week, then a tail over the following weeks.
    const total = centavos(Math.exp(entre(Math.log(60), Math.log(1400))) * local.peso ** 0.3);
    const inicial = centavos(total * entre(0.65, 0.85));
    vendas.push({ evento: evento.id, valor: inicial, data: dia(desloc + 2), origem: "carga_inicial" });
    let restante = centavos(total - inicial);
    for (let p = 1; p <= 3 && restante > 1; p++) {
      const parte = p === 3 ? restante : centavos(restante * entre(0.4, 0.7));
      const quando = desloc + 7 * p + Math.floor(aleatorio() * 5);
      if (quando > 0) break;
      vendas.push({ evento: evento.id, valor: parte, data: dia(quando), origem: "banlek" });
      restante = centavos(restante - parte);
    }
    const vendido = centavos(vendas.filter((v) => v.evento === evento.id).reduce((s, v) => s + v.valor, 0));

    // Revenue split in the Banlek patterns: 9/11/69/11 (with album admin) or 9/11/80/0.
    const comAdmin = aleatorio() < 0.6;
    const [taxaAdmin, taxaFoto] = comAdmin ? [11, 69] : [0, 80];
    const bruto = vendido / 0.91;
    const fotografo = aleatorio() < 0.45 ? null : escolher([...freelas, pessoas.bruno.nome, pessoas.marina.nome]);
    const partes = [{ papel: "banlek", nome: "Banlek", valor: centavos(bruto - vendido) }];
    if (comAdmin) {
      partes.push({ papel: "administrador", nome: pessoas.marina.nome, pessoa: pessoas.marina.id, valor: centavos((bruto * taxaAdmin) / 100) });
    }
    if (fotografo) {
      const daEquipe = Object.values(pessoas).find((p) => p.nome === fotografo);
      partes.push({ papel: "fotografo", nome: fotografo, pessoa: daEquipe?.id, valor: centavos((bruto * taxaFoto) / 100) });
    }
    const repassado = partes.filter((p) => p.papel !== "banlek").reduce((s, p) => s + p.valor, 0);
    // No photographer: photos uploaded from the company account, which keeps that share too.
    partes.push({ papel: "empresa", nome: "Rio CrossFoto", valor: centavos(Math.max(0, vendido - repassado)) });
    for (const p of partes) {
      divisoes.push({ ...p, evento: evento.id, percentual: centavos((p.valor / bruto) * 100) });
    }

    // Costs on some events: travel and food, sometimes registration.
    if (aleatorio() < 0.55) {
      custos.push({ evento: evento.id, tipo: "deslocamento", descricao: escolher(["Uber", "Combustível", "Estacionamento"]), valor: centavos(entre(18, 90)), data });
      if (aleatorio() < 0.5) custos.push({ evento: evento.id, tipo: "alimentacao", descricao: "Almoço", valor: centavos(entre(25, 70)), data });
      if (aleatorio() < 0.15) custos.push({ evento: evento.id, tipo: "inscricao", descricao: "Credenciamento", valor: centavos(entre(50, 150)), data });
    }
  }
}

// ---------------------------------------------------------------- company expenses
const despesas = [];
for (let m = 7; m >= 0; m--) {
  const d = new Date(hoje);
  d.setUTCMonth(d.getUTCMonth() - m, 5);
  const no = (diaDoMes) => `${d.toISOString().slice(0, 8)}${String(diaDoMes).padStart(2, "0")}`;
  despesas.push({ descricao: "Adobe Lightroom", categoria: "software", valor: 46.0, data: no(5) });
  despesas.push({ descricao: "Armazenamento em nuvem", categoria: "software", valor: 34.9, data: no(8) });
  despesas.push({ descricao: "Impostos (DAS)", categoria: "impostos", valor: centavos(entre(70, 180)), data: no(20) });
  if (aleatorio() < 0.4) despesas.push({ descricao: "Anúncios no Instagram", categoria: "marketing", valor: centavos(entre(50, 200)), data: no(12) });
}
despesas.push({ descricao: "Lente 70-200mm (usada)", categoria: "equipamento", valor: 3200.0, data: dia(-120) });
despesas.push({ descricao: "Cartões de memória", categoria: "equipamento", valor: 389.9, data: dia(-45) });

// ---------------------------------------------------------------- SQL
const out = ["-- Generated by scripts/gerar-demo.mjs. Fictional data for the public demo.", "begin;", ""];

out.push(`do $$ begin
  if exists (select 1 from public.eventos where banlek_id is not null) then
    raise exception 'This database has events imported from Banlek; refusing to load the demo.';
  end if;
end $$;`, "");

out.push("truncate public.divisoes, public.vendas, public.custos, public.despesas, public.eventos, public.locais, public.pessoas cascade;");
out.push(`delete from auth.identities where user_id in (select id from auth.users where email = ${sql(DEMO_EMAIL)});`);
out.push(`delete from auth.users where email = ${sql(DEMO_EMAIL)};`, "");

out.push(`insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token,
  email_change, email_change_token_new)
values ('00000000-0000-0000-0000-000000000000', ${sql(usuarioDemo)}, 'authenticated', 'authenticated',
  ${sql(DEMO_EMAIL)}, crypt(${sql(DEMO_SENHA)}, gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');`);
out.push(`insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), ${sql(usuarioDemo)}, ${sql(usuarioDemo)},
  ${sql(JSON.stringify({ sub: usuarioDemo, email: DEMO_EMAIL }))}, 'email', now(), now(), now());`, "");

out.push("insert into public.pessoas (id, nome, papel, user_id) values");
out.push(
  Object.values(pessoas)
    .map((p) => `  (${sql(p.id)}, ${sql(p.nome)}, ${sql(p.papel)}, ${p.login ? sql(usuarioDemo) : "null"})`)
    .join(",\n") + ";",
  "",
);

out.push("insert into public.locais (id, nome, tipo, bairro, cidade, uf) values");
out.push(locais.map((l) => `  (${sql(l.id)}, ${sql(l.nome)}, 'box', ${sql(l.bairro)}, ${sql(l.cidade)}, ${sql(l.uf)})`).join(",\n") + ";", "");

out.push("insert into public.eventos (id, nome, local_id, data, status, responsavel_id, fotos, galeria_banlek) values");
out.push(
  eventos
    .map((e) => `  (${sql(e.id)}, ${sql(e.nome)}, ${sql(e.local.id)}, ${sql(e.data)}, ${sql(e.status)}, ${sql(e.responsavel.id)}, ${e.fotos ?? "null"}, ${sql(e.galeria)})`)
    .join(",\n") + ";",
  "",
);

out.push("insert into public.vendas (evento_id, valor, data, origem) values");
out.push(vendas.map((v) => `  (${sql(v.evento)}, ${v.valor.toFixed(2)}, ${sql(v.data)}, ${sql(v.origem)})`).join(",\n") + ";", "");

out.push("insert into public.divisoes (evento_id, papel, nome, pessoa_id, percentual, valor) values");
out.push(
  divisoes
    .map((d) => `  (${sql(d.evento)}, ${sql(d.papel)}, ${sql(d.nome)}, ${d.pessoa ? sql(d.pessoa) : "null"}, ${d.percentual.toFixed(2)}, ${d.valor.toFixed(2)})`)
    .join(",\n") + ";",
  "",
);

out.push("insert into public.custos (evento_id, tipo, descricao, valor, data) values");
out.push(custos.map((c) => `  (${sql(c.evento)}, ${sql(c.tipo)}, ${sql(c.descricao)}, ${c.valor.toFixed(2)}, ${sql(c.data)})`).join(",\n") + ";", "");

out.push("insert into public.despesas (descricao, categoria, valor, data) values");
out.push(despesas.map((d) => `  (${sql(d.descricao)}, ${sql(d.categoria)}, ${d.valor.toFixed(2)}, ${sql(d.data)})`).join(",\n") + ";", "");

out.push("commit;");
console.log(out.join("\n"));

const totalVendas = vendas.reduce((s, v) => s + v.valor, 0);
console.error(
  `${locais.length} venues, ${eventos.length} events (${eventos.filter((e) => e.status === "agendado").length} scheduled), ` +
    `${vendas.length} sales (R$ ${totalVendas.toFixed(2)}), ${custos.length} costs, ${despesas.length} expenses.`,
);
