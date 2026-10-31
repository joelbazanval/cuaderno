# Cuaderno

Notas en Markdown con bloques, enlaces `[[yy/mm/dd]]`, registros automáticos (TODOs, finanzas, hashtags, objetos como `[[persona/Camila]]`), agenda, buscador y exportar/importar. App estática: solo HTML, CSS y JS, sin build.

## Archivos
- `index.html` estructura
- `styles.css` estilos
- `app.js` toda la lógica

## Ejecutar en local
Abre `index.html` en el navegador, o sirve la carpeta: `python3 -m http.server 8000`.

## Publicar en GitHub Pages
1. Crea un repositorio y sube los 4 archivos a la raíz.
2. Settings → Pages → Source: *Deploy from a branch* → rama `main`, carpeta `/ (root)`.
3. Tu app queda en `https://TU-USUARIO.github.io/NOMBRE-REPO/`.

## Datos
Hoy se guardan en `localStorage` del navegador (por dispositivo y por dirección). Usa **Exportar / Importar** como respaldo y para pasar notas entre dispositivos.
Importante: al cambiar de dirección (por ejemplo de claude.ai a github.io) las notas no se trasladan solas; exporta en la anterior e importa en la nueva.

## Sincronizar con Supabase
1. En https://supabase.com crea un proyecto.
2. SQL Editor → pega el contenido de `supabase.sql` → Run (crea las tablas `pages` y `settings` con seguridad por usuario).
3. Project Settings → API: copia **Project URL** y la clave **anon public** y pégalas en `config.js`.
4. Authentication → URL Configuration: pon como *Site URL* `https://joelbazanval.github.io/cuaderno/`.
   (Opcional, para entrar sin confirmar correo: Authentication → Providers → Email → desactiva *Confirm email*.)
5. Sube los cambios a GitHub. Abre la app, pulsa ☁, crea tu cuenta y entra.

Cómo sincroniza: al entrar, al guardar (unos segundos después), al volver a la pestaña y cada minuto. Si una nota cambia en dos dispositivos a la vez, se conserva tu versión y la otra queda como `nota (conflicto)`. Los borrados también se propagan. Si `config.js` está vacío, la app funciona solo en local.

Seguridad: usa únicamente la clave anon; las políticas RLS impiden leer o escribir notas de otros usuarios. Nunca pongas la clave `service_role` en el código.
