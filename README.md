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

## Sincronizar con Supabase (opcional, aún no incluido)
GitHub Pages solo sirve archivos estáticos; Supabase aportaría login y base de datos para sincronizar entre dispositivos. Esquema sugerido:

```sql
create table pages (
  user_id uuid references auth.users not null default auth.uid(),
  name text not null,
  body text not null default '',
  untitled boolean default false,
  touched bigint default 0,
  updated_at timestamptz default now(),
  primary key (user_id, name)
);
create table settings (
  user_id uuid primary key references auth.users default auth.uid(),
  enums jsonb default '{}'
);
alter table pages enable row level security;
alter table settings enable row level security;
create policy "own pages" on pages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own settings" on settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```
Con eso, la app usaría solo la clave pública (anon) de Supabase en el navegador; la seguridad la dan las políticas RLS. Nunca pongas la clave `service_role` en el código.
