import { Suspense, type ReactNode } from "react";

import { CARTAO, FAIXA } from "@/components/pagina";
import { PERIODO_PADRAO, PERIODOS } from "@/lib/financeiro";
import { cn } from "@/lib/utils";

import { FiltroPeriodo, FiltroPeriodoEstatico } from "./periodo";

const OPCOES = Object.entries(PERIODOS).map(([valor, { rotulo }]) => ({ valor, rotulo }));

/**
 * Faixa azul-marinho do topo do painel, emendada no cabeçalho: título, filtro
 * de período e o destaque (faturamento e barras por mês). Fica na tela
 * enquanto os números carregam.
 */
export function FaixaPainel({ descricao, children }: { descricao?: ReactNode; children: ReactNode }) {
  return (
    <section className={cn(FAIXA, "pt-6 pb-20 sm:pt-8 sm:pb-24")}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Painel</h1>
          {descricao ? <p className="mt-1 text-sm text-tinta-suave">{descricao}</p> : null}
        </div>
        <Suspense fallback={<FiltroPeriodoEstatico opcoes={OPCOES} padrao={PERIODO_PADRAO} />}>
          <FiltroPeriodo opcoes={OPCOES} padrao={PERIODO_PADRAO} />
        </Suspense>
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

const Bloco = ({ className }: { className: string }) => (
  <div className={cn("animate-pulse rounded-md bg-muted", className)} />
);

/** Esqueleto do destaque, em tons claros sobre a faixa escura. */
export function EsqueletoDestaque() {
  return (
    <div aria-hidden className="flex flex-wrap items-end justify-between gap-8">
      <div className="grid gap-3">
        <div className="h-4 w-48 animate-pulse rounded-md bg-white/10" />
        <div className="h-12 w-72 animate-pulse rounded-md bg-white/10 sm:h-16" />
        <div className="h-6 w-64 animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="h-32 w-64 animate-pulse rounded-md bg-white/10" />
    </div>
  );
}

/** Esqueleto com a forma do corpo do painel: 3 indicadores e as seções. */
export function EsqueletoPainel() {
  return (
    <div aria-busy="true" aria-live="polite" className="relative -mt-14">
      <span className="sr-only">Carregando os números…</span>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={cn(CARTAO, "grid gap-3 p-4 sm:p-5", i === 2 && "col-span-2 sm:col-span-1")}>
            <Bloco className="h-8 w-28" />
            <Bloco className="h-7 w-32" />
            <Bloco className="h-3 w-24" />
          </div>
        ))}
      </div>
      {[0, 1].map((linha) => (
        <div
          key={linha}
          className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
        >
          {[0, 1].map((col) => (
            <div key={col} className={cn(CARTAO, "p-4 sm:p-6")}>
              <Bloco className="mb-4 h-5 w-36" />
              <Bloco className="h-56 w-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
