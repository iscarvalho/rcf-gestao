"use server";

import { revalidatePath } from "next/cache";

import { clienteAutenticado, erroDoBanco, validar, type EstadoForm } from "@/lib/acao";
import { pessoaSchema } from "@/lib/dominio";

export async function criarPessoa(_: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const v = validar(pessoaSchema, formData);
  if ("estado" in v) return v.estado;

  const supabase = await clienteAutenticado();
  const { error } = await supabase.from("pessoas").insert(v.dados);
  if (error) return erroDoBanco(error);

  revalidatePath("/pessoas");
  return { ok: true };
}

/** Desativar mantém o histórico de eventos e tira a pessoa das listas de escolha. */
export async function alternarAtivo(id: string, ativo: boolean) {
  const supabase = await clienteAutenticado();
  const { error } = await supabase.from("pessoas").update({ ativo }).eq("id", id);
  if (error) throw new Error(erroDoBanco(error).erro);
  revalidatePath("/pessoas");
}
