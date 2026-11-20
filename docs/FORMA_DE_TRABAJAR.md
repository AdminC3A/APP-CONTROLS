# Forma de trabajar · igual en todas las apps
David Martínez, 20/11/2026: «unifica la forma de trabajar».

## Cada hoja tiene su menú ⚙
```
⚙ <APP>
 ├ Instalar / actualizar     ← crea pestañas y columnas que falten; nunca borra
 ├ ℹ Versión del código
 └ ─── lo propio de cada app ───
```
| App | Menú | Repo |
|---|---|---|
| Control | ⚙ APP-CONTROL | AdminC3A/APP-CONTROLS |
| Graficador | ⚙ CTA-GRAFICAR | AdminC3A/CTA-GRAFICAR |
| Asistencias (+ Reportes) | ⚙ CTA-ASISTENCIAS | AdminC3A/CTA-ASISTENCIAS · AdminC3A/REPORTES |
| Almacén | ⚙ CTA-ALMACÉN (al rehacerlo, etapa 2) | AdminC3A/EAI-CTA-ALMACEN |
| Calidad · Control presupuestal | por hacer | — |

## Actualizar cualquier app
1. Pegar el **Code.gs** nuevo (la versión va en la primera línea) y guardar.
2. **Implementar › Administrar implementaciones › ✏ › Versión: Nueva versión › Implementar** (la liga /exec no cambia).
3. En la hoja: **⚙ <APP> › Instalar / actualizar**.
4. Merge del PR y **Ctrl+F5** en la app.

## Reglas de cada entrega
- Rama `claude/<tema>` → PR → **David hace el merge**.
- El Code.gs se entrega como archivo descargable, completo, con su versión en la primera línea; más un ZIP «CAMBIOS_<versión>».
- Cada JS lleva su número de versión nuevo en cada entrega.
- Cada módulo en su carpeta (html, js y css); lo común en la raíz.
- Nada manual en la hoja: pestañas, columnas y usuarios los hace el Code.gs con «Instalar / actualizar».
- Usuarios: separar **Usuario** (nombre que se ve) de **Acceso** (con qué entra).
- Lo que borra pide confirmación en pantalla, nunca editando el código.

## Conexiones (APP-CONTROL)
- Cada app toma su hoja de APP-CONTROL con la **liga de instalación**; si no, usa la escrita en su config.
- Solo los **equipos maestros** (clave maestra de David) ven **🔗 Conexiones**.
- Si APP-CONTROL no contesta, la app sigue con lo último guardado.

## Plan completo
Plan · Sistema de almacén multiobra y apps conectadas: https://claude.ai/artifact/4dM99TQL8CGWPQQmGZPUo2
