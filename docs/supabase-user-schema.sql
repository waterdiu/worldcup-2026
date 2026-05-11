create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  status text not null default 'pending' check (status in ('pending', 'active', 'disabled', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists email text;

alter table public.profiles
  add column if not exists status text not null default 'pending';

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('team', 'match', 'city')),
  target_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id text not null,
  winner text not null,
  home_score integer not null check (home_score >= 0),
  away_score integer not null check (away_score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.page_permissions (
  path text primary key,
  label text not null,
  require_login boolean not null default false,
  admin_only boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_page_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  path text not null references public.page_permissions(path) on delete cascade,
  can_access boolean not null default true,
  requires_approval boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, path)
);

create table if not exists public.user_activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.page_permissions (path, label, require_login, admin_only)
values
  ('/', '首页', false, false),
  ('/qualifiers', '预选赛', false, false),
  ('/qualifiers/*', '预选赛子页面', false, false),
  ('/stats', '统计', false, false),
  ('/groups', '小组', false, false),
  ('/groups/*', '小组子页面', false, false),
  ('/matches', '比赛', false, false),
  ('/matches/*', '比赛详情', false, false),
  ('/teams', '球队', false, false),
  ('/teams/*', '球队详情', false, false),
  ('/cities', '城市', false, false),
  ('/cities/*', '城市详情', false, false),
  ('/me', '我的', true, false),
  ('/admin', '管理后台', true, true)
on conflict (path) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.predictions enable row level security;
alter table public.user_roles enable row level security;
alter table public.page_permissions enable row level security;
alter table public.user_page_permissions enable row level security;
alter table public.user_activity_events enable row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;

drop policy if exists "Users can read own favorites" on public.favorites;
drop policy if exists "Users can write own favorites" on public.favorites;
drop policy if exists "Users can delete own favorites" on public.favorites;

drop policy if exists "Users can read own predictions" on public.predictions;
drop policy if exists "Users can write own predictions" on public.predictions;
drop policy if exists "Users can update own predictions" on public.predictions;
drop policy if exists "Users can delete own predictions" on public.predictions;

drop policy if exists "Users can read own role" on public.user_roles;
drop policy if exists "Admins can write roles" on public.user_roles;
drop policy if exists "Page permissions are readable" on public.page_permissions;
drop policy if exists "Admins can write page permissions" on public.page_permissions;
drop policy if exists "Users can read own page permissions" on public.user_page_permissions;
drop policy if exists "Admins can write user page permissions" on public.user_page_permissions;
drop policy if exists "Admins can read activity events" on public.user_activity_events;
drop policy if exists "Users can insert own activity events" on public.user_activity_events;

create policy "Profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can update profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users can read own favorites"
  on public.favorites for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can write own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

create policy "Users can read own predictions"
  on public.predictions for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can write own predictions"
  on public.predictions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own predictions"
  on public.predictions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own predictions"
  on public.predictions for delete
  using (auth.uid() = user_id);

create policy "Users can read own role"
  on public.user_roles for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins can write roles"
  on public.user_roles for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Page permissions are readable"
  on public.page_permissions for select
  using (true);

create policy "Admins can write page permissions"
  on public.page_permissions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users can read own page permissions"
  on public.user_page_permissions for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins can write user page permissions"
  on public.user_page_permissions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can read activity events"
  on public.user_activity_events for select
  using (public.is_admin());

create policy "Users can insert own activity events"
  on public.user_activity_events for insert
  with check (auth.uid() = user_id);

-- After your own account has logged in once, run this with that user's UUID:
-- insert into public.user_roles (user_id, role)
-- values ('YOUR_USER_UUID', 'admin')
-- on conflict (user_id) do update set role = excluded.role;
