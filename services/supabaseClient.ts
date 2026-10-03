import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase project URL
const DEFAULT_URL = 'https://wyjvhwsxfvxgsbiwmmpa.supabase.co';

// Read from Vite environment variables or fallback
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
    if (!supabaseAnonKey) {
        return null;
    }

    if (!client) {
        client = createClient(supabaseUrl, supabaseAnonKey, {
            realtime: {
                params: {
                    eventsPerSecond: 20
                }
            }
        });
    }

    return client;
}

export function isSupabaseConfigured(): boolean {
    return !!supabaseAnonKey;
}
