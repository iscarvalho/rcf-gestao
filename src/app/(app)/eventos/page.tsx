import type { Metadata } from "next";
import Link from "next/link";

import { LinkBotao } from "@/components/link-botao";
import { Paginacao } from "@/components/paginacao";
import { BOTAO_NA_FAIXA, CabecalhoPagina, StatusEvento, Vazio } from "@/components/pagina";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Enums } from "@/lib/database.types";
import { formatarData, formatarReais, STATUS_EVENTO } from "@/lib/dominio";
import { exigirPaginaValida, lerPaginacao, tratarForaDoFim } from "@/lib/paginacao";
import type { ResumoEvento } from "@/lib/resumo";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Eventos" };

const ehStatus = (v: unknown): v is Enums<"status_evento"> =>
  typeof v === "string" && v in STATUS_EVENTO;

export default async function EventosPage(props: PageProps<"/eventos">) {
  const busca = await props.searchParams;
  const filtro = ehStatus(busca.status) ? busca.status : null;
  const paginacao = lerPaginacao(busca);

  const supabase = await createClient();
  let consulta = supabase
    .from("eventos_resumo")
    .select("*", { count: "exact" })
    .order("data", { ascending: false })
    .order("nome")
    .range(paginacao.de, paginacao.ate);
  if (filtro) consulta = consulta.eq("status", filtro);
  const {
    data: eventos,
    count,
    error,
  } = await consulta.overrideTypes<ResumoEvento[], { merge: false }>();
  tratarForaDoFim(error, paginacao, "/eventos", { status: filtro });
  if (error) throw error;
  const total = count ?? 0;
  exigirPaginaValida(total, paginacao, "/eventos", { status: filtro });

  const filtros = [
    { valor: null, rotulo: "Todos" },
    ...Object.entries(STATUS_EVENTO).map(([valor, rotulo]) => ({ valor, rotulo })),
  ];

  return (
    <>
      <CabecalhoPagina
        titulo="Eventos"
        descricao="Do agendamento ao fechamento, com o resultado de cada um."
        acao={<LinkBotao href="/eventos/novo" className={BOTAO_NA_FAIXA}>Novo evento</LinkBotao>}
      />
      <nav aria-label="Filtrar por status" className="mb-4 flex gap-1 overflow-x-auto pb-1">
        {filtros.map((f) => (
          <Link
            key={f.rotulo}
            href={f.valor ? `/eventos?status=${f.valor}` : "/eventos"}
            aria-current={filtro === f.valor ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1 text-sm whitespace-nowrap text-muted-foreground hover:text-foreground",
              filtro === f.valor && "border-foreground bg-foreground text-background hover:text-background",
            )}
          >
            {f.rotulo}
          </Link>
        ))}
      </nav>
      {eventos.length === 0 ? (
        <Vazio>
          {filtro ? "Nenhum evento com este status." : "Nenhum evento cadastrado ainda."}
        </Vazio>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead className="hidden sm:table-cell">Data</TableHead>
                <TableHead className="hidden md:table-cell">Responsável</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden text-right lg:table-cell">Faturamento</TableHead>
                <TableHead className="hidden text-right lg:table-cell">Custos</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventos.map((e) => (
                <TableRow key={e.id}>
                  {/* Quebra a linha no celular para o resultado não sair da tela. */}
                  <TableCell className="whitespace-normal">
                    <Link href={`/eventos/${e.id}`} className="font-medium hover:underline">
                      {e.nome}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {e.local_nome}
                      <span className="sm:hidden tabular-nums"> · {formatarData(e.data)}</span>
                    </p>
                    {/* No celular o status vai abaixo do nome, para o resultado caber na tela. */}
                    <div className="mt-1.5 sm:hidden">
                      <StatusEvento status={e.status} />
                    </div>
                  </TableCell>
                  <TableCell className="hidden tabular-nums sm:table-cell">
                    {formatarData(e.data)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {e.responsavel_nome ?? "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StatusEvento status={e.status} />
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums lg:table-cell">
                    {formatarReais(Number(e.total_vendas))}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums lg:table-cell">
                    {formatarReais(Number(e.total_custos))}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium tabular-nums",
                      Number(e.resultado) < 0 && "text-destructive",
                    )}
                  >
                    {formatarReais(Number(e.resultado))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Paginacao
        total={total}
        paginacao={paginacao}
        caminho="/eventos"
        params={{ status: filtro }}
        rotuloItens="eventos"
      />
    </>
  );
}
