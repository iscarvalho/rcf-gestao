export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      custos: {
        Row: {
          atualizado_em: string
          criado_em: string
          criado_por: string | null
          data: string
          descricao: string | null
          evento_id: string
          id: string
          tipo: Database["public"]["Enums"]["tipo_custo"]
          valor: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          data?: string
          descricao?: string | null
          evento_id: string
          id?: string
          tipo: Database["public"]["Enums"]["tipo_custo"]
          valor: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          criado_por?: string | null
          data?: string
          descricao?: string | null
          evento_id?: string
          id?: string
          tipo?: Database["public"]["Enums"]["tipo_custo"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "custos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos_resumo"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas: {
        Row: {
          atualizado_em: string
          categoria: Database["public"]["Enums"]["categoria_despesa"]
          criado_em: string
          criado_por: string | null
          data: string
          descricao: string
          id: string
          valor: number
        }
        Insert: {
          atualizado_em?: string
          categoria?: Database["public"]["Enums"]["categoria_despesa"]
          criado_em?: string
          criado_por?: string | null
          data?: string
          descricao: string
          id?: string
          valor: number
        }
        Update: {
          atualizado_em?: string
          categoria?: Database["public"]["Enums"]["categoria_despesa"]
          criado_em?: string
          criado_por?: string | null
          data?: string
          descricao?: string
          id?: string
          valor?: number
        }
        Relationships: []
      }
      divisoes: {
        Row: {
          criado_em: string
          evento_id: string
          id: string
          nome: string
          papel: Database["public"]["Enums"]["papel_divisao"]
          percentual: number
          pessoa_id: string | null
          valor: number
        }
        Insert: {
          criado_em?: string
          evento_id: string
          id?: string
          nome: string
          papel: Database["public"]["Enums"]["papel_divisao"]
          percentual: number
          pessoa_id?: string | null
          valor: number
        }
        Update: {
          criado_em?: string
          evento_id?: string
          id?: string
          nome?: string
          papel?: Database["public"]["Enums"]["papel_divisao"]
          percentual?: number
          pessoa_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "divisoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "divisoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos_resumo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "divisoes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          atualizado_em: string
          banlek_id: string | null
          banlek_slug: string | null
          criado_em: string
          data: string
          fotos: number | null
          galeria_banlek: string | null
          id: string
          local_id: string
          nome: string
          observacoes: string | null
          responsavel_id: string | null
          status: Database["public"]["Enums"]["status_evento"]
        }
        Insert: {
          atualizado_em?: string
          banlek_id?: string | null
          banlek_slug?: string | null
          criado_em?: string
          data: string
          fotos?: number | null
          galeria_banlek?: string | null
          id?: string
          local_id: string
          nome: string
          observacoes?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_evento"]
        }
        Update: {
          atualizado_em?: string
          banlek_id?: string | null
          banlek_slug?: string | null
          criado_em?: string
          data?: string
          fotos?: number | null
          galeria_banlek?: string | null
          id?: string
          local_id?: string
          nome?: string
          observacoes?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["status_evento"]
        }
        Relationships: [
          {
            foreignKeyName: "eventos_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "locais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      locais: {
        Row: {
          atualizado_em: string
          bairro: string | null
          cidade: string | null
          contato_email: string | null
          contato_nome: string | null
          contato_telefone: string | null
          criado_em: string
          id: string
          instagram: string | null
          nome: string
          observacoes: string | null
          tipo: Database["public"]["Enums"]["tipo_local"]
          uf: string | null
        }
        Insert: {
          atualizado_em?: string
          bairro?: string | null
          cidade?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_telefone?: string | null
          criado_em?: string
          id?: string
          instagram?: string | null
          nome: string
          observacoes?: string | null
          tipo?: Database["public"]["Enums"]["tipo_local"]
          uf?: string | null
        }
        Update: {
          atualizado_em?: string
          bairro?: string | null
          cidade?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_telefone?: string | null
          criado_em?: string
          id?: string
          instagram?: string | null
          nome?: string
          observacoes?: string | null
          tipo?: Database["public"]["Enums"]["tipo_local"]
          uf?: string | null
        }
        Relationships: []
      }
      pessoas: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          id: string
          nome: string
          papel: Database["public"]["Enums"]["papel_pessoa"]
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome: string
          papel?: Database["public"]["Enums"]["papel_pessoa"]
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome?: string
          papel?: Database["public"]["Enums"]["papel_pessoa"]
          user_id?: string | null
        }
        Relationships: []
      }
      vendas: {
        Row: {
          atualizado_em: string
          chave_externa: string | null
          comprador: string | null
          criado_em: string
          criado_por: string | null
          data: string
          evento_id: string
          id: string
          origem: Database["public"]["Enums"]["origem_venda"]
          valor: number
        }
        Insert: {
          atualizado_em?: string
          chave_externa?: string | null
          comprador?: string | null
          criado_em?: string
          criado_por?: string | null
          data: string
          evento_id: string
          id?: string
          origem?: Database["public"]["Enums"]["origem_venda"]
          valor: number
        }
        Update: {
          atualizado_em?: string
          chave_externa?: string | null
          comprador?: string | null
          criado_em?: string
          criado_por?: string | null
          data?: string
          evento_id?: string
          id?: string
          origem?: Database["public"]["Enums"]["origem_venda"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos_resumo"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      eventos_resumo: {
        Row: {
          data: string | null
          fotos: number | null
          id: string | null
          local_cidade: string | null
          local_id: string | null
          local_nome: string | null
          nome: string | null
          responsavel_id: string | null
          responsavel_nome: string | null
          resultado: number | null
          status: Database["public"]["Enums"]["status_evento"] | null
          total_custos: number | null
          total_vendas: number | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "locais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      categoria_despesa:
        | "equipamento"
        | "software"
        | "marketing"
        | "transporte"
        | "impostos"
        | "outros"
      origem_venda: "manual" | "banlek" | "carga_inicial"
      papel_divisao: "banlek" | "administrador" | "fotografo" | "empresa"
      papel_pessoa: "socio" | "fotografo" | "administrador"
      status_evento: "agendado" | "fotografado" | "publicado" | "fechado"
      tipo_custo: "inscricao" | "deslocamento" | "alimentacao" | "outros"
      tipo_local: "box" | "organizador"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      categoria_despesa: [
        "equipamento",
        "software",
        "marketing",
        "transporte",
        "impostos",
        "outros",
      ],
      origem_venda: ["manual", "banlek", "carga_inicial"],
      papel_divisao: ["banlek", "administrador", "fotografo", "empresa"],
      papel_pessoa: ["socio", "fotografo", "administrador"],
      status_evento: ["agendado", "fotografado", "publicado", "fechado"],
      tipo_custo: ["inscricao", "deslocamento", "alimentacao", "outros"],
      tipo_local: ["box", "organizador"],
    },
  },
} as const
