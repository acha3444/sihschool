-- ==============================================================================
-- SCHÉMA DE BASE DE DONNÉES SIHSCOOL (MÉTHODE NOURANIA & ARABE LITTÉRAIRE)
-- À exécuter dans le "SQL Editor" de votre projet Supabase (https://supabase.com)
-- ==============================================================================

-- 1. Table Utilisateurs (Élèves, Parents, Professeurs, Direction)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('eleve', 'parent', 'prof', 'admin')),
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar TEXT DEFAULT 'cat-mint',
  telephone TEXT,
  code_connexion TEXT,
  cree_le TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Table Groupes / Classes de cours
CREATE TABLE IF NOT EXISTS public.groupes (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('nourania', 'litteraire', 'mixte')),
  public TEXT NOT NULL CHECK (public IN ('enfants', 'femmes', 'mixte')),
  creneau TEXT NOT NULL,
  lieu_ou_lien TEXT NOT NULL,
  tarif_mensuel NUMERIC NOT NULL DEFAULT 45,
  prof_id TEXT REFERENCES public.users(id) ON DELETE SET NULL
);

-- 3. Associations Élèves <-> Groupes
CREATE TABLE IF NOT EXISTS public.groupe_eleves (
  groupe_id TEXT NOT NULL REFERENCES public.groupes(id) ON DELETE CASCADE,
  eleve_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (groupe_id, eleve_id)
);

-- 4. Associations Parents <-> Enfants
CREATE TABLE IF NOT EXISTS public.parent_eleves (
  parent_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  eleve_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (parent_id, eleve_id)
);

-- 5. Table Séances de cours
CREATE TABLE IF NOT EXISTS public.seances (
  id TEXT PRIMARY KEY,
  groupe_id TEXT NOT NULL REFERENCES public.groupes(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  creneau TEXT NOT NULL,
  effectuee BOOLEAN DEFAULT false,
  theme TEXT
);

-- 6. Table Présences & Assiduité
CREATE TABLE IF NOT EXISTS public.presences (
  seance_id TEXT NOT NULL REFERENCES public.seances(id) ON DELETE CASCADE,
  eleve_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  statut TEXT NOT NULL CHECK (statut IN ('present', 'retard', 'absent_excuse', 'absent_non_excuse')),
  motif_retard_ou_absence TEXT,
  PRIMARY KEY (seance_id, eleve_id)
);

-- 7. Table Progression Nourania (17 Leçons)
CREATE TABLE IF NOT EXISTS public.progressions (
  eleve_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lecon_id TEXT NOT NULL,
  statut TEXT NOT NULL CHECK (statut IN ('en_cours', 'validee', 'verrouillee')),
  date_validation TEXT,
  prof_id TEXT REFERENCES public.users(id),
  PRIMARY KEY (eleve_id, lecon_id)
);

-- 8. Table Devoirs
CREATE TABLE IF NOT EXISTS public.devoirs (
  id TEXT PRIMARY KEY,
  groupe_id TEXT NOT NULL REFERENCES public.groupes(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  titre_arabe TEXT,
  consigne TEXT NOT NULL,
  date_limite TEXT NOT NULL,
  audio_prof TEXT
);

-- 9. Table Devoirs Rendus par les Élèves (Récitations audio)
CREATE TABLE IF NOT EXISTS public.rendus (
  devoir_id TEXT NOT NULL REFERENCES public.devoirs(id) ON DELETE CASCADE,
  eleve_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  statut TEXT NOT NULL CHECK (statut IN ('a_faire', 'rendu', 'corrige')),
  audio_eleve TEXT,
  commentaire_prof TEXT,
  note_ou_mention TEXT,
  rendu_le TEXT,
  PRIMARY KEY (devoir_id, eleve_id)
);

-- 10. Table Appréciations de l'Enseignant
CREATE TABLE IF NOT EXISTS public.appreciations (
  id TEXT PRIMARY KEY,
  eleve_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prof_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  texte TEXT NOT NULL
);

-- 11. Table Paiements & Cotisations
CREATE TABLE IF NOT EXISTS public.paiements (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mois TEXT NOT NULL,
  montant NUMERIC NOT NULL,
  statut TEXT NOT NULL CHECK (statut IN ('paye', 'en_attente', 'retard')),
  date_paiement TEXT,
  recu_numero TEXT,
  moyen_paiement TEXT
);

-- 12. Table Messagerie
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  expediteur_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  destinataire_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  contenu TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  lu BOOLEAN DEFAULT false
);

-- 13. Table Annonces Générales
CREATE TABLE IF NOT EXISTS public.annonces (
  id TEXT PRIMARY KEY,
  titre TEXT NOT NULL,
  contenu TEXT NOT NULL,
  date TEXT NOT NULL,
  auteur_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
);

-- 14. Table Badges Obtenus
CREATE TABLE IF NOT EXISTS public.badges_eleves (
  eleve_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL,
  obtenu_le TEXT NOT NULL,
  PRIMARY KEY (eleve_id, badge_code)
);

-- ==============================================================================
-- ACTIVER ROW LEVEL SECURITY (RLS) & STRATÉGIES PUBLIQUES POUR DÉMONSTRATION
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groupes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groupe_eleves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_eleves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devoirs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rendus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appreciations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges_eleves ENABLE ROW LEVEL SECURITY;

-- Autoriser la lecture et l'écriture pour le client avec la clé publique (anon)
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow public read-write for all" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Allow public read-write for all" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- ==============================================================================
-- BUCKET DE STOCKAGE AUDIO (Supabase Storage)
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-recordings', 'audio-recordings', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Audio Access" ON storage.objects
FOR SELECT USING (bucket_id = 'audio-recordings');

CREATE POLICY "Public Audio Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'audio-recordings');

-- ==============================================================================
-- DONNÉES INITIALES (SEED DE DÉPART SIHSCOOL)
-- ==============================================================================

-- Direction & Professeurs
INSERT INTO public.users (id, role, prenom, nom, email, avatar, telephone)
VALUES 
  ('user-admin-1', 'admin', 'Mohammed', 'Al-Mansour', 'direction@sihscool.fr', 'cheikh-avatar', '06 12 34 56 78'),
  ('user-prof-1', 'prof', 'Fatima', 'El Amrani', 'fatima@sihscool.fr', 'prof-fatima', '06 23 45 67 89'),
  ('user-prof-2', 'prof', 'Amina', 'Benali', 'amina.prof@sihscool.fr', 'prof-amina', '06 34 56 78 90')
ON CONFLICT (id) DO NOTHING;

-- Parents
INSERT INTO public.users (id, role, prenom, nom, email, avatar, telephone)
VALUES
  ('user-parent-1', 'parent', 'Yasmina', 'Benali', 'yasmina.benali@gmail.com', 'parent-yasmina', '06 55 44 33 22'),
  ('user-parent-2', 'parent', 'Karim', 'Meziani', 'karim.meziani@gmail.com', 'parent-karim', '06 66 55 44 33')
ON CONFLICT (id) DO NOTHING;

-- Élèves
INSERT INTO public.users (id, role, prenom, nom, avatar, code_connexion)
VALUES
  ('user-eleve-1', 'eleve', 'Inès', 'Benali', 'cat-mint', '123456'),
  ('user-eleve-2', 'eleve', 'Youssef', 'Benali', 'falcon-mint', '234567'),
  ('user-eleve-3', 'eleve', 'Rayan', 'Meziani', 'lion-sun', '345678'),
  ('user-eleve-4', 'eleve', 'Nour', 'Haddad', 'dove-lavender', '456789')
ON CONFLICT (id) DO NOTHING;

-- Groupes
INSERT INTO public.groupes (id, nom, type, public, creneau, lieu_ou_lien, tarif_mensuel, prof_id)
VALUES
  ('groupe-1', 'Nourania Débutants - Papillons', 'nourania', 'enfants', 'Mercredi 14h00 - 15h30', 'Salle Al-Qalam (RDC)', 45, 'user-prof-1'),
  ('groupe-2', 'Arabe Littéraire - Étoiles', 'litteraire', 'enfants', 'Samedi 10h00 - 11h30', 'Salle Al-Hikma', 50, 'user-prof-2'),
  ('groupe-3', 'Nourania & Tajweed - Mamans', 'nourania', 'femmes', 'Samedi 14h00 - 16h00', 'En ligne (Zoom)', 55, 'user-prof-1')
ON CONFLICT (id) DO NOTHING;

-- Relations Parents-Élèves
INSERT INTO public.parent_eleves (parent_id, eleve_id)
VALUES
  ('user-parent-1', 'user-eleve-1'),
  ('user-parent-1', 'user-eleve-2'),
  ('user-parent-2', 'user-eleve-3')
ON CONFLICT DO NOTHING;

-- Inscriptions aux Groupes
INSERT INTO public.groupe_eleves (groupe_id, eleve_id)
VALUES
  ('groupe-1', 'user-eleve-1'),
  ('groupe-1', 'user-eleve-3'),
  ('groupe-2', 'user-eleve-2'),
  ('groupe-1', 'user-eleve-4')
ON CONFLICT DO NOTHING;
