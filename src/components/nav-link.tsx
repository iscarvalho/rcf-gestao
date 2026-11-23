"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { linkAtivo } from "@/lib/navegacao";
import { cn } from "@/lib/utils";

type Props = { href: string; children: React.ReactNode; ativo?: boolean };

export function NavLink({ href, children, ativo = false }: Props) {
  return (
    <Link
      href={href}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        // Menu sobre a faixa azul-marinho do cabeçalho.
        "rounded-full px-3.5 py-2 text-sm whitespace-nowrap text-tinta-suave transition-colors hover:bg-white/10 hover:text-white",
        ativo && "bg-white font-semibold text-tinta hover:bg-white hover:text-tinta",
      )}
    >
      {children}
    </Link>
  );
}

/** NavLink que se marca como ativo pela URL atual. Use dentro de <Suspense>. */
export function NavLinkAtivo({ href, children }: Omit<Props, "ativo">) {
  const ativo = linkAtivo(usePathname(), href);
  return (
    <NavLink href={href} ativo={ativo}>
      {children}
    </NavLink>
  );
}
