"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clienteAutenticado, erroDoBanco, validar, type EstadoForm } from "@/lib/acao";
import { localSchema } from "@/lib/dominio";

export async function criarLocal(_: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const v = validar(localSchema, formData);
  if ("estado" in v) return v.estado;

  const supabase = await clienteAutenticado();
  const { data, error } = await supabase.from("locais").insert(v.dados).select("id").single();
  if (error) return erroDoBanco(error);

  revalidatePath("/locais");
  redirect(`/locais/${data.id}`);
}

export async function atualizarLocal(
  id: string,
  _: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const v = validar(localSchema, formData);
  if ("estado" in v) return v.estado;

  const supabase = await clienteAutenticado();
  const { error } = await supabase.from("locais").update(v.dados).eq("id", id);
  if (error) return erroDoBanco(error);

  revalidatePath("/locais");
  revalidatePath(`/locais/${id}`);
  return { ok: true };
}
