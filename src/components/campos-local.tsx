"use client";

import { CampoSelect, CampoTexto, CampoTextoLongo } from "@/components/campos";
import type { Tables } from "@/lib/database.types";
import { TIPO_LOCAL } from "@/lib/dominio";

const OPCOES_TIPO = Object.entries(TIPO_LOCAL).map(([valor, rotulo]) => ({ valor, rotulo }));

export function CamposLocal({ local }: { local?: Tables<"locais"> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CampoTexto nome="nome" rotulo="Nome" defaultValue={local?.nome} required />
      <CampoSelect
        nome="tipo"
        rotulo="Tipo"
        opcoes={OPCOES_TIPO}
        defaultValue={local?.tipo ?? "box"}
      />
      <CampoTexto nome="bairro" rotulo="Bairro" defaultValue={local?.bairro ?? ""} />
      <div className="grid grid-cols-[1fr_5rem] gap-4">
        <CampoTexto nome="cidade" rotulo="Cidade" defaultValue={local?.cidade ?? ""} />
        <CampoTexto
          nome="uf"
          rotulo="UF"
          maxLength={2}
          autoCapitalize="characters"
          defaultValue={local?.uf ?? ""}
        />
      </div>
      <CampoTexto nome="instagram" rotulo="Instagram" defaultValue={local?.instagram ?? ""} />
      <CampoTexto
        nome="contato_nome"
        rotulo="Contato"
        defaultValue={local?.contato_nome ?? ""}
      />
      <CampoTexto
        nome="contato_telefone"
        rotulo="Telefone"
        type="tel"
        inputMode="tel"
        defaultValue={local?.contato_telefone ?? ""}
      />
      <CampoTexto
        nome="contato_email"
        rotulo="E-mail"
        type="email"
        defaultValue={local?.contato_email ?? ""}
        className="sm:col-span-2"
      />
      <CampoTextoLongo
        nome="observacoes"
        rotulo="Observações"
        defaultValue={local?.observacoes ?? ""}
        className="sm:col-span-2"
      />
    </div>
  );
}
