import { createClient } from '@supabase/supabase-js';

/**
 * Accès personnel d'un enfant (sans e-mail) : il se connecte avec un identifiant, ex. « yasmine4821 ».
 * Géré par le parent de l'enfant (ou l'enseignante / la direction).
 *
 * POST /api/compte-enfant   (Authorization: Bearer <token>)
 *   { action: 'creer',   eleveId, motDePasse }  → crée l'accès, renvoie { identifiant }
 *   { action: 'mdp',     eleveId, motDePasse }  → change le mot de passe de l'enfant
 *   { action: 'retirer', eleveId }              → supprime l'accès (la fiche élève reste)
 */

export const DOMAINE_ELEVES = 'eleves.sihschool.com';

const slug = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .slice(0, 12) || 'eleve';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Configuration serveur incomplète.' });

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Session non authentifiée.' });

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  try {
    const { data: userData } = await admin.auth.getUser(authHeader.slice(7).trim());
    if (!userData?.user) return res.status(401).json({ error: 'Session expirée, reconnectez-vous.' });
    const { data: caller } = await admin.from('profiles').select('id, role').eq('id', userData.user.id).single();
    if (!caller || !['parent', 'prof', 'admin'].includes(caller.role)) {
      return res.status(403).json({ error: 'Accès refusé.' });
    }

    const { action, eleveId, motDePasse } = req.body || {};
    const { data: eleve } = await admin
      .from('eleves')
      .select('id, prenom, nom, type, parent_id, compte_id, identifiant')
      .eq('id', eleveId || '')
      .maybeSingle();
    if (!eleve) return res.status(404).json({ error: 'Élève introuvable.' });
    if (caller.role === 'parent' && eleve.parent_id !== caller.id) {
      return res.status(403).json({ error: "Vous ne pouvez gérer que l'accès de vos enfants." });
    }
    if (eleve.type !== 'enfant') return res.status(400).json({ error: 'Cet élève a déjà son propre compte.' });

    const mdpValide = typeof motDePasse === 'string' && motDePasse.length >= 6;

    if (action === 'creer') {
      if (eleve.compte_id) return res.status(409).json({ error: 'Cet enfant a déjà son accès.' });
      if (!mdpValide) return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });

      // identifiant unique : prénom + 4 chiffres
      let identifiant = '';
      for (let i = 0; i < 8 && !identifiant; i++) {
        const essai = `${slug(eleve.prenom)}${Math.floor(1000 + Math.random() * 9000)}`;
        const { data: pris } = await admin.from('eleves').select('id').eq('identifiant', essai).maybeSingle();
        if (!pris) identifiant = essai;
      }
      if (!identifiant) throw new Error('Identifiant introuvable');

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: `${identifiant}@${DOMAINE_ELEVES}`,
        password: motDePasse,
        email_confirm: true,
        user_metadata: { role: 'eleve', prenom: eleve.prenom, nom: eleve.nom, doit_changer_mdp: false },
      });
      if (createError) throw createError;
      const compteId = created.user.id;

      await admin.from('profiles').upsert({ id: compteId, role: 'eleve', prenom: eleve.prenom, nom: eleve.nom, doit_changer_mdp: false });
      const { error: linkError } = await admin.from('eleves').update({ compte_id: compteId, identifiant }).eq('id', eleve.id);
      if (linkError) {
        await admin.auth.admin.deleteUser(compteId);
        throw linkError;
      }
      return res.status(200).json({ success: true, identifiant });
    }

    if (!eleve.compte_id) return res.status(400).json({ error: "Cet enfant n'a pas encore d'accès." });

    if (action === 'mdp') {
      if (!mdpValide) return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });
      const { error } = await admin.auth.admin.updateUserById(eleve.compte_id, { password: motDePasse });
      if (error) throw error;
      return res.status(200).json({ success: true, identifiant: eleve.identifiant });
    }

    if (action === 'retirer') {
      await admin.from('eleves').update({ compte_id: null, identifiant: null }).eq('id', eleve.id);
      await admin.auth.admin.deleteUser(eleve.compte_id);
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Action inconnue.' });
  } catch (err) {
    console.error('Erreur compte-enfant:', err);
    return res.status(500).json({ error: "L'opération n'a pas pu être enregistrée. Réessayez." });
  }
}
