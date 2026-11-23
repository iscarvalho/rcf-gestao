"use client";

import {
  createContext,
  startTransition,
  useActionState,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EstadoForm } from "@/lib/acao";

const ErrosContext = createContext<EstadoForm["campos"]>(undefined);

/** Erros de validação de um campo do formulário atual. */
export function useErrosDoCampo(nome: string) {
  return useContext(ErrosContext)?.[nome];
}

type Props = {
  action: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
  children: ReactNode;
  rotulo: string;
  rotuloEnviando?: string;
  /** Limpa os campos depois de salvar, para formulários de "adicionar". */
  limparAoSalvar?: boolean;
  /** Mantém o botão visível no rodapé da tela, para formulários longos. */
  rodapeFixo?: boolean;
  className?: string;
  /** Classes extras do botão de enviar (ex.: largura total no login). */
  classeBotao?: string;
};

/**
 * Formulário ligado a uma Server Action, com estado de envio e erros.
 * O envio passa por onSubmit para que os campos não sejam limpos quando a
 * validação falha (o React limpa formulários enviados via `action`).
 */
export function FormAcao({
  action,
  children,
  rotulo,
  rotuloEnviando,
  limparAoSalvar,
  rodapeFixo,
  className,
  classeBotao,
}: Props) {
  const [estado, formAction, enviando] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok && limparAoSalvar) formRef.current?.reset();
  }, [estado, limparAoSalvar]);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={(e) => {
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        startTransition(() => formAction(dados));
      }}
      className={cn("grid gap-4", className)}
      noValidate
    >
      <ErrosContext.Provider value={estado.campos}>{children}</ErrosContext.Provider>
      <div
        className={cn(
          "grid gap-3",
          rodapeFixo && "sticky bottom-0 z-10 -mx-4 border-t bg-background px-4 py-3 sm:-mx-6 sm:px-6",
        )}
      >
        {estado.erro ? (
          <p role="alert" className="text-sm text-destructive">
            {estado.erro}
          </p>
        ) : null}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={enviando} className={classeBotao}>
            {enviando ? (rotuloEnviando ?? "Salvando…") : rotulo}
          </Button>
          <p role="status" className="text-sm text-muted-foreground">
            {estado.ok && !enviando
              ? (estado.mensagem ?? (limparAoSalvar ? null : "Alterações salvas."))
              : null}
          </p>
        </div>
      </div>
    </form>
  );
}
