"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { clienteAutenticado, erroDoBanco, validar, type EstadoForm } from "@/lib/acao";
import { usuarioAtual } from "@/lib/usuario";

/** Na demonstração pública, o usuário de demonstração não muda nome nem senha. */
const ehDemo = (email: string | undefined) =>
  Boolean(process.env.DEMO_EMAIL) && email === process.env.DEMO_EMAIL;
const AVISO_DEMO = "Na demonstração, o perfil não pode ser alterado.";

const perfilSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome.").max(120, "Nome muito longo."),
});

/**
 * Salva o nome de quem está logado. Com cadastro em Pessoas, o nome é o de lá
 * (é o que aparece nos eventos); sem cadastro, fica no perfil do login.
 */
export async function salvarPerfil(_: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const v = validar(perfilSchema, formData);
  if ("estado" in v) return v.estado;

  const supabase = await clienteAutenticado();
  const usuario = await usuarioAtual();
  if (!usuario) return { erro: "Sessão expirada. Entre de novo." };
  if (ehDemo(usuario.email)) return { erro: AVISO_DEMO };

  if (usuario.pessoaId) {
    const { error } = await supabase
      .from("pessoas")
      .update({ nome: v.dados.nome })
      .eq("id", usuario.pessoaId);
    if (error) return erroDoBanco(error);
  } else {
    const { error } = await supabase.auth.updateUser({ data: { nome: v.dados.nome } });
    if (error) return { erro: "Não foi possível salvar. Tente de novo." };
  }

  // O nome aparece no topo de todas as telas e nas listas de eventos.
  revalidatePath("/", "layout");
  return { ok: true, mensagem: "Perfil salvo." };
}

const MINIMO_SENHA = 8;

const senhaSchema = z
  .object({
    atual: z.string().min(1, "Informe a senha atual."),
    nova: z
      .string()
      .min(MINIMO_SENHA, `A nova senha precisa de pelo menos ${MINIMO_SENHA} caracteres.`)
      .max(72, "A nova senha pode ter no máximo 72 caracteres."),
    confirmacao: z.string().min(1, "Repita a nova senha."),
  })
  // As comparações só valem com os dois campos preenchidos; vazio já tem erro próprio.
  .refine((d) => !d.nova || !d.confirmacao || d.nova === d.confirmacao, {
    path: ["confirmacao"],
    message: "As senhas não conferem.",
  })
  .refine((d) => !d.nova || !d.atual || d.nova !== d.atual, {
    path: ["nova"],
    message: "A nova senha precisa ser diferente da atual.",
  });

/**
 * Troca a senha de quem está logado. Confere a senha atual antes (entrando de
 * novo com ela), para que uma sessão esquecida aberta não baste para trocar.
 */
export async function trocarSenha(_: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const v = validar(senhaSchema, formData);
  if ("estado" in v) return v.estado;

  const supabase = await clienteAutenticado();
  const usuario = await usuarioAtual();
  if (!usuario?.email) return { erro: "Sessão expirada. Entre de novo." };
  if (ehDemo(usuario.email)) return { erro: AVISO_DEMO };

  const { error: erroAtual } = await supabase.auth.signInWithPassword({
    email: usuario.email,
    password: v.dados.atual,
  });
  if (erroAtual) return { campos: { atual: ["Senha atual incorreta."] } };

  const { error } = await supabase.auth.updateUser({ password: v.dados.nova });
  if (error) {
    if (error.code === "weak_password") {
      return { campos: { nova: ["Senha fraca. Use letras, números e símbolos."] } };
    }
    if (error.code === "same_password") {
      return { campos: { nova: ["A nova senha precisa ser diferente da atual."] } };
    }
    console.error(error);
    return { erro: "Não foi possível trocar a senha. Tente de novo." };
  }

  return { ok: true, mensagem: "Senha alterada." };
}
