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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contract_amendments: {
        Row: {
          amendment_type: Database["public"]["Enums"]["amendment_type"]
          contract_id: string
          created_at: string | null
          created_by: string | null
          id: string
          new_end_date: string | null
          new_value: number | null
          process_number: string
        }
        Insert: {
          amendment_type: Database["public"]["Enums"]["amendment_type"]
          contract_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_end_date?: string | null
          new_value?: number | null
          process_number: string
        }
        Update: {
          amendment_type?: Database["public"]["Enums"]["amendment_type"]
          contract_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_end_date?: string | null
          new_value?: number | null
          process_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_amendments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_documents: {
        Row: {
          contract_id: string
          document_number: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          contract_id: string
          document_number?: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          contract_id?: string
          document_number?: string | null
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_documents_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_endorsements: {
        Row: {
          adjustment_index: string | null
          contract_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          endorsement_type: Database["public"]["Enums"]["endorsement_type"]
          id: string
          new_execution_date: string | null
          new_value: number | null
          process_number: string
        }
        Insert: {
          adjustment_index?: string | null
          contract_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          endorsement_type: Database["public"]["Enums"]["endorsement_type"]
          id?: string
          new_execution_date?: string | null
          new_value?: number | null
          process_number: string
        }
        Update: {
          adjustment_index?: string | null
          contract_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          endorsement_type?: Database["public"]["Enums"]["endorsement_type"]
          id?: string
          new_execution_date?: string | null
          new_value?: number | null
          process_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_contract"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_supervisors: {
        Row: {
          contract_id: string
          created_at: string | null
          id: string
          supervisor_email: string | null
          supervisor_name: string
          supervisor_nomination: string | null
          updated_at: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          id?: string
          supervisor_email?: string | null
          supervisor_name: string
          supervisor_nomination?: string | null
          updated_at?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          id?: string
          supervisor_email?: string | null
          supervisor_name?: string
          supervisor_nomination?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_supervisors_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          contract_number: string
          contract_value: number
          contracted_company: string
          created_at: string | null
          created_by: string | null
          end_date: string
          gms_number: string | null // Alterado para aceitar NULL
          has_extension_clause: boolean | null
          id: string
          manager_email: string | null
          manager_name: string | null
          manager_nomination: string | null
          modality: Database["public"]["Enums"]["modality"]
          object: string
          process_number: string
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          updated_at: string | null
        }
        Insert: {
          contract_number: string
          contract_value: number
          contracted_company: string
          created_at?: string | null
          created_by?: string | null
          end_date: string
          gms_number?: string | null // Alterado para aceitar NULL
          has_extension_clause?: boolean | null
          id?: string
          manager_email?: string | null
          manager_name?: string | null
          manager_nomination?: string | null
          modality: Database["public"]["Enums"]["modality"]
          object: string
          process_number: string
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string | null
        }
        Update: {
          contract_number?: string
          contract_value?: number
          contracted_company?: string
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          gms_number?: string | null // Alterado para aceitar NULL
          has_extension_clause?: boolean | null
          id?: string
          manager_email?: string | null
          manager_name?: string | null
          manager_nomination?: string | null
          modality?: Database["public"]["Enums"]["modality"]
          object?: string
          process_number?: string
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      amendment_type:
        | "Aditivo de Valor"
        | "Aditivo de Prazo"
        | "Aditivo de Valor e Prazo"
      app_role: "admin" | "user"
      contract_status: "Vigente" | "Rescindido" | "Encerrado" | "Prorrogado"
      endorsement_type:
        | "Prorrogação de Prazo de Execução"
        | "Reajuste por Índice"
        | "Repactuação"
        | "Alteração de Dotação Orçamentária"
      modality:
        | "Pregão"
        | "Dispensa"
        | "Inexigibilidade"
        | "Concorrência"
        | "Tomada de Preços"
        | "Credenciamento" // Adicionado
        | "Adesão" // Adicionado
      nomination_type: "Cláusula Contratual" | "Portaria"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      amendment_type: [
        "Aditivo de Valor",
        "Aditivo de Prazo",
        "Aditivo de Valor e Prazo",
      ],
      app_role: ["admin", "user"],
      contract_status: ["Vigente", "Rescindido", "Encerrado", "Prorrogado"],
      endorsement_type: [
        "Prorrogação de Prazo de Execução",
        "Reajuste por Índice",
        "Repactuação",
        "Alteração de Dotação Orçamentária",
      ],
      modality: [
        "Pregão",
        "Dispensa",
        "Inexigibilidade",
        "Concorrência",
        "Tomada de Preços",
        "Credenciamento",
        "Adesão",
      ],
      nomination_type: ["Cláusula Contratual", "Portaria"],
    },
  },
} as const