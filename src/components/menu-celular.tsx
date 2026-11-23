"use client";

import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { sair } from "@/app/login/actions";
import { Avatar, IdentificacaoUsuario, type DadosUsuario } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LINKS_MENU, linkAtivo } from "@/lib/navegacao";
import { cn } from "@/lib/utils";

const CLASSE_BOTAO = "size-11 text-white hover:bg-white/10 hover:text-white md:hidden";

/** Botão sanduíche sem menu, enquanto a URL ainda não está disponível. */
export function BotaoMenuEstatico() {
  return (
    <Button variant="ghost" size="icon" className={CLASSE_BOTAO} aria-label="Abrir menu" disabled>
      <Menu className="size-6" />
    </Button>
  );
}

/**
 * Menu lateral do celular: botão sanduíche no canto direito do topo, que abre
 * os links do app e o "Sair" numa gaveta azul-marinho. Use dentro de <Suspense>.
 */
export function MenuCelular({ usuario }: { usuario: DadosUsuario | null }) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className={CLASSE_BOTAO} aria-label="Abrir menu" />
        }
      >
        <Menu className="size-6" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-72 gap-0 border-white/10 bg-tinta text-white [&>[data-slot=sheet-close]]:top-4 [&>[data-slot=sheet-close]]:right-4 [&>[data-slot=sheet-close]]:size-11 [&>[data-slot=sheet-close]]:text-white [&>[data-slot=sheet-close]]:hover:bg-white/10"
      >
        <div className="flex h-16 items-center px-5">
          <SheetTitle className="font-display text-lg font-bold text-white">Menu</SheetTitle>
        </div>
        {usuario ? (
          <Link
            href="/perfil"
            onClick={() => setAberto(false)}
            aria-current={linkAtivo(pathname, "/perfil") ? "page" : undefined}
            className="mx-3 mb-2 flex items-center gap-3 rounded-xl bg-white/5 p-3 transition-colors hover:bg-white/10"
          >
            <Avatar iniciais={usuario.iniciais} className="size-10" />
            <IdentificacaoUsuario usuario={usuario} className="flex-1" />
            <span className="text-xs text-tinta-suave">Perfil</span>
          </Link>
        ) : null}
        <nav aria-label="Menu principal" className="grid gap-1 px-3 py-2">
          {LINKS_MENU.map((l) => {
            const ativo = linkAtivo(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={ativo ? "page" : undefined}
                // Fecha a gaveta ao navegar; se for a mesma página, também.
                onClick={() => setAberto(false)}
                className={cn(
                  "flex h-12 items-center rounded-xl px-4 text-base text-tinta-suave transition-colors hover:bg-white/10 hover:text-white",
                  ativo && "bg-white font-semibold text-tinta hover:bg-white hover:text-tinta",
                )}
              >
                {l.rotulo}
              </Link>
            );
          })}
        </nav>
        <form action={sair} className="mt-auto border-t border-white/10 p-3">
          <button
            type="submit"
            className="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-base text-tinta-suave transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-5" aria-hidden />
            Sair
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
