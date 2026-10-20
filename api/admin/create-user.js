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
      return res.status(403).json({ error: 'Accès refusé : seuls les administrateurs peuvent créer des comptes.' });
    }

    // 4. Valider les paramètres du nouveau compte
    const { email, prenom, nom, telephone, role } = req.body || {};
    if (!email || !prenom) {
      return res.status(400).json({ error: 'L\'adresse e-mail et le prénom sont obligatoires.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanRole = role === 'eleve' ? 'eleve' : role === 'prof' ? 'prof' : 'parent';

    // Génération d'un mot de passe temporaire clair et mémorisable
    const tempPassword = `SIH-${Math.floor(100000 + Math.random() * 900000)}`;

    // 5. Créer l'utilisateur dans Supabase Auth
    const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: cleanRole,
        prenom: prenom.trim(),
        nom: (nom || '').trim(),
        telephone: (telephone || '').trim(),
        doit_changer_mdp: true,
      },
    });

    if (createError) {
      if (createError.message && createError.message.toLowerCase().includes('already')) {
        return res.status(200).json({
          success: true,
          alreadyExisted: true,
          email: cleanEmail,
          message: 'Ce compte existe déjà avec cette adresse e-mail.',
        });
      }

      if (createError.message && createError.message.toLowerCase().includes('database error')) {
        return res.status(400).json({
          error: "Erreur base de données Supabase : le rôle 'prof' n'est pas encore autorisé dans la table profiles. Veuillez exécuter le script SQL dans Supabase SQL Editor.",
        });
      }

      return res.status(400).json({ error: `Erreur lors de la création : ${createError.message}` });
    }

    const createdUserId = newUserData.user.id;

    // 6. S'assurer que la ligne profile a bien doit_changer_mdp = true
    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: createdUserId,
        role: cleanRole,
        prenom: prenom.trim(),
        nom: (nom || '').trim(),
        telephone: (telephone || '').trim() || null,
        doit_changer_mdp: true,
      });

    return res.status(200).json({
      success: true,
      userId: createdUserId,
      email: cleanEmail,
      role: cleanRole,
      tempPassword,
    });
  } catch (err) {
    console.error('Erreur create-user:', err);
    return res.status(500).json({ error: 'Une erreur interne est survenue sur le serveur.' });
  }
}
