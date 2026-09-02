// Supabase клиент для чтения медиа (ED-14).
// URL/ключ берутся из env (см. .env.example). Окружение dev/prod выбирается
// переменной NEXT_PUBLIC_ENV (default dev).

import {createClient, SupabaseClient} from '@supabase/supabase-js';

const env = process.env.NEXT_PUBLIC_ENV ?? 'dev';
const isProd = env === 'prod';

const supabaseUrl = isProd
  ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD ?? ''
  : process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = isProd
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD ?? ''
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/** Публичный URL объекта в бакете games. */
export function supabasePublicUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${path}`;
}