import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  User,
  Groupe,
  GroupeEleve,
  ParentEleve,
  Seance,
  Presence,
  Progression,
  Devoir,
  Rendu,
  Appreciation,
  Paiement,
  Message,
  Annonce,
  BadgeEleve,
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

// Create Supabase client if configured, otherwise null
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Upload an audio recording (Blob or File) to Supabase Storage
 * Returns the public URL of the uploaded audio file
 */
export async function uploadAudioToSupabase(
  audioBlob: Blob,
  fileName: string
): Promise<string | null> {
  if (!supabase) return null;

  try {
    const bucketName = 'audio-recordings';
    const filePath = `devoirs/${Date.now()}-${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, audioBlob, {
        contentType: audioBlob.type || 'audio/webm',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage upload error:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn('Failed to upload audio to Supabase:', err);
    return null;
  }
}

/**
 * Fetch all initial datasets from Supabase tables
 */
export async function fetchAllDataFromSupabase(): Promise<{
  users?: User[];
  groupes?: Groupe[];
  groupeEleves?: GroupeEleve[];
  parentEleves?: ParentEleve[];
  seances?: Seance[];
  presences?: Presence[];
  progressions?: Progression[];
  devoirs?: Devoir[];
  rendus?: Rendu[];
  appreciations?: Appreciation[];
  paiements?: Paiement[];
  messages?: Message[];
  annonces?: Annonce[];
  badgesEleve?: BadgeEleve[];
} | null> {
  if (!supabase) return null;

  try {
    const [
      usersRes,
      groupesRes,
      groupeElevesRes,
      parentElevesRes,
      seancesRes,
      presencesRes,
      progressionsRes,
      devoirsRes,
      rendusRes,
      appreciationsRes,
      paiementsRes,
      messagesRes,
      annoncesRes,
      badgesRes,
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('groupes').select('*'),
      supabase.from('groupe_eleves').select('*'),
      supabase.from('parent_eleves').select('*'),
      supabase.from('seances').select('*'),
      supabase.from('presences').select('*'),
      supabase.from('progressions').select('*'),
      supabase.from('devoirs').select('*'),
      supabase.from('rendus').select('*'),
      supabase.from('appreciations').select('*'),
      supabase.from('paiements').select('*'),
      supabase.from('messages').select('*'),
      supabase.from('annonces').select('*'),
      supabase.from('badges_eleves').select('*'),
    ]);

    return {
      users: (usersRes.data as User[]) || undefined,
      groupes: (groupesRes.data as Groupe[]) || undefined,
      groupeEleves: (groupeElevesRes.data as GroupeEleve[]) || undefined,
      parentEleves: (parentElevesRes.data as ParentEleve[]) || undefined,
      seances: (seancesRes.data as Seance[]) || undefined,
      presences: (presencesRes.data as Presence[]) || undefined,
      progressions: (progressionsRes.data as Progression[]) || undefined,
      devoirs: (devoirsRes.data as Devoir[]) || undefined,
      rendus: (rendusRes.data as Rendu[]) || undefined,
      appreciations: (appreciationsRes.data as Appreciation[]) || undefined,
      paiements: (paiementsRes.data as Paiement[]) || undefined,
      messages: (messagesRes.data as Message[]) || undefined,
      annonces: (annoncesRes.data as Annonce[]) || undefined,
      badgesEleve: (badgesRes.data as BadgeEleve[]) || undefined,
    };
  } catch (err) {
    console.warn('Error fetching data from Supabase:', err);
    return null;
  }
}

/**
 * Sync individual mutation to Supabase (fire-and-forget, with fallback to local)
 */
export async function syncTableRecord<T extends Record<string, any>>(
  table: string,
  record: T,
  action: 'upsert' | 'insert' | 'delete' = 'upsert'
): Promise<boolean> {
  if (!supabase) return false;

  try {
    if (action === 'upsert') {
      const { error } = await supabase.from(table).upsert(record);
      if (error) throw error;
    } else if (action === 'insert') {
      const { error } = await supabase.from(table).insert(record);
      if (error) throw error;
    } else if (action === 'delete') {
      const { error } = await supabase.from(table).delete().match(record);
      if (error) throw error;
    }
    return true;
  } catch (err) {
    console.warn(`Supabase sync failed on table ${table}:`, err);
    return false;
  }
}
