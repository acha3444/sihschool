import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Accepter uniquement les requêtes POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({
      error: 'Configuration serveur incomplète : SUPABASE_SERVICE_ROLE_KEY manquante sur le serveur.',
    });
  }

  // 1. Vérifier le token de l'appelant
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Session non authentifiée. Token manquant.' });
  }
  const token = authHeader.replace('Bearer ', '').trim();

  // Initialisation du client admin avec la clé de service
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // 2. Valider l'identité de l'appelant
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Session invalide ou expirée.' });
    }

    // 3. Vérifier que l'appelant est bien administrateur
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé : seuls les administrateurs peuvent réinitialiser les mots de passe.' });
    }

    // 4. Valider le compte cible
    const { userId, email } = req.body || {};
    let targetUserId = userId;

    if (!targetUserId && email) {
      const cleanEmail = email.toLowerCase().trim();
      const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (!listError && usersList?.users) {
        const found = usersList.users.find((u) => u.email?.toLowerCase() === cleanEmail);
        if (found) targetUserId = found.id;
      }
    }

    if (!targetUserId) {
      return res.status(400).json({ error: 'Identifiant d\'utilisateur (userId) ou adresse e-mail manquant.' });
    }

    // Récupérer le profil cible
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, prenom, nom, telephone, role')
      .eq('id', targetUserId)
      .maybeSingle();

    // Récupérer l'e-mail dans auth.users
    const { data: targetUserAuth, error: targetUserError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
    if (targetUserError || !targetUserAuth?.user) {
      return res.status(404).json({ error: 'Utilisateur introuvable dans le système.' });
    }

    const targetEmail = targetUserAuth.user.email;
    const targetPrenom = targetProfile?.prenom || targetUserAuth.user.user_metadata?.prenom || 'Bonjour';

    // 5. Générer un mot de passe temporaire
    const tempPassword = `SIH-${Math.floor(100000 + Math.random() * 900000)}`;

    // 6. Mettre à jour le mot de passe dans Supabase Auth
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      password: tempPassword,
      user_metadata: {
        ...(targetUserAuth.user.user_metadata || {}),
        doit_changer_mdp: true,
      },
    });

    if (updateAuthError) {
      return res.status(400).json({ error: `Erreur lors de la mise à jour : ${updateAuthError.message}` });
    }

    // 7. Forcer doit_changer_mdp = true dans la table profiles
    await supabaseAdmin
      .from('profiles')
      .update({ doit_changer_mdp: true })
      .eq('id', targetUserId);

    return res.status(200).json({
      success: true,
      tempPassword,
      email: targetEmail,
      prenom: targetPrenom,
      nom: targetProfile?.nom || '',
      telephone: targetProfile?.telephone || '',
      role: targetProfile?.role || 'utilisateur',
    });
  } catch (err) {
    console.error('Erreur inattendue réinitialisation mot de passe:', err);
    return res.status(500).json({ error: err.message || 'Erreur interne du serveur.' });
  }
}
