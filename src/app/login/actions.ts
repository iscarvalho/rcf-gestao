"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { validar, type EstadoForm } from "@/lib/acao";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe a senha."),
});

export async function entrar(_: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const v = validar(loginSchema, formData);
  if ("estado" in v) return v.estado;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: v.dados.email,
    password: v.dados.senha,
  });
  if (error) return { erro: "E-mail ou senha incorretos." };

  redirect("/painel");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Login da demonstração pública (DEMO_EMAIL e DEMO_SENHA no ambiente). As
 * credenciais ficam no servidor, nunca no HTML; sem elas, volta para o login.
 */
export async function entrarDemo() {
  const email = process.env.DEMO_EMAIL;
  const senha = process.env.DEMO_SENHA;
  if (!email || !senha) redirect("/login");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) redirect("/login");
  redirect("/painel");
}
