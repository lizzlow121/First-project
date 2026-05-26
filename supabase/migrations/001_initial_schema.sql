-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  full_name       text,
  avatar_url      text,
  weight_goal_kg  numeric(5,2),
  pace_unit       text not null default 'km' check (pace_unit in ('km', 'mile')),
  created_at      timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users own their profile" on profiles for all using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- RACES
-- ============================================================
create table races (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade not null,
  name                text not null,
  race_type           text not null,
  race_subtype        text,
  race_date           date not null,
  location            text,
  distance_km         numeric(6,2),
  goal_time_seconds   integer,
  current_fitness     text check (current_fitness in ('beginner', 'intermediate', 'advanced')),
  notes               text,
  created_at          timestamptz default now()
);
alter table races enable row level security;
create policy "Users own their races" on races for all using (auth.uid() = user_id);
create index on races (user_id, race_date);

-- ============================================================
-- TRAINING SESSIONS
-- ============================================================
create table training_sessions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade not null,
  race_id             uuid references races(id) on delete set null,
  session_date        date not null,
  title               text not null,
  session_type        text not null,
  duration_minutes    integer,
  distance_km         numeric(6,2),
  perceived_effort    integer check (perceived_effort between 1 and 10),
  pace_per_km_seconds integer,
  notes               text,
  source              text not null default 'manual',
  external_id         text,
  created_at          timestamptz default now()
);
alter table training_sessions enable row level security;
create policy "Users own their sessions" on training_sessions for all using (auth.uid() = user_id);
create index on training_sessions (user_id, session_date);
create unique index on training_sessions (user_id, source, external_id) where external_id is not null;

-- ============================================================
-- NUTRITION GOALS
-- ============================================================
create table nutrition_goals (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null unique,
  calories_target  integer not null default 2000,
  protein_g        integer not null default 150,
  carbs_g          integer not null default 200,
  fat_g            integer not null default 65,
  updated_at       timestamptz default now()
);
alter table nutrition_goals enable row level security;
create policy "Users own their nutrition goals" on nutrition_goals for all using (auth.uid() = user_id);

-- ============================================================
-- FOOD LOGS
-- ============================================================
create table food_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  log_date        date not null default current_date,
  meal_type       text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name       text not null,
  brand           text,
  serving_size_g  numeric(7,2),
  calories        numeric(7,1),
  protein_g       numeric(7,2),
  carbs_g         numeric(7,2),
  fat_g           numeric(7,2),
  usda_fdc_id     text,
  created_at      timestamptz default now()
);
alter table food_logs enable row level security;
create policy "Users own their food logs" on food_logs for all using (auth.uid() = user_id);
create index on food_logs (user_id, log_date);

-- ============================================================
-- RECOVERY LOGS
-- ============================================================
create table recovery_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  log_date        date not null default current_date,
  sleep_hours     numeric(4,1),
  soreness        integer check (soreness between 1 and 10),
  energy          integer check (energy between 1 and 10),
  hrv_ms          numeric(6,1),
  resting_hr      integer,
  notes           text,
  source          text not null default 'manual' check (source in ('manual', 'whoop')),
  created_at      timestamptz default now(),
  unique (user_id, log_date)
);
alter table recovery_logs enable row level security;
create policy "Users own their recovery logs" on recovery_logs for all using (auth.uid() = user_id);
create index on recovery_logs (user_id, log_date);

-- ============================================================
-- SUPPLEMENTS
-- ============================================================
create table supplements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  dose        text,
  timing      text,
  notes       text,
  active      boolean not null default true,
  created_at  timestamptz default now()
);
alter table supplements enable row level security;
create policy "Users own their supplements" on supplements for all using (auth.uid() = user_id);

-- ============================================================
-- SUPPLEMENT LOGS
-- ============================================================
create table supplement_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  supplement_id  uuid references supplements(id) on delete cascade not null,
  taken_date     date not null default current_date,
  taken_at       timestamptz default now(),
  unique (user_id, supplement_id, taken_date)
);
alter table supplement_logs enable row level security;
create policy "Users own their supplement logs" on supplement_logs for all using (auth.uid() = user_id);
create index on supplement_logs (user_id, taken_date);

-- ============================================================
-- WEIGHT LOGS
-- ============================================================
create table weight_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  log_date    date not null default current_date,
  weight_kg   numeric(5,2) not null,
  notes       text,
  created_at  timestamptz default now(),
  unique (user_id, log_date)
);
alter table weight_logs enable row level security;
create policy "Users own their weight logs" on weight_logs for all using (auth.uid() = user_id);
create index on weight_logs (user_id, log_date);

-- ============================================================
-- JOURNAL ENTRIES
-- ============================================================
create table journal_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  entry_date   date not null default current_date,
  entry_type   text not null check (entry_type in ('morning', 'evening')),
  intention    text,
  content      text,
  ai_prompts   jsonb,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (user_id, entry_date, entry_type)
);
alter table journal_entries enable row level security;
create policy "Users own their journal" on journal_entries for all using (auth.uid() = user_id);
create index on journal_entries (user_id, entry_date);

-- ============================================================
-- INTEGRATIONS (OAuth token store)
-- ============================================================
create table integrations (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  provider          text not null check (provider in ('strava', 'whoop', 'google_calendar', 'gmail')),
  access_token      text not null,
  refresh_token     text,
  expires_at        timestamptz,
  athlete_id        text,
  scope             text,
  gcal_calendar_id  text,
  last_synced_at    timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  unique (user_id, provider)
);
alter table integrations enable row level security;
create policy "Users own their integrations" on integrations for all using (auth.uid() = user_id);
