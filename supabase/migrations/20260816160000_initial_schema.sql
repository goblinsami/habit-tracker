create extension if not exists pgcrypto with schema extensions;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default 'Circle',
  color text not null,
  created_at timestamptz not null default now(),
  constraint categories_user_id_id_unique unique (user_id, id),
  constraint categories_name_not_blank check (length(btrim(name)) > 0),
  constraint categories_icon_not_blank check (length(btrim(icon)) > 0),
  constraint categories_color_not_blank check (length(btrim(color)) > 0)
);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null,
  name text not null,
  created_at timestamptz not null default now(),
  archived boolean not null default false,
  constraint habits_user_id_id_unique unique (user_id, id),
  constraint habits_category_user_fk foreign key (user_id, category_id)
    references public.categories(user_id, id)
    on update cascade
    on delete restrict,
  constraint habits_name_not_blank check (length(btrim(name)) > 0)
);

create table public.habit_entries (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  completed boolean not null default false,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint habit_entries_habit_user_fk foreign key (user_id, habit_id)
    references public.habits(user_id, id)
    on update cascade
    on delete cascade,
  constraint habit_entries_one_per_habit_user_date unique (habit_id, user_id, date),
  constraint habit_entries_comment_not_blank_when_present check (
    comment is null or length(btrim(comment)) > 0
  )
);

create unique index categories_user_name_unique_idx
  on public.categories (user_id, lower(btrim(name)));

create unique index habits_active_user_category_name_unique_idx
  on public.habits (user_id, category_id, lower(btrim(name)))
  where archived = false;

create index habits_user_category_idx on public.habits (user_id, category_id);
create index habits_user_archived_idx on public.habits (user_id, archived);
create index habit_entries_user_date_idx on public.habit_entries (user_id, date desc);
create index habit_entries_habit_date_idx on public.habit_entries (habit_id, date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_habit_entries_updated_at
  before update on public.habit_entries
  for each row
  execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.habits enable row level security;
alter table public.habit_entries enable row level security;

create policy "Users can select their categories"
  on public.categories
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their categories"
  on public.categories
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their categories"
  on public.categories
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their categories"
  on public.categories
  for delete
  using (auth.uid() = user_id);

create policy "Users can select their habits"
  on public.habits
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their habits"
  on public.habits
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their habits"
  on public.habits
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their habits"
  on public.habits
  for delete
  using (auth.uid() = user_id);

create policy "Users can select their habit entries"
  on public.habit_entries
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their habit entries"
  on public.habit_entries
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their habit entries"
  on public.habit_entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their habit entries"
  on public.habit_entries
  for delete
  using (auth.uid() = user_id);
