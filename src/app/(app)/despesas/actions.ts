"use server";

import { revalidatePath } from "next/cache";

import { clienteAutenticado, erroDoBanco, validar, type EstadoForm } from "@/lib/acao";
import { despesaSchema } from "@/lib/dominio";

function revalidarDespesas() {
  revalidatePath("/despesas");
  revalidatePath("/painel");
}

export async function lancarDespesa(_: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const v = validar(despesaSchema, formData);
  if ("estado" in v) return v.estado;

  const supabase = await clienteAutenticado();
  const { error } = await supabase.from("despesas").insert(v.dados);
  if (error) return erroDoBanco(error);

  revalidarDespesas();
  return { ok: true, mensagem: "Despesa lançada." };
}

export async function removerDespesa(id: string) {
  const supabase = await clienteAutenticado();
  const { error } = await supabase.from("despesas").delete().eq("id", id);
  if (error) throw new Error(erroDoBanco(error).erro);
  revalidarDespesas();
}
