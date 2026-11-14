import { createClient } from '@supabase/supabase-js';

/**
 * Inscription par lien de groupe : /inscription/<CODE>
 *
 * GET  /api/inscription?code=ABC123
 *      → infos publiques du groupe (nom, jour, heure, enseignante)
 *
 * POST /api/inscription
 *      { code, type: 'parent' | 'adulte', prenom, nom, email, telephone, motDePasse, enfants: [{ prenom, nom }] }
 *      → crée le compte (le mot de passe est choisi par la personne) puis l'élève / les enfants dans le groupe.
 *      Avec un en-tête « Authorization: Bearer <token> » d'un parent déjà connecté :
 *      { code, enfants } → ajoute seulement les enfants à ce groupe.
 */

const clean = (v) => String(v ?? '').trim();
const CODE_RE = /^[A-Z0-9]{4,12}$/;

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Configuration serveur incomplète.' });
  }
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const code = clean(req.method === 'GET' ? req.query?.code : req.body?.code).toUpperCase();
  if (!CODE_RE.test(code)) {
    return res.status(404).json({ error: "Ce lien d'inscription n'est pas valide." });
  }

  const { data: groupe } = await admin
    .from('groupes')
    .select('id, nom, formation, jour, heure, prof:profiles!groupes_prof_id_fkey(prenom)')
    .eq('code_inscription', code)
    .maybeSingle();

  if (!groupe) {
    return res.status(404).json({
      error: "Ce lien d'inscription n'existe plus. Demandez le nouveau lien à l'enseignante.",
    });
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      groupe: {
        nom: groupe.nom,
        formation: groupe.formation,
        jour: groupe.jour,
        heure: groupe.heure,
        enseignante: groupe.prof?.prenom || null,
      },
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const body = req.body || {};
  const enfants = (Array.isArray(body.enfants) ? body.enfants : [])
    .map((e) => ({ prenom: clean(e?.prenom), nom: clean(e?.nom) }))
    .filter((e) => e.prenom)
    .slice(0, 10);

  try {
    // Cas 1 : parent déjà connecté qui ajoute un enfant à ce groupe
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const { data: userData } = await admin.auth.getUser(authHeader.slice(7).trim());
      if (!userData?.user) return res.status(401).json({ error: 'Session expirée, reconnectez-vous.' });
      const { data: profile } = await admin.from('profiles').select('role').eq('id', userData.user.id).single();
      if (profile?.role !== 'parent') {
        return res.status(403).json({ error: 'Seul un compte parent peut ajouter un enfant.' });
      }
      if (!enfants.length) return res.status(400).json({ error: "Indiquez le prénom d'au moins un enfant." });
      const { error } = await admin.from('eleves').insert(
        enfants.map((e) => ({ prenom: e.prenom, nom: e.nom, type: 'enfant', parent_id: userData.user.id, groupe_id: groupe.id }))
      );
      if (error) throw error;
      return res.status(200).json({ success: true, ajoutes: enfants.length });
    }

    // Cas 2 : nouveau compte (parent ou élève adulte)
    const type = body.type === 'adulte' ? 'adulte' : 'parent';
    const prenom = clean(body.prenom);
    const nom = clean(body.nom);
    const email = clean(body.email).toLowerCase();
    const telephone = clean(body.telephone);
    const motDePasse = String(body.motDePasse || '');

    if (!prenom) return res.status(400).json({ error: 'Le prénom est obligatoire.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "L'adresse e-mail n'est pas valide." });
    if (motDePasse.length < 6) return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });
    if (type === 'parent' && !enfants.length) return res.status(400).json({ error: "Indiquez le prénom d'au moins un enfant." });

    const role = type === 'adulte' ? 'eleve' : 'parent';
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password: motDePasse,
      email_confirm: true,
      user_metadata: { role, prenom, nom, telephone, doit_changer_mdp: false },
    });

    if (createError) {
      if (createError.message?.toLowerCase().includes('already')) {
        return res.status(409).json({
          error:
            type === 'parent'
              ? 'Un compte existe déjà avec cet e-mail. Connectez-vous, puis rouvrez ce lien pour ajouter votre enfant.'
              : 'Un compte existe déjà avec cet e-mail. Connectez-vous directement.',
        });
      }
      throw createError;
    }

    const userId = created.user.id;
    await admin.from('profiles').upsert({ id: userId, role, prenom, nom, telephone: telephone || null, doit_changer_mdp: false });

    const lignes =
      type === 'adulte'
        ? [{ prenom, nom, type: 'adulte', compte_id: userId, groupe_id: groupe.id }]
        : enfants.map((e) => ({ prenom: e.prenom, nom: e.nom || nom, type: 'enfant', parent_id: userId, groupe_id: groupe.id }));

    const { error: eleveError } = await admin.from('eleves').insert(lignes);
    if (eleveError) {
      // on n'abandonne pas un compte sans élève : on annule la création
      await admin.auth.admin.deleteUser(userId);
      throw eleveError;
    }

    return res.status(200).json({ success: true, email, role });
  } catch (err) {
    console.error('Erreur inscription:', err);
    return res.status(500).json({ error: "L'inscription n'a pas pu être enregistrée. Réessayez dans un instant." });
  }
}
