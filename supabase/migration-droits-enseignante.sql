-- ==============================================================================
-- Droits de l'enseignante (à exécuter une fois dans Supabase > SQL Editor)
-- Ne supprime AUCUNE table ni donnée : ne touche qu'aux règles d'accès (RLS).
-- L'enseignante peut : inscrire / modifier des élèves, voir les comptes parents,
-- gérer les groupes et liens Zoom, les devoirs, les annonces et les rendus.
-- ==============================================================================

create or replace function public.is_prof()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (select 1 from public.profiles where id = auth.uid() and role = 'prof');
end;
$$;

-- PROFILES : l'enseignante voit les comptes (pour choisir un parent existant)
drop policy if exists "Prof lit tous les profiles" on public.profiles;
create policy "Prof lit tous les profiles"
  on public.profiles for select
  using (public.is_prof());

-- ELEVES
drop policy if exists "Prof lit ses eleves" on public.eleves;
drop policy if exists "Prof gere les eleves" on public.eleves;
create policy "Prof gere les eleves"
  on public.eleves for all
  using (public.is_prof())
  with check (public.is_prof());

-- GROUPES (création, lien Zoom)
drop policy if exists "Prof lit ses groupes" on public.groupes;
drop policy if exists "Prof gere les groupes" on public.groupes;
create policy "Prof gere les groupes"
  on public.groupes for all
  using (public.is_prof())
  with check (public.is_prof());

-- DEVOIRS
drop policy if exists "Prof gere les devoirs" on public.devoirs;
create policy "Prof gere les devoirs"
  on public.devoirs for all
  using (public.is_prof())
  with check (public.is_prof());

-- RENDUS (écoute et correction des vocaux)
drop policy if exists "Prof gere tous les rendus" on public.devoir_rendus;
create policy "Prof gere tous les rendus"
  on public.devoir_rendus for all
  using (public.is_prof())
  with check (public.is_prof());

-- ANNONCES
drop policy if exists "Prof gere les annonces" on public.annonces;
create policy "Prof gere les annonces"
  on public.annonces for all
  using (public.is_prof())
  with check (public.is_prof());
