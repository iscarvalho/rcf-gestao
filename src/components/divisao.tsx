import { Secao } from "@/components/pagina";
import type { Enums } from "@/lib/database.types";
import { formatarReais } from "@/lib/dominio";
import { cn } from "@/lib/utils";

type Papel = Enums<"papel_divisao">;

export const PAPEL_DIVISAO: Record<Papel, string> = {
  banlek: "Taxa da Banlek",
  administrador: "Administrador(a)",
  fotografo: "Fotógrafo(a)",
  empresa: "Empresa",
};

/** Cor de cada parte na barra: a empresa em magenta, quem recebe em azul/laranja, a Banlek neutra. */
const COR: Record<Papel, string> = {
  empresa: "bg-[#e0418c]",
  fotografo: "bg-marca-azul",
  administrador: "bg-[#f26a2e]",
  banlek: "bg-muted-foreground/40",
};

type Linha = {
  id: string;
  papel: Papel;
  nome: string;
  percentual: number;
  valor: number;
  pessoa: { nome: string } | null;
};

/**
 * Como a Banlek dividiu o faturamento do evento. A taxa da Banlek já vem
 * descontada do faturamento; aparece só para os percentuais somarem 100%.
 */
export function DivisaoFaturamento({ divisoes }: { divisoes: Linha[] }) {
  const ordem: Papel[] = ["empresa", "administrador", "fotografo", "banlek"];
  const linhas = [...divisoes].sort(
    (a, b) => ordem.indexOf(a.papel) - ordem.indexOf(b.papel) || Number(b.valor) - Number(a.valor),
  );
  const banlek = linhas.find((l) => l.papel === "banlek");
  const repartido = linhas.filter((l) => l.papel !== "banlek");

  return (
    <Secao titulo="Divisão do faturamento">
      {/* Barra empilhada: uma faixa por parte, com 2px de respiro entre elas. */}
      <div className="mb-4 flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden>
        {linhas.map((l, i) => (
          <div
            key={l.id}
            className={cn("h-full origin-left animate-estica", COR[l.papel])}
            style={{ width: `${Number(l.percentual)}%`, animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
      <ul className="divide-y text-sm">
        {repartido.map((l) => (
          <li key={l.id} className="flex items-center gap-3 py-2.5">
            <span className={cn("size-2.5 shrink-0 rounded-sm", COR[l.papel])} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{l.pessoa?.nome ?? l.nome}</p>
              <p className="text-xs text-muted-foreground">
                {PAPEL_DIVISAO[l.papel]} ·{" "}
                <span className="tabular-nums">
                  {Number(l.percentual).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
                </span>
              </p>
            </div>
            <span className="font-semibold tabular-nums">{formatarReais(Number(l.valor))}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        {banlek ? (
          <>
            A taxa da Banlek (
            <span className="tabular-nums">
              {Number(banlek.percentual).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%,{" "}
              {formatarReais(Number(banlek.valor))}
            </span>
            ) já vem descontada do faturamento.{" "}
          </>
        ) : null}
        Calculada na última importação da Banlek; a empresa fica também com a parte de fotógrafo
        das fotos enviadas pela conta da Rio CrossFoto.
      </p>
    </Secao>
  );
}
