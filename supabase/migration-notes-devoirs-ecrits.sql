-- ==============================================================================
-- Notes (barème au choix) + devoirs écrits (à exécuter une fois). Ne supprime aucune donnée.
-- ==============================================================================

-- Barème choisi par l'enseignante pour chaque devoir (noté sur 20, 10, 5, 100…)
alter table public.devoirs add column if not exists bareme numeric(5,1) not null default 20;
alter table public.devoirs drop constraint if exists devoirs_bareme_check;
alter table public.devoirs add constraint devoirs_bareme_check check (bareme > 0 and bareme <= 1000);

-- Réponse écrite de l'élève, et note donnée par l'enseignante (sur le barème du devoir)
alter table public.devoir_rendus add column if not exists texte_rendu text;
alter table public.devoir_rendus add column if not exists note numeric(6,1);
alter table public.devoir_rendus drop constraint if exists devoir_rendus_note_check;
alter table public.devoir_rendus add constraint devoir_rendus_note_check check (note is null or note >= 0);

-- Un rendu peut être écrit seulement (sans vocal), ou une note sans rendu
alter table public.devoir_rendus alter column audio_url drop not null;

-- Sécurité : un parent ou un élève ne peut jamais modifier sa note ni la correction.
-- Quand il envoie (ou renvoie) sa réponse, le statut repasse « en attente ».
create or replace function public.proteger_correction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or public.is_prof() then
    -- la note ne peut pas dépasser le barème du devoir
    if new.note is not null and new.note > (select bareme from public.devoirs where id = new.devoir_id) then
      raise exception 'La note dépasse le barème du devoir';
    end if;
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.note := null;
    new.commentaire_prof := null;
    new.corrige_le := null;
  else
    new.note := old.note;
    new.commentaire_prof := old.commentaire_prof;
    new.corrige_le := old.corrige_le;
  end if;
  new.statut := 'en_attente';
  return new;
end;
$$;

drop trigger if exists proteger_correction on public.devoir_rendus;
create trigger proteger_correction
  before insert or update on public.devoir_rendus
  for each row execute procedure public.proteger_correction();
