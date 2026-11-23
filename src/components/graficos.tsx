"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

import type { Mes } from "@/lib/financeiro";

// Cores validadas com o validador de paleta (azul/laranja, fundo claro).
// Ficam aqui e não no CSS: o Tailwind descarta variáveis que só o JS usa.
const COR = {
  faturamento: "#2a78d6",
  saidas: "#eb6834",
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
// Eixos sem "R$": a legenda e a dica já dizem que é dinheiro, e o eixo
// estreito deixa mais espaço para as barras no celular.
const compacto = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const eixo = { fontSize: 12, fill: "var(--muted-foreground)" };

function Dica({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-popover px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-display font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="flex items-center gap-2">
          <span className="size-2.5 rounded-sm" style={{ background: p.color }} aria-hidden />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="ml-auto pl-4 tabular-nums">{brl.format(Number(p.value))}</span>
        </p>
      ))}
    </div>
  );
}

export function Legenda({ itens }: { itens: { cor: string; rotulo: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
      {itens.map((i) => (
        <li key={i.rotulo} className="flex items-center gap-2">
          <span className="size-2.5 rounded-sm" style={{ background: i.cor }} aria-hidden />
          {i.rotulo}
        </li>
      ))}
    </ul>
  );
}

/** Faturamento × saídas (custos de eventos + despesas gerais) por mês. */
export function GraficoMensal({ dados }: { dados: Mes[] }) {
  return (
    <div className="grid gap-3">
      <Legenda
        itens={[
          { cor: COR.faturamento, rotulo: "Faturamento" },
          { cor: COR.saidas, rotulo: "Saídas" },
        ]}
      />
      <div className="h-72" role="img" aria-label="Faturamento e saídas por mês">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} barGap={2} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="rotulo"
              tickLine={false}
              axisLine={false}
              tick={eixo}
              interval="preserveStartEnd"
              minTickGap={12}
            />
            <YAxis
              width={44}
              tickLine={false}
              axisLine={false}
              tick={eixo}
              tickFormatter={(v: number) => compacto.format(v)}
            />
            <Tooltip content={Dica} cursor={{ fill: "var(--muted)" }} />
            <Bar
              dataKey="faturamento"
              name="Faturamento"
              fill={COR.faturamento}
              radius={[6, 6, 0, 0]}
              maxBarSize={24}
              animationDuration={900}
            />
            <Bar
              dataKey="saidas"
              name="Saídas"
              fill={COR.saidas}
              radius={[6, 6, 0, 0]}
              maxBarSize={24}
              animationBegin={150}
              animationDuration={900}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
