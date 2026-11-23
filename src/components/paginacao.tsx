import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import {
  hrefPagina,
  TAMANHOS_PAGINA,
  ultimaPagina,
  type Paginacao as DadosPaginacao,
} from "@/lib/paginacao";
import { cn } from "@/lib/utils";

/** Números de página à vista: a primeira, a última e as vizinhas da atual. */
function paginasVisiveis(atual: number, ultima: number): (number | "…")[] {
  const set = new Set([1, ultima, atual - 1, atual, atual + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= ultima).sort((a, b) => a - b);
  return nums.flatMap((n, i) => (i > 0 && n - nums[i - 1] > 1 ? ["…" as const, n] : [n]));
}

const BOTAO =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-lg px-2 text-sm tabular-nums transition-colors sm:h-8 sm:min-w-8";

/**
 * Navegação entre páginas e escolha de quantos itens mostrar. Só links: a
 * página e o tamanho vão na URL (`?pagina=&por=`), junto com os outros
 * filtros da tela (`params`).
 */
export function Paginacao({
  total,
  paginacao,
  caminho,
  params = {},
  rotuloItens = "itens",
}: {
  total: number;
  paginacao: DadosPaginacao;
  caminho: string;
  params?: Record<string, string | null | undefined>;
  rotuloItens?: string;
}) {
  const { pagina, porPagina, de } = paginacao;
  const ultima = ultimaPagina(total, porPagina);

  const href = (novaPagina: number, novoPor = porPagina) =>
    hrefPagina(caminho, params, novaPagina, novoPor);

  if (total === 0) return null;
  const ate = Math.min(de + porPagina, total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm">
      <p className="text-muted-foreground">
        <span className="tabular-nums">
          {de + 1}–{ate}
        </span>{" "}
        de <span className="tabular-nums">{total}</span> {rotuloItens}
      </p>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {ultima > 1 ? (
          <nav aria-label="Páginas" className="flex items-center gap-1">
            {pagina > 1 ? (
              <Link href={href(pagina - 1)} className={cn(BOTAO, "hover:bg-card")} aria-label="Página anterior">
                <ChevronLeft className="size-4" />
              </Link>
            ) : (
              <span className={cn(BOTAO, "text-muted-foreground/40")} aria-hidden>
                <ChevronLeft className="size-4" />
              </span>
            )}
            {paginasVisiveis(pagina, ultima).map((n, i) =>
              n === "…" ? (
                <span key={`r${i}`} className="px-1 text-muted-foreground" aria-hidden>
                  …
                </span>
              ) : (
                <Link
                  key={n}
                  href={href(n)}
                  aria-current={n === pagina ? "page" : undefined}
                  aria-label={`Página ${n}`}
                  className={cn(
                    BOTAO,
                    n === pagina ? "bg-tinta font-semibold text-white" : "hover:bg-card",
                  )}
                >
                  {n}
                </Link>
              ),
            )}
            {pagina < ultima ? (
              <Link href={href(pagina + 1)} className={cn(BOTAO, "hover:bg-card")} aria-label="Próxima página">
                <ChevronRight className="size-4" />
              </Link>
            ) : (
              <span className={cn(BOTAO, "text-muted-foreground/40")} aria-hidden>
                <ChevronRight className="size-4" />
              </span>
            )}
          </nav>
        ) : null}

        <nav aria-label="Itens por página" className="flex items-center gap-1">
          <span className="mr-1 text-muted-foreground">Por página</span>
          {TAMANHOS_PAGINA.map((t) => (
            <Link
              key={t}
              // Ao trocar o tamanho, volta para a página 1: a atual pode não existir mais.
              href={href(1, t)}
              aria-current={t === porPagina ? "true" : undefined}
              className={cn(
                BOTAO,
                t === porPagina
                  ? "bg-marca-azul-fundo font-semibold text-marca-azul"
                  : "text-muted-foreground hover:bg-card hover:text-foreground",
              )}
            >
              {t}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
