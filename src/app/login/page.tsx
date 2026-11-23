import type { Metadata } from "next";
import Image from "next/image";

import logo from "@/assets/logo-transparente.png";

import { CampoSenha, CampoTexto } from "@/components/campos";
import { FormAcao } from "@/components/form-acao";

import { entrar, entrarDemo } from "./actions";

export const metadata: Metadata = { title: "Entrar" };

// Altura (44px) e fonte (16px) já vêm do Input; aqui só os cantos e o respiro.
const CAMPO = "rounded-xl px-3.5";

export default function LoginPage() {
  // Na demonstração pública, um botão entra direto com o usuário de demonstração.
  const demo = Boolean(process.env.DEMO_EMAIL && process.env.DEMO_SENHA);
  return (
    <main className="relative isolate flex flex-1 flex-col items-center justify-center overflow-hidden bg-tinta px-4 py-10 sm:py-16">
      {/* Três faixas nas cores do logo, inclinadas no canto: só decoração. */}
      <div
        aria-hidden
        className="absolute -right-24 -bottom-24 -z-10 flex rotate-[-24deg] gap-4 opacity-90 sm:-right-16"
      >
        <span className="h-96 w-10 rounded-full bg-[#2f80ed]/70" />
        <span className="mt-16 h-96 w-10 rounded-full bg-[#f26a2e]/70" />
        <span className="mt-32 h-96 w-10 rounded-full bg-[#e0418c]/70" />
      </div>

      <div className="w-full max-w-sm animate-entra">
        <Image
          src={logo}
          alt="Rio CrossFoto"
          className="mx-auto h-32 w-auto drop-shadow-[0_8px_24px_rgb(0_0_0/0.35)] sm:h-36"
          priority
        />
        <p className="mt-4 text-center text-sm text-tinta-suave">Gestão de eventos e caixa</p>

        <div
          className="mt-8 animate-entra rounded-2xl bg-card p-6 text-card-foreground shadow-[0_24px_48px_-20px_rgb(0_0_0/0.5)] sm:p-8"
          style={{ animationDelay: "120ms" }}
        >
          {demo ? (
            <div className="mb-6 rounded-xl bg-marca-magenta-fundo p-4">
              <p className="text-sm font-semibold text-marca-magenta">Demonstração</p>
              <p className="mt-1 text-sm text-foreground">
                Todos os dados aqui são fictícios. Entre sem senha para conhecer o sistema.
              </p>
              <form action={entrarDemo} className="mt-3">
                <button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-marca-magenta text-base font-semibold text-white transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-10px_rgb(184_40_108/0.6)] focus-visible:ring-2 focus-visible:ring-marca-magenta focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Entrar como demonstração
                </button>
              </form>
            </div>
          ) : null}
          <h1 className="font-display text-2xl font-bold tracking-tight">Entrar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acesso só para a equipe. Peça um convite para quem administra o sistema.
          </p>
          <FormAcao
            action={entrar}
            rotulo="Entrar"
            rotuloEnviando="Entrando…"
            className="mt-6"
            classeBotao="mt-2 h-12 w-full rounded-xl text-base font-semibold shadow-[0_8px_20px_-8px_rgb(20_32_58/0.6)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgb(20_32_58/0.6)]"
          >
            <CampoTexto
              nome="email"
              rotulo="E-mail"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="voce@exemplo.com"
              classeInput={CAMPO}
              required
            />
            <CampoSenha
              nome="senha"
              rotulo="Senha"
              autoComplete="current-password"
              classeInput={CAMPO}
              required
            />
          </FormAcao>
        </div>
      </div>
    </main>
  );
}
