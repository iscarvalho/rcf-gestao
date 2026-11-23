import type { Metadata } from "next";
import Link from "next/link";

import { BOTAO_NA_FAIXA, CabecalhoPagina, Vazio } from "@/components/pagina";
import { LinkBotao } from "@/components/link-botao";
import { Paginacao } from "@/components/paginacao";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { enderecoLocal, TIPO_LOCAL } from "@/lib/dominio";
import { exigirPaginaValida, lerPaginacao, tratarForaDoFim } from "@/lib/paginacao";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Locais" };

export default async function LocaisPage(props: PageProps<"/locais">) {
  const paginacao = lerPaginacao(await props.searchParams);
  const supabase = await createClient();
  const {
    data: locais,
    count,
    error,
  } = await supabase
    .from("locais")
    .select("id, nome, tipo, bairro, cidade, uf, contato_nome, eventos(count)", { count: "exact" })
    .order("nome")
    .range(paginacao.de, paginacao.ate);
  tratarForaDoFim(error, paginacao, "/locais");
  if (error) throw error;
  const total = count ?? 0;
  exigirPaginaValida(total, paginacao, "/locais");

  return (
    <>
      <CabecalhoPagina
        titulo="Locais"
        descricao="Boxes e organizadores onde a Rio CrossFoto fotografa."
        acao={<LinkBotao href="/locais/novo" className={BOTAO_NA_FAIXA}>Novo local</LinkBotao>}
      />
      {locais.length === 0 ? (
        <Vazio>Nenhum local cadastrado ainda.</Vazio>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="hidden sm:table-cell">Onde</TableHead>
                <TableHead className="hidden md:table-cell">Contato</TableHead>
                <TableHead className="text-right">Eventos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locais.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">
                    <Link href={`/locais/${l.id}`} className="hover:underline">
                      {l.nome}
                    </Link>
                  </TableCell>
                  <TableCell>{TIPO_LOCAL[l.tipo]}</TableCell>
                  <TableCell className="hidden sm:table-cell">{enderecoLocal(l) || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell">{l.contato_nome ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {l.eventos[0]?.count ?? 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Paginacao total={total} paginacao={paginacao} caminho="/locais" rotuloItens="locais" />
    </>
  );
}
