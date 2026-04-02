export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          owner_id: string
          name: string
          abbreviation: string
          primary_color: string
          secondary_color: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          abbreviation: string
          primary_color?: string
          secondary_color?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          abbreviation?: string
          primary_color?: string
          secondary_color?: string
          notes?: string | null
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          owner_id: string
          team_id: string
          name: string
          jersey_number: number
          position: Database['public']['Enums']['player_position'] | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          team_id: string
          name: string
          jersey_number: number
          position?: Database['public']['Enums']['player_position'] | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          team_id?: string
          name?: string
          jersey_number?: number
          position?: Database['public']['Enums']['player_position'] | null
          is_active?: boolean
          notes?: string | null
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          owner_id: string
          team_home_id: string
          team_away_id: string
          match_date: string
          location: string | null
          notes: string | null
          status: Database['public']['Enums']['match_status']
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          team_home_id: string
          team_away_id: string
          match_date: string
          location?: string | null
          notes?: string | null
          status?: Database['public']['Enums']['match_status']
          created_at?: string
          updated_at?: string
        }
        Update: {
          team_home_id?: string
          team_away_id?: string
          match_date?: string
          location?: string | null
          notes?: string | null
          status?: Database['public']['Enums']['match_status']
          updated_at?: string
        }
      }
      match_videos: {
        Row: {
          id: string
          match_id: string
          owner_id: string
          storage_path: string
          filename: string
          file_size_bytes: number | null
          duration_seconds: number | null
          fps: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_id: string
          owner_id: string
          storage_path: string
          filename: string
          file_size_bytes?: number | null
          duration_seconds?: number | null
          fps?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          storage_path?: string
          filename?: string
          file_size_bytes?: number | null
          duration_seconds?: number | null
          fps?: number | null
          updated_at?: string
        }
      }
      match_events: {
        Row: {
          id: string
          match_id: string
          owner_id: string
          timestamp_seconds: number
          type: Database['public']['Enums']['event_type']
          team_id: string | null
          primary_player_id: string | null
          secondary_player_id: string | null
          notes: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_id: string
          owner_id: string
          timestamp_seconds: number
          type: Database['public']['Enums']['event_type']
          team_id?: string | null
          primary_player_id?: string | null
          secondary_player_id?: string | null
          notes?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          timestamp_seconds?: number
          type?: Database['public']['Enums']['event_type']
          team_id?: string | null
          primary_player_id?: string | null
          secondary_player_id?: string | null
          notes?: string | null
          tags?: string[]
          updated_at?: string
        }
      }
    }
    Enums: {
      match_status: 'draft' | 'uploaded' | 'reviewing' | 'completed'
      event_type:
        | 'gol'
        | 'assistencia'
        | 'finalizacao'
        | 'defesa'
        | 'dividida'
        | 'falta'
        | 'recuperacao'
        | 'perda_de_bola'
        | 'substituicao'
        | 'observacao_tatica'
      player_position: 'goleiro' | 'fixo' | 'ala' | 'pivo'
    }
  }
}
