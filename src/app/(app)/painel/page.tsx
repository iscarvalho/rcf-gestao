import { ArrowDownRight, Building2, TrendingUp, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { GraficoMensal } from "@/components/graficos";
import { Indicador, Secao, StatusEvento, Vazio } from "@/components/pagina";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatarData, formatarReais } from "@/lib/dominio";
import {
  aguardandoVendas,
  carregarPainel,
  ehPeriodo,
  type Mes,
  PERIODO_PADRAO,
  PERIODOS,
  type Periodo,
  type ResultadoLocal,
} from "@/lib/financeiro";
import type { ResumoEvento } from "@/lib/resumo";
import { cn } from "@/lib/utils";

import { EsqueletoDestaque, EsqueletoPainel, FaixaPainel } from "./partes";

export const metadata: Metadata = { title: "Painel" };

/** Acima disso, o gráfico mostra só as pontas: as maiores e as menores margens. */
const LOCAIS_NAS_PONTAS = 5;
const EVENTOS_NO_TOPO = 10;
const EVENTOS_NO_FIM = 5;

const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
/** As datas dos próximos eventos alternam as três cores do logo. */
const TONS_DATA = [
  "bg-marca-azul-fundo text-marca-azul",
  "bg-marca-laranja-fundo text-marca-laranja",
  "bg-marca-magenta-fundo text-marca-magenta",
];

type Busca = PageProps<"/painel">["searchParams"];

async function lerPeriodo(searchParams: Busca): Promise<Periodo> {
  const { periodo } = await searchParams;
  return ehPeriodo(periodo) ? periodo : PERIODO_PADRAO;
}

export default function PainelPage(props: PageProps<"/painel">) {
  return (
    <>
      <FaixaPainel
        descricao={
          <Suspense fallback={<span className="invisible">Carregando o período…</span>}>
            <Janela searchParams={props.searchParams} />
          </Suspense>
        }
      >
        <Suspense fallback={<EsqueletoDestaque />}>
          <Destaque searchParams={props.searchParams} />
        </Suspense>
      </FaixaPainel>
      <Suspense fallback={<EsqueletoPainel />}>
        <Numeros searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

/** De quando a quando são os números. */
async function Janela({ searchParams }: { searchParams: Busca }) {
  const { inicioRotulo } = await carregarPainel(await lerPeriodo(searchParams));
  return <>Dinheiro que entrou e saiu de {inicioRotulo} até hoje.</>;
}

const LARGURA_BARRA = { 3: "w-8 sm:w-10", 6: "w-5 sm:w-8", 12: "w-3 sm:w-5" } as const;

/** Barras de faturamento por mês na faixa escura; o mês atual em magenta. */
function BarrasMensais({ mensal }: { mensal: Mes[] }) {
  const maximo = Math.max(...mensal.map((m) => m.faturamento), 1);
  const largura = LARGURA_BARRA[mensal.length as keyof typeof LARGURA_BARRA] ?? "w-4";
  const descricao = mensal.map((m) => `${m.rotulo}: ${formatarReais(m.faturamento)}`).join("; ");
  return (
    <div
      role="img"
      aria-label={`Faturamento por mês. ${descricao}`}
      // No celular as barras ocupam a largura toda da faixa.
      className="flex h-36 w-full items-end justify-between gap-2 sm:w-auto sm:justify-start sm:gap-3"
    >
      {mensal.map((m, i) => {
        const atual = i === mensal.length - 1;
        return (
          <div key={m.chave} className="flex h-full flex-col items-center justify-end gap-1.5">
            <div
              title={`${m.rotulo}: ${formatarReais(m.faturamento)}`}
              className={cn(
                "origin-bottom animate-cresce rounded-md",
                largura,
                m.faturamento > 0 ? (atual ? "bg-[#e0418c]" : "bg-[#2f80ed]") : "bg-white/15",
              )}
              style={{
                height: `${Math.max(4, Math.round((m.faturamento / maximo) * 104))}px`,
                animationDelay: `${200 + i * 70}ms`,
              }}
            />
            <span className="text-xs text-tinta-suave">{m.rotulo.split("/")[0]}</span>
          </div>
        );
      })}
    </div>
  );
}

/** O número que mais importa, grande, com o contexto em pílulas. */
async function Destaque({ searchParams }: { searchParams: Busca }) {
  const periodo = await lerPeriodo(searchParams);
  const { kpis, mensal, eventos, porLocal, ultimaVenda } = await carregarPainel(periodo);
  const [reais, centavos] = formatarReais(kpis.faturamento).split(",");
  return (
    <div className="flex flex-wrap items-end justify-between gap-8">
      <div className="min-w-0 animate-entra">
        <p className="text-xs font-medium tracking-[0.08em] text-tinta-suave uppercase">
          Faturamento · {PERIODOS[periodo].rotulo}
        </p>
        <p className="mt-2 font-display text-5xl leading-none font-bold tracking-tighter tabular-nums sm:text-6xl">
          {reais}
          <span className="text-tinta-suave">,{centavos}</span>
        </p>
        <ul className="mt-4 flex flex-wrap gap-2 text-xs sm:text-sm">
          <li className="rounded-full bg-[#2f80ed]/25 px-2.5 py-1 text-[#cfe2fc]">
            {eventos.length} {eventos.length === 1 ? "evento realizado" : "eventos realizados"}
          </li>
          <li className="rounded-full bg-[#f26a2e]/25 px-2.5 py-1 text-[#fdd5c1]">
            {porLocal.length} {porLocal.length === 1 ? "local" : "locais"}
          </li>
          <li className="rounded-full bg-[#e0418c]/25 px-2.5 py-1 text-[#f8cde1]">
            {ultimaVenda ? (
              <>
                Banlek até <span className="tabular-nums">{formatarData(ultimaVenda)}</span>
              </>
            ) : (
              "Nenhuma venda registrada"
            )}
          </li>
        </ul>
      </div>
      <BarrasMensais mensal={mensal} />
    </div>
  );
}

/** Ranking com a posição real de cada local; acima de 10, só as pontas. */
function locaisNasPontas(porLocal: ResultadoLocal[]) {
  const comPosicao = porLocal.map((l, i) => ({ ...l, posicao: i + 1 }));
  if (comPosicao.length <= LOCAIS_NAS_PONTAS * 2) return { topo: comPosicao, fim: [] };
  return {
    topo: comPosicao.slice(0, LOCAIS_NAS_PONTAS),
    fim: comPosicao.slice(-LOCAIS_NAS_PONTAS),
  };
}

type LocalNoRanking = ResultadoLocal & { posicao: number };

function LinhasRanking({ locais, maximo }: { locais: LocalNoRanking[]; maximo: number }) {
  return (
    <ol className="grid gap-3.5">
      {locais.map((l, i) => (
        <li key={l.local} className="flex items-center gap-3">
          <span className="w-6 shrink-0 font-display text-sm font-bold text-muted-foreground tabular-nums">
            {l.posicao}
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex justify-between gap-3 text-sm">
              <span className="truncate font-medium">{l.local}</span>
              <span
                className={cn(
                  "shrink-0 font-semibold tabular-nums",
                  l.resultado < 0 && "text-destructive",
                )}
              >
                {formatarReais(l.resultado)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
              <div
                className={cn(
                  "h-full origin-left animate-estica rounded-full",
                  l.resultado < 0 ? "bg-destructive" : "bg-marca-azul",
                )}
                style={{
                  width: `${Math.max(2, (Math.abs(l.resultado) / maximo) * 100)}%`,
                  animationDelay: `${300 + i * 60}ms`,
                }}
              />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function RankingLocais({ porLocal }: { porLocal: ResultadoLocal[] }) {
  const { topo, fim } = locaisNasPontas(porLocal);
  const maximo = Math.max(...porLocal.map((l) => Math.abs(l.resultado)), 1);
  return (
    <>
      <LinhasRanking locais={topo} maximo={maximo} />
      {fim.length > 0 ? (
        <>
          <p className="my-3 pl-9 text-xs text-muted-foreground" aria-hidden>
            ⋯
          </p>
          <LinhasRanking locais={fim} maximo={maximo} />
        </>
      ) : null}
    </>
  );
}

/**
 * As maiores e as menores margens ficam à vista; o meio vai para "Ver os
 * outros". Eventos aguardando vendas ficam sempre à vista, no fim.
 */
function eventosNasPontas(eventos: ResumoEvento[]) {
  const vendidos = eventos.filter((e) => !aguardandoVendas(e));
  const aguardando = eventos.filter(aguardandoVendas);
  if (vendidos.length <= EVENTOS_NO_TOPO + EVENTOS_NO_FIM) {
    return { visiveis: [...vendidos, ...aguardando], resto: [] };
  }
  return {
    visiveis: [
      ...vendidos.slice(0, EVENTOS_NO_TOPO),
      ...vendidos.slice(-EVENTOS_NO_FIM),
      ...aguardando,
    ],
    resto: vendidos.slice(EVENTOS_NO_TOPO, -EVENTOS_NO_FIM),
  };
}

function TabelaEventos({ eventos, className }: { eventos: ResumoEvento[]; className?: string }) {
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          <TableHead>Evento</TableHead>
          <TableHead className="text-right">Margem</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {eventos.map((e) => {
          const aguardando = aguardandoVendas(e);
          const margem = Number(e.resultado);
          return (
            <TableRow key={e.id}>
              <TableCell className="whitespace-normal">
                <Link href={`/eventos/${e.id}`} className="font-medium hover:underline">
                  {e.nome}
                </Link>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    {e.local_nome} · <span className="tabular-nums">{formatarData(e.data)}</span>
                  </span>
                  {aguardando ? <StatusEvento status={e.status} /> : null}
                </div>
              </TableCell>
              <TableCell className="text-right align-top tabular-nums">
                {aguardando ? (
                  <span className="text-xs text-muted-foreground">Aguardando vendas</span>
                ) : (
                  <>
                    <span className={cn("font-medium", margem < 0 && "text-destructive")}>
                      {formatarReais(margem)}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      de {formatarReais(Number(e.total_vendas))} vendidos
                    </span>
                  </>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

async function Numeros({ searchParams }: { searchParams: Busca }) {
  const { kpis, mensal, porLocal, eventos, proximos, repasses } = await carregarPainel(
    await lerPeriodo(searchParams),
  );
  const { visiveis, resto } = eventosNasPontas(eventos);

  return (
    <>
      {/* Sobe sobre a faixa escura do topo. */}
      <div className="relative -mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Indicador
          icone={Building2}
          tom="magenta"
          rotulo="Parte da empresa"
          valor={kpis.parteEmpresa}
          detalhe={
            kpis.semDivisao > 0
              ? `Pela divisão da Banlek · ${formatarReais(kpis.semDivisao)} sem divisão`
              : "Pela divisão da Banlek"
          }
          destaque
          atraso={60}
        />
        <Indicador
          icone={ArrowDownRight}
          tom="laranja"
          rotulo="Saídas"
          valor={kpis.custosEventos + kpis.despesasGerais}
          detalhe={`${formatarReais(kpis.custosEventos)} em eventos · ${formatarReais(kpis.despesasGerais)} gerais`}
          atraso={120}
        />
        <Indicador
          icone={TrendingUp}
          rotulo="Resultado"
          valor={kpis.resultado}
          detalhe="Faturamento − saídas"
          atraso={180}
        />
        <Indicador
          icone={Wallet}
          rotulo="Saldo de caixa"
          valor={kpis.saldoCaixa}
          detalhe="Todo o histórico"
          atraso={240}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Secao titulo="Por mês">
          <GraficoMensal dados={mensal} />
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Faturamento</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Saídas</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mensal.map((m) => {
                const resultado = m.faturamento - m.saidas;
                return (
                  <TableRow key={m.chave}>
                    <TableCell>{m.rotulo}</TableCell>
                    <TableCell className="hidden text-right tabular-nums sm:table-cell">
                      {formatarReais(m.faturamento)}
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums sm:table-cell">
                      {formatarReais(m.saidas)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        resultado < 0 && "text-destructive",
                      )}
                    >
                      {formatarReais(resultado)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Secao>

        <Secao titulo="Margem por local">
          {porLocal.length === 0 ? (
            <Vazio>Nenhum evento publicado no período.</Vazio>
          ) : (
            <>
              <RankingLocais porLocal={porLocal} />
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Ver tabela{porLocal.length > LOCAIS_NAS_PONTAS * 2 ? ` com os ${porLocal.length} locais` : ""}
                </summary>
                <Table className="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Local</TableHead>
                      <TableHead className="hidden text-right sm:table-cell">Vendas</TableHead>
                      <TableHead className="text-right">Margem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {porLocal.map((l) => (
                      <TableRow key={l.local}>
                        <TableCell className="whitespace-normal">{l.local}</TableCell>
                        <TableCell className="hidden text-right tabular-nums sm:table-cell">
                          {formatarReais(l.faturamento)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right tabular-nums",
                            l.resultado < 0 && "text-destructive",
                          )}
                        >
                          {formatarReais(l.resultado)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </details>
            </>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            {porLocal.length > LOCAIS_NAS_PONTAS * 2
              ? `Aqui, as ${LOCAIS_NAS_PONTAS} maiores e as ${LOCAIS_NAS_PONTAS} menores margens de ${porLocal.length} locais. `
              : ""}
            Vendas de todo o histórico menos custos dos eventos publicados ou fechados no período, sem
            despesas gerais.
          </p>
        </Secao>

        <Secao titulo="Margem por evento">
          {eventos.length === 0 ? (
            <Vazio>Nenhum evento realizado no período.</Vazio>
          ) : (
            <>
              <p className="-mt-2 mb-3 max-w-[65ch] text-xs text-muted-foreground">
                Tudo o que o evento já vendeu menos os custos dele, sem despesas gerais. Por
                isso não bate com o Resultado do período.
              </p>
              <TabelaEventos eventos={visiveis} />
              {resto.length > 0 ? (
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Ver os {resto.length} eventos do meio da lista
                  </summary>
                  <TabelaEventos eventos={resto} className="mt-2" />
                </details>
              ) : null}
            </>
          )}
        </Secao>

        {/* No celular sobe para logo depois dos indicadores: é o que o fotógrafo procura. */}
        <Secao titulo="Próximos eventos" className="order-first self-start lg:order-none">
          {proximos.length === 0 ? (
            <Vazio>Nenhum evento agendado a partir de hoje.</Vazio>
          ) : (
            <ul className="grid gap-2">
              {proximos.map((e, i) => {
                const [, mes, dia] = e.data.split("-");
                return (
                  <li key={e.id}>
                    <Link
                      href={`/eventos/${e.id}`}
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 p-2.5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgb(20_32_58/0.35)]"
                    >
                      <span
                        className={cn(
                          "flex size-12 shrink-0 flex-col items-center justify-center rounded-xl leading-none",
                          TONS_DATA[i % TONS_DATA.length],
                        )}
                      >
                        <span className="font-display text-lg font-bold tabular-nums">{dia}</span>
                        <span className="text-[10px] font-semibold uppercase">
                          {MESES_CURTOS[Number(mes) - 1]}
                        </span>
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{e.nome}</span>
                        <span className="block truncate text-sm text-muted-foreground">
                          {e.local_nome} · {e.responsavel_nome ?? "sem responsável"}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Secao>

        <Secao titulo="Repasses no período" className="lg:col-span-2">
          {repasses.length === 0 ? (
            <Vazio>Nenhuma venda com divisão no período.</Vazio>
          ) : (
            <>
              <p className="-mt-2 mb-3 max-w-[65ch] text-xs text-muted-foreground">
                Quanto das vendas do período é de cada administrador e fotógrafo, pela divisão da
                Banlek. A Banlek paga cada um direto; aqui é para conferir.
              </p>
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {repasses.map((r) => (
                  <li key={r.nome} className="flex items-center gap-3 border-b py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate font-medium">
                        <span className="truncate">{r.nome}</span>
                        {r.equipe ? (
                          <span className="shrink-0 rounded-full bg-marca-azul-fundo px-2 py-0.5 text-[11px] font-semibold text-marca-azul">
                            Equipe
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[
                          r.fotografo > 0 ? `Fotos ${formatarReais(r.fotografo)}` : null,
                          r.administrador > 0 ? `Administração ${formatarReais(r.administrador)}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <span className="font-semibold tabular-nums">{formatarReais(r.total)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Secao>
      </div>
    </>
  );
}
