-- ==============================================================================
-- Inscription par lien + correctif de sécurité (à exécuter une fois)
-- Ne supprime aucune donnée.
-- ==============================================================================

-- 1. SÉCURITÉ : un nouveau compte ne peut jamais choisir lui-même le rôle
--    « admin » ou « prof ». Seule l'API serveur (clé secrète) attribue ces rôles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := coalesce(new.raw_user_meta_data->>'role', 'parent');
begin
  if v_role not in ('parent', 'eleve') then
    v_role := 'parent';
  end if;

  insert into public.profiles (id, role, prenom, nom, telephone, doit_changer_mdp)
  values (
    new.id,
    v_role,
    coalesce(new.raw_user_meta_data->>'prenom', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'nom', ''),
    new.raw_user_meta_data->>'telephone',
    coalesce((new.raw_user_meta_data->>'doit_changer_mdp')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2. Code d'inscription unique pour chaque groupe (lien à partager aux familles)
alter table public.groupes
  add column if not exists code_inscription text unique
  default upper(substr(md5(gen_random_uuid()::text), 1, 6));

update public.groupes
  set code_inscription = upper(substr(md5(gen_random_uuid()::text), 1, 6))
  where code_inscription is null;
