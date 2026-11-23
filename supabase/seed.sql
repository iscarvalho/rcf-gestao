-- Dados de desenvolvimento local. Rodam em `supabase db reset`.
-- Login local: dev@rcf.test / dev-senha-123 (só existe no banco local).

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change, email_change_token_new
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated', 'dev@rcf.test',
  crypt('dev-senha-123', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}', '{}',
  now(), now(), '', '', '', ''
);

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"dev@rcf.test"}',
  'email', now(), now(), now()
);

insert into public.pessoas (id, nome, papel, user_id) values
  ('22222222-0000-0000-0000-000000000001', 'Sócia (dev)', 'socio', '11111111-1111-1111-1111-111111111111'),
  ('22222222-0000-0000-0000-000000000002', 'Fotógrafo (dev)', 'fotografo', null);

insert into public.locais (id, nome, tipo, cidade, contato_nome) values
  ('33333333-0000-0000-0000-000000000001', 'Box Exemplo', 'box', 'Belo Horizonte', 'Coach Exemplo'),
  ('33333333-0000-0000-0000-000000000002', 'Liga Exemplo', 'organizador', 'São Paulo', null);

insert into public.eventos (id, nome, local_id, data, responsavel_id, status) values
  ('44444444-0000-0000-0000-000000000001', 'Open Interno', '33333333-0000-0000-0000-000000000001',
   current_date - 20, '22222222-0000-0000-0000-000000000001', 'publicado'),
  ('44444444-0000-0000-0000-000000000002', 'Campeonato de Inverno', '33333333-0000-0000-0000-000000000002',
   current_date + 15, '22222222-0000-0000-0000-000000000002', 'agendado');

insert into public.custos (evento_id, tipo, descricao, valor) values
  ('44444444-0000-0000-0000-000000000001', 'deslocamento', 'Combustível', 120.00),
  ('44444444-0000-0000-0000-000000000001', 'alimentacao', 'Almoço', 45.50);
