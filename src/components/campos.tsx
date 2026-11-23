"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type ComponentProps } from "react";

import { useErrosDoCampo } from "@/components/form-acao";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Base = {
  nome: string;
  rotulo: string;
  /** Rótulo só para leitores de tela (ex.: campo dentro de uma tabela). */
  rotuloOculto?: boolean;
  className?: string;
};

function Campo({
  id,
  nome,
  rotulo,
  rotuloOculto,
  className,
  children,
}: Base & { id: string; children: React.ReactNode }) {
  const erros = useErrosDoCampo(nome);
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className={cn(rotuloOculto && "sr-only")}>
        {rotulo}
      </Label>
      {children}
      {erros?.map((e) => (
        <p key={e} id={`${id}-erro`} className="text-sm text-destructive">
          {e}
        </p>
      ))}
    </div>
  );
}

type PropsTexto = Base & {
  /** Classes do <input> em si (o `className` vai no bloco do campo). */
  classeInput?: string;
} & Omit<ComponentProps<"input">, "name">;

export function CampoTexto({
  nome,
  rotulo,
  rotuloOculto,
  className,
  classeInput,
  ...props
}: PropsTexto) {
  const id = useId();
  const erros = useErrosDoCampo(nome);
  return (
    <Campo id={id} nome={nome} rotulo={rotulo} rotuloOculto={rotuloOculto} className={className}>
      <Input
        id={id}
        name={nome}
        aria-invalid={erros ? true : undefined}
        aria-describedby={erros ? `${id}-erro` : undefined}
        className={classeInput}
        {...props}
      />
    </Campo>
  );
}

/** Senha com botão de mostrar/ocultar dentro do campo. */
export function CampoSenha({
  nome,
  rotulo,
  className,
  classeInput,
  ...props
}: Omit<PropsTexto, "type" | "rotuloOculto">) {
  const id = useId();
  const erros = useErrosDoCampo(nome);
  const [visivel, setVisivel] = useState(false);
  const Icone = visivel ? EyeOff : Eye;
  return (
    <Campo id={id} nome={nome} rotulo={rotulo} className={className}>
      <div className="relative">
        <Input
          id={id}
          name={nome}
          type={visivel ? "text" : "password"}
          aria-invalid={erros ? true : undefined}
          aria-describedby={erros ? `${id}-erro` : undefined}
          className={cn("pr-12", classeInput)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
          aria-controls={id}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Icone className="size-5" aria-hidden />
        </button>
      </div>
    </Campo>
  );
}

export function CampoTextoLongo({
  nome,
  rotulo,
  className,
  ...props
}: Base & Omit<ComponentProps<"textarea">, "name">) {
  const id = useId();
  return (
    <Campo id={id} nome={nome} rotulo={rotulo} className={className}>
      <Textarea id={id} name={nome} rows={3} {...props} />
    </Campo>
  );
}

/** Select nativo: funciona bem no celular e com Server Actions. */
export function CampoSelect({
  nome,
  rotulo,
  opcoes,
  vazio,
  className,
  ...props
}: Base & {
  opcoes: { valor: string; rotulo: string }[];
  vazio?: string;
} & Omit<ComponentProps<"select">, "name" | "children">) {
  const id = useId();
  const erros = useErrosDoCampo(nome);
  return (
    <Campo id={id} nome={nome} rotulo={rotulo} className={className}>
      <select
        id={id}
        name={nome}
        aria-invalid={erros ? true : undefined}
        // Mesmas regras do Input: 44px, 16px, anel de 2px com 2px de folga no foco.
        className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-base outline-none transition-colors focus-visible:border-marca-azul focus-visible:ring-2 focus-visible:ring-marca-azul focus-visible:ring-offset-2 focus-visible:ring-offset-card aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive dark:bg-input/30"
        {...props}
      >
        {vazio !== undefined ? <option value="">{vazio}</option> : null}
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </Campo>
  );
}
