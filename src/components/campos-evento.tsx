"use client";

import { CampoSelect, CampoTexto, CampoTextoLongo } from "@/components/campos";
import type { Tables } from "@/lib/database.types";
import { STATUS_EVENTO } from "@/lib/dominio";

type Opcao = { valor: string; rotulo: string };

const OPCOES_STATUS = Object.entries(STATUS_EVENTO).map(([valor, rotulo]) => ({ valor, rotulo }));

export function CamposEvento({
  evento,
  locais,
  pessoas,
}: {
  evento?: Tables<"eventos">;
  locais: Opcao[];
  pessoas: Opcao[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CampoTexto
        nome="nome"
        rotulo="Nome do evento"
        defaultValue={evento?.nome}
        className="sm:col-span-2"
        required
      />
      <CampoSelect
        nome="local_id"
        rotulo="Local"
        opcoes={locais}
        vazio="Escolha o local"
        defaultValue={evento?.local_id ?? ""}
        required
      />
      <CampoTexto nome="data" rotulo="Data" type="date" defaultValue={evento?.data} required />
      <CampoSelect
        nome="responsavel_id"
        rotulo="Responsável"
        opcoes={pessoas}
        vazio="Sem responsável"
        defaultValue={evento?.responsavel_id ?? ""}
      />
      <CampoSelect
        nome="status"
        rotulo="Status"
        opcoes={OPCOES_STATUS}
        defaultValue={evento?.status ?? "agendado"}
      />
      <CampoTexto
        nome="galeria_banlek"
        rotulo="Galeria na Banlek"
        placeholder="Nome exato da galeria, para atribuir as vendas"
        defaultValue={evento?.galeria_banlek ?? ""}
        className="sm:col-span-2"
      />
      <CampoTextoLongo
        nome="observacoes"
        rotulo="Observações"
        defaultValue={evento?.observacoes ?? ""}
        className="sm:col-span-2"
      />
    </div>
  );
}
