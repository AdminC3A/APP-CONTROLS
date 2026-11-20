/* CTA-CONTROL · versión 2026-11-20h
   ============================================================
   CONTROL CENTRAL DE LAS APPS (Graficador, Asistencias, Reportes, Almacén, Calidad, Control presupuestal…)
   20b: la lista de apps vive en CONFIGURACIÓN › APPS: una app nueva se agrega ahí, sin tocar el código.
   20c: Clientes › Cobrar = «No» → empresa sin cobro: sus apps activas siempre funcionan y nunca vencen.
   20d: Apps › Prueba hasta = periodo de prueba gratis de esa app (funciona completa; avisa antes de que termine).
   20e: 🔑 CLAVE MAESTRA (David, 20/11/2026: «solo hay un admin para la app de control»): solo los equipos que la escribieron
        una vez ven el botón 🔗 Conexiones en las apps. La clave nunca se guarda en el equipo: se guarda una ficha
        (pestaña «Equipos maestros»); borrando su renglón ese equipo deja de ser maestro.
   20f: Clientes › Aviso de pago = «No» → a ese cliente JAMÁS le sale el aviso de pago: CTA-CONTROL no le manda
        nada del pago a sus equipos (solo los equipos maestros de David lo siguen viendo).
   20g: menú igual que en todas las apps: ⚙ CTA-CONTROL › Instalar / actualizar · ℹ Versión del código.
   20h: 🖥 PANEL (David: «verlo desde mi compu o desde el cel»): la página panel/ lee y guarda Clientes, Apps,
        Conexiones, Pagos y Equipos maestros. Todo lo del panel pide la ficha de un equipo maestro.
   David Martínez · 20/11/2026

   Una sola hoja de Google en el Drive de David que dice:
     · qué clientes hay (con su logo y en qué cuenta viven sus datos)
     · qué apps tiene activa cada cliente
     · las ligas de cada app y obra (Conexiones)
     · los pagos de cada cliente
   Las apps le preguntan a esta hoja «¿a dónde me conecto y estoy al corriente?».
   Cada cliente solo ve lo suyo: se identifica con su CLAVE (se genera sola, larga
   y difícil de adivinar). Nunca devuelve datos de otro cliente.

   CÓMO SE INSTALA (una sola vez) · igual que todas las apps
     1. Crear una hoja de Google nueva en tu Drive y nombrarla «CTA-CONTROL».
     2. Extensiones › Apps Script › pegar este archivo completo › Guardar › cerrar esa pestaña.
     3. Recargar la hoja (F5) › menú ⚙ CTA-CONTROL › Instalar / actualizar (la primera vez pide permisos).
     4. Implementar › Nueva implementación › Aplicación web · Ejecutar como: Yo · Acceso: Cualquier usuario.
     5. Copiar la liga /exec y pegarla en CONFIGURACIÓN › URL_CONTROL.
   CÓMO SE ACTUALIZA (igual que todas las apps)
     Pegar el Code.gs nuevo › Implementar › Administrar implementaciones › ✏ › Nueva versión ›
     en la hoja: ⚙ CTA-CONTROL › Instalar / actualizar.
   ============================================================ */

const VERSION = '2026-11-20h';
const ZONA = 'America/Mazatlan';
const APPS_INICIAL = 'Graficador, Asistencias, Reportes, Almacén, Calidad, Control presupuestal';
/* La lista vigente se lee de CONFIGURACIÓN › APPS (separadas por coma) */
function apps_() { const v = String(config_('APPS') || APPS_INICIAL); return v.split(',').map(function (x) { return x.trim(); }).filter(String); }
const DIAS_AVISO = 5;            /* «vence en N días» */

const HOJAS = {
  Clientes:      ['Cliente', 'Clave', 'Logo (liga)', 'Datos en cuenta de', 'Contacto', 'WhatsApp', 'Correo', 'Activo', 'Notas', 'Cobrar', 'Aviso de pago'],
  Apps:          ['Cliente', 'App', 'Activa', 'Mensual', 'Días de gracia', 'Notas', 'Prueba hasta'],
  Conexiones:    ['Cliente', 'Obra', 'App', 'Página (Netlify)', 'Web app (/exec)', 'Archivo (liga de la hoja)', 'Notas', 'Actualizó'],
  Pagos:         ['Fecha', 'Cliente', 'App', 'Monto', 'Forma de pago', 'Pagado hasta', 'Comprobante (liga)', 'Notas'],
  Bitácora:      ['Fecha', 'Quién', 'Acción', 'Detalle'],
  'Equipos maestros': ['Ficha', 'Alta', 'Equipo', 'App'],
  'CONFIGURACIÓN': ['Clave', 'Valor', 'Para qué sirve']
};
const CONFIG_INICIAL = [
  ['APPS', APPS_INICIAL, 'Las apps que se rentan, separadas por coma. Para una app nueva, agrégala aquí y vuelve a correr «Instalar» (actualiza las listas para escoger).'],
  ['CLAVE_MAESTRA', '', 'Solo tú la sabes. Se escribe una vez en tus equipos (liga de equipo maestro) para ver el botón 🔗 Conexiones. Si la cambias, los equipos ya dados de alta siguen siéndolo hasta que borres su renglón en «Equipos maestros».'],
  ['URL_CONTROL', '', 'La liga /exec de este Apps Script (paso 5 de la instalación). Con ella se arman las ligas de instalación.'],
  ['DIAS_GRACIA', '5', 'Días después de vencer en que la app sigue funcionando normal antes de pasar a «solo consulta».'],
  ['VERSION', VERSION, 'Versión del código instalado. Se actualiza sola al instalar.']
];
function listas_() {   /* validaciones de la hoja: listas para escoger (la de apps sale de CONFIGURACIÓN) */
  const A = apps_();
  return {
    Clientes: { 'Datos en cuenta de': ['Empresa', 'David'], 'Activo': ['Sí', 'No'], 'Cobrar': ['Sí', 'No'], 'Aviso de pago': ['Sí', 'No'] },
    Apps: { 'App': A, 'Activa': ['Sí', 'No'] },
    Conexiones: { 'App': A },
    Pagos: { 'App': ['Todas'].concat(A), 'Forma de pago': ['Transferencia', 'Efectivo', 'Depósito', 'Otro'] }
  };
}

/* ============================================================ MENÚ */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('⚙ CTA-CONTROL')
    .addItem('Instalar / actualizar', 'menuInstalar')
    .addItem('ℹ Versión del código', 'menuVersion')
    .addSeparator()
    .addItem('🔑 Generar claves que falten', 'generarClaves')
    .addItem('🔗 Ligas de instalación', 'ligasInstalacion')
    .addItem('🔑 Ligas de equipo maestro (solo para ti)', 'ligasMaestro')
    .addItem('💳 Estado de pagos', 'estadoPagos')
    .addToUi();
}

function menuInstalar() { const t = instalar(); try { SpreadsheetApp.getUi().alert('⚙ CTA-CONTROL', t + '\n\nSi pegaste una versión nueva, recuerda: Implementar › Administrar implementaciones › Nueva versión.', SpreadsheetApp.getUi().ButtonSet.OK); } catch (e) {} return t; }
function menuVersion() { try { SpreadsheetApp.getUi().alert('ℹ Versión del código', 'CTA-CONTROL ' + VERSION, SpreadsheetApp.getUi().ButtonSet.OK); } catch (e) {} return VERSION; }

/* ============================================================ INSTALAR
   Crea lo que falte sin borrar nada: pestañas, encabezados, listas y configuración. */
function instalar() {
  const ss = libro_(), hechos = [];
  Object.keys(HOJAS).forEach(function (n) {
    let h = ss.getSheetByName(n);
    if (!h) { h = ss.insertSheet(n); hechos.push('pestaña ' + n); }
    const enc = HOJAS[n], ya = h.getLastColumn() ? h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0].map(String) : [];
    enc.forEach(function (c) { if (ya.indexOf(c) < 0) { ya.push(c); h.getRange(1, ya.length).setValue(c); hechos.push(n + ' › ' + c); } });
    h.getRange(1, 1, 1, ya.length).setFontWeight('bold').setBackground('#1F3864').setFontColor('#FFFFFF');
    h.setFrozenRows(1);
    const ls = listas_()[n] || {};
    Object.keys(ls).forEach(function (c) {
      const col = ya.indexOf(c) + 1; if (!col) return;
      h.getRange(2, col, 998, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(ls[c], true).setAllowInvalid(false).build());
    });
  });
  const cfg = ss.getSheetByName('CONFIGURACIÓN'), hay = leer_('CONFIGURACIÓN').map(function (r) { return r['Clave']; });
  CONFIG_INICIAL.forEach(function (r) { if (hay.indexOf(r[0]) < 0) { cfg.appendRow(r); hechos.push('configuración ' + r[0]); } });
  ponerConfig_('VERSION', VERSION);
  const h1 = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (h1 && h1.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(h1);
  generarClaves();
  bitacora_('Instalar', hechos.length ? hechos.join(' · ') : 'todo estaba en orden');
  return 'CTA-CONTROL ' + VERSION + ' instalado. ' + (hechos.length ? 'Se agregó: ' + hechos.join(', ') : 'Todo estaba en orden.');
}

/* Cada cliente sin clave recibe una nueva (24 caracteres al azar). Nunca cambia una que ya existe. */
function generarClaves() {
  const h = libro_().getSheetByName('Clientes'); if (!h || h.getLastRow() < 2) return 0;
  const enc = h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0], cC = enc.indexOf('Cliente'), cK = enc.indexOf('Clave');
  const v = h.getRange(2, 1, h.getLastRow() - 1, enc.length).getValues(); let n = 0;
  v.forEach(function (r, i) { if (String(r[cC]).trim() && !String(r[cK]).trim()) { h.getRange(i + 2, cK + 1).setValue(claveNueva_()); n++; } });
  if (n) bitacora_('Claves', n + ' cliente(s) con clave nueva');
  return n;
}
function claveNueva_() { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'; let s = ''; for (let i = 0; i < 24; i++) s += a.charAt(Math.floor(Math.random() * a.length)); return s; }

/* ============================================================ ESTADO DE PAGO
   Pagado hasta = la fecha más lejana de los pagos de ese cliente para esa app (o «Todas»).
   sin_cobro · prueba · al_corriente · por_vencer (faltan ≤ DIAS_AVISO) · gracia (vencido ≤ días de gracia) · vencido · inactiva */
function estadoApp_(cliente, app, hoy) {
  hoy = soloDia_(hoy || new Date());
  const fila = leer_('Apps').find(function (r) { return igual_(r['Cliente'], cliente) && igual_(r['App'], app); });
  if (!fila || !esSi_(fila['Activa'])) return { estado: 'inactiva', texto: 'Esta app no está activa para este cliente.' };
  /* empresa sin cobro (Clientes › Cobrar = No): siempre al día; vacío cuenta como «Sí» */
  const cli = leer_('Clientes').find(function (r) { return igual_(r['Cliente'], cliente); });
  if (cli && norm_(cli['Cobrar']) === 'no') return { estado: 'sin_cobro', texto: 'Sin cobro.', hasta: '' };
  let hasta = null;
  leer_('Pagos').forEach(function (p) {
    if (!igual_(p['Cliente'], cliente)) return;
    if (!(igual_(p['App'], app) || igual_(p['App'], 'Todas'))) return;
    const f = aFecha_(p['Pagado hasta']); if (f && (!hasta || f > hasta)) hasta = f;
  });
  const gracia = num_(fila['Días de gracia'], num_(config_('DIAS_GRACIA'), 5));
  /* 🧪 periodo de prueba: cuenta mientras ningún pago llegue más lejos */
  const prueba = aFecha_(fila['Prueba hasta']);
  if (prueba && (!hasta || prueba > hasta) && soloDia_(prueba) >= hoy) {
    const dp = Math.round((soloDia_(prueba) - hoy) / 864e5), tp = fmt_(prueba);
    return dp <= DIAS_AVISO ? { estado: 'por_vencer', prueba: true, texto: dp === 0 ? 'Tu periodo de prueba termina hoy.' : 'Tu periodo de prueba termina en ' + dp + ' día(s).', hasta: tp, dias: dp }
                            : { estado: 'prueba', prueba: true, texto: 'Periodo de prueba hasta el ' + tp + '.', hasta: tp, dias: dp };
  }
  if (prueba && (!hasta || prueba > hasta)) hasta = prueba;   /* terminó la prueba sin pago: desde ahí cuentan los días de gracia */
  if (!hasta) return { estado: 'vencido', texto: 'No hay pagos registrados.', hasta: '', gracia: gracia };
  const dias = Math.round((soloDia_(hasta) - hoy) / 864e5), txt = fmt_(hasta);
  if (dias >= 0) return dias <= DIAS_AVISO ? { estado: 'por_vencer', texto: dias === 0 ? 'Vence hoy.' : 'Vence en ' + dias + ' día(s).', hasta: txt, dias: dias }
                                         : { estado: 'al_corriente', texto: 'Al corriente hasta el ' + txt + '.', hasta: txt, dias: dias };
  if (-dias <= gracia) return { estado: 'gracia', texto: 'Venció el ' + txt + '. Quedan ' + (gracia + dias) + ' día(s) de gracia.', hasta: txt, dias: dias };
  return { estado: 'vencido', texto: 'Venció el ' + txt + '. Solo consulta.', hasta: txt, dias: dias };
}

/* Resumen para David (menú 💳). */
function estadoPagos() {
  const ls = [];
  leer_('Apps').forEach(function (a) {
    if (!a['Cliente'] || !a['App']) return;
    const e = estadoApp_(a['Cliente'], a['App']);
    ls.push((e.estado === 'sin_cobro' ? '🎁' : e.estado === 'prueba' ? '🧪' : e.estado === 'al_corriente' ? '✅' : e.estado === 'por_vencer' ? '⚠' : e.estado === 'gracia' ? '⏳' : e.estado === 'inactiva' ? '⚪' : '🔴') + ' ' + a['Cliente'] + ' · ' + a['App'] + ' · ' + e.texto);
  });
  const t = ls.length ? ls.join('\n') : 'Todavía no hay apps registradas en la pestaña Apps.';
  try { SpreadsheetApp.getUi().alert('Estado de pagos', t, SpreadsheetApp.getUi().ButtonSet.OK); } catch (e) { /* sin pantalla */ }
  return t;
}

/* ============================================================ LIGAS DE INSTALACIÓN
   Para cada conexión con página: página?control=<URL_CONTROL>&c=<clave>&obra=<obra>
   La app la abre una vez y queda conectada (guarda la liga en el teléfono). */
function ligasMaestro() { return ligasInstalacion(true); }
function ligasInstalacion(maestro) {
  const url = String(config_('URL_CONTROL') || '').trim(), ls = [];
  if (!/\/exec$/.test(url)) { const m = 'Falta la liga /exec en CONFIGURACIÓN › URL_CONTROL (paso 5 de la instalación).'; try { SpreadsheetApp.getUi().alert(m); } catch (e) {} return m; }
  const cl = leer_('Clientes');
  leer_('Conexiones').forEach(function (c) {
    const k = cl.find(function (x) { return igual_(x['Cliente'], c['Cliente']); }), pag = String(c['Página (Netlify)'] || '').trim();
    if (!k || !k['Clave'] || !pag) return;
    ls.push(c['Cliente'] + ' · ' + c['App'] + (c['Obra'] ? ' · ' + c['Obra'] : '') + '\n' + pag + (pag.indexOf('?') < 0 ? '?' : '&') + 'control=' + encodeURIComponent(url) + '&c=' + encodeURIComponent(k['Clave']) + (c['Obra'] ? '&obra=' + encodeURIComponent(c['Obra']) : '') + (maestro === true ? '&maestro=1' : ''));
  });
  const t = ls.length ? ls.join('\n\n') : 'No hay conexiones con «Página (Netlify)» llena.';
  try { SpreadsheetApp.getUi().alert(maestro === true ? 'Ligas de equipo maestro (no las compartas)' : 'Ligas de instalación', t, SpreadsheetApp.getUi().ButtonSet.OK); } catch (e) {}
  return t;
}

/* ============================================================ LO QUE PIDEN LAS APPS
   GET  ?accion=version
   GET  ?accion=conexion&c=<clave>&app=<App>[&obra=<obra>]
     → { ok, cliente:{nombre, logo, cuenta}, app, pago:{estado, texto, hasta}, soloConsulta, conexiones:[{obra, app, pagina, webapp, archivo}] }
   Con una clave que no existe o un cliente inactivo: { ok:false, error } y nada más. */
function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.accion === 'version') return json_({ ok: true, version: VERSION });
    if (p.accion === 'conexion') return json_(conexion_(p.c, p.app, p.obra, p.t));
    if (p.accion === 'maestra') return json_(maestra_(p.k, p.equipo, p.app));
    if (p.accion === 'panel' || p.accion === 'guardar' || p.accion === 'baja_equipo') {
      if (!esFicha_(p.t)) return json_({ ok: false, error: 'Este equipo no es maestro. Entra con tu clave maestra.', sinFicha: true });
      if (p.accion === 'panel') return json_(panel_());
      if (p.accion === 'guardar') return json_(guardar_(p.hoja, p.datos, p.t));
      return json_(bajaEquipo_(p.ficha, p.t));
    }
    return json_({ ok: false, error: 'Acción no reconocida.' });
  } catch (err) { return json_({ ok: false, error: 'Error en CTA-CONTROL: ' + err.message }); }
}
function doPost(e) {
  let b = {}; try { b = JSON.parse(e.postData.contents || '{}'); } catch (err) { return json_({ ok: false, error: 'Petición mal formada.' }); }
  return doGet({ parameter: b });
}

function conexion_(clave, app, obra, ficha) {
  clave = String(clave || '').trim();
  if (clave.length < 16) return { ok: false, error: 'Liga de instalación incompleta: falta la clave del cliente.' };
  const cli = leer_('Clientes').find(function (r) { return String(r['Clave']).trim() === clave; });
  if (!cli) return { ok: false, error: 'Esta liga ya no es válida. Pide una nueva al administrador.' };
  if (!esSi_(cli['Activo'])) return { ok: false, error: 'Este cliente está dado de baja. Contacta al administrador.' };
  const nombre = String(cli['Cliente']), appN = apps_().find(function (a) { return igual_(a, app); }) || '';
  const pago = appN ? estadoApp_(nombre, appN) : null;
  /* todas las conexiones del cliente: una app necesita también las ligas de las otras (el Almacén lee al Graficador y a Asistencias) */
  const con = leer_('Conexiones').filter(function (r) {
    return igual_(r['Cliente'], nombre) && (!obra || !r['Obra'] || igual_(r['Obra'], obra));
  }).map(function (r) { return { obra: String(r['Obra'] || ''), app: String(r['App'] || ''), pagina: String(r['Página (Netlify)'] || ''), webapp: String(r['Web app (/exec)'] || ''), archivo: String(r['Archivo (liga de la hoja)'] || '') }; });
  /* 20f: cliente con «Aviso de pago = No» → no se le manda nada del pago (salvo a los equipos maestros) */
  const maestro = esFicha_(ficha), sinAviso = norm_(cli['Aviso de pago']) === 'no';
  return {
    ok: true, version: VERSION,
    cliente: { nombre: nombre, logo: String(cli['Logo (liga)'] || ''), cuenta: String(cli['Datos en cuenta de'] || '') },
    app: appN, pago: (sinAviso && !maestro) ? null : pago,
    soloConsulta: !!(pago && (pago.estado === 'vencido' || pago.estado === 'inactiva')),
    esMaestro: maestro,
    conexiones: con
  };
}

/* ============================================================ 🔑 CLAVE MAESTRA
   ?accion=maestra&k=<clave>&equipo=<nombre del equipo>&app=<app> → { ok, ficha }
   Si la clave es correcta se da una ficha nueva (24 caracteres) y se anota en «Equipos maestros».
   Tras 5 intentos fallidos se bloquea 15 minutos. */
function maestra_(k, equipo, app) {
  const cache = CacheService.getScriptCache(), n = Number(cache.get('fallas_maestra') || 0);
  if (n >= 5) return { ok: false, error: 'Demasiados intentos. Espera 15 minutos.' };
  const buena = String(config_('CLAVE_MAESTRA') || '').trim();
  if (!buena) return { ok: false, error: 'Falta escribir la CLAVE_MAESTRA en CTA-CONTROL › CONFIGURACIÓN.' };
  if (String(k || '').trim() !== buena) { cache.put('fallas_maestra', String(n + 1), 900); bitacora_('Clave maestra', 'intento fallido · ' + String(equipo || '').slice(0, 60)); return { ok: false, error: 'Clave incorrecta.' }; }
  const ficha = claveNueva_(), h = libro_().getSheetByName('Equipos maestros');
  h.appendRow([ficha, new Date(), String(equipo || '').slice(0, 80), String(app || '').slice(0, 40)]);
  bitacora_('Clave maestra', 'equipo maestro nuevo · ' + String(equipo || '').slice(0, 60) + ' · ' + String(app || ''));
  return { ok: true, ficha: ficha };
}
function esFicha_(f) { f = String(f || '').trim(); return f.length >= 16 && leer_('Equipos maestros').some(function (r) { return String(r['Ficha']).trim() === f; }); }

/* ============================================================ 🖥 PANEL
   Todo pide ficha de equipo maestro (se revisa en doGet). */
const LLAVES = { Clientes: ['Cliente'], Apps: ['Cliente', 'App'], Conexiones: ['Cliente', 'Obra', 'App'] };   /* Pagos: siempre renglón nuevo */
function panel_() {
  const hoy = new Date(), apps = leer_('Apps').filter(function (a) { return a['Cliente'] && a['App']; });
  const fecha = function (o) { const c = {}; Object.keys(o).forEach(function (k) { const v = o[k]; c[k] = Object.prototype.toString.call(v) === '[object Date]' ? Utilities.formatDate(v, ZONA, 'yyyy-MM-dd') : v; }); return c; };
  return {
    ok: true, version: VERSION, apps: apps_(), url: String(config_('URL_CONTROL') || ''), diasGracia: num_(config_('DIAS_GRACIA'), 5),
    clientes: leer_('Clientes').filter(function (r) { return r['Cliente']; }).map(fecha),
    appsCliente: apps.map(function (a) { const o = fecha(a); o.estado = estadoApp_(a['Cliente'], a['App'], hoy); return o; }),
    conexiones: leer_('Conexiones').filter(function (r) { return r['Cliente']; }).map(fecha),
    pagos: leer_('Pagos').filter(function (r) { return r['Cliente']; }).map(fecha).reverse(),
    equipos: leer_('Equipos maestros').filter(function (r) { return r['Ficha']; }).map(function (r) { const f = String(r['Ficha']); return { ficha: f, fin: f.slice(-4), alta: fecha(r)['Alta'], equipo: r['Equipo'], app: r['App'] }; })
  };
}
function guardar_(nombre, datos, ficha) {
  if (typeof datos === 'string') { try { datos = JSON.parse(datos); } catch (e) { datos = null; } }
  if (!datos || typeof datos !== 'object') return { ok: false, error: 'Faltan los datos.' };
  if (['Clientes', 'Apps', 'Conexiones', 'Pagos'].indexOf(nombre) < 0) return { ok: false, error: 'Esa pestaña no se edita desde el panel.' };
  const h = libro_().getSheetByName(nombre); if (!h) return { ok: false, error: 'Falta la pestaña ' + nombre + '. Corre ⚙ Instalar / actualizar.' };
  const enc = h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0].map(String);
  const limpio = {}; enc.forEach(function (c) { if (c in datos && c !== 'Clave') limpio[c] = typeof datos[c] === 'string' ? datos[c].trim() : datos[c]; });
  ['Prueba hasta', 'Pagado hasta', 'Fecha'].forEach(function (c) { if (limpio[c]) { const f = aFecha_(limpio[c]); limpio[c] = f || limpio[c]; } });
  const ll = LLAVES[nombre];
  if (ll && ll.some(function (k) { return k !== 'Obra' && !String(limpio[k] || '').trim(); })) return { ok: false, error: 'Falta ' + ll.join(' / ') + '.' };
  if (nombre === 'Pagos') {
    if (!limpio['Cliente'] || !limpio['Pagado hasta']) return { ok: false, error: 'Falta el cliente o «pagado hasta».' };
    if (!limpio['Fecha']) limpio['Fecha'] = new Date();
    h.appendRow(enc.map(function (c) { return c in limpio ? limpio[c] : ''; }));
    bitacora_('Panel · pago', limpio['Cliente'] + ' · ' + (limpio['App'] || '') + ' · hasta ' + fmt_(aFecha_(limpio['Pagado hasta']) || new Date()));
    return { ok: true };
  }
  const v = h.getLastRow() > 1 ? h.getRange(2, 1, h.getLastRow() - 1, enc.length).getValues() : [];
  const idx = v.findIndex(function (r) { return ll.every(function (k) { return igual_(r[enc.indexOf(k)], limpio[k] || ''); }); });
  if (idx >= 0) {
    Object.keys(limpio).forEach(function (c) { if (ll.indexOf(c) < 0) h.getRange(idx + 2, enc.indexOf(c) + 1).setValue(limpio[c]); });   /* las llaves (cliente, obra, app) se quedan como estaban escritas */
    if (nombre === 'Conexiones' && enc.indexOf('Actualizó') >= 0) h.getRange(idx + 2, enc.indexOf('Actualizó') + 1).setValue(new Date());
  } else {
    if (nombre === 'Conexiones') limpio['Actualizó'] = new Date();
    h.appendRow(enc.map(function (c) { return c in limpio ? limpio[c] : ''; }));
  }
  if (nombre === 'Clientes') generarClaves();
  bitacora_('Panel · ' + nombre, ll.map(function (k) { return limpio[k] || '—'; }).join(' · ') + (idx >= 0 ? ' (cambio)' : ' (nuevo)'));
  return { ok: true, nuevo: idx < 0 };
}
function bajaEquipo_(fin, ficha) {
  const h = libro_().getSheetByName('Equipos maestros'); if (!h || h.getLastRow() < 2) return { ok: false, error: 'No hay equipos.' };
  const v = h.getRange(2, 1, h.getLastRow() - 1, 1).getValues(), i = v.findIndex(function (r) { return String(r[0]).trim() === String(fin || '').trim(); });
  if (i < 0) return { ok: false, error: 'Ese equipo ya no está.' };
  if (String(fin).trim() === String(ficha).trim()) return { ok: false, error: 'No puedes dar de baja el equipo con el que estás entrando.' };
  h.deleteRow(i + 2); bitacora_('Panel · equipo maestro', 'baja de un equipo');
  return { ok: true };
}

/* ============================================================ AYUDANTES */
function libro_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function leer_(n) {
  const h = libro_().getSheetByName(n); if (!h || h.getLastRow() < 2) return [];
  const v = h.getRange(1, 1, h.getLastRow(), h.getLastColumn()).getValues(), enc = v[0].map(String);
  return v.slice(1).map(function (r) { const o = {}; enc.forEach(function (c, i) { o[c] = r[i]; }); return o; });
}
function config_(k) { const r = leer_('CONFIGURACIÓN').find(function (x) { return x['Clave'] === k; }); return r ? r['Valor'] : ''; }
function ponerConfig_(k, v) {
  const h = libro_().getSheetByName('CONFIGURACIÓN'); if (!h) return;
  const ks = h.getLastRow() > 1 ? h.getRange(2, 1, h.getLastRow() - 1, 1).getValues().map(function (r) { return r[0]; }) : [];
  const i = ks.indexOf(k); if (i >= 0) h.getRange(i + 2, 2).setValue(v); else h.appendRow([k, v, '']);
}
function bitacora_(accion, detalle) {
  const h = libro_().getSheetByName('Bitácora'); if (!h) return;
  let quien = ''; try { quien = Session.getActiveUser().getEmail(); } catch (e) {}
  h.appendRow([new Date(), quien || 'administración', accion, detalle]);
}
function norm_(s) { return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase(); }
function igual_(a, b) { return norm_(a) === norm_(b); }
function esSi_(v) { return v === true || ['si', 'sí', 'yes', 'true', '1', 'x'].indexOf(norm_(v)) >= 0; }
function num_(v, d) { const n = Number(String(v == null ? '' : v).replace(/[^\d.-]/g, '')); return String(v == null ? '' : v).trim() !== '' && !isNaN(n) ? n : d; }
function soloDia_(d) { const x = new Date(d); x.setHours(12, 0, 0, 0); return x; }
function aFecha_(v) {
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v)) return v;
  const t = String(v == null ? '' : v).trim(); let m = t.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return new Date(+m[1], +m[2] - 1, +m[3], 12);
  m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/); if (m) return new Date(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2] - 1, +m[1], 12);
  return null;
}
function fmt_(d) { return Utilities.formatDate(d, ZONA, 'dd/MM/yyyy'); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
