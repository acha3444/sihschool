import { createClient } from '@supabase/supabase-js';
import { demoSupabase, installDemoApi, resetDemo } from './demoSupabase';

// Mode démo local (`npm run demo`) : base en mémoire, aucune connexion à Supabase
export const isDemoMode = import.meta.env.VITE_DEMO === '1';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured =
  isDemoMode || Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));

if (isDemoMode) {
  installDemoApi();
  // ?reset dans l'adresse : remet la démo à zéro
  if (new URLSearchParams(window.location.search).has('reset')) resetDemo();
}

export const supabase = isDemoMode
  ? demoSupabase
  : createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon-key', {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
