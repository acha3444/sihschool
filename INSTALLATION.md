# Sihscool : mémo technique

## Où est quoi
- **Site en ligne** : https://app.sihschool.com (Vercel, projet `sihschool`, mis à jour à chaque envoi sur GitHub `main`)
- **Base de données** : Supabase, organisation `sihschool`, projet `sihschool` (région Irlande)
- **Clés** : déjà configurées sur Vercel. En local, dans `.env` (jamais sur GitHub).

## ⚠️ Ne PAS lancer `supabase/schema.sql`
Ce script efface toutes les tables avant de les recréer. Il ne sert que pour un projet Supabase **vide**.
Le projet actuel a déjà ses tables. Les droits de l'enseignante ont été mis à jour avec
`supabase/migration-droits-enseignante.sql` (déjà appliqué, le 14/11/2026).

## Si l'appli ne marche plus du tout
Supabase met en pause les projets gratuits après 7 jours sans visite.
Aller sur supabase.com, ouvrir le projet `sihschool`, cliquer **Resume project**, attendre 2 à 3 minutes.

## Tester sans toucher aux vraies données (mode démo)
```bash
npm run demo
```
Ouvre http://localhost:5175 : une copie de l'appli avec une base fictive, sur l'ordinateur seulement.
- Compte de départ : `direction@demo.test` / `demo1234`
- Ajouter `?reset` à l'adresse pour tout remettre à zéro.

## Refaire la vidéo tutoriel
Avec `npm run demo` lancé :
```bash
python3 tutoriel/tourner_tutoriel.py
```
Puis assembler la vidéo :
```bash
cd tutoriel && ffmpeg -y -f concat -safe 0 -i brut/images.txt -vf "fps=30,format=yuv420p" -c:v libx264 -crf 20 -movflags +faststart tutoriel-sihscool.mp4
```

## Qui peut faire quoi
- **Direction** : tout (créer l'enseignante, les parents, les élèves, groupes, Zoom, annonces, devoirs).
- **Enseignante** : élèves et comptes parents/élèves, nouveaux mots de passe, groupes et Zoom, devoirs (texte + vocal), correction des vocaux, annonces.
- **Parents / élèves adultes** : lien Zoom, annonces, devoirs, réponse en vocal.
