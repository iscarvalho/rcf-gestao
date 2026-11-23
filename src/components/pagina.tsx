import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import type { Enums } from "@/lib/database.types";
import { formatarReais, STATUS_EVENTO } from "@/lib/dominio";
import { cn } from "@/lib/utils";

/**
 * Fundo azul-marinho que sangra até as bordas da janela, emendado no
 * cabeçalho do app. O conteúdo segue na coluna central. Usado no topo de
 * todas as páginas; o painel usa uma versão mais alta.
 */
export const FAIXA =
  "relative isolate -mt-6 text-white before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:bg-tinta sm:-mt-8";

/** Botão de ação sobre a faixa escura: branco com texto azul-marinho. */
export const BOTAO_NA_FAIXA = "bg-white text-tinta hover:bg-white/90";

export function CabecalhoPagina({
  titulo,
  descricao,
  voltar,
  acao,
}: {
  titulo: string;
  descricao?: ReactNode;
  voltar?: { href: string; rotulo: string };
  acao?: ReactNode;
}) {
  return (
    // Compacta: só o suficiente para dar identidade, sem empurrar os registros para baixo.
    <div className={cn(FAIXA, "mb-6 flex flex-wrap items-end justify-between gap-4 pt-4 pb-6 sm:pt-5 sm:pb-7")}>
      <div className="min-w-0">
        {voltar ? (
          <Link
            href={voltar.href}
            className="text-sm text-tinta-suave transition-colors hover:text-white"
          >
            ← {voltar.rotulo}
          </Link>
        ) : null}
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          {titulo}
        </h1>
        {descricao ? <p className="mt-1 text-sm text-tinta-suave">{descricao}</p> : null}
      </div>
      {/* Badges de status (ex.: na página do evento) viram translúcidos sobre o azul-marinho. */}
      {acao ? (
        <div className="[&_[data-slot=badge]]:border-white/25 [&_[data-slot=badge]]:bg-white/15 [&_[data-slot=badge]]:text-white">
          {acao}
        </div>
      ) : null}
    </div>
  );
}

/** Superfície branca sobre o fundo cinza-azulado. */
export const CARTAO = "rounded-2xl border border-border/70 bg-card shadow-[0_2px_6px_rgb(20_32_58/0.05)]";

const TONS = {
  azul: "bg-marca-azul-fundo text-marca-azul",
  laranja: "bg-marca-laranja-fundo text-marca-laranja",
  magenta: "bg-marca-magenta-fundo text-marca-magenta",
} as const;

export type Tom = keyof typeof TONS;

export function Secao({
  titulo,
  children,
  className,
}: {
  titulo: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(CARTAO, "p-4 sm:p-6", className)}>
      <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">{titulo}</h2>
      {children}
    </section>
  );
}

/**
 * Card de um número em reais, com rótulo, ícone e detalhe opcionais.
 * Negativos em vermelho. Sobe um pouco no hover e entra com animação
 * (`atraso` escalona a entrada de vários cards).
 */
export function Indicador({
  rotulo,
  valor,
  detalhe,
  destaque,
  icone: Icone,
  tom = "azul",
  atraso,
}: {
  rotulo: string;
  valor: number;
  detalhe?: string;
  destaque?: boolean;
  icone?: LucideIcon;
  tom?: Tom;
  atraso?: number;
}) {
  const estilo: CSSProperties | undefined = atraso ? { animationDelay: `${atraso}ms` } : undefined;
  return (
    // O valor escala com a largura do card (cqi), para "R$ 1.234.567,89"
    // caber em meio celular sem quebrar a linha.
    <div
      style={estilo}
      className={cn(
        CARTAO,
        "min-w-0 animate-entra p-4 transition-[transform,box-shadow] duration-200 [container-type:inline-size] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-14px_rgb(20_32_58/0.35)] sm:p-5",
        destaque && "ring-2 ring-marca-magenta/25",
      )}
    >
      <div className="flex items-center gap-2.5">
        {Icone ? (
          <span
            // Em cards estreitos (3 por linha no celular) o ícone sai para o rótulo caber.
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg @max-[9rem]:hidden",
              TONS[tom],
            )}
            aria-hidden
          >
            <Icone className="size-4" strokeWidth={2.2} />
          </span>
        ) : null}
        <p className="truncate text-sm text-muted-foreground @max-[9rem]:text-xs">{rotulo}</p>
      </div>
      <p
        className={cn(
          "mt-3 font-display text-[clamp(1.125rem,12cqi,1.75rem)] font-bold tracking-tight whitespace-nowrap tabular-nums",
          valor < 0 && "text-destructive",
        )}
      >
        {formatarReais(valor)}
      </p>
      {detalhe ? <p className="mt-1 text-xs text-muted-foreground">{detalhe}</p> : null}
    </div>
  );
}

export function Vazio({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

const VARIANTE_STATUS = {
  agendado: "outline",
  fotografado: "secondary",
  publicado: "default",
  fechado: "ghost",
} as const satisfies Record<Enums<"status_evento">, string>;

export function StatusEvento({ status }: { status: Enums<"status_evento"> }) {
  return <Badge variant={VARIANTE_STATUS[status]}>{STATUS_EVENTO[status]}</Badge>;
}
