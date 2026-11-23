"use client";

import Link, { useLinkStatus } from "next/link";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

type Opcao = { valor: string; rotulo: string };

/** Marca o período que está carregando, para a troca não parecer travada. */
function Carregando() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span data-pendente className="sr-only">
      (carregando)
    </span>
  ) : null;
}

function Pilula({ opcao, ativo }: { opcao: Opcao; ativo: boolean }) {
  return (
    <Link
      href={`/painel?periodo=${opcao.valor}`}
      aria-current={ativo ? "true" : undefined}
      // 44px de altura no toque; no desktop volta à altura dos links do menu.
      className={cn(
        // Sobre a faixa azul-marinho do painel.
        "inline-flex h-11 items-center rounded-full px-3.5 text-sm whitespace-nowrap text-tinta-suave transition-colors hover:text-white has-[[data-pendente]]:animate-pulse sm:h-8",
        ativo && "bg-white font-semibold text-tinta hover:text-tinta",
      )}
    >
      {opcao.rotulo}
      <Carregando />
    </Link>
  );
}

/** Filtro de período do painel; o ativo vem da URL, como no menu. */
export function FiltroPeriodo({ opcoes, padrao }: { opcoes: Opcao[]; padrao: string }) {
  const params = useSearchParams();
  const atual = opcoes.some((o) => o.valor === params.get("periodo"))
    ? params.get("periodo")
    : padrao;
  return (
    <nav aria-label="Período" className="flex gap-1 rounded-full bg-white/10 p-1">
      {opcoes.map((o) => (
        <Pilula key={o.valor} opcao={o} ativo={o.valor === atual} />
      ))}
    </nav>
  );
}

/** Mesmo filtro, sem saber o ativo, enquanto a URL não está disponível. */
export function FiltroPeriodoEstatico({ opcoes, padrao }: { opcoes: Opcao[]; padrao: string }) {
  return (
    <nav aria-label="Período" className="flex gap-1 rounded-full bg-white/10 p-1">
      {opcoes.map((o) => (
        <Pilula key={o.valor} opcao={o} ativo={o.valor === padrao} />
      ))}
    </nav>
  );
}
