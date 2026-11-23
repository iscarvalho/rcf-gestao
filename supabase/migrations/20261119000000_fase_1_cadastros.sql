-- Fase 1: cadastros (locais, pessoas, eventos e custos por evento).
-- Vendas, despesas gerais e importações entram nas próximas fases.

create extension if not exists citext;

-- Atualiza `atualizado_em` em qualquer tabela que tenha essa coluna.
create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

-- Locais: boxes de CrossFit e organizadores de campeonatos.
create type public.tipo_local as enum ('box', 'organizador');

create table public.locais (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) > 0),
  tipo public.tipo_local not null default 'box',
  cidade text,
  contato_nome text,
  contato_telefone text,
  contato_email citext,
  instagram text,
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create unique index locais_nome_cidade_key
  on public.locais (lower(nome), lower(coalesce(cidade, '')));

-- Pessoas: sócios e fotógrafos. `user_id` liga a pessoa a um login, quando houver.
create type public.papel_pessoa as enum ('socio', 'fotografo');

create table public.pessoas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) > 0),
  papel public.papel_pessoa not null default 'fotografo',
  user_id uuid unique references auth.users (id) on delete set null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Eventos: o responsável fica registrado para os repasses entrarem depois.
create type public.status_evento as enum ('agendado', 'fotografado', 'publicado', 'fechado');

create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) > 0),
  local_id uuid not null references public.locais (id) on delete restrict,
  data date not null,
  responsavel_id uuid references public.pessoas (id) on delete set null,
  status public.status_evento not null default 'agendado',
  -- Nome da galeria na Banlek, usado depois para atribuir as vendas importadas.
  galeria_banlek text,
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index eventos_local_id_idx on public.eventos (local_id);
create index eventos_responsavel_id_idx on public.eventos (responsavel_id);
create index eventos_data_idx on public.eventos (data desc);

-- Custos por evento.
create type public.tipo_custo as enum ('inscricao', 'deslocamento', 'alimentacao', 'outros');

create table public.custos (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  tipo public.tipo_custo not null,
  descricao text,
  valor numeric(12, 2) not null check (valor > 0),
  data date not null default current_date,
  criado_por uuid references auth.users (id) on delete set null default auth.uid(),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index custos_evento_id_idx on public.custos (evento_id);

create trigger locais_atualizado_em before update on public.locais
  for each row execute function public.set_atualizado_em();
create trigger pessoas_atualizado_em before update on public.pessoas
  for each row execute function public.set_atualizado_em();
create trigger eventos_atualizado_em before update on public.eventos
  for each row execute function public.set_atualizado_em();
create trigger custos_atualizado_em before update on public.custos
  for each row execute function public.set_atualizado_em();

-- Total de custos por evento, calculado e nunca digitado.
create view public.eventos_resumo
with (security_invoker = true)
as
select
  e.id,
  e.nome,
  e.data,
  e.status,
  e.local_id,
  l.nome as local_nome,
  l.cidade as local_cidade,
  e.responsavel_id,
  p.nome as responsavel_nome,
  coalesce(sum(c.valor), 0)::numeric(12, 2) as total_custos
from public.eventos e
join public.locais l on l.id = e.local_id
left join public.pessoas p on p.id = e.responsavel_id
left join public.custos c on c.evento_id = e.id
group by e.id, l.id, p.id;

-- Row Level Security. O cadastro público está desligado, então todo usuário
-- autenticado é alguém da empresa. Quando os repasses entrarem, as políticas
-- podem ficar mais finas (por exemplo, por papel).
alter table public.locais enable row level security;
alter table public.pessoas enable row level security;
alter table public.eventos enable row level security;
alter table public.custos enable row level security;

create policy "equipe gerencia locais" on public.locais
  for all to authenticated using (true) with check (true);
create policy "equipe gerencia pessoas" on public.pessoas
  for all to authenticated using (true) with check (true);
create policy "equipe gerencia eventos" on public.eventos
  for all to authenticated using (true) with check (true);
create policy "equipe gerencia custos" on public.custos
  for all to authenticated using (true) with check (true);
