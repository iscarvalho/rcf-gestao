/** Itens do menu principal, na ordem em que aparecem no topo e no menu do celular. */
export const LINKS_MENU = [
  { href: "/painel", rotulo: "Painel" },
  { href: "/eventos", rotulo: "Eventos" },
  { href: "/vendas", rotulo: "Vendas" },
  { href: "/despesas", rotulo: "Despesas" },
  { href: "/locais", rotulo: "Locais" },
  { href: "/pessoas", rotulo: "Pessoas" },
] as const;

/** O link está ativo na página dele e nas de dentro (ex.: /eventos/123). */
export const linkAtivo = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);
