-- Vendas por evento e despesas gerais da empresa.
-- Adiantado da fase 2/3 para o dashboard. O importador da Banlek vai gravar
-- nesta mesma tabela de vendas; `chave_externa` evita duplicar reimportações.

create type public.origem_venda as enum ('manual', 'banlek', 'carga_inicial');

create table public.vendas (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  valor numeric(12, 2) not null check (valor > 0),
  data date not null,
  comprador text,
  origem public.origem_venda not null default 'manual',
  -- ID do pedido na Banlek (ou data + comprador + valor). Único quando presente.
  chave_externa text unique,
  criado_por uuid references auth.users (id) on delete set null default auth.uid(),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index vendas_evento_id_idx on public.vendas (evento_id);
create index vendas_data_idx on public.vendas (data);

create type public.categoria_despesa as enum (
  'equipamento', 'software', 'marketing', 'transporte', 'impostos', 'outros'
);

-- Despesas gerais da empresa, sem evento (equipamento, assinaturas...).
create table public.despesas (
  id uuid primary key default gen_random_uuid(),
  descricao text not null check (length(trim(descricao)) > 0),
  categoria public.categoria_despesa not null default 'outros',
  valor numeric(12, 2) not null check (valor > 0),
  data date not null default current_date,
  criado_por uuid references auth.users (id) on delete set null default auth.uid(),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index despesas_data_idx on public.despesas (data);

create trigger vendas_atualizado_em before update on public.vendas
  for each row execute function public.set_atualizado_em();
create trigger despesas_atualizado_em before update on public.despesas
  for each row execute function public.set_atualizado_em();

alter table public.vendas enable row level security;
alter table public.despesas enable row level security;

create policy "equipe gerencia vendas" on public.vendas
  for all to authenticated using (true) with check (true);
create policy "equipe gerencia despesas" on public.despesas
  for all to authenticated using (true) with check (true);

grant select, insert, update, delete on public.vendas, public.despesas to authenticated;
grant usage on type public.origem_venda, public.categoria_despesa to authenticated;

-- Resumo por evento agora com faturamento e resultado. Custos e vendas são
-- somados em subconsultas separadas para um não multiplicar o outro.
drop view public.eventos_resumo;

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
  coalesce(c.total, 0)::numeric(12, 2) as total_custos,
  coalesce(v.total, 0)::numeric(12, 2) as total_vendas,
  (coalesce(v.total, 0) - coalesce(c.total, 0))::numeric(12, 2) as resultado
from public.eventos e
join public.locais l on l.id = e.local_id
left join public.pessoas p on p.id = e.responsavel_id
left join (
  select evento_id, sum(valor) as total from public.custos group by evento_id
) c on c.evento_id = e.id
left join (
  select evento_id, sum(valor) as total from public.vendas group by evento_id
) v on v.evento_id = e.id;

grant select on public.eventos_resumo to authenticated;
