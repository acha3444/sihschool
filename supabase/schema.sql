-- ==============================================================================
-- SIHSCOOL V1 - SCHEMA SUPABASE COMPLET & SECURISÉ (RLS)
-- Plateforme de suivi pour école d'arabe en ligne
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "pgcrypto";

-- 2. SUPPRESSION PROPRE DES ANCIENNES TABLES ET POLICIES (SI EXISTANTES)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.is_parent_of(uuid) cascade;
drop function if exists public.is_eleve_self(uuid) cascade;

drop table if exists public.annonces cascade;
drop table if exists public.paiements cascade;
drop table if exists public.appreciations cascade;
drop table if exists public.devoirs cascade;
drop table if exists public.progressions cascade;
drop table if exists public.presences cascade;
drop table if exists public.seances cascade;
drop table if exists public.eleves cascade;
drop table if exists public.groupes cascade;
drop table if exists public.profiles cascade;

-- Suppression d'anciennes tables de la démo si elles existaient
drop table if exists public.groupe_eleves cascade;
drop table if exists public.parent_eleves cascade;
drop table if exists public.messages cascade;
drop table if exists public.conversations cascade;
drop table if exists public.badges_eleve cascade;
drop table if exists public.notifications cascade;
drop table if exists public.rendus cascade;
drop table if exists public.users cascade;

-- ==============================================================================
-- 3. TABLES DU NOUVEAU SCHEMA V1
-- ==============================================================================

-- PROFILES : id = auth.users.id
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'parent', 'eleve')) default 'parent',
  prenom text not null,
  nom text not null default '',
  telephone text,
  doit_changer_mdp boolean not null default false,
  created_at timestamptz not null default now()
);

-- GROUPES : nom, formation, jour, heure, lien_zoom
create table public.groupes (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  formation text not null check (formation in ('nourania', 'litteraire', 'eveil')) default 'nourania',
  jour text not null,
  heure text not null,
  lien_zoom text,
  created_at timestamptz not null default now()
);

-- ELEVES : prenom, nom, date_naissance, type, parent_id, compte_id, groupe_id, notes_admin
create table public.eleves (
  id uuid primary key default gen_random_uuid(),
  prenom text not null,
  nom text not null,
  date_naissance date,
  type text not null check (type in ('enfant', 'adulte')) default 'enfant',
  parent_id uuid references public.profiles(id) on delete set null,
  compte_id uuid references public.profiles(id) on delete set null,
  groupe_id uuid references public.groupes(id) on delete set null,
  notes_admin text,
  created_at timestamptz not null default now()
);

-- SEANCES : groupe_id, date, theme
create table public.seances (
  id uuid primary key default gen_random_uuid(),
  groupe_id uuid not null references public.groupes(id) on delete cascade,
  date date not null,
  theme text,
  created_at timestamptz not null default now()
);

-- PRESENCES : seance_id, eleve_id, statut, unique(seance_id, eleve_id)
create table public.presences (
  id uuid primary key default gen_random_uuid(),
  seance_id uuid not null references public.seances(id) on delete cascade,
  eleve_id uuid not null references public.eleves(id) on delete cascade,
  statut text not null check (statut in ('present', 'absent', 'retard', 'excuse')),
  created_at timestamptz not null default now(),
  constraint presences_seance_eleve_unique unique (seance_id, eleve_id)
);

-- PROGRESSIONS : eleve_id, formation, lecon_actuelle (1 à 17 pour Nourania), commentaire, mis_a_jour_le
create table public.progressions (
  id uuid primary key default gen_random_uuid(),
  eleve_id uuid not null references public.eleves(id) on delete cascade,
  formation text not null check (formation in ('nourania', 'litteraire', 'eveil')) default 'nourania',
  lecon_actuelle int not null default 1 check (lecon_actuelle between 1 and 17),
  commentaire text,
  mis_a_jour_le timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- DEVOIRS : groupe_id, titre, consigne, date_limite
create table public.devoirs (
  id uuid primary key default gen_random_uuid(),
  groupe_id uuid not null references public.groupes(id) on delete cascade,
  titre text not null,
  consigne text not null,
  date_limite date,
  created_at timestamptz not null default now()
);

-- APPRECIATIONS : eleve_id, periode (ex: "2026-10"), texte
create table public.appreciations (
  id uuid primary key default gen_random_uuid(),
  eleve_id uuid not null references public.eleves(id) on delete cascade,
  periode text not null,
  texte text not null,
  created_at timestamptz not null default now()
);

-- PAIEMENTS : eleve_id, mois (ex: "2026-10"), montant, statut, moyen, date_paiement, unique(eleve_id, mois)
create table public.paiements (
  id uuid primary key default gen_random_uuid(),
  eleve_id uuid not null references public.eleves(id) on delete cascade,
  mois text not null,
  montant numeric(10,2) not null default 45,
  statut text not null check (statut in ('paye', 'en_attente')) default 'en_attente',
  moyen text,
  date_paiement date,
  created_at timestamptz not null default now(),
  constraint paiements_eleve_mois_unique unique (eleve_id, mois)
);

-- ANNONCES : titre, texte, groupe_id (nullable = tout le monde), publiee_le
create table public.annonces (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  texte text not null,
  groupe_id uuid references public.groupes(id) on delete set null,
  publiee_le date not null default current_date,
  created_at timestamptz not null default now()
);

-- INDEX PERFORMANCES
create index if not exists idx_eleves_parent on public.eleves(parent_id);
create index if not exists idx_eleves_compte on public.eleves(compte_id);
create index if not exists idx_eleves_groupe on public.eleves(groupe_id);
create index if not exists idx_seances_groupe_date on public.seances(groupe_id, date);
create index if not exists idx_presences_seance on public.presences(seance_id);
create index if not exists idx_progressions_eleve on public.progressions(eleve_id);
create index if not exists idx_paiements_eleve on public.paiements(eleve_id);
create index if not exists idx_devoirs_groupe on public.devoirs(groupe_id);
create index if not exists idx_annonces_groupe on public.annonces(groupe_id);

-- ==============================================================================
-- 4. FONCTIONS HELPER DE SÉCURITÉ (SECURITY DEFINER)
-- ==============================================================================

-- Vérifie si l'utilisateur connecté est admin
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- Vérifie si l'utilisateur connecté est le parent de l'élève
create or replace function public.is_parent_of(p_eleve_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.eleves
    where id = p_eleve_id and parent_id = auth.uid()
  );
end;
$$;

-- Vérifie si l'élève adulte est lui-même
create or replace function public.is_eleve_self(p_eleve_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.eleves
    where id = p_eleve_id and compte_id = auth.uid()
  );
end;
$$;

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) SUR TOUTES LES TABLES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.groupes enable row level security;
alter table public.eleves enable row level security;
alter table public.seances enable row level security;
alter table public.presences enable row level security;
alter table public.progressions enable row level security;
alter table public.devoirs enable row level security;
alter table public.appreciations enable row level security;
alter table public.paiements enable row level security;
alter table public.annonces enable row level security;

-- ------------------------------------------------------------------------------
-- POLICIES : PROFILES
-- ------------------------------------------------------------------------------
create policy "Admin total sur profiles"
  on public.profiles
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Lecture de son propre profil"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Mise a jour de son profil sans changer son role"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- ------------------------------------------------------------------------------
-- POLICIES : ELEVES
-- ------------------------------------------------------------------------------
create policy "Admin total sur eleves"
  on public.eleves
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Parent lit ses enfants"
  on public.eleves
  for select
  using (parent_id = auth.uid());

create policy "Eleve adulte lit sa fiche"
  on public.eleves
  for select
  using (compte_id = auth.uid());

-- ------------------------------------------------------------------------------
-- POLICIES : GROUPES
-- ------------------------------------------------------------------------------
create policy "Admin total sur groupes"
  on public.groupes
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Parent lit les groupes de ses enfants"
  on public.groupes
  for select
  using (
    exists (
      select 1 from public.eleves e
      where e.groupe_id = groupes.id and e.parent_id = auth.uid()
    )
  );

create policy "Eleve adulte lit son groupe"
  on public.groupes
  for select
  using (
    exists (
      select 1 from public.eleves e
      where e.groupe_id = groupes.id and e.compte_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- POLICIES : SEANCES
-- ------------------------------------------------------------------------------
create policy "Admin total sur seances"
  on public.seances
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Parent lit les seances de ses enfants"
  on public.seances
  for select
  using (
    exists (
      select 1 from public.eleves e
      where e.groupe_id = seances.groupe_id and e.parent_id = auth.uid()
    )
  );

create policy "Eleve adulte lit les seances de son groupe"
  on public.seances
  for select
  using (
    exists (
      select 1 from public.eleves e
      where e.groupe_id = seances.groupe_id and e.compte_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- POLICIES : PRESENCES
-- ------------------------------------------------------------------------------
create policy "Admin total sur presences"
  on public.presences
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Parent lit les presences de ses enfants"
  on public.presences
  for select
  using (public.is_parent_of(eleve_id));

create policy "Eleve adulte lit ses presences"
  on public.presences
  for select
  using (public.is_eleve_self(eleve_id));

-- ------------------------------------------------------------------------------
-- POLICIES : PROGRESSIONS
-- ------------------------------------------------------------------------------
create policy "Admin total sur progressions"
  on public.progressions
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Parent lit la progression de ses enfants"
  on public.progressions
  for select
  using (public.is_parent_of(eleve_id));

create policy "Eleve adulte lit sa progression"
  on public.progressions
  for select
  using (public.is_eleve_self(eleve_id));

-- ------------------------------------------------------------------------------
-- POLICIES : DEVOIRS
-- ------------------------------------------------------------------------------
create policy "Admin total sur devoirs"
  on public.devoirs
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Parent lit les devoirs du groupe de ses enfants"
  on public.devoirs
  for select
  using (
    exists (
      select 1 from public.eleves e
      where e.groupe_id = devoirs.groupe_id and e.parent_id = auth.uid()
    )
  );

create policy "Eleve adulte lit les devoirs de son groupe"
  on public.devoirs
  for select
  using (
    exists (
      select 1 from public.eleves e
      where e.groupe_id = devoirs.groupe_id and e.compte_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- POLICIES : APPRECIATIONS
-- ------------------------------------------------------------------------------
create policy "Admin total sur appreciations"
  on public.appreciations
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Parent lit les appreciations de ses enfants"
  on public.appreciations
  for select
  using (public.is_parent_of(eleve_id));

create policy "Eleve adulte lit ses appreciations"
  on public.appreciations
  for select
  using (public.is_eleve_self(eleve_id));

-- ------------------------------------------------------------------------------
-- POLICIES : PAIEMENTS
-- ------------------------------------------------------------------------------
create policy "Admin total sur paiements"
  on public.paiements
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Parent lit les cotisations de ses enfants"
  on public.paiements
  for select
  using (public.is_parent_of(eleve_id));

create policy "Eleve adulte lit ses cotisations"
  on public.paiements
  for select
  using (public.is_eleve_self(eleve_id));

-- ------------------------------------------------------------------------------
-- POLICIES : ANNONCES
-- ------------------------------------------------------------------------------
create policy "Admin total sur annonces"
  on public.annonces
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Parent lit les annonces generales ou de ses enfants"
  on public.annonces
  for select
  using (
    groupe_id is null
    or exists (
      select 1 from public.eleves e
      where e.groupe_id = annonces.groupe_id and e.parent_id = auth.uid()
    )
  );

create policy "Eleve adulte lit les annonces generales ou de son groupe"
  on public.annonces
  for select
  using (
    groupe_id is null
    or exists (
      select 1 from public.eleves e
      where e.groupe_id = annonces.groupe_id and e.compte_id = auth.uid()
    )
  );

-- ==============================================================================
-- 6. TRIGGER DE CREATION AUTOMATIQUE DU PROFIL LORS DE L'INSCRIPTION
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, prenom, nom, telephone, doit_changer_mdp)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'parent'),
    coalesce(new.raw_user_meta_data->>'prenom', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'nom', ''),
    new.raw_user_meta_data->>'telephone',
    coalesce((new.raw_user_meta_data->>'doit_changer_mdp')::boolean, false)
  )
  on conflict (id) do update set
    role = coalesce(excluded.role, public.profiles.role),
    prenom = coalesce(nullif(excluded.prenom, ''), public.profiles.prenom),
    nom = coalesce(nullif(excluded.nom, ''), public.profiles.nom),
    telephone = coalesce(excluded.telephone, public.profiles.telephone),
    doit_changer_mdp = coalesce(excluded.doit_changer_mdp, public.profiles.doit_changer_mdp);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
