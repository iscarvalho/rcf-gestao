import Link from "next/link";

import { Avatar, IdentificacaoUsuario, type DadosUsuario } from "@/components/avatar";
import { MenuCelular } from "@/components/menu-celular";
import { iniciais, usuarioAtual } from "@/lib/usuario";

async function dadosUsuario(): Promise<DadosUsuario | null> {
  const usuario = await usuarioAtual();
  return usuario ? { ...usuario, iniciais: iniciais(usuario) } : null;
}

/**
 * Quem está logado, no topo (a partir do tablet). No tablet só o avatar, com
 * nome e e-mail na dica; no desktop, nome e e-mail ao lado. Use dentro de <Suspense>.
 */
export async function UsuarioTopo() {
  const usuario = await dadosUsuario();
  if (!usuario) return null;
  const dica = usuario.nome ? `${usuario.nome} · ${usuario.email}` : usuario.email;
  return (
    <Link
      href="/perfil"
      title={`${dica} · Meu perfil`}
      className="hidden min-w-0 items-center gap-2.5 rounded-full py-1 pr-1 pl-1 transition-colors hover:bg-white/10 md:flex lg:pr-3"
    >
      {/* 32px: o mesmo tamanho do círculo do logo. */}
      <Avatar iniciais={usuario.iniciais} className="size-8 text-xs" />
      <IdentificacaoUsuario usuario={usuario} className="hidden max-w-44 lg:grid" />
      <span className="sr-only">Meu perfil{usuario.nome ? `: ${usuario.nome}` : ""}</span>
    </Link>
  );
}

/** Menu do celular já com quem está logado no topo da gaveta. Use dentro de <Suspense>. */
export async function MenuCelularComUsuario() {
  return <MenuCelular usuario={await dadosUsuario()} />;
}
