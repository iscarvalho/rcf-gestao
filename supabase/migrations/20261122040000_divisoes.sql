-- Divisão do faturamento de cada evento, como a Banlek reparte (aba Colaboradores).
--
-- O faturamento que a Banlek mostra já vem sem a taxa dela (9%). O resto é dividido
-- entre fotógrafo(s), administrador do álbum e a organização (a Rio CrossFoto).
-- Valores calculados na importação a partir do faturamento e das taxas do evento;
-- a linha "banlek" é só referência (a taxa já descontada).

create type public.papel_divisao as enum ('banlek', 'administrador', 'fotografo', 'empresa');

create table public.divisoes (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  papel public.papel_divisao not null,
  -- Nome como está na Banlek (fotógrafos de fora não têm cadastro em Pessoas).
  nome text not null,
  -- Cadastro em Pessoas, quando a pessoa é da equipe.
  pessoa_id uuid references public.pessoas (id) on delete set null,
  percentual numeric(5, 2) not null,
  valor numeric(12, 2) not null check (valor >= 0),
  criado_em timestamptz not null default now()
);

create unique index divisoes_evento_papel_nome_key on public.divisoes (evento_id, papel, nome);
create index divisoes_pessoa_idx on public.divisoes (pessoa_id);

alter table public.divisoes enable row level security;
create policy "equipe gerencia divisoes" on public.divisoes
  for all to authenticated using (true) with check (true);

grant select, insert, update, delete on public.divisoes to authenticated;
grant usage on type public.papel_divisao to authenticated;
