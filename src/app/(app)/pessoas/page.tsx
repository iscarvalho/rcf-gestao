import type { Metadata } from "next";

import { CampoSelect, CampoTexto } from "@/components/campos";
import { FormAcao } from "@/components/form-acao";
import { CabecalhoPagina, Secao, Vazio } from "@/components/pagina";
import { Paginacao } from "@/components/paginacao";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAPEL_PESSOA } from "@/lib/dominio";
import { exigirPaginaValida, lerPaginacao, tratarForaDoFim } from "@/lib/paginacao";
import { createClient } from "@/lib/supabase/server";

import { alternarAtivo, criarPessoa } from "./actions";

export const metadata: Metadata = { title: "Pessoas" };

const OPCOES_PAPEL = Object.entries(PAPEL_PESSOA).map(([valor, rotulo]) => ({ valor, rotulo }));

export default async function PessoasPage(props: PageProps<"/pessoas">) {
  const paginacao = lerPaginacao(await props.searchParams);
  const supabase = await createClient();
  const {
    data: pessoas,
    count,
    error,
  } = await supabase
    .from("pessoas")
    .select("id, nome, papel, ativo, user_id", { count: "exact" })
    .order("ativo", { ascending: false })
    .order("nome")
    .range(paginacao.de, paginacao.ate);
  tratarForaDoFim(error, paginacao, "/pessoas");
  if (error) throw error;
  const total = count ?? 0;
  exigirPaginaValida(total, paginacao, "/pessoas");

  return (
    <>
      <CabecalhoPagina
        titulo="Pessoas"
        descricao="Sócios e fotógrafos que podem ser responsáveis por um evento."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          {pessoas.length === 0 ? (
            <Vazio>Nenhuma pessoa cadastrada ainda.</Vazio>
          ) : (
            <ul className="divide-y rounded-xl border">
              {pessoas.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className={p.ativo ? "font-medium" : "font-medium text-muted-foreground"}>
                      {p.nome}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {PAPEL_PESSOA[p.papel]}
                      {p.user_id ? " · tem login" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.ativo ? null : <Badge variant="outline">Inativa</Badge>}
                    <form action={alternarAtivo.bind(null, p.id, !p.ativo)}>
                      <Button type="submit" variant="ghost" size="sm">
                        {p.ativo ? "Desativar" : "Reativar"}
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Paginacao total={total} paginacao={paginacao} caminho="/pessoas" rotuloItens="pessoas" />
        </div>
        <Secao titulo="Adicionar pessoa" className="self-start">
          <FormAcao action={criarPessoa} rotulo="Adicionar" limparAoSalvar>
            <CampoTexto nome="nome" rotulo="Nome" required />
            <CampoSelect nome="papel" rotulo="Papel" opcoes={OPCOES_PAPEL} defaultValue="fotografo" />
          </FormAcao>
        </Secao>
      </div>
    </>
  );
}
