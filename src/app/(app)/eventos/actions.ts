"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clienteAutenticado, erroDoBanco, validar, type EstadoForm } from "@/lib/acao";
import { custoSchema, eventoSchema } from "@/lib/dominio";

export async function criarEvento(_: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const v = validar(eventoSchema, formData);
  if ("estado" in v) return v.estado;

  const supabase = await clienteAutenticado();
  const { data, error } = await supabase.from("eventos").insert(v.dados).select("id").single();
  if (error) return erroDoBanco(error);

  revalidatePath("/eventos");
  redirect(`/eventos/${data.id}`);
}

export async function atualizarEvento(
  id: string,
  _: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const v = validar(eventoSchema, formData);
  if ("estado" in v) return v.estado;

  const supabase = await clienteAutenticado();
  const { error } = await supabase.from("eventos").update(v.dados).eq("id", id);
  if (error) return erroDoBanco(error);

  revalidatePath("/eventos");
  revalidatePath(`/eventos/${id}`);
  return { ok: true };
}

export async function adicionarCusto(_: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const v = validar(custoSchema, formData);
  if ("estado" in v) return v.estado;

  const supabase = await clienteAutenticado();
  const { error } = await supabase.from("custos").insert(v.dados);
  if (error) return erroDoBanco(error);

  revalidatePath(`/eventos/${v.dados.evento_id}`);
  revalidatePath("/eventos");
  return { ok: true };
}

export async function removerCusto(eventoId: string, custoId: string) {
  const supabase = await clienteAutenticado();
  const { error } = await supabase
    .from("custos")
    .delete()
    .eq("id", custoId)
    .eq("evento_id", eventoId);
  if (error) throw new Error(erroDoBanco(error).erro);

  revalidatePath(`/eventos/${eventoId}`);
  revalidatePath("/eventos");
}
