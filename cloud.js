(() => {
  const C = window.CFG || {};
  if (!C.url || !C.key || !window.supabase) return; // sin configurar: la app sigue 100% local
  const sb = window.supabase.createClient(C.url, C.key);
  const KB = K + 'b:', KE = K + 'eb:';
  let user = null, busy = false, again = false, tm, msg = '';
  const ld = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v } catch (e) { return d } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} };

  /* ---------- interfaz ---------- */
  const btn = document.createElement('button');
  btn.id = 'hC'; btn.title = 'Nube'; btn.setAttribute('aria-label', 'Nube'); btn.textContent = '☁';
  document.getElementById('hX').before(btn);
  const m = document.createElement('div'); m.id = 'cmod';
  m.innerHTML = '<div class="box"><b>Nube (Supabase)</b><div id="cb"></div><span id="cm" class="mu"></span><div><button id="cx">Cerrar</button></div></div>';
  document.body.appendChild(m);
  const $c = s => m.querySelector(s);
  btn.onclick = () => { ui(); m.style.display = 'flex' };
  $c('#cx').onclick = () => m.style.display = 'none';

  function ui() {
    btn.textContent = user ? '☁✓' : '☁';
    $c('#cm').textContent = msg;
    $c('#cb').innerHTML = user
      ? '<p>Sesión: <b></b></p><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="p" id="cs">Sincronizar ahora</button><button id="co">Salir</button></div>'
      : '<div style="display:grid;gap:8px"><input id="ce" type="email" placeholder="Correo" autocomplete="email"><input id="cp" type="password" placeholder="Contraseña (mín. 6)" autocomplete="current-password"><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="p" id="ci">Entrar</button><button id="cr">Crear cuenta</button></div></div>';
    if (user) {
      $c('#cb b').textContent = user.email;
      $c('#cs').onclick = cloudSync;
      $c('#co').onclick = async () => { await sb.auth.signOut(); msg = 'Sesión cerrada. Tus notas siguen en este dispositivo.'; };
    } else {
      const go = async up => {
        const email = $c('#ce').value.trim(), password = $c('#cp').value;
        if (!email || password.length < 6) { msg = 'Escribe correo y una contraseña de 6+ caracteres.'; ui(); return }
        msg = 'Un momento…'; ui();
        const r = up ? await sb.auth.signUp({ email, password }) : await sb.auth.signInWithPassword({ email, password });
        if (r.error) { msg = r.error.message; ui(); return }
        if (up && !r.data.session) { msg = 'Cuenta creada. Revisa tu correo para confirmarla y luego pulsa Entrar.'; ui() }
      };
      $c('#ci').onclick = () => go(false);
      $c('#cr').onclick = () => go(true);
    }
  }

  /* ---------- sincronización ---------- */
  async function cloudSync() {
    if (!user) return;
    if (busy) { again = true; return }
    busy = true; msg = 'Sincronizando…'; ui();
    try {
      clearTimeout(tm);
      const { data: rows, error } = await sb.from('pages').select('name,body,untitled');
      if (error) throw error;
      const R = {}; rows.forEach(r => R[r.name] = r);
      const B = ld(KB + user.id, {}), L = S.pages, nb = {}, up = [], del = [];
      let pulled = false;
      const names = new Set([...Object.keys(L), ...Object.keys(R), ...Object.keys(B)]);
      for (const n of names) {
        const l = L[n] ? L[n].t : undefined, r = R[n] ? R[n].body : undefined, b = B[n];
        const editing = S.mode === 'edit' && S.cur === n;
        if (l === r) { if (l !== undefined) nb[n] = l; continue }
        if (r === undefined) {                       // no existe en la nube
          if (b !== undefined && l === b) {          // la borraron en otro dispositivo
            if (editing) nb[n] = b; else { delete L[n]; pulled = true }
            continue;
          }
          up.push(n); nb[n] = l; continue;           // nueva o modificada aquí
        }
        if (l === undefined) {                       // no existe aquí
          if (b !== undefined && r === b) { del.push(n); continue } // la borré aquí
          L[n] = { t: r, u: !!R[n].untitled }; nb[n] = r; pulled = true; continue;
        }
        if (r === b) { up.push(n); nb[n] = l; continue }          // solo cambió aquí
        if (l === b) {                                            // solo cambió en la nube
          if (editing) { nb[n] = b; continue }
          L[n].t = r; L[n].u = !!R[n].untitled; nb[n] = r; pulled = true; continue;
        }
        let c = n + ' (conflicto)', i = 2;                        // cambió en ambos: no se pierde nada
        while (L[c] || R[c]) c = n + ' (conflicto ' + i++ + ')';
        L[c] = { t: r, u: false }; pulled = true;
        up.push(c, n); nb[c] = r; nb[n] = l;
      }
      for (let i = 0; i < up.length; i += 100) {
        const chunk = up.slice(i, i + 100).map(n => ({ user_id: user.id, name: n, body: L[n].t, untitled: !!L[n].u, touched: L[n].r || 0, updated_at: new Date().toISOString() }));
        const { error: e } = await sb.from('pages').upsert(chunk, { onConflict: 'user_id,name' });
        if (e) throw e;
      }
      if (del.length) { const { error: e } = await sb.from('pages').delete().in('name', del); if (e) throw e }
      sv(KB + user.id, nb);

      // listas (estados, cuentas, personas)
      const { data: st, error: e2 } = await sb.from('settings').select('enums').maybeSingle();
      if (e2) throw e2;
      const le = JSON.stringify(EN), be = localStorage.getItem(KE + user.id), re = st && st.enums && Object.keys(st.enums).length ? JSON.stringify(st.enums) : null;
      if (re && re !== le && (be === null || le === be)) { EN = st.enums; saveEn(); pulled = true }
      else if (re !== JSON.stringify(EN)) { const { error: e3 } = await sb.from('settings').upsert({ user_id: user.id, enums: EN, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }); if (e3) throw e3 }
      localStorage.setItem(KE + user.id, JSON.stringify(EN));

      if (pulled) { persist(); UH = [snap()]; UI = 0; if (S.mode !== 'edit') draw() }
      msg = 'Sincronizado ' + new Date().toLocaleTimeString();
    } catch (e) { msg = 'Error: ' + (e.message || e) }
    busy = false; ui();
    if (again) { again = false; cloudSync() }
  }

  window.cloudSoon = () => { if (!user) return; clearTimeout(tm); tm = setTimeout(cloudSync, 2500) };
  sb.auth.onAuthStateChange((ev, s) => {
    user = s ? s.user : null; ui();
    if (user) setTimeout(cloudSync, 0);
  });
  window.addEventListener('focus', () => cloudSync());
  document.addEventListener('visibilitychange', () => { if (!document.hidden) cloudSync() });
  setInterval(() => cloudSync(), 60000);
  ui();
})();
