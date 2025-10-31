import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ChatSession {
  id: string;
  user_id: string;
  started_at: string;
  last_activity: string;
  personality_state: {
    curiosity: number;
    confidence: number;
    friendliness: number;
  };
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  emotion: string;
  confidence: number;
  sentiment_score: number;
  response_time_ms: number;
  color_code: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface EmotionHistoryEntry {
  id: string;
  session_id: string;
  emotion: string;
  intensity: number;
  timestamp: string;
}

export interface GeneratedImage {
  id: string;
  session_id: string;
  prompt: string;
  image_url: string;
  ai_reaction: string;
  emotion: string;
  created_at: string;
}
