import { createClient } from '@supabase/supabase-js';
import { demoSupabase, installDemoApi, resetDemo, loadTikTokDemo } from './demoSupabase';

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
  // ?tiktok dans l'adresse : charge une famille fictive prête à filmer (famille@demo.test / demo1234)
  if (new URLSearchParams(window.location.search).has('tiktok')) loadTikTokDemo();
}

export const supabase = isDemoMode
  ? demoSupabase
  : createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon-key', {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
