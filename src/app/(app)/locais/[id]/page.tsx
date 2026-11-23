import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CamposLocal } from "@/components/campos-local";
import { FormAcao } from "@/components/form-acao";
import { CabecalhoPagina, Secao, StatusEvento, Vazio } from "@/components/pagina";
import { enderecoLocal, formatarData, TIPO_LOCAL } from "@/lib/dominio";
import { createClient } from "@/lib/supabase/server";

import { atualizarLocal } from "../actions";

async function carregar(id: string) {
  const supabase = await createClient();
  const [{ data: local }, { data: eventos }] = await Promise.all([
    supabase.from("locais").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("eventos")
      .select("id, nome, data, status")
      .eq("local_id", id)
      .order("data", { ascending: false }),
  ]);
  if (!local) notFound();
  return { local, eventos: eventos ?? [] };
}

export async function generateMetadata(props: PageProps<"/locais/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const { local } = await carregar(id);
  return { title: local.nome };
}

export default async function LocalPage(props: PageProps<"/locais/[id]">) {
  const { id } = await props.params;
  const { local, eventos } = await carregar(id);

  return (
    <>
      <CabecalhoPagina
        titulo={local.nome}
        descricao={[TIPO_LOCAL[local.tipo], enderecoLocal(local)].filter(Boolean).join(" · ")}
        voltar={{ href: "/locais", rotulo: "Locais" }}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Secao titulo="Dados do local">
          <FormAcao action={atualizarLocal.bind(null, local.id)} rotulo="Salvar alterações">
            <CamposLocal local={local} />
          </FormAcao>
        </Secao>
        <Secao titulo={`Eventos (${eventos.length})`}>
          {eventos.length === 0 ? (
            <Vazio>Nenhum evento neste local.</Vazio>
          ) : (
            <ul className="divide-y">
              {eventos.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link href={`/eventos/${e.id}`} className="font-medium hover:underline">
                      {e.nome}
                    </Link>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {formatarData(e.data)}
                    </p>
                  </div>
                  <StatusEvento status={e.status} />
                </li>
              ))}
            </ul>
          )}
        </Secao>
      </div>
    </>
  );
}
