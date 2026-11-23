-- Dados fictícios para demonstrar o MVP: 10 locais, 10 pessoas, 10 eventos e custos.
-- Todos os IDs começam com 10000000-, 20000000- ou 30000000- para facilitar a limpeza
-- (veja limpar.sql). As datas são relativas a hoje, então o mock não envelhece.
-- Rodar: supabase db query --linked -f supabase/mock/carregar.sql

begin;

-- Remove os registros criados nos testes manuais da fase 1.
delete from public.eventos where nome = 'Campeonato Teste';
delete from public.locais where nome = 'Box Teste Claude';
delete from public.pessoas where nome = 'Fotógrafo Teste';

insert into public.locais (id, nome, tipo, cidade, contato_nome, contato_telefone, contato_email, instagram, observacoes) values
  ('10000000-0000-4000-8000-000000000001', 'Box Copacabana Strength', 'box', 'Rio de Janeiro', 'Marina Alves', '(21) 90000-0001', 'contato@copastrength.example', '@copastrength', 'Box parceiro desde o início. Prefere fotos em preto e branco no pódio.'),
  ('10000000-0000-4000-8000-000000000002', 'Tijuca Training Center', 'box', 'Rio de Janeiro', 'Rafael Souza', '(21) 90000-0002', 'rafael@tijucatc.example', '@tijucatc', null),
  ('10000000-0000-4000-8000-000000000003', 'Barra Functional', 'box', 'Rio de Janeiro', 'Juliana Prado', '(21) 90000-0003', 'ju@barrafunctional.example', '@barrafunctional', 'Estacionamento no local.'),
  ('10000000-0000-4000-8000-000000000004', 'Niterói Iron Box', 'box', 'Niterói', 'Bruno Lima', '(21) 90000-0004', null, '@niteroiiron', null),
  ('10000000-0000-4000-8000-000000000005', 'Botafogo Barbell Club', 'box', 'Rio de Janeiro', 'Camila Rocha', '(21) 90000-0005', 'camila@botafogobarbell.example', '@botafogobarbell', 'Eventos costumam acabar tarde; combinar alimentação.'),
  ('10000000-0000-4000-8000-000000000006', 'Recreio Fitness Lab', 'box', 'Rio de Janeiro', 'Diego Martins', '(21) 90000-0006', null, '@recreiolab', null),
  ('10000000-0000-4000-8000-000000000007', 'Petrópolis Mountain Box', 'box', 'Petrópolis', 'Larissa Teixeira', '(24) 90000-0007', 'larissa@mountainbox.example', '@mountainbox', 'Subida da serra: contar 1h30 de deslocamento.'),
  ('10000000-0000-4000-8000-000000000008', 'Liga Carioca de Funcional', 'organizador', 'Rio de Janeiro', 'Thiago Ribeiro', '(21) 90000-0008', 'eventos@ligacarioca.example', '@ligacariocafuncional', 'Organiza três etapas por ano em boxes diferentes.'),
  ('10000000-0000-4000-8000-000000000009', 'Circuito Praia Games', 'organizador', 'Rio de Janeiro', 'Fernanda Costa', '(21) 90000-0009', 'fernanda@praiagames.example', '@praiagames', 'Evento ao ar livre; levar proteção para chuva.'),
  ('10000000-0000-4000-8000-000000000010', 'Serra Fit Challenge', 'organizador', 'Teresópolis', 'Gustavo Nunes', '(21) 90000-0010', null, '@serrafitchallenge', null);

insert into public.pessoas (id, nome, papel, ativo) values
  ('20000000-0000-4000-8000-000000000001', 'Ana Beatriz (sócia)', 'socio', true),
  ('20000000-0000-4000-8000-000000000002', 'Pedro Henrique (sócio)', 'socio', true),
  ('20000000-0000-4000-8000-000000000003', 'Lucas Ferreira', 'fotografo', true),
  ('20000000-0000-4000-8000-000000000004', 'Mariana Duarte', 'fotografo', true),
  ('20000000-0000-4000-8000-000000000005', 'João Victor', 'fotografo', true),
  ('20000000-0000-4000-8000-000000000006', 'Beatriz Monteiro', 'fotografo', true),
  ('20000000-0000-4000-8000-000000000007', 'Rodrigo Saraiva', 'fotografo', true),
  ('20000000-0000-4000-8000-000000000008', 'Isabela Cardoso', 'fotografo', true),
  ('20000000-0000-4000-8000-000000000009', 'Felipe Andrade', 'fotografo', true),
  ('20000000-0000-4000-8000-000000000010', 'Carolina Pires', 'fotografo', false);

-- Eventos em todos os status: antigos fechados, recentes publicados/fotografados e futuros agendados.
insert into public.eventos (id, nome, local_id, data, responsavel_id, status, galeria_banlek, observacoes) values
  ('30000000-0000-4000-8000-000000000001', 'Copa Strength Open 2026', '10000000-0000-4000-8000-000000000001', current_date - 120, '20000000-0000-4000-8000-000000000001', 'fechado', 'Copa Strength Open 2026', null),
  ('30000000-0000-4000-8000-000000000002', 'Liga Carioca — Etapa 1', '10000000-0000-4000-8000-000000000008', current_date - 95, '20000000-0000-4000-8000-000000000002', 'fechado', 'Liga Carioca Etapa 1', 'Três fotógrafos no evento.'),
  ('30000000-0000-4000-8000-000000000003', 'Tijuca Throwdown', '10000000-0000-4000-8000-000000000002', current_date - 70, '20000000-0000-4000-8000-000000000003', 'fechado', 'Tijuca Throwdown', null),
  ('30000000-0000-4000-8000-000000000004', 'Praia Games — Primavera', '10000000-0000-4000-8000-000000000009', current_date - 45, '20000000-0000-4000-8000-000000000001', 'publicado', 'Praia Games Primavera', 'Choveu na final; muitas fotos em contraluz.'),
  ('30000000-0000-4000-8000-000000000005', 'Barra Team Series', '10000000-0000-4000-8000-000000000003', current_date - 30, '20000000-0000-4000-8000-000000000004', 'publicado', 'Barra Team Series', null),
  ('30000000-0000-4000-8000-000000000006', 'Liga Carioca — Etapa 2', '10000000-0000-4000-8000-000000000008', current_date - 18, '20000000-0000-4000-8000-000000000002', 'publicado', 'Liga Carioca Etapa 2', null),
  ('30000000-0000-4000-8000-000000000007', 'Niterói Iron Games', '10000000-0000-4000-8000-000000000004', current_date - 5, '20000000-0000-4000-8000-000000000005', 'fotografado', null, 'Fotos em seleção no Lightroom.'),
  ('30000000-0000-4000-8000-000000000008', 'Botafogo Barbell Night', '10000000-0000-4000-8000-000000000005', current_date + 10, '20000000-0000-4000-8000-000000000006', 'agendado', null, null),
  ('30000000-0000-4000-8000-000000000009', 'Serra Fit Challenge 2026', '10000000-0000-4000-8000-000000000010', current_date + 24, '20000000-0000-4000-8000-000000000001', 'agendado', null, 'Reservar hotel para a noite anterior.'),
  ('30000000-0000-4000-8000-000000000010', 'Mountain Box Open', '10000000-0000-4000-8000-000000000007', current_date + 40, null, 'agendado', null, 'Ainda sem responsável definido.');

-- Custos dos eventos já realizados (e uma inscrição paga antecipada para um agendado).
insert into public.custos (evento_id, tipo, descricao, valor, data) values
  ('30000000-0000-4000-8000-000000000001', 'inscricao',    'Taxa de cobertura oficial', 300.00, current_date - 130),
  ('30000000-0000-4000-8000-000000000001', 'deslocamento', 'Uber ida e volta',           68.40, current_date - 120),
  ('30000000-0000-4000-8000-000000000001', 'alimentacao',  'Almoço da equipe',           92.00, current_date - 120),
  ('30000000-0000-4000-8000-000000000002', 'inscricao',    'Credenciamento',             450.00, current_date - 100),
  ('30000000-0000-4000-8000-000000000002', 'deslocamento', 'Combustível e pedágio',     135.70, current_date - 95),
  ('30000000-0000-4000-8000-000000000002', 'alimentacao',  'Almoço de 3 fotógrafos',    156.00, current_date - 95),
  ('30000000-0000-4000-8000-000000000002', 'outros',       'Cartão de memória extra',   189.90, current_date - 96),
  ('30000000-0000-4000-8000-000000000003', 'deslocamento', 'Metrô e Uber',               42.30, current_date - 70),
  ('30000000-0000-4000-8000-000000000003', 'alimentacao',  'Lanche',                     38.50, current_date - 70),
  ('30000000-0000-4000-8000-000000000004', 'inscricao',    'Cota de mídia',             500.00, current_date - 50),
  ('30000000-0000-4000-8000-000000000004', 'deslocamento', 'Van com equipamento',       220.00, current_date - 45),
  ('30000000-0000-4000-8000-000000000004', 'alimentacao',  'Almoço e água',             118.00, current_date - 45),
  ('30000000-0000-4000-8000-000000000004', 'outros',       'Capa de chuva para câmera',  79.90, current_date - 46),
  ('30000000-0000-4000-8000-000000000005', 'deslocamento', 'Combustível',                85.00, current_date - 30),
  ('30000000-0000-4000-8000-000000000005', 'alimentacao',  'Almoço',                     64.00, current_date - 30),
  ('30000000-0000-4000-8000-000000000006', 'inscricao',    'Credenciamento',            450.00, current_date - 25),
  ('30000000-0000-4000-8000-000000000006', 'deslocamento', 'Combustível e pedágio',     128.20, current_date - 18),
  ('30000000-0000-4000-8000-000000000006', 'alimentacao',  'Almoço de 2 fotógrafos',    104.00, current_date - 18),
  ('30000000-0000-4000-8000-000000000007', 'deslocamento', 'Barca Rio–Niterói e Uber',   54.60, current_date - 5),
  ('30000000-0000-4000-8000-000000000007', 'alimentacao',  'Almoço',                     47.00, current_date - 5),
  ('30000000-0000-4000-8000-000000000009', 'inscricao',    'Cota de mídia (antecipada)', 350.00, current_date - 3);

-- Vendas individuais (como viriam do export da Banlek) dos eventos já publicados.
-- Preços de foto avulsa, combo e pacote; a maioria das compras cai nos primeiros
-- dias depois do evento (offset ao quadrado), nunca depois de hoje.
-- IDs começam com 50000000- para a limpeza.
insert into public.vendas (id, evento_id, valor, data, comprador, origem, chave_externa)
select
  ('50000000-0000-4000-8000-' || lpad((q.n * 1000 + g)::text, 12, '0'))::uuid,
  e.id,
  (array[29.90, 49.90, 49.90, 89.90])[1 + (g * 7 + q.n) % 4],
  e.data + least(current_date - e.data, floor(power(((g * 37 + q.n * 11) % 100) / 100.0, 2) * 30)::int),
  'Atleta ' || lpad(g::text, 3, '0'),
  'banlek',
  'mock-' || q.n || '-' || g
from (values (1, 72), (2, 96), (3, 41), (4, 63), (5, 38), (6, 27)) as q(n, qtd)
join public.eventos e
  on e.id = ('30000000-0000-4000-8000-' || lpad(q.n::text, 12, '0'))::uuid
cross join generate_series(1, q.qtd) as g;

-- Despesas gerais: assinaturas e impostos mensais nos últimos 6 meses, mais avulsas.
-- IDs começam com 40000000-.
insert into public.despesas (id, descricao, categoria, valor, data)
select
  ('40000000-0000-4000-8000-' || lpad((m * 10 + k)::text, 12, '0'))::uuid,
  d.descricao, d.categoria::public.categoria_despesa, d.valor,
  (date_trunc('month', current_date) - make_interval(months => m))::date + 4
from generate_series(0, 5) as m
cross join (values
  (1, 'Adobe Lightroom (plano fotografia)', 'software', 49.00),
  (2, 'Simples Nacional (DAS)', 'impostos', 76.60),
  (3, 'Armazenamento em nuvem', 'software', 34.90)
) as d(k, descricao, categoria, valor);

insert into public.despesas (id, descricao, categoria, valor, data) values
  ('40000000-0000-4000-8000-000000000901', 'Lente 70-200mm (usada)', 'equipamento', 2400.00, current_date - 110),
  ('40000000-0000-4000-8000-000000000902', 'Cartões de memória 128GB (2x)', 'equipamento', 318.00, current_date - 80),
  ('40000000-0000-4000-8000-000000000903', 'Impulsionamento Instagram', 'marketing', 150.00, current_date - 60),
  ('40000000-0000-4000-8000-000000000904', 'Impulsionamento Instagram', 'marketing', 150.00, current_date - 30),
  ('40000000-0000-4000-8000-000000000905', 'Bateria extra para câmera', 'equipamento', 289.90, current_date - 12);

commit;
