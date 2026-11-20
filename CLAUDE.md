# APP-CONTROLS · nota para Claude
Control central (CTA-CONTROL) de las apps de **David Martínez**. Hoja de Google en su Drive + `apps-script/Code.gs`.

## Reglas
1. Rama `claude/<tema>` desde `main`, commit, push, PR (`gh api repos/AdminC3A/APP-CONTROLS/pulls --input pr.json`). **David hace el merge.**
2. Cada versión nueva del Code.gs: cambiar la versión en la **primera línea** y en `VERSION`, entregarlo descargable + ZIP «CAMBIOS_<versión>», con los pasos de docs/FORMA_DE_TRABAJAR.md.
3. Nunca devolver datos de un cliente a otro; la clave del cliente y la ficha de equipo maestro no se escriben en ningún log visible.
4. Probar con la hoja simulada antes de entregar.
5. Hablarle a David en español sencillo, paso a paso, sin jerga; opciones con algo visual.
