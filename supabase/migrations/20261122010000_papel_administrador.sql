-- Papel para quem administra o sistema sem fotografar nem ser sócio.
-- Não aparece como opção de responsável nos eventos (filtro no app).
alter type public.papel_pessoa add value if not exists 'administrador';
