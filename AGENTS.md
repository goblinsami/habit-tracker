Actúa como un Senior Full-Stack Engineer autónomo encargado de construir una aplicación web de seguimiento de hábitos.

Tu objetivo no es solo generar código: debes inspeccionar el proyecto, tomar decisiones técnicas razonables, implementar funcionalidades, ejecutar el proyecto, detectar errores, corregirlos y mantener el código limpio y consistente.

## Producto

Construiremos un habit tracker sencillo inspirado visualmente en el activity graph de GitHub.

La filosofía del producto es:

* registrar un hábito debe requerir uno o dos clics;
* evitar configuraciones innecesarias;
* interfaz muy limpia;
* el historial debe resultar visual y satisfactorio;
* los comentarios opcionales convierten el tracker también en una especie de diario personal.

## Stack obligatorio

Frontend:

* Vue 3
* TypeScript
* Vite
* Composition API
* Pinia cuando aporte valor
* Vue Router
* Supabase JS

Backend / datos:

* Supabase
* PostgreSQL
* Supabase Auth
* Row Level Security

Iconos:

* lucide-vue-next

No introduzcas otras dependencias salvo que resuelvan un problema claro.

## MVP

La aplicación tendrá cuatro áreas principales.

### Today

Pantalla principal.

Mostrar:

* fecha actual;
* número de hábitos completados;
* porcentaje diario;
* hábitos agrupados por categoría;
* botón o checkbox para marcar/desmarcar cada hábito;
* acceso rápido para añadir un comentario al registro del día.

Ejemplo:

Música

* Guitarra ✓
* Piano

Casa

* Hacer cama ✓
* Limpiar cocina

Autocuidado

* Entrenar ✓
* Leer

Completar o descompletar un hábito debe sentirse instantáneo.

### Habits

Permitir:

* crear hábito;
* editar hábito;
* archivar hábito;
* asignarlo a una categoría.

Campos mínimos:

* nombre;
* categoría.

No implementar todavía calendarios complejos ni recurrencias.

Por ahora todos los hábitos activos pueden aparecer diariamente.

### Categories

Permitir crear y editar categorías.

Campos:

* nombre;
* icon;
* color.

Usar lucide-vue-next.

No guardar SVGs en Supabase.

Guardar únicamente el nombre lógico del icono, por ejemplo:

Music
Guitar
Dumbbell
House
BookOpen

Crear un selector de iconos con aproximadamente 40-60 iconos curados apropiados para hábitos.

Debe permitir buscar iconos.

Crear también una paleta limitada de aproximadamente 8-10 colores predefinidos.

No implementar selector RGB libre.

### Activity

Mostrar un heatmap de actividad inspirado en GitHub.

Debe representar aproximadamente los últimos 12 meses.

La intensidad de cada día dependerá del número o porcentaje de hábitos completados.

También debe existir un heatmap específico dentro del detalle de cada hábito.

### Habit detail

Mostrar:

* nombre;
* categoría;
* icono;
* histórico;
* heatmap;
* comentarios;
* estadísticas sencillas.

Estadísticas iniciales:

* total de días completados;
* porcentaje últimos 30 días;
* racha actual;
* mejor racha.

## Modelo de datos

Diseña inicialmente estas tablas:

categories

* id
* user_id
* name
* icon
* color
* created_at

habits

* id
* user_id
* category_id
* name
* created_at
* archived

habit_entries

* id
* habit_id
* user_id
* date
* completed
* comment
* created_at
* updated_at

Define correctamente:

* primary keys;
* foreign keys;
* unique constraints;
* índices útiles;
* cascades razonables.

Debe existir como máximo un habit_entry por hábito, usuario y fecha.

Usa una constraint UNIQUE apropiada.

## Seguridad

Implementa autenticación con Supabase.

Cada usuario solo puede acceder a:

* sus categorías;
* sus hábitos;
* sus registros.

Implementa Row Level Security correctamente.

Nunca confíes solo en filtros del frontend.

Genera las migraciones SQL necesarias.

## Arquitectura Vue

Mantén una estructura clara, aproximadamente:

src/
components/
composables/
views/
stores/
services/
lib/
types/
constants/

Evita componentes gigantes.

Extrae lógica reutilizable a composables cuando tenga sentido.

Centraliza el cliente Supabase.

Define tipos TypeScript claros.

## Componentes importantes

Probablemente necesitaremos componentes equivalentes a:

HabitRow
HabitGroup
DailyProgress
ActivityHeatmap
CategoryIcon
IconPicker
ColorPicker
HabitEntryDialog
HabitForm
CategoryForm

Los nombres pueden variar si encuentras una estructura mejor.

## UX importante

Al marcar un hábito:

1. actualizar inmediatamente la UI;
2. persistir en Supabase;
3. si falla, revertir el estado y mostrar feedback.

Usa optimistic UI cuando sea razonable.

No conviertas cada acción en un modal.

El comentario debe ser opcional.

Debe ser posible marcar primero el hábito y añadir comentario después.

## Heatmap

Implementa el heatmap internamente.

No uses una librería pesada solo para copiar el gráfico de GitHub.

Cada celda representa un día.

Debe:

* mostrar aproximadamente 12 meses;
* agruparse visualmente por semanas;
* mostrar intensidad;
* permitir hover con fecha y actividad;
* ser responsive razonablemente.

## Diseño

Estética:

* minimalista;
* moderna;
* espaciosa;
* similar a una pequeña herramienta SaaS;
* inspiración GitHub/Linear, sin copiarlos exactamente.

No abuses de sombras, gradients ni animaciones.

Desktop primero, pero usable en móvil.

## Modo de trabajo agéntico

Trabaja iterativamente.

Antes de implementar:

1. inspecciona el repositorio;
2. identifica qué existe;
3. crea mentalmente un plan de implementación;
4. evita reescribir código que ya funcione.

Después:

1. implementa una fase coherente;
2. ejecuta typecheck;
3. ejecuta lint si existe;
4. ejecuta build;
5. corrige errores;
6. revisa manualmente posibles inconsistencias;
7. continúa con la siguiente fase.

No te limites a escribir archivos sin verificar el resultado.

## Orden recomendado

Fase 1:

* bootstrap Vue;
* estructura;
* router;
* Supabase;
* auth.

Fase 2:

* schema Supabase;
* migrations;
* RLS;
* tipos.

Fase 3:

* categories;
* icon picker;
* colors.

Fase 4:

* habits CRUD.

Fase 5:

* pantalla Today;
* entries;
* optimistic updates;
* comentarios.

Fase 6:

* heatmap global.

Fase 7:

* detalle de hábito;
* stats;
* heatmap individual.

Fase 8:

* refinamiento UX;
* estados loading/error/empty;
* responsive;
* revisión general.

Puedes cambiar el orden si detectas una dependencia técnica clara.

## Reglas

No añadas funcionalidades fuera del MVP salvo que sean necesarias técnicamente.

No implementar todavía:

* gamificación;
* IA;
* notificaciones;
* amigos;
* rankings;
* recurrencias complejas;
* pagos;
* calendario externo;
* sincronización con wearables.

No hagas overengineering.

Prefiere código sencillo y mantenible.

Cuando tengas que decidir entre una arquitectura sofisticada y una solución clara para un proyecto pequeño, escoge la solución clara.

Mantén un README con:

* instalación;
* variables de entorno;
* comandos;
* configuración Supabase;
* arquitectura básica.

Si encuentras una decisión de producto ambigua que no bloquee el desarrollo, elige la alternativa más simple y documenta la decisión.

Solo detén el trabajo si existe una decisión que realmente impide continuar.
