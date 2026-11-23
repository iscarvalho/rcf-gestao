-- Projetos Supabase novos não concedem acesso automático às tabelas criadas por
-- migration. O RLS continua decidindo quais linhas cada usuário vê; aqui só
-- liberamos o acesso às tabelas para quem está logado. `anon` segue sem acesso.

grant usage on schema public to authenticated;

grant select, insert, update, delete
  on public.locais, public.pessoas, public.eventos, public.custos
  to authenticated;

grant select on public.eventos_resumo to authenticated;

grant usage on type
  public.tipo_local, public.papel_pessoa, public.status_evento, public.tipo_custo
  to authenticated;
