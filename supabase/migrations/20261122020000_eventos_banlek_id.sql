-- Id do evento na Banlek: chave estável para importar e atualizar eventos.
-- O título (galeria_banlek) muda quando o fotógrafo edita o álbum e já
-- causou divergências ("DOMINGO" × "DOM|NGO"); o id não muda.
alter table public.eventos add column banlek_id text;
create unique index eventos_banlek_id_key on public.eventos (banlek_id);
