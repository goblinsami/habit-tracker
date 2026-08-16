# Habit Tracker

Aplicacion web sencilla para seguimiento de habitos, construida con Vue 3, TypeScript, Vite, Vue Router y Supabase.

## Requisitos

- Node.js 20 o superior
- npm
- Un proyecto de Supabase

## Instalacion

```bash
npm install
```

Copia el archivo de entorno de ejemplo:

```bash
cp .env.example .env
```

En Windows PowerShell puedes usar:

```powershell
Copy-Item .env.example .env
```

## Variables de entorno

Debes completar manualmente estas variables en `.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Puedes encontrarlas en Supabase dentro de `Project Settings > API`:

- `VITE_SUPABASE_URL`: Project URL
- `VITE_SUPABASE_ANON_KEY`: anon public API key

## Comandos

```bash
npm run dev
npm run typecheck
npm run build
npm run preview
```

## Configuracion Supabase para Fase 1

Esta fase usa Supabase Auth con email y password. En el panel de Supabase revisa:

- `Authentication > Providers > Email` debe estar habilitado.
- Si mantienes confirmacion por email activa, el registro puede requerir confirmar el correo antes de iniciar sesion.
- Para desarrollo local, anade `http://localhost:5173` en `Authentication > URL Configuration` si usas redirecciones.

## Base de datos y RLS

El proyecto local de Supabase esta inicializado en `supabase/config.toml` y enlazado al proyecto remoto usado en `.env`.

La migracion inicial esta en:

```text
supabase/migrations/20260816160000_initial_schema.sql
```

Incluye:

- `categories`
- `habits`
- `habit_entries`
- claves primarias y foraneas
- constraint unica para un registro por habito, usuario y fecha
- indices para listados por usuario, categoria, fecha y heatmaps
- trigger de `updated_at` para `habit_entries`
- Row Level Security para que cada usuario solo pueda acceder a sus datos

Para aplicar migraciones con Supabase CLI:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

La migracion inicial ya fue aplicada con `npx supabase db push`.

## Arquitectura

```text
src/
  components/
    ActivityHeatmap.vue
    CategoryForm.vue
    CategoryIcon.vue
    ColorPicker.vue
    DailyProgress.vue
    HabitGroup.vue
    HabitForm.vue
    HabitRow.vue
    IconPicker.vue
  composables/
    useCategories.ts
    useAuth.ts
    useHabits.ts
  constants/
    categoryColors.ts
    categoryIcons.ts
  lib/
    supabase.ts
  router/
    index.ts
  services/
    auth.ts
    categories.ts
    entries.ts
    habits.ts
  stores/
  types/
    database.ts
    router.d.ts
  views/
    ActivityView.vue
    CategoriesView.vue
    HabitDetailView.vue
    HabitsView.vue
    LoginView.vue
    TodayView.vue
  utils/
    activity.ts
    date.ts
    stats.ts
supabase/
  migrations/
    20260816160000_initial_schema.sql
```

## Estado del proyecto

Implementado:

- App Vue 3 + TypeScript + Vite
- Vue Router
- Cliente Supabase centralizado
- Variables de entorno de ejemplo
- Login, registro y logout minimos
- Ruta protegida `/today`
- Pantalla de login sencilla
- Schema inicial de Supabase
- Migracion SQL con RLS
- Tipos TypeScript basicos para la base de datos
- Vista protegida `/categories`
- CRUD inicial de categorias
- Selector buscable de iconos curados
- Paleta cerrada de colores
- Vista protegida `/habits`
- CRUD inicial de habitos
- Archivado y restauracion de habitos
- Pantalla Today conectada a habitos activos
- Marcado/desmarcado con UI optimista
- Comentarios opcionales por habito y dia
- Progreso diario con porcentaje
- Vista protegida `/activity`
- Heatmap global de los ultimos 12 meses
- Resumen de actividad historica
- Vista protegida `/habits/:id`
- Heatmap individual por habito
- Comentarios historicos por habito
- Estadisticas por habito
- Refinamiento UX final de estados, responsive y navegacion

## Estado MVP

El MVP descrito en `AGENTS.md` esta completo. No incluye funcionalidades fuera de alcance como recurrencias complejas, gamificacion, notificaciones, IA, pagos o integraciones externas.
