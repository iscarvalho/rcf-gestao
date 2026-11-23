-- Campos que a lista de eventos da Banlek traz e a carga inicial precisa.

alter table public.locais
  add column bairro text,
  add column uf char(2);

alter table public.eventos
  add column fotos integer check (fotos >= 0);

-- Na Banlek cada galeria tem título e data; os dois juntos identificam o evento,
-- e reimportar a lista atualiza em vez de duplicar.
create unique index eventos_galeria_data_key
  on public.eventos (galeria_banlek, data)
  where galeria_banlek is not null;

-- O resumo passa a trazer as fotos publicadas.
drop view public.eventos_resumo;

create view public.eventos_resumo
with (security_invoker = true)
as
select
  e.id,
  e.nome,
  e.data,
  e.status,
  e.fotos,
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
