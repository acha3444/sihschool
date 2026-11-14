-- ==============================================================================
-- Accès personnel des enfants (à exécuter une fois). Ne supprime aucune donnée.
-- L'enfant se connecte avec un identifiant (ex. « yasmine4821 ») au lieu d'un e-mail.
-- Son compte est lié à sa fiche par eleves.compte_id (comme un élève adulte).
-- ==============================================================================
alter table public.eleves add column if not exists identifiant text unique;
