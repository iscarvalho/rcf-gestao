import { cn } from "@/lib/utils";

/** Círculo com as iniciais de quem está logado, em magenta (cor do logo). */
export function Avatar({ iniciais, className }: { iniciais: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e0418c] font-display text-sm font-bold text-white",
        className,
      )}
    >
      {iniciais}
    </span>
  );
}

export type DadosUsuario = { nome: string | null; email: string; iniciais: string };

/** Nome em cima, e-mail embaixo; sem nome (login sem cadastro em Pessoas), só o e-mail. */
export function IdentificacaoUsuario({
  usuario,
  className,
}: {
  usuario: DadosUsuario;
  className?: string;
}) {
  return (
    <span className={cn("grid min-w-0 text-left leading-tight", className)}>
      {usuario.nome ? (
        <span className="truncate text-sm font-semibold text-white">{usuario.nome}</span>
      ) : null}
      <span className="truncate text-xs text-tinta-suave">{usuario.email}</span>
    </span>
  );
}
