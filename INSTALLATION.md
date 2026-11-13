# Remettre l'appli Sihscool en ligne (environ 15 minutes)

L'appli garde les comptes, les devoirs et les vocaux sur **Supabase** (gratuit).
L'ancien projet Supabase a été supprimé, il faut en créer un nouveau.

## 1. Créer le projet Supabase
1. Va sur https://supabase.com, crée un compte, puis clique sur **New project**.
2. Choisis un nom (ex. `sihscool`), un mot de passe de base (garde-le) et la région **Europe (Paris ou Frankfurt)**.
3. Attends 1 à 2 minutes que le projet soit prêt.

## 2. Créer les tables
1. Dans Supabase, ouvre **SQL Editor**, puis **New query**.
2. Copie tout le contenu de `supabase/schema.sql`, colle-le, puis clique sur **Run**.

## 3. Créer ton compte Direction (super admin)
1. **Authentication > Users > Add user > Create new user** : ton e-mail + un mot de passe, coche **Auto Confirm User**.
2. Dans **SQL Editor**, lance (avec ton e-mail) :
   ```sql
   update public.profiles set role = 'admin', doit_changer_mdp = false
   where id = (select id from auth.users where email = 'ton-email@exemple.com');
   ```

## 4. Récupérer les 3 clés
Dans **Project Settings > API** (ou **API Keys**) :
- `Project URL` → `VITE_SUPABASE_URL`
- `anon public` → `VITE_SUPABASE_ANON_KEY`
- `service_role` (secrète, ne la partage jamais) → `SUPABASE_SERVICE_ROLE_KEY`

## 5. Les mettre sur Vercel
Projet Vercel > **Settings > Environment Variables** : ajoute les 3 variables, puis **Deployments > Redeploy**.

Pour tester sur l'ordinateur, mets les 3 mêmes lignes dans le fichier `.env` puis lance `npm run dev`.

## 6. Utilisation
- **Toi (Direction)** : onglet *Enseignantes* → « Ajouter une enseignante » pour créer le compte de ta mère. Tu peux aussi inscrire des élèves et des parents, gérer les groupes et les liens Zoom. Le bouton « Espace devoirs » ouvre la même vue que ta mère.
- **Ta mère (Enseignante)** :
  - *Devoirs* : donner un devoir (texte et/ou vocal), écouter et corriger les vocaux des élèves.
  - *Élèves & comptes* : inscrire un élève (enfant avec un compte parent, ou adulte avec son propre compte), donner un nouveau mot de passe.
  - *Groupes & Zoom* : créer les groupes et coller le lien Zoom.
  - *Annonces*.
- **Parents / élèves** : voient le lien Zoom, les annonces et les devoirs, et envoient leur réponse en vocal.

À chaque création de compte, l'appli affiche un message prêt à envoyer sur WhatsApp avec un mot de passe temporaire. À la première connexion, chacun choisit son propre mot de passe. Le bouton **Mot de passe** en haut de l'écran permet de le changer quand on veut.
