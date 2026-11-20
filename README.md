# APP-CONTROLS · CTA-CONTROL

Control central de las apps de David Martínez: **Graficador, Asistencias, Reportes, Almacén, Calidad y Control presupuestal**.

Es una **hoja de Google en el Drive de David** («CTA-CONTROL») con su Apps Script (`apps-script/Code.gs`). Ahí se dice:

| Pestaña | Para qué |
|---|---|
| **Clientes** | cada empresa: clave (se genera sola), logo, en qué cuenta viven sus datos, activo, **Cobrar** (No = sin cobro 🎁), **Aviso de pago** (No = jamás le sale) |
| **Apps** | qué app tiene activa cada cliente, mensual, días de gracia, **Prueba hasta** (🧪 periodo de prueba) |
| **Conexiones** | por cliente y obra: la página (Netlify), el Apps Script (/exec) y la hoja de cada app |
| **Pagos** | fecha, monto, forma, **pagado hasta**, comprobante |
| **Equipos maestros** | los equipos de David que ven 🔗 Conexiones (se dan de alta con la clave maestra) |
| **Bitácora** · **CONFIGURACIÓN** | historial · APPS, CLAVE_MAESTRA, URL_CONTROL, DIAS_GRACIA, VERSION |

Las apps le preguntan a CTA-CONTROL «¿a qué hoja me conecto y estoy al corriente?» con la **liga de instalación**
(`<página>?control=<liga de CTA-CONTROL>&c=<clave del cliente>&obra=<obra>`). Cada cliente solo ve lo suyo.

## Instalar (una sola vez)
1. En el Drive de David: **Nuevo › Hojas de cálculo de Google** › nombre **CTA-CONTROL**.
2. **Extensiones › Apps Script** › pegar `apps-script/Code.gs` completo › Guardar › cerrar esa pestaña.
3. Recargar la hoja (F5) › menú **⚙ CTA-CONTROL › Instalar / actualizar** (la primera vez pide permisos).
4. **Implementar › Nueva implementación › Aplicación web** · Ejecutar como: Yo · Acceso: Cualquier usuario.
5. Copiar la liga `/exec` y pegarla en **CONFIGURACIÓN › URL_CONTROL**. Escribir la **CLAVE_MAESTRA**.

## Actualizar
Igual que todas las apps → [docs/FORMA_DE_TRABAJAR.md](docs/FORMA_DE_TRABAJAR.md).

## Estados de pago que ven las apps
🎁 sin cobro · 🧪 prueba · ✅ al corriente · ⚠ por vencer (≤ 5 días) · ⏳ gracia · 🔴 vencido (solo consulta) · ⚪ app no activa
