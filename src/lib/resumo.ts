import type { Database } from "@/lib/database.types";

type LinhaView = Database["public"]["Views"]["eventos_resumo"]["Row"];
type Opcionais = "local_cidade" | "responsavel_id" | "responsavel_nome";

/** Views saem com todas as colunas anuláveis nos tipos gerados; estas nunca são null. */
export type ResumoEvento = {
  [K in Exclude<keyof LinhaView, Opcionais>]: NonNullable<LinhaView[K]>;
} & Pick<LinhaView, Opcionais>;
