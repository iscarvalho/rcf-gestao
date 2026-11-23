"use client";

import { useEffect } from "react";

import { CabecalhoPagina } from "@/components/pagina";
import { Button } from "@/components/ui/button";

export default function ErroPainel({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <CabecalhoPagina titulo="Painel" />
      <div
        role="alert"
        className="grid justify-items-center gap-3 rounded-xl border border-dashed px-4 py-10 text-center"
      >
        <p className="font-medium">Não foi possível carregar os números.</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Algo deu errado ao buscar os dados. Nada foi alterado; tente de novo em instantes.
        </p>
        <Button variant="outline" onClick={() => retry()}>
          Tentar de novo
        </Button>
      </div>
    </>
  );
}
