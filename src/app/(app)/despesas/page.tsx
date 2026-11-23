import type { Metadata } from "next";

import { CampoSelect, CampoTexto } from "@/components/campos";
import { FormAcao } from "@/components/form-acao";
import { CabecalhoPagina, Secao, Vazio } from "@/components/pagina";
import { Paginacao } from "@/components/paginacao";
import { Button } from "@/components/ui/button";
import { CATEGORIA_DESPESA, formatarData, formatarReais } from "@/lib/dominio";
import { exigirPaginaValida, lerPaginacao, tratarForaDoFim } from "@/lib/paginacao";
import { createClient } from "@/lib/supabase/server";

import { lancarDespesa, removerDespesa } from "./actions";

export const metadata: Metadata = { title: "Despesas" };

const OPCOES_CATEGORIA = Object.entries(CATEGORIA_DESPESA).map(([valor, rotulo]) => ({
  valor,
  rotulo,
}));

const nomeDoMes = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Hoje no fuso da empresa, como "AAAA-MM-DD". */
const hoje = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

export default async function DespesasPage(props: PageProps<"/despesas">) {
  const paginacao = lerPaginacao(await props.searchParams);
  const supabase = await createClient();
  const [pagina, valores] = await Promise.all([
    supabase
      .from("despesas")
      .select("id, descricao, categoria, valor, data", { count: "exact" })
      .order("data", { ascending: false })
      .order("criado_em", { ascending: false })
      .range(paginacao.de, paginacao.ate),
    // Total de cada mês com todas as despesas dele, mesmo as de outras páginas.
    supabase.from("despesas").select("valor, data"),
  ]);
  tratarForaDoFim(pagina.error, paginacao, "/despesas");
  if (pagina.error) throw pagina.error;
  if (valores.error) throw valores.error;
  const despesas = pagina.data;
  const quantidade = pagina.count ?? 0;
  exigirPaginaValida(quantidade, paginacao, "/despesas");

  const totalDoMes = new Map<string, number>();
  for (const d of valores.data ?? []) {
    const chave = d.data.slice(0, 7);
    totalDoMes.set(chave, (totalDoMes.get(chave) ?? 0) + Number(d.valor));
  }

  // Agrupa a página por mês ("AAAA-MM"), do mais recente ao mais antigo.
  const meses = new Map<string, typeof despesas>();
  for (const d of despesas) {
    const chave = d.data.slice(0, 7);
    meses.set(chave, [...(meses.get(chave) ?? []), d]);
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Despesas"
        descricao="Gastos gerais da empresa, que não pertencem a um evento: equipamento, assinaturas, impostos."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="grid content-start gap-6">
          {despesas.length === 0 ? (
            <Vazio>Nenhuma despesa lançada ainda.</Vazio>
          ) : (
            [...meses].map(([chave, itens]) => {
              const [ano, mes] = chave.split("-").map(Number);
              const titulo = nomeDoMes.format(new Date(Date.UTC(ano, mes - 1, 1)));
              const total = totalDoMes.get(chave) ?? 0;
              return (
                <section key={chave} className="rounded-xl border">
                  <h2 className="flex items-baseline justify-between gap-3 border-b px-4 py-3 text-base font-semibold">
                    <span className="first-letter:uppercase">{titulo}</span>
                    <span className="tabular-nums">{formatarReais(total)}</span>
                  </h2>
                  <ul className="divide-y">
                    {itens.map((d) => (
                      <li key={d.id} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{d.descricao}</p>
                          <p className="text-sm text-muted-foreground">
                            <span className="tabular-nums">{formatarData(d.data)}</span> ·{" "}
                            {CATEGORIA_DESPESA[d.categoria]}
                          </p>
                        </div>
                        <span className="tabular-nums">{formatarReais(Number(d.valor))}</span>
                        <form action={removerDespesa.bind(null, d.id)}>
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            aria-label={`Remover despesa ${d.descricao}`}
                          >
                            Remover
                          </Button>
                        </form>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          )}
          <Paginacao
            total={quantidade}
            paginacao={paginacao}
            caminho="/despesas"
            rotuloItens="despesas"
          />
        </div>

        <Secao titulo="Lançar despesa" className="self-start lg:sticky lg:top-6">
          <FormAcao action={lancarDespesa} rotulo="Lançar despesa" limparAoSalvar>
            <CampoTexto
              nome="descricao"
              rotulo="Descrição"
              placeholder="Ex.: Adobe Lightroom"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <CampoTexto
                nome="valor"
                rotulo="Valor (R$)"
                inputMode="decimal"
                placeholder="0,00"
                autoComplete="off"
                required
              />
              <CampoTexto nome="data" rotulo="Data" type="date" defaultValue={hoje()} required />
            </div>
            <CampoSelect
              nome="categoria"
              rotulo="Categoria"
              opcoes={OPCOES_CATEGORIA}
              defaultValue="outros"
            />
          </FormAcao>
        </Secao>
      </div>
    </>
  );
}
