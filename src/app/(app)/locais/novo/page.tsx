import type { Metadata } from "next";

import { CamposLocal } from "@/components/campos-local";
import { FormAcao } from "@/components/form-acao";
import { CabecalhoPagina } from "@/components/pagina";

import { criarLocal } from "../actions";

export const metadata: Metadata = { title: "Novo local" };

export default function NovoLocalPage() {
  return (
    <>
      <CabecalhoPagina titulo="Novo local" voltar={{ href: "/locais", rotulo: "Locais" }} />
      <FormAcao action={criarLocal} rotulo="Cadastrar local" className="max-w-2xl">
        <CamposLocal />
      </FormAcao>
    </>
  );
}
