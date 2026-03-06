export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          plan: 'free' | 'creator' | 'pro' | 'agency'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          assets_used_this_month: number
          billing_cycle_start: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          plan?: 'free' | 'creator' | 'pro' | 'agency'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          assets_used_this_month?: number
          billing_cycle_start?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          plan?: 'free' | 'creator' | 'pro' | 'agency'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          assets_used_this_month?: number
          billing_cycle_start?: string
          updated_at?: string
        }
      }
      brand_voices: {
        Row: {
          id: string
          user_id: string
          voice_description: string
          example_content: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          voice_description: string
          example_content?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          voice_description?: string
          example_content?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          user_id: string
          title: string
          source_type: 'audio' | 'video' | 'text' | 'url'
          source_url: string | null
          file_size_bytes: number | null
          duration_seconds: number | null
          transcript: string | null
          status: 'uploading' | 'uploaded' | 'transcribing' | 'generating' | 'complete' | 'failed'
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          source_type: 'audio' | 'video' | 'text' | 'url'
          source_url?: string | null
          file_size_bytes?: number | null
          duration_seconds?: number | null
          transcript?: string | null
          status?: 'uploading' | 'uploaded' | 'transcribing' | 'generating' | 'complete' | 'failed'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          source_type?: 'audio' | 'video' | 'text' | 'url'
          source_url?: string | null
          file_size_bytes?: number | null
          duration_seconds?: number | null
          transcript?: string | null
          status?: 'uploading' | 'uploaded' | 'transcribing' | 'generating' | 'complete' | 'failed'
          error_message?: string | null
          updated_at?: string
        }
      }
      outputs: {
        Row: {
          id: string
          asset_id: string
          user_id: string
          platform: 'linkedin' | 'twitter' | 'newsletter' | 'instagram' | 'youtube_shorts'
          content: string
          metadata: Json
          version: number
          is_edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          user_id: string
          platform: 'linkedin' | 'twitter' | 'newsletter' | 'instagram' | 'youtube_shorts'
          content: string
          metadata?: Json
          version?: number
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          metadata?: Json
          version?: number
          is_edited?: boolean
          updated_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          asset_id: string
          action: string
          api_provider: string
          tokens_used: number | null
          cost_usd: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          asset_id: string
          action: string
          api_provider: string
          tokens_used?: number | null
          cost_usd?: number | null
          created_at?: string
        }
        Update: {
          action?: string
          api_provider?: string
          tokens_used?: number | null
          cost_usd?: number | null
        }
      }
    }
  }
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type BrandVoice = Database['public']['Tables']['brand_voices']['Row']
export type Asset = Database['public']['Tables']['assets']['Row']
export type Output = Database['public']['Tables']['outputs']['Row']
export type UsageLog = Database['public']['Tables']['usage_logs']['Row']

export type AssetStatus = Asset['status']
export type Platform = Output['platform']
export type Plan = Profile['plan']
