/* Lets the page's online mode run outside Claude: provides window.claude.use('db' | 'user') on top of
   Firebase (Firestore + anonymous sign-in). Configure it in config.js. */
(function () {
  const VER = '10.12.2';
  const load = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src)); document.head.appendChild(s); });
  /* Firestore refuses nested arrays and undefined: store nested arrays as JSON strings and put them back on read */
  const enc = v => { if (v === undefined) return null; if (Array.isArray(v)) return v.some(Array.isArray) ? { __na: JSON.stringify(v) } : v.map(enc);
    if (v && typeof v === 'object') { const o = {}; for (const k in v) o[k] = enc(v[k]); return o; } return v; };
  const dec = v => { if (Array.isArray(v)) return v.map(dec); if (v && typeof v === 'object') { if (typeof v.__na === 'string' && Object.keys(v).length === 1) return JSON.parse(v.__na); const o = {}; for (const k in v) o[k] = dec(v[k]); return o; } return v; };
  const snap = s => ({ id: s.id, exists: s.exists, data: () => (s.exists ? dec(s.data()) : undefined), metadata: s.metadata });
  let ready = null;
  function init() {
    if (ready) return ready;
    ready = (async () => {
      const cfg = window.SMASHUP_FIREBASE;
      if (!cfg || !cfg.apiKey || /PASTE|YOUR/i.test(cfg.apiKey + cfg.projectId)) { window.__suErr = 'Online play is not set up yet. Open config.js and paste in your Firebase settings (see README.md).'; throw new Error('not configured'); }
      try {
        const base = 'https://www.gstatic.com/firebasejs/' + VER + '/';
        await load(base + 'firebase-app-compat.js'); await Promise.all([load(base + 'firebase-auth-compat.js'), load(base + 'firebase-firestore-compat.js')]);
        firebase.initializeApp(cfg); const auth = firebase.auth();
        /* keep whoever is already signed in on this browser (a player account or a guest); otherwise start as a guest */
        let user = await new Promise(res => { const un = auth.onAuthStateChanged(u => { un(); res(u); }); });
        if (!user) user = (await auth.signInAnonymously()).user;
        return { fs: firebase.firestore(), uid: user.uid };
      } catch (e) { window.__suErr = 'Could not reach Firebase: ' + (e && e.message ? e.message : e) + ' (check config.js, that Anonymous sign-in is enabled, and your internet connection).'; throw e; }
    })();
    ready.catch(() => { ready = null; });
    return ready; }
  const dbApi = fs => ({
    doc: path => { const r = fs.doc(path); return { id: r.id, path,
      get: async () => snap(await r.get()), set: d => r.set(enc(d)), update: d => r.update(enc(d)), delete: () => r.delete(),
      onSnapshot: (next, err) => r.onSnapshot(s => next(snap(s)), err) }; },
    collection: path => { const c = fs.collection(path); return {
      add: d => c.add(enc(d)),
      onSnapshot: (next, err) => c.onSnapshot(q => next({ docs: q.docs.map(snap), docChanges: () => q.docChanges().map(ch => ({ type: ch.type, doc: snap(ch.doc) })), size: q.size }), err) }; } });
  window.claude = { use: async name => {
    const { fs, uid } = await init();
    if (name === 'db') return dbApi(fs);
    if (name === 'user') return { me: async () => ({ id: (firebase.auth().currentUser || { uid }).uid, name: userName(firebase.auth().currentUser) }), can: async () => true };
    return null; } };

  /* player accounts: username + password (Firebase Email/Password sign-in under the hood) */
  const DOMAIN = 'players.example.com';
  const toEmail = u => String(u).trim().toLowerCase() + '@' + DOMAIN;
  function userName(u) { return u && !u.isAnonymous && u.email ? u.email.split('@')[0] : null; }
  window.suAuth = {
    async state() { await init(); const u = firebase.auth().currentUser; return { uid: u ? u.uid : null, username: userName(u), guest: !userName(u) }; },
    /* a guest who creates an account keeps the same id, so the games on this device come along */
    async signUp(username, password) { await init(); const auth = firebase.auth(), cur = auth.currentUser;
      if (cur && cur.isAnonymous) { await cur.linkWithCredential(firebase.auth.EmailAuthProvider.credential(toEmail(username), password)); return { uid: cur.uid, prevUid: null }; }
      const r = await auth.createUserWithEmailAndPassword(toEmail(username), password); return { uid: r.user.uid, prevUid: null }; },
    /* signing in to an existing account switches id: the caller moves this device's guest games over */
    async signIn(username, password) { await init(); const auth = firebase.auth(), cur = auth.currentUser, prevUid = cur && cur.isAnonymous ? cur.uid : null;
      const r = await auth.signInWithEmailAndPassword(toEmail(username), password); return { uid: r.user.uid, prevUid }; },
    async signOut() { await init(); await firebase.auth().signOut(); } };
})();
