import type { Metadata } from "next";
import { ArrowDownRight, ArrowUpRight, ExternalLink, Images, TrendingUp } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CampoSelect, CampoTexto } from "@/components/campos";
import { CamposEvento } from "@/components/campos-evento";
import { DivisaoFaturamento } from "@/components/divisao";
import { FormAcao } from "@/components/form-acao";
import { BOTAO_NA_FAIXA, CabecalhoPagina, Indicador, Secao, StatusEvento, Vazio } from "@/components/pagina";
import { Button } from "@/components/ui/button";
import { formatarData, formatarReais, linksBanlek, ORIGEM_VENDA, TIPO_CUSTO } from "@/lib/dominio";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { atualizarTotalEvento, removerVenda } from "../../vendas/actions";
import { adicionarCusto, atualizarEvento, removerCusto } from "../actions";
import { opcoesDoEvento } from "../opcoes";

const OPCOES_CUSTO = Object.entries(TIPO_CUSTO).map(([valor, rotulo]) => ({ valor, rotulo }));

/** Hoje no fuso da empresa, como "AAAA-MM-DD". */
const hoje = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

async function carregar(id: string) {
  const supabase = await createClient();
  const [{ data: evento }, { data: custos }, { data: vendas }, { data: divisoes }] = await Promise.all([
    supabase.from("eventos").select("*, local:locais(id, nome, cidade)").eq("id", id).maybeSingle(),
    supabase
      .from("custos")
      .select("id, tipo, descricao, valor, data")
      .eq("evento_id", id)
      .order("data", { ascending: false })
      .order("criado_em", { ascending: false }),
    supabase
      .from("vendas")
      .select("id, valor, data, origem")
      .eq("evento_id", id)
      .order("data", { ascending: false })
      .order("criado_em", { ascending: false }),
    supabase
      .from("divisoes")
      .select("id, papel, nome, percentual, valor, pessoa:pessoas(nome)")
      .eq("evento_id", id)
      .order("valor", { ascending: false }),
  ]);
  if (!evento) notFound();
  return { evento, custos: custos ?? [], vendas: vendas ?? [], divisoes: divisoes ?? [] };
}

export async function generateMetadata(props: PageProps<"/eventos/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const { evento } = await carregar(id);
  return { title: evento.nome };
}

export default async function EventoPage(props: PageProps<"/eventos/[id]">) {
  const { id } = await props.params;
  const { evento, custos, vendas, divisoes } = await carregar(id);
  const opcoes = await opcoesDoEvento(evento.responsavel_id);
  const totalCustos = custos.reduce((soma, c) => soma + Number(c.valor), 0);
  const totalVendas = vendas.reduce((soma, v) => soma + Number(v.valor), 0);
  const banlek = linksBanlek(evento);

  return (
    <>
      <CabecalhoPagina
        titulo={evento.nome}
        voltar={{ href: "/eventos", rotulo: "Eventos" }}
        descricao={
          <>
            <Link href={`/locais/${evento.local?.id}`} className="hover:underline">
              {evento.local?.nome}
            </Link>
            {" · "}
            <span className="tabular-nums">{formatarData(evento.data)}</span>
            {evento.fotos !== null ? (
              <>
                {" · "}
                <span className="tabular-nums">
                  {evento.fotos.toLocaleString("pt-BR")} fotos
                </span>
              </>
            ) : null}
          </>
        }
        acao={
          <div className="flex flex-wrap items-center gap-2">
            <StatusEvento status={evento.status} />
            {banlek.album ? (
              <a
                href={banlek.album}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  BOTAO_NA_FAIXA,
                  "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium",
                )}
              >
                <Images className="size-4" aria-hidden />
                Ver álbum
                <span className="sr-only">(abre a Banlek em outra aba)</span>
              </a>
            ) : null}
            {banlek.painel ? (
              <a
                href={banlek.painel}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-tinta-suave transition-colors hover:bg-white/10 hover:text-white"
              >
                Painel da Banlek
                <ExternalLink className="size-3.5" aria-hidden />
                <span className="sr-only">(abre em outra aba)</span>
              </a>
            ) : null}
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Indicador
          icone={ArrowUpRight}
          rotulo="Faturamento"
          valor={totalVendas}
          detalhe={`${vendas.length} ${vendas.length === 1 ? "lançamento" : "lançamentos"}`}
        />
        <Indicador icone={ArrowDownRight} tom="laranja" rotulo="Custos" valor={totalCustos} atraso={80} />
        <Indicador
          icone={TrendingUp}
          tom="magenta"
          rotulo="Resultado"
          valor={totalVendas - totalCustos}
          atraso={160}
          destaque
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="grid content-start gap-6">
        <Secao titulo="Vendas">
          {/* key: reinicia o formulário (e erros antigos) quando o total muda. */}
          <FormAcao
            key={totalVendas}
            action={atualizarTotalEvento}
            rotulo="Atualizar faturamento"
            limparAoSalvar
          >
            <input type="hidden" name="evento_id" value={evento.id} />
            <CampoTexto
              nome="total"
              rotulo="Faturamento atual na Banlek (R$)"
              inputMode="decimal"
              placeholder={formatarReais(totalVendas).replace("R$", "").trim()}
              autoComplete="off"
              required
            />
            <p className="-mt-2 text-xs text-muted-foreground">
              Informe o total acumulado; o sistema registra a diferença com a data de hoje.
            </p>
          </FormAcao>

          <div className="mt-6 border-t pt-4">
            {vendas.length === 0 ? (
              <Vazio>Nenhuma venda registrada.</Vazio>
            ) : (
              <ul className="divide-y">
                {vendas.map((v) => (
                  <li key={v.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium tabular-nums">{formatarData(v.data)}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {ORIGEM_VENDA[v.origem]}
                      </p>
                    </div>
                    <span className="tabular-nums">{formatarReais(Number(v.valor))}</span>
                    <form action={removerVenda.bind(null, evento.id, v.id)}>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        aria-label={`Remover venda de ${formatarData(v.data)}`}
                      >
                        Remover
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Secao>

        {divisoes.length > 0 ? <DivisaoFaturamento divisoes={divisoes} /> : null}

        <Secao titulo="Custos">
          <FormAcao action={adicionarCusto} rotulo="Lançar custo" limparAoSalvar>
            <input type="hidden" name="evento_id" value={evento.id} />
            <div className="grid grid-cols-2 gap-4">
              <CampoSelect nome="tipo" rotulo="Tipo" opcoes={OPCOES_CUSTO} defaultValue="deslocamento" />
              <CampoTexto
                nome="valor"
                rotulo="Valor (R$)"
                inputMode="decimal"
                placeholder="0,00"
                autoComplete="off"
                required
              />
              <CampoTexto nome="descricao" rotulo="Descrição" placeholder="Opcional" />
              <CampoTexto nome="data" rotulo="Data" type="date" defaultValue={hoje()} required />
            </div>
          </FormAcao>

          <div className="mt-6 border-t pt-4">
            {custos.length === 0 ? (
              <Vazio>Nenhum custo lançado.</Vazio>
            ) : (
              <ul className="divide-y">
                {custos.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{TIPO_CUSTO[c.tipo]}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        <span className="tabular-nums">{formatarData(c.data)}</span>
                        {c.descricao ? ` · ${c.descricao}` : ""}
                      </p>
                    </div>
                    <span className="tabular-nums">{formatarReais(Number(c.valor))}</span>
                    <form action={removerCusto.bind(null, evento.id, c.id)}>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        aria-label={`Remover custo de ${TIPO_CUSTO[c.tipo]}`}
                      >
                        Remover
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 flex justify-between border-t pt-4 font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatarReais(totalCustos)}</span>
            </p>
          </div>
        </Secao>
        </div>

        <Secao titulo="Dados do evento" className="self-start">
          <FormAcao action={atualizarEvento.bind(null, evento.id)} rotulo="Salvar alterações">
            <CamposEvento evento={evento} locais={opcoes.locais} pessoas={opcoes.pessoas} />
          </FormAcao>
        </Secao>
      </div>
    </>
  );
}
