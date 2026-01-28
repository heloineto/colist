export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      categories: {
        Row: {
          created: string;
          id: number;
          listId: number;
          name: string;
        };
        Insert: {
          created?: string;
          id?: number;
          listId: number;
          name: string;
        };
        Update: {
          created?: string;
          id?: number;
          listId?: number;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_listId_fkey';
            columns: ['listId'];
            isOneToOne: false;
            referencedRelation: 'lists';
            referencedColumns: ['id'];
          },
        ];
      };
      errors: {
        Row: {
          allowCommunication: boolean;
          created: string;
          error: Json | null;
          files: string[] | null;
          id: number;
          message: Json | null;
          profileId: string | null;
        };
        Insert: {
          allowCommunication: boolean;
          created?: string;
          error?: Json | null;
          files?: string[] | null;
          id?: number;
          message?: Json | null;
          profileId?: string | null;
        };
        Update: {
          allowCommunication?: boolean;
          created?: string;
          error?: Json | null;
          files?: string[] | null;
          id?: number;
          message?: Json | null;
          profileId?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'errors_profileId_fkey';
            columns: ['profileId'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      feedbacks: {
        Row: {
          created: string;
          files: string[] | null;
          id: number;
          message: Json | null;
          profileId: string | null;
          rating: number | null;
        };
        Insert: {
          created?: string;
          files?: string[] | null;
          id?: number;
          message?: Json | null;
          profileId?: string | null;
          rating?: number | null;
        };
        Update: {
          created?: string;
          files?: string[] | null;
          id?: number;
          message?: Json | null;
          profileId?: string | null;
          rating?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'feedbacks_profileId_fkey';
            columns: ['profileId'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      items: {
        Row: {
          amount: number;
          categoryId: number | null;
          checked: boolean;
          created: string;
          details: string | null;
          id: number;
          listId: number;
          name: string;
        };
        Insert: {
          amount?: number;
          categoryId?: number | null;
          checked?: boolean;
          created?: string;
          details?: string | null;
          id?: number;
          listId: number;
          name: string;
        };
        Update: {
          amount?: number;
          categoryId?: number | null;
          checked?: boolean;
          created?: string;
          details?: string | null;
          id?: number;
          listId?: number;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'items_categoryId_fkey';
            columns: ['categoryId'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'items_listId_fkey';
            columns: ['listId'];
            isOneToOne: false;
            referencedRelation: 'lists';
            referencedColumns: ['id'];
          },
        ];
      };
      lists: {
        Row: {
          created: string;
          id: number;
          name: string;
        };
        Insert: {
          created?: string;
          id?: number;
          name: string;
        };
        Update: {
          created?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      members: {
        Row: {
          listId: number;
          profileId: string;
          role: Database['public']['Enums']['membersRole'];
        };
        Insert: {
          listId: number;
          profileId: string;
          role?: Database['public']['Enums']['membersRole'];
        };
        Update: {
          listId?: number;
          profileId?: string;
          role?: Database['public']['Enums']['membersRole'];
        };
        Relationships: [
          {
            foreignKeyName: 'members_listId_fkey';
            columns: ['listId'];
            isOneToOne: false;
            referencedRelation: 'lists';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'members_profileId_fkey';
            columns: ['profileId'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          created: string;
          email: string | null;
          id: string;
          name: string | null;
          picture: string | null;
        };
        Insert: {
          created?: string;
          email?: string | null;
          id: string;
          name?: string | null;
          picture?: string | null;
        };
        Update: {
          created?: string;
          email?: string | null;
          id?: string;
          name?: string | null;
          picture?: string | null;
        };
        Relationships: [];
      };
      trackEvents: {
        Row: {
          created: string;
          id: number;
          name: string | null;
          profileId: string | null;
          properties: Json | null;
        };
        Insert: {
          created?: string;
          id?: number;
          name?: string | null;
          profileId?: string | null;
          properties?: Json | null;
        };
        Update: {
          created?: string;
          id?: number;
          name?: string | null;
          profileId?: string | null;
          properties?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trackEvents_profileId_fkey';
            columns: ['profileId'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      createList: {
        Args: {
          name: string;
        };
        Returns: {
          created: string;
          id: number;
          name: string;
        }[];
      };
      getProfile: {
        Args: {
          email: string;
        };
        Returns: {
          created: string;
          email: string | null;
          id: string;
          name: string | null;
          picture: string | null;
        }[];
      };
    };
    Enums: {
      membersRole: 'owner' | 'member';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
