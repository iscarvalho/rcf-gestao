import type { Metadata } from "next";
import Link from "next/link";

import { CamposEvento } from "@/components/campos-evento";
import { FormAcao } from "@/components/form-acao";
import { CabecalhoPagina, Vazio } from "@/components/pagina";

import { criarEvento } from "../actions";
import { opcoesDoEvento } from "../opcoes";

export const metadata: Metadata = { title: "Novo evento" };

export default async function NovoEventoPage() {
  const { locais, pessoas } = await opcoesDoEvento();

  return (
    <>
      <CabecalhoPagina titulo="Novo evento" voltar={{ href: "/eventos", rotulo: "Eventos" }} />
      {locais.length === 0 ? (
        <Vazio>
          Cadastre um local antes de criar o evento.{" "}
          <Link href="/locais/novo" className="font-medium text-foreground underline">
            Novo local
          </Link>
        </Vazio>
      ) : (
        <FormAcao action={criarEvento} rotulo="Criar evento" className="max-w-2xl">
          <CamposEvento locais={locais} pessoas={pessoas} />
        </FormAcao>
      )}
    </>
  );
}
