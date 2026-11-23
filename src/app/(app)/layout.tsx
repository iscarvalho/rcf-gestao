import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import logo from "@/assets/logo-transparente.png";

import { sair } from "@/app/login/actions";
import { BotaoMenuEstatico } from "@/components/menu-celular";
import { NavLink, NavLinkAtivo } from "@/components/nav-link";
import { Button } from "@/components/ui/button";
import { MenuCelularComUsuario, UsuarioTopo } from "@/components/usuario-topo";
import { LINKS_MENU } from "@/lib/navegacao";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    // overflow-x-clip: a faixa do painel sangra até as bordas da janela.
    <div className="flex min-h-full flex-1 flex-col overflow-x-clip">
      <header className="bg-tinta text-white">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/painel" className="flex shrink-0 items-center gap-2.5">
            {/*
              O círculo do kettlebell tem o centro a 60% da altura e 73% dela de
              diâmetro: com 44px de altura, é um círculo de 32px que precisa subir
              ~4px para ficar no eixo do menu (a alça sobra acima).
            */}
            <Image
              src={logo}
              alt="Rio CrossFoto"
              className="h-11 w-auto -translate-y-[4.4px]"
              priority
            />
            <span className="font-display text-base font-bold tracking-tight">Rio CrossFoto</span>
            {process.env.DEMO_EMAIL ? (
              <span className="rounded-full bg-[#e0418c] px-2 py-0.5 text-[11px] font-semibold text-white">
                Demo
              </span>
            ) : null}
          </Link>
          {/* A partir do tablet, menu e "Sair" no topo; no celular, a gaveta lateral. */}
          <nav className="hidden min-w-0 flex-1 items-center gap-1 md:flex">
            {LINKS_MENU.map((l) => (
              // O link ativo depende da URL; o Suspense deixa o resto do cabeçalho estático.
              <Suspense key={l.href} fallback={<NavLink href={l.href}>{l.rotulo}</NavLink>}>
                <NavLinkAtivo href={l.href}>{l.rotulo}</NavLinkAtivo>
              </Suspense>
            ))}
          </nav>
          {/* Sem fallback: o espaço fica vazio por um instante até a sessão chegar. */}
          <Suspense fallback={null}>
            <UsuarioTopo />
          </Suspense>
          <form action={sair} className="hidden md:block">
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-tinta-suave hover:bg-white/10 hover:text-white"
            >
              Sair
            </Button>
          </form>
          <Suspense fallback={<BotaoMenuEstatico />}>
            <MenuCelularComUsuario />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
