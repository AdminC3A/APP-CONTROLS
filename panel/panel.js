// Panel de APP-CONTROL · versión 2026-11-20b (antes se llamaba CTA-CONTROL) · David Martínez, 20/11/2026: «verlo desde mi compu o desde el cel».
// Lee y guarda en la hoja APP-CONTROL (su Apps Script). Solo entra un equipo maestro (clave maestra → ficha).
// En este navegador se guardan solo la liga de APP-CONTROL y la ficha; la clave maestra nunca.
(function () {
  const K = 'app_control_panel';
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const leerK = () => { try { return JSON.parse(localStorage.getItem(K) || '{}'); } catch (e) { return {}; } };
  const guardarK = v => { try { localStorage.setItem(K, JSON.stringify(v)); } catch (e) { /* sin espacio */ } };
  const ICONO = { sin_cobro: '🎁', prueba: '🧪', al_corriente: '✅', por_vencer: '⚠', gracia: '⏳', vencido: '🔴', inactiva: '⚪' };
  const NOMBRE = { sin_cobro: 'Sin cobro', prueba: 'Prueba', al_corriente: 'Al corriente', por_vencer: 'Por vencer', gracia: 'En gracia', vencido: 'Vencido', inactiva: 'No activa' };
  let D = null, pest = 'resumen', editando = null;

  function aviso(t) { const a = $('aviso'); a.textContent = t; a.hidden = false; clearTimeout(aviso.t); aviso.t = setTimeout(() => { a.hidden = true; }, 3500); }

  async function llamar(cuerpo) {
    const k = leerK(); if (!k.url) return { ok: false, error: 'Falta la liga de APP-CONTROL.' };
    try {
      const r = await fetch(k.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ t: k.ficha || '' }, cuerpo)) });
      return await r.json();
    } catch (e) { return { ok: false, error: 'Sin respuesta de APP-CONTROL. Revisa tu internet o la liga.' }; }
  }

  /* ---------- entrada ---------- */
  function mostrarEntrada(msg) {
    $('entrada').hidden = false; $('pestanas').hidden = true; $('vista').innerHTML = '';
    $('salir').hidden = true; $('recargar').hidden = true; $('estado').textContent = '';
    const k = leerK(); $('url-control').value = k.url || '';
    const m = $('msg-entrada'); m.hidden = !msg; m.className = 'msg mal'; m.textContent = msg || '';
  }
  $('entrar').onclick = async () => {
    const url = $('url-control').value.trim(), clave = $('clave').value;
    const m = $('msg-entrada'); m.hidden = false; m.className = 'msg bien'; m.textContent = 'Revisando…';
    if (!/^https:\/\/script\.google\.com\/.+\/exec$/.test(url)) { m.className = 'msg mal'; m.textContent = 'La liga debe ser la de APP-CONTROL y terminar en /exec.'; return; }
    if (!clave) { m.className = 'msg mal'; m.textContent = 'Escribe tu clave maestra.'; return; }
    guardarK({ url: url });
    const equipo = 'Panel · ' + ((navigator.userAgent.match(/\(([^)]+)\)/) || ['', 'equipo'])[1]).slice(0, 50);
    const r = await llamar({ accion: 'maestra', k: clave, equipo: equipo, app: 'Panel' });
    $('clave').value = '';
    if (!r.ok) { m.className = 'msg mal'; m.textContent = r.error || 'No se pudo entrar.'; return; }
    guardarK({ url: url, ficha: r.ficha });
    cargar();
  };
  $('salir').onclick = () => { const k = leerK(); guardarK({ url: k.url }); mostrarEntrada('Saliste. Para volver a entrar escribe tu clave maestra.'); };
  $('recargar').onclick = () => cargar();

  /* ---------- carga ---------- */
  async function cargar() {
    $('estado').textContent = 'Leyendo…';
    const r = await llamar({ accion: 'panel' });
    if (!r.ok) { if (r.sinFicha) return mostrarEntrada(r.error); $('estado').textContent = ''; return aviso(r.error || 'No se pudo leer.'); }
    D = r; $('entrada').hidden = true; $('pestanas').hidden = false; $('salir').hidden = false; $('recargar').hidden = false;
    $('estado').textContent = 'v' + r.version + ' · ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    pintar();
  }
  $('pestanas').onclick = e => { const b = e.target.closest('button[data-p]'); if (!b) return; pest = b.dataset.p; editando = null; [...$('pestanas').children].forEach(x => x.classList.toggle('on', x === b)); pintar(); };

  const chip = e => `<span class="chip ${esc(e.estado)}">${ICONO[e.estado] || ''} ${esc(e.texto)}</span>`;
  const opciones = (lista, v) => lista.map(x => `<option${String(x) === String(v || '') ? ' selected' : ''}>${esc(x)}</option>`).join('');
  const campo = (et, nombre, v, tipo, extra) => `<label>${esc(et)}<input name="${esc(nombre)}" type="${tipo || 'text'}" value="${esc(v || '')}" ${extra || ''}></label>`;
  const lista = (et, nombre, v, ops) => `<label>${esc(et)}<select name="${esc(nombre)}">${opciones(ops, v)}</select></label>`;
  const clientes = () => D.clientes.map(c => c.Cliente);
  const ligaDe = (con, maestro) => { const c = D.clientes.find(x => x.Cliente === con.Cliente); if (!c || !c.Clave || !con['Página (Netlify)'] || !D.url) return '';
    const p = String(con['Página (Netlify)']); return p + (p.indexOf('?') < 0 ? '?' : '&') + 'control=' + encodeURIComponent(D.url) + '&c=' + encodeURIComponent(c.Clave) + (con.Obra ? '&obra=' + encodeURIComponent(con.Obra) : '') + (maestro ? '&maestro=1' : ''); };

  function pintar() {
    const v = $('vista');
    if (pest === 'resumen') {
      const cuenta = {}; D.appsCliente.forEach(a => { cuenta[a.estado.estado] = (cuenta[a.estado.estado] || 0) + 1; });
      const atencion = D.appsCliente.filter(a => ['por_vencer', 'gracia', 'vencido'].includes(a.estado.estado));
      v.innerHTML = `<div class="tarjetas">${['vencido', 'gracia', 'por_vencer', 'prueba', 'al_corriente', 'sin_cobro'].map(k => `<div class="tarjeta"><span class="mut">${ICONO[k]} ${NOMBRE[k]}</span><b>${cuenta[k] || 0}</b></div>`).join('')}</div>
        <div class="titulo"><h2>Requieren atención</h2></div>
        ${atencion.length ? `<div class="lista">${atencion.map(a => `<div class="fila"><h3>${esc(a.Cliente)} · ${esc(a.App)}</h3>${chip(a.estado)}</div>`).join('')}</div>` : '<p class="vacio">Nada pendiente. 👍</p>'}
        <div class="titulo"><h2>Todos los clientes</h2></div>
        <div class="lista">${D.clientes.map(c => `<div class="fila"><h3>${esc(c.Cliente)} ${String(c.Activo).toLowerCase().startsWith('n') ? '<span class="chip">dado de baja</span>' : ''}</h3>
          <div class="chips">${D.appsCliente.filter(a => a.Cliente === c.Cliente).map(a => `<span class="chip ${esc(a.estado.estado)}">${ICONO[a.estado.estado] || ''} ${esc(a.App)}</span>`).join('') || '<span class="mut">sin apps</span>'}</div></div>`).join('') || '<p class="vacio">Todavía no hay clientes.</p>'}</div>`;
    }
    if (pest === 'clientes') {
      const c = editando || {};
      v.innerHTML = `<div class="titulo"><h2>${editando ? 'Cambiar ' + esc(c.Cliente) : 'Cliente nuevo'}</h2></div>
        <form class="caja forma" data-hoja="Clientes">
          ${campo('Cliente (nombre de la empresa)', 'Cliente', c.Cliente, 'text', editando ? 'readonly' : 'required')}
          ${campo('Logo (liga de la imagen)', 'Logo (liga)', c['Logo (liga)'], 'url')}
          ${lista('Sus datos viven en la cuenta de', 'Datos en cuenta de', c['Datos en cuenta de'] || 'David', ['David', 'Empresa'])}
          ${campo('Contacto', 'Contacto', c.Contacto)}${campo('WhatsApp (con 52…)', 'WhatsApp', c.WhatsApp, 'tel')}${campo('Correo', 'Correo', c.Correo, 'email')}
          ${lista('Activo', 'Activo', c.Activo || 'Sí', ['Sí', 'No'])}${lista('Cobrar', 'Cobrar', c.Cobrar || 'Sí', ['Sí', 'No'])}${lista('Aviso de pago', 'Aviso de pago', c['Aviso de pago'] || 'Sí', ['Sí', 'No'])}
          <label class="todo">Notas<textarea name="Notas" rows="2">${esc(c.Notas || '')}</textarea></label>
          <div class="botones"><button type="submit">Guardar</button>${editando ? '<button type="button" class="sec" data-a="nuevo">Cancelar</button>' : ''}</div>
        </form>
        <div class="lista">${D.clientes.map((x, i) => `<div class="fila"><h3>${esc(x.Cliente)} <span class="mut">${esc(x['Datos en cuenta de'] || '')}</span></h3>
          <div class="chips"><span class="chip">${String(x.Activo).toLowerCase().startsWith('n') ? '✖ Dado de baja' : '✔ Activo'}</span><span class="chip">${String(x.Cobrar).toLowerCase() === 'no' ? '🎁 Sin cobro' : '💳 Se cobra'}</span><span class="chip">${String(x['Aviso de pago']).toLowerCase() === 'no' ? '🔕 Sin aviso de pago' : '🔔 Con aviso de pago'}</span></div>
          <div class="acc"><button type="button" class="sec peq" data-editar="${i}">✏ Cambiar</button></div></div>`).join('')}</div>`;
    }
    if (pest === 'apps') {
      const a = editando || {};
      v.innerHTML = `<div class="titulo"><h2>${editando ? 'Cambiar ' + esc(a.Cliente) + ' · ' + esc(a.App) : 'Activar una app a un cliente'}</h2></div>
        <form class="caja forma" data-hoja="Apps">
          ${editando ? campo('Cliente', 'Cliente', a.Cliente, 'text', 'readonly') + campo('App', 'App', a.App, 'text', 'readonly') : lista('Cliente', 'Cliente', '', clientes()) + lista('App', 'App', '', D.apps)}
          ${lista('Activa', 'Activa', a.Activa || 'Sí', ['Sí', 'No'])}${campo('Mensual ($)', 'Mensual', a.Mensual, 'number', 'min="0" step="1"')}
          ${campo('Días de gracia (vacío = ' + D.diasGracia + ')', 'Días de gracia', a['Días de gracia'], 'number', 'min="0"')}${campo('🧪 Prueba hasta', 'Prueba hasta', a['Prueba hasta'], 'date')}
          <label class="todo">Notas<textarea name="Notas" rows="2">${esc(a.Notas || '')}</textarea></label>
          <div class="botones"><button type="submit">Guardar</button>${editando ? '<button type="button" class="sec" data-a="nuevo">Cancelar</button>' : ''}</div>
        </form>
        <div class="lista">${D.appsCliente.map((x, i) => `<div class="fila"><h3>${esc(x.Cliente)} · ${esc(x.App)}</h3>${chip(x.estado)}
          <div class="acc"><button type="button" class="sec peq" data-editar="${i}">✏ Cambiar</button></div></div>`).join('') || '<p class="vacio">Todavía no hay apps activadas.</p>'}</div>`;
    }
    if (pest === 'conexiones') {
      const c = editando || {};
      v.innerHTML = `<div class="titulo"><h2>${editando ? 'Cambiar conexión' : 'Conexión nueva'}</h2></div>
        <form class="caja forma" data-hoja="Conexiones">
          ${editando ? campo('Cliente', 'Cliente', c.Cliente, 'text', 'readonly') + campo('Obra', 'Obra', c.Obra, 'text', 'readonly') + campo('App', 'App', c.App, 'text', 'readonly') : lista('Cliente', 'Cliente', '', clientes()) + campo('Obra (vacío = todas)', 'Obra', '') + lista('App', 'App', '', D.apps)}
          ${campo('Página (Netlify)', 'Página (Netlify)', c['Página (Netlify)'], 'url', 'placeholder="https://….netlify.app"')}
          ${campo('Web app (/exec)', 'Web app (/exec)', c['Web app (/exec)'], 'url', 'placeholder="https://script.google.com/macros/s/…/exec"')}
          ${campo('Archivo (liga de la hoja)', 'Archivo (liga de la hoja)', c['Archivo (liga de la hoja)'], 'url')}
          <label class="todo">Notas<textarea name="Notas" rows="2">${esc(c.Notas || '')}</textarea></label>
          <div class="botones"><button type="submit">Guardar</button>${editando ? '<button type="button" class="sec" data-a="nuevo">Cancelar</button>' : ''}</div>
        </form>
        <div class="lista">${D.conexiones.map((x, i) => { const l = ligaDe(x); return `<div class="fila"><h3>${esc(x.Cliente)} · ${esc(x.App)}${x.Obra ? ' · ' + esc(x.Obra) : ''}</h3>
          <div class="liga">${esc(x['Web app (/exec)'] || 'sin web app')}</div>
          <div class="acc"><button type="button" class="sec peq" data-editar="${i}">✏ Cambiar</button>
          ${l ? `<button type="button" class="peq" data-copiar="${esc(l)}">📋 Copiar liga de instalación</button><a href="https://wa.me/?text=${encodeURIComponent('Para conectar ' + x.App + ' abre esta liga una vez: ' + l)}" target="_blank" rel="noopener"><button type="button" class="peq sec">💬 Mandar por WhatsApp</button></a><button type="button" class="peq sec" data-copiar="${esc(ligaDe(x, true))}">🔑 Copiar liga maestra (solo tú)</button>` : '<span class="mut">Para la liga falta la página, la clave del cliente o URL_CONTROL.</span>'}</div></div>`; }).join('') || '<p class="vacio">Todavía no hay conexiones.</p>'}</div>`;
    }
    if (pest === 'pagos') {
      v.innerHTML = `<div class="titulo"><h2>Registrar un pago</h2></div>
        <form class="caja forma" data-hoja="Pagos">
          ${lista('Cliente', 'Cliente', '', clientes())}${lista('App', 'App', 'Todas', ['Todas'].concat(D.apps))}
          ${campo('Monto ($)', 'Monto', '', 'number', 'min="0" step="0.01"')}${lista('Forma de pago', 'Forma de pago', 'Transferencia', ['Transferencia', 'Efectivo', 'Depósito', 'Otro'])}
          ${campo('Pagado hasta', 'Pagado hasta', '', 'date', 'required')}${campo('Comprobante (liga)', 'Comprobante (liga)', '', 'url')}
          <label class="todo">Notas<textarea name="Notas" rows="2"></textarea></label>
          <div class="botones"><button type="submit">Registrar pago</button></div>
        </form>
        <div class="lista">${D.pagos.map(p => `<div class="fila"><h3>${esc(p.Cliente)} · ${esc(p.App || 'Todas')}</h3>
          <div class="mut">${esc(p.Fecha)} · ${p.Monto !== '' ? '$' + esc(p.Monto) + ' · ' : ''}${esc(p['Forma de pago'] || '')} · pagado hasta <b>${esc(p['Pagado hasta'])}</b>${p['Comprobante (liga)'] ? ` · <a href="${esc(p['Comprobante (liga)'])}" target="_blank" rel="noopener">📎 comprobante</a>` : ''}</div></div>`).join('') || '<p class="vacio">Todavía no hay pagos.</p>'}</div>`;
    }
    if (pest === 'equipos') {
      const mia = leerK().ficha || '';
      v.innerHTML = `<div class="titulo"><h2>Equipos maestros</h2></div><p class="vacio">Los equipos que ven 🔗 Conexiones y este panel. Si pierdes uno, dalo de baja aquí.</p>
        <div class="lista">${D.equipos.map(x => `<div class="fila"><h3>${esc(x.equipo || 'equipo')} ${x.ficha === mia ? '<span class="chip al_corriente">este equipo</span>' : ''}</h3>
          <div class="mut">Alta: ${esc(x.alta)} ${x.app ? '· ' + esc(x.app) : ''} · ficha …${esc(x.fin)}</div>
          ${x.ficha === mia ? '' : `<div class="acc" data-caja="${esc(x.ficha)}"><button type="button" class="peq sec" data-baja="${esc(x.ficha)}">Dar de baja</button></div>`}</div>`).join('')}</div>`;
    }
  }

  /* ---------- acciones ---------- */
  $('vista').addEventListener('click', async e => {
    const ed = e.target.closest('[data-editar]');
    if (ed) { const i = +ed.dataset.editar; editando = pest === 'clientes' ? D.clientes[i] : pest === 'apps' ? D.appsCliente[i] : D.conexiones[i]; pintar(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (e.target.closest('[data-a="nuevo"]')) { editando = null; return pintar(); }
    const cp = e.target.closest('[data-copiar]');
    if (cp) { try { await navigator.clipboard.writeText(cp.dataset.copiar); aviso('📋 Liga copiada.'); } catch (er) { aviso('No se pudo copiar; mantén presionada la liga.'); } return; }
    const bj = e.target.closest('[data-baja]');
    if (bj) { const caja = bj.parentElement; caja.innerHTML = `<span>¿Seguro? Ese equipo ya no verá 🔗 Conexiones.</span><button type="button" class="peq" data-si="${esc(bj.dataset.baja)}">Sí, dar de baja</button><button type="button" class="peq sec" data-a="nuevo">No</button>`; return; }
    const si = e.target.closest('[data-si]');
    if (si) { const r = await llamar({ accion: 'baja_equipo', ficha: si.dataset.si }); aviso(r.ok ? '✔ Equipo dado de baja.' : r.error); if (r.ok) cargar(); }
  });
  $('vista').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, hoja = f.dataset.hoja, datos = {};
    new FormData(f).forEach((val, k) => { datos[k] = val; });
    const b = f.querySelector('button[type="submit"]'); b.disabled = true;
    const r = await llamar({ accion: 'guardar', hoja: hoja, datos: datos });
    b.disabled = false;
    if (!r.ok) return aviso('✖ ' + (r.error || 'No se guardó.'));
    aviso(hoja === 'Pagos' ? '✔ Pago registrado.' : r.nuevo ? '✔ Guardado (nuevo).' : '✔ Cambios guardados.');
    editando = null; cargar();
  });

  /* ---------- arranque ---------- */
  if (leerK().ficha) cargar(); else mostrarEntrada();
})();
