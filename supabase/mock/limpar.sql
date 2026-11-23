-- Remove os dados fictícios de carregar.sql (custos e vendas saem junto com os eventos).
-- Rodar: supabase db query --linked -f supabase/mock/limpar.sql

begin;

delete from public.despesas where id::text like '40000000-0000-4000-8000-%';
delete from public.vendas where id::text like '50000000-0000-4000-8000-%';
delete from public.eventos where id::text like '30000000-0000-4000-8000-%';
delete from public.locais where id::text like '10000000-0000-4000-8000-%';
delete from public.pessoas where id::text like '20000000-0000-4000-8000-%';

commit;
