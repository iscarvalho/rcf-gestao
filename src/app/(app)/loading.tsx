import { FAIXA } from "@/components/pagina";
import { cn } from "@/lib/utils";

export default function Carregando() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando…</span>
      {/* Mesma faixa do CabecalhoPagina, para o topo não pular quando a página chega. */}
      <div className={cn(FAIXA, "mb-6 grid gap-2 pt-4 pb-6 sm:pt-5 sm:pb-7")}>
        <div className="mt-6 h-8 w-48 animate-pulse rounded-md bg-white/10" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded-md bg-white/10" />
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
