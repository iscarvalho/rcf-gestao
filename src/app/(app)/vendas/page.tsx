import type { Metadata } from "next";
import Link from "next/link";

import { CampoTexto } from "@/components/campos";
import { FormAcao } from "@/components/form-acao";
import { CabecalhoPagina, Secao, Vazio } from "@/components/pagina";
import { Paginacao } from "@/components/paginacao";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatarData, formatarReais } from "@/lib/dominio";
import { exigirPaginaValida, lerPaginacao, tratarForaDoFim } from "@/lib/paginacao";
import type { ResumoEvento } from "@/lib/resumo";
import { createClient } from "@/lib/supabase/server";

import { atualizarTotaisEmLote } from "./actions";

export const metadata: Metadata = { title: "Vendas" };

export default async function VendasPage(props: PageProps<"/vendas">) {
  const paginacao = lerPaginacao(await props.searchParams);
  const supabase = await createClient();
  const [pagina, todos] = await Promise.all([
    supabase
      .from("eventos_resumo")
      .select("*", { count: "exact" })
      .neq("status", "agendado")
      .order("data", { ascending: false })
      .order("nome")
      .range(paginacao.de, paginacao.ate)
      .overrideTypes<ResumoEvento[], { merge: false }>(),
    // O total do título é de todos os eventos, não só da página.
    supabase.from("eventos_resumo").select("total_vendas").neq("status", "agendado"),
  ]);
  tratarForaDoFim(pagina.error, paginacao, "/vendas");
  if (pagina.error) throw pagina.error;
  if (todos.error) throw todos.error;
  const eventos = pagina.data;
  const quantidade = pagina.count ?? 0;
  exigirPaginaValida(quantidade, paginacao, "/vendas");

  const total = (todos.data ?? []).reduce((s, e) => s + Number(e.total_vendas), 0);

  return (
    <>
      <CabecalhoPagina
        titulo="Vendas"
        descricao="Copie do painel da Banlek o faturamento atual de cada evento. O sistema registra só a diferença, com a data de hoje."
      />
      {eventos.length === 0 ? (
        <Vazio>Nenhum evento fotografado ainda.</Vazio>
      ) : (
        <Secao titulo={`Faturamento por evento · ${formatarReais(total)} no total`}>
          <FormAcao
            action={atualizarTotaisEmLote}
            rotulo="Salvar novos totais"
            limparAoSalvar
            rodapeFixo
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead className="text-right">Total atual</TableHead>
                  <TableHead className="w-28 text-right sm:w-36">Novo total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventos.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-normal">
                      <Link href={`/eventos/${e.id}`} className="font-medium hover:underline">
                        {e.nome}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {e.local_nome} ·{" "}
                        <span className="tabular-nums">{formatarData(e.data)}</span>
                      </p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatarReais(Number(e.total_vendas))}
                    </TableCell>
                    <TableCell className="align-top">
                      <CampoTexto
                        nome={`total_${e.id}`}
                        rotulo={`Novo total de ${e.nome} (${e.local_nome})`}
                        rotuloOculto
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="0,00"
                        className="text-right [&_input]:text-right"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </FormAcao>
          <Paginacao
            total={quantidade}
            paginacao={paginacao}
            caminho="/vendas"
            rotuloItens="eventos"
          />
        </Secao>
      )}
    </>
  );
}
