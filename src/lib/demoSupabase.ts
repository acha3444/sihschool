/**
 * MODE DÉMO (local uniquement) : remplace Supabase par une base en mémoire
 * stockée dans le navigateur. Aucune donnée n'est envoyée sur Internet.
 * Activé avec `npm run demo`. Sert aux tests et aux vidéos tutoriels.
 *
 * Compte de départ : direction@demo.test / demo1234. Les autres comptes
 * (enseignante, parents, élèves) se créent depuis l'appli, comme en vrai.
 * Ajouter ?reset à l'adresse pour tout remettre à zéro.
 */

type Row = Record<string, any>;
type Db = Record<string, Row[]> & { _users: Row[] };

const STORAGE_KEY = 'sihscool-demo-db-v1';
const SESSION_KEY = 'sihscool-demo-session-v1';
const DEMO_PASSWORD = 'demo1234';

const uuid = () =>
  (crypto as any).randomUUID
    ? crypto.randomUUID()
    : 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
const nowIso = () => new Date().toISOString();
const today = () => new Date().toISOString().split('T')[0];

const seed = (): Db => {
  const created_at = nowIso();
  // On démarre avec le seul compte Direction : tout le reste se crée depuis l'appli.
  return {
    _users: [{ id: 'u-admin', email: 'direction@demo.test', password: DEMO_PASSWORD }],
    profiles: [
      { id: 'u-admin', role: 'admin', prenom: 'Achraf', nom: '', telephone: null, doit_changer_mdp: false, created_at },
    ],
    groupes: [],
    eleves: [],
    devoirs: [],
    devoir_rendus: [],
    annonces: [],
    seances: [],
    presences: [],
    progressions: [],
    appreciations: [],
    paiements: [],
  } as Db;
};

const loadDb = (): Db => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* stockage indisponible : on repart des données de démo */
  }
  const db = seed();
  saveDb(db);
  return db;
};
const saveDb = (db: Db) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* ignore */
  }
};

/** Remet la démo à zéro (utile avant de tourner une vidéo). */
export const resetDemo = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
};

// ─── Jointures du type "parent:profiles!eleves_parent_id_fkey(*)" ou "groupe:groupes(*)"
type Join = { alias: string; table: string; column: string };
const parseSelect = (fromTable: string, select: string): Join[] => {
  const joins: Join[] = [];
  const re = /(\w+):(\w+)(?:!(\w+))?\(\*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(select))) {
    const [, alias, table, fk] = m;
    let column = `${alias}_id`;
    if (fk) {
      const prefix = `${fromTable}_`;
      column = fk.replace(prefix, '').replace(/_fkey$/, '');
    }
    joins.push({ alias, table, column });
  }
  return joins;
};

const UNIQUE_KEYS: Record<string, string[]> = {
  devoir_rendus: ['devoir_id', 'eleve_id'],
  presences: ['seance_id', 'eleve_id'],
  paiements: ['eleve_id', 'mois'],
};

const DEFAULTS: Record<string, () => Row> = {
  devoir_rendus: () => ({ statut: 'en_attente', duree_secondes: 0, commentaire_prof: null, corrige_le: null }),
  annonces: () => ({ publiee_le: today() }),
  progressions: () => ({ formation: 'nourania', lecon_actuelle: 1, mis_a_jour_le: nowIso() }),
  eleves: () => ({ type: 'enfant', parent_id: null, compte_id: null, groupe_id: null, notes_admin: null }),
  groupes: () => ({
    code_inscription: Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join(''),
  }),
};

type Filter = (row: Row) => boolean;

class Query implements PromiseLike<{ data: any; error: any }> {
  private filters: Filter[] = [];
  private orders: { col: string; asc: boolean }[] = [];
  private selectStr: string | null = null;
  private mode: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private payload: Row | Row[] | null = null;
  private singleMode: 'single' | 'maybe' | null = null;

  constructor(private table: string) {}

  select(cols = '*') {
    this.selectStr = cols;
    return this;
  }
  insert(values: Row | Row[]) {
    this.mode = 'insert';
    this.payload = values;
    return this;
  }
  update(values: Row) {
    this.mode = 'update';
    this.payload = values;
    return this;
  }
  upsert(values: Row | Row[]) {
    this.mode = 'upsert';
    this.payload = values;
    return this;
  }
  delete() {
    this.mode = 'delete';
    return this;
  }
  eq(col: string, val: any) {
    this.filters.push((r) => r[col] === val);
    return this;
  }
  neq(col: string, val: any) {
    this.filters.push((r) => r[col] !== val);
    return this;
  }
  in(col: string, vals: any[]) {
    this.filters.push((r) => vals.includes(r[col]));
    return this;
  }
  is(col: string, val: any) {
    this.filters.push((r) => (val === null ? r[col] == null : r[col] === val));
    return this;
  }
  gte(col: string, val: any) {
    this.filters.push((r) => r[col] >= val);
    return this;
  }
  lte(col: string, val: any) {
    this.filters.push((r) => r[col] <= val);
    return this;
  }
  or(expr: string) {
    const parts = expr.split(',').map((p) => {
      const [col, op, ...rest] = p.split('.');
      const val = rest.join('.');
      if (op === 'is' && val === 'null') return (r: Row) => r[col] == null;
      if (op === 'eq') return (r: Row) => String(r[col]) === val;
      return () => false;
    });
    this.filters.push((r) => parts.some((f) => f(r)));
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orders.push({ col, asc: opts?.ascending !== false });
    return this;
  }
  limit() {
    return this;
  }
  single() {
    this.singleMode = 'single';
    return this;
  }
  maybeSingle() {
    this.singleMode = 'maybe';
    return this;
  }

  private withJoins(db: Db, rows: Row[]) {
    if (!this.selectStr || this.selectStr === '*') return rows.map((r) => ({ ...r }));
    const joins = parseSelect(this.table, this.selectStr);
    return rows.map((r) => {
      const out: Row = { ...r };
      for (const j of joins) {
        out[j.alias] = (db[j.table] || []).find((x) => x.id === r[j.column]) || null;
      }
      return out;
    });
  }

  private run(): { data: any; error: any } {
    const db = loadDb();
    const tableRows: Row[] = db[this.table] || (db[this.table] = []);
    let result: Row[] = [];

    if (this.mode === 'select') {
      result = tableRows.filter((r) => this.filters.every((f) => f(r)));
    } else if (this.mode === 'insert' || this.mode === 'upsert') {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      for (const item of items) {
        const keys = UNIQUE_KEYS[this.table];
        const existing =
          this.mode === 'upsert'
            ? tableRows.find((r) =>
                item.id ? r.id === item.id : keys ? keys.every((k) => r[k] === item[k]) : false
              )
            : undefined;
        if (existing) {
          Object.assign(existing, item);
          result.push(existing);
        } else {
          const row = { ...(DEFAULTS[this.table]?.() || {}), id: uuid(), created_at: nowIso(), ...item };
          tableRows.push(row);
          result.push(row);
        }
      }
      saveDb(db);
    } else if (this.mode === 'update') {
      result = tableRows.filter((r) => this.filters.every((f) => f(r)));
      result.forEach((r) => Object.assign(r, this.payload));
      saveDb(db);
    } else if (this.mode === 'delete') {
      result = tableRows.filter((r) => this.filters.every((f) => f(r)));
      db[this.table] = tableRows.filter((r) => !result.includes(r));
      // suppressions en cascade simples
      if (this.table === 'eleves') {
        const ids = result.map((r) => r.id);
        db.devoir_rendus = db.devoir_rendus.filter((r) => !ids.includes(r.eleve_id));
      }
      if (this.table === 'devoirs') {
        const ids = result.map((r) => r.id);
        db.devoir_rendus = db.devoir_rendus.filter((r) => !ids.includes(r.devoir_id));
      }
      saveDb(db);
    }

    for (const o of [...this.orders].reverse()) {
      result.sort((a, b) => {
        const av = a[o.col] ?? '';
        const bv = b[o.col] ?? '';
        const c = String(av).localeCompare(String(bv), 'fr');
        return o.asc ? c : -c;
      });
    }

    let data: any = this.mode !== 'select' && this.selectStr === null ? null : this.withJoins(db, result);
    if (this.singleMode) {
      const rows = this.withJoins(db, result);
      if (rows.length === 0) {
        return this.singleMode === 'maybe'
          ? { data: null, error: null }
          : { data: null, error: { message: 'Aucune ligne trouvée', code: 'PGRST116' } };
      }
      data = rows[0];
    }
    return { data, error: null };
  }

  then<T1 = { data: any; error: any }, T2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => T1 | PromiseLike<T1>) | null,
    onrejected?: ((reason: any) => T2 | PromiseLike<T2>) | null
  ): PromiseLike<T1 | T2> {
    return new Promise<{ data: any; error: any }>((resolve) => setTimeout(() => resolve(this.run()), 120)).then(
      onfulfilled,
      onrejected
    );
  }
}

// ─── Authentification
type Listener = (event: string, session: any) => void;
const listeners = new Set<Listener>();

const readSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const writeSession = (s: any) => {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
};
const makeSession = (u: Row) => ({
  access_token: `demo-${u.id}`,
  user: { id: u.id, email: u.email, user_metadata: {} },
});
const emit = (event: string, session: any) => listeners.forEach((l) => setTimeout(() => l(event, session), 0));

const auth = {
  async getSession() {
    return { data: { session: readSession() }, error: null };
  },
  async getUser() {
    return { data: { user: readSession()?.user ?? null }, error: null };
  },
  onAuthStateChange(cb: Listener) {
    listeners.add(cb);
    return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    await new Promise((r) => setTimeout(r, 300));
    const u = loadDb()._users.find((x) => x.email === email.toLowerCase().trim() && x.password === password);
    if (!u) return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
    const session = makeSession(u);
    writeSession(session);
    emit('SIGNED_IN', session);
    return { data: { user: session.user, session }, error: null };
  },
  async signOut() {
    writeSession(null);
    emit('SIGNED_OUT', null);
    return { error: null };
  },
  async updateUser({ password }: { password?: string }) {
    const s = readSession();
    if (!s) return { data: null, error: { message: 'Non connecté' } };
    const db = loadDb();
    const u = db._users.find((x) => x.id === s.user.id);
    if (u && password) u.password = password;
    saveDb(db);
    return { data: { user: s.user }, error: null };
  },
  async resetPasswordForEmail() {
    return { data: {}, error: null };
  },
};

export const demoSupabase = {
  from: (table: string) => new Query(table),
  auth,
};

// ─── Routes /api/admin/* simulées (création de comptes, nouveau mot de passe)
const tempPassword = () => `SIH-${Math.floor(100000 + Math.random() * 900000)}`;

const handleApi = (path: string, body: Row, token: string | null) => {
  const db = loadDb();
  const callerId = token?.replace('demo-', '');
  const caller = db.profiles.find((p) => p.id === callerId);
  if (!caller || (caller.role !== 'admin' && caller.role !== 'prof')) {
    return { status: 403, json: { error: 'Accès refusé.' } };
  }

  if (path.endsWith('/create-user')) {
    const email = String(body.email || '').toLowerCase().trim();
    if (!email || !body.prenom) return { status: 400, json: { error: "L'adresse e-mail et le prénom sont obligatoires." } };
    const role = body.role === 'eleve' ? 'eleve' : body.role === 'prof' ? 'prof' : 'parent';
    if (role === 'prof' && caller.role !== 'admin') {
      return { status: 403, json: { error: 'Seule la direction peut créer un compte enseignante.' } };
    }
    if (db._users.some((u) => u.email === email)) {
      return { status: 200, json: { success: true, alreadyExisted: true, email } };
    }
    const id = uuid();
    const password = tempPassword();
    db._users.push({ id, email, password });
    db.profiles.push({
      id,
      role,
      prenom: String(body.prenom).trim(),
      nom: String(body.nom || '').trim(),
      telephone: String(body.telephone || '').trim() || null,
      doit_changer_mdp: true,
      created_at: nowIso(),
    });
    saveDb(db);
    return { status: 200, json: { success: true, userId: id, email, role, tempPassword: password } };
  }

  if (path.endsWith('/reset-password')) {
    const target =
      db._users.find((u) => u.id === body.userId) ||
      db._users.find((u) => u.email === String(body.email || '').toLowerCase().trim());
    if (!target) return { status: 404, json: { error: 'Utilisateur introuvable.' } };
    const profile = db.profiles.find((p) => p.id === target.id);
    if (caller.role === 'prof' && profile?.role !== 'parent' && profile?.role !== 'eleve') {
      return { status: 403, json: { error: "L'enseignante peut seulement réinitialiser les comptes parents et élèves." } };
    }
    target.password = tempPassword();
    if (profile) profile.doit_changer_mdp = true;
    saveDb(db);
    return {
      status: 200,
      json: {
        success: true,
        tempPassword: target.password,
        email: target.email,
        prenom: profile?.prenom || '',
        nom: profile?.nom || '',
        telephone: profile?.telephone || '',
        role: profile?.role,
      },
    };
  }
  return { status: 404, json: { error: 'Route inconnue.' } };
};

// Inscription par lien de groupe (équivalent de api/inscription.js)
const handleInscription = (method: string, url: URL, body: Row, token: string | null) => {
  const db = loadDb();
  const code = String(method === 'GET' ? url.searchParams.get('code') : body.code || '').toUpperCase();
  const groupe = db.groupes.find((g) => g.code_inscription === code);
  if (!groupe) {
    return { status: 404, json: { error: "Ce lien d'inscription n'existe plus. Demandez le nouveau lien à l'enseignante." } };
  }
  if (method === 'GET') {
    const prof = db.profiles.find((p) => p.id === groupe.prof_id);
    return {
      status: 200,
      json: { success: true, groupe: { nom: groupe.nom, formation: groupe.formation, jour: groupe.jour, heure: groupe.heure, enseignante: prof?.prenom || null } },
    };
  }
  const enfants = (Array.isArray(body.enfants) ? body.enfants : [])
    .map((e: Row) => ({ prenom: String(e?.prenom || '').trim(), nom: String(e?.nom || '').trim() }))
    .filter((e: Row) => e.prenom);
  const addEleve = (row: Row) => db.eleves.push({ id: uuid(), created_at: nowIso(), date_naissance: null, notes_admin: null, parent_id: null, compte_id: null, ...row });

  if (token) {
    const parent = db.profiles.find((p) => p.id === token.replace('demo-', ''));
    if (parent?.role !== 'parent') return { status: 403, json: { error: 'Seul un compte parent peut ajouter un enfant.' } };
    if (!enfants.length) return { status: 400, json: { error: "Indiquez le prénom d'au moins un enfant." } };
    enfants.forEach((e: Row) => addEleve({ prenom: e.prenom, nom: e.nom, type: 'enfant', parent_id: parent.id, groupe_id: groupe.id }));
    saveDb(db);
    return { status: 200, json: { success: true, ajoutes: enfants.length } };
  }

  const type = body.type === 'adulte' ? 'adulte' : 'parent';
  const email = String(body.email || '').toLowerCase().trim();
  if (!body.prenom || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { status: 400, json: { error: "Le prénom et un e-mail valide sont obligatoires." } };
  if (String(body.motDePasse || '').length < 6) return { status: 400, json: { error: 'Le mot de passe doit faire au moins 6 caractères.' } };
  if (type === 'parent' && !enfants.length) return { status: 400, json: { error: "Indiquez le prénom d'au moins un enfant." } };
  if (db._users.some((u) => u.email === email)) return { status: 409, json: { error: 'Un compte existe déjà avec cet e-mail.' } };

  const id = uuid();
  const role = type === 'adulte' ? 'eleve' : 'parent';
  db._users.push({ id, email, password: body.motDePasse });
  db.profiles.push({ id, role, prenom: String(body.prenom).trim(), nom: String(body.nom || '').trim(), telephone: body.telephone || null, doit_changer_mdp: false, created_at: nowIso() });
  if (type === 'adulte') addEleve({ prenom: String(body.prenom).trim(), nom: String(body.nom || '').trim(), type: 'adulte', compte_id: id, groupe_id: groupe.id });
  else enfants.forEach((e: Row) => addEleve({ prenom: e.prenom, nom: e.nom || String(body.nom || '').trim(), type: 'enfant', parent_id: id, groupe_id: groupe.id }));
  saveDb(db);
  return { status: 200, json: { success: true, email, role } };
};

export const installDemoApi = () => {
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.includes('/api/admin/') || url.includes('/api/inscription')) {
      const headers = new Headers(init?.headers);
      const token = headers.get('Authorization')?.replace('Bearer ', '') || null;
      const body = init?.body ? JSON.parse(String(init.body)) : {};
      await new Promise((r) => setTimeout(r, 400));
      const parsed = new URL(url, window.location.origin);
      const res = parsed.pathname === '/api/inscription'
        ? handleInscription(init?.method || 'GET', parsed, body, token)
        : handleApi(parsed.pathname, body, token);
      return new Response(JSON.stringify(res.json), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return realFetch(input as any, init);
  };
};
