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
        firebase.initializeApp(cfg); const cred = await firebase.auth().signInAnonymously();
        return { fs: firebase.firestore(), uid: cred.user.uid };
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
    if (name === 'user') return { me: async () => ({ id: uid, name: null }), can: async () => true };
    return null; } };
})();
