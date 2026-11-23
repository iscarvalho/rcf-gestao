import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Avatar } from "@/components/avatar";
import { CampoSenha, CampoTexto } from "@/components/campos";
import { FormAcao } from "@/components/form-acao";
import { CabecalhoPagina, Secao } from "@/components/pagina";
import { iniciais, usuarioAtual } from "@/lib/usuario";

import { salvarPerfil, trocarSenha } from "./actions";

export const metadata: Metadata = { title: "Meu perfil" };

export default async function PerfilPage() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/login");

  return (
    <>
      <CabecalhoPagina titulo="Meu perfil" descricao="Seu nome e sua senha de acesso." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Secao titulo="Dados" className="self-start">
          <div className="mb-6 flex items-center gap-4">
            <Avatar iniciais={iniciais(usuario)} className="size-14 text-lg" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{usuario.nome ?? "Sem nome"}</p>
              <p className="truncate text-sm text-muted-foreground">{usuario.email}</p>
            </div>
          </div>
          {/* key: depois de salvar, o campo volta com o nome novo como valor inicial. */}
          <FormAcao key={usuario.nome} action={salvarPerfil} rotulo="Salvar">
            <CampoTexto
              nome="nome"
              rotulo="Nome"
              defaultValue={usuario.nome ?? ""}
              autoComplete="name"
              required
            />
            <p className="-mt-2 text-sm text-muted-foreground">
              {usuario.pessoaId
                ? "É o nome do seu cadastro em Pessoas, então muda também nos eventos."
                : "Seu login não está ligado a um cadastro em Pessoas; o nome aparece só no topo."}
            </p>
            <div className="grid gap-1.5">
              <p className="text-sm font-medium">E-mail</p>
              <p className="text-sm text-muted-foreground">
                {usuario.email} · para trocar, fale com quem administra o sistema.
              </p>
            </div>
          </FormAcao>
        </Secao>

        <Secao titulo="Trocar senha" className="self-start">
          <FormAcao action={trocarSenha} rotulo="Trocar senha" rotuloEnviando="Trocando…" limparAoSalvar>
            <CampoSenha nome="atual" rotulo="Senha atual" autoComplete="current-password" required />
            <CampoSenha
              nome="nova"
              rotulo="Nova senha"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <p className="-mt-2 text-sm text-muted-foreground">
              Pelo menos 8 caracteres. Misture letras, números e símbolos.
            </p>
            <CampoSenha
              nome="confirmacao"
              rotulo="Repita a nova senha"
              autoComplete="new-password"
              required
            />
          </FormAcao>
        </Secao>
      </div>
    </>
  );
}
