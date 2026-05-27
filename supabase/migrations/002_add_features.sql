-- ============================================================
-- BODY MEASUREMENTS (extends weight tracking)
-- ============================================================
create table body_measurements (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  log_date        date not null default current_date,
  weight_kg       numeric(5,2),
  body_fat_pct    numeric(4,1),
  waist_cm        numeric(5,1),
  chest_cm        numeric(5,1),
  arm_cm          numeric(5,1),
  thigh_cm        numeric(5,1),
  notes           text,
  created_at      timestamptz default now(),
  unique (user_id, log_date)
);
alter table body_measurements enable row level security;
create policy "Users own their measurements" on body_measurements for all using (auth.uid() = user_id);
create index on body_measurements (user_id, log_date);

-- ============================================================
-- HYDRATION LOGS (daily water intake)
-- ============================================================
create table hydration_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  log_date    date not null default current_date,
  amount_ml   integer not null,
  logged_at   timestamptz default now()
);
alter table hydration_logs enable row level security;
create policy "Users own their hydration logs" on hydration_logs for all using (auth.uid() = user_id);
create index on hydration_logs (user_id, log_date);

-- ============================================================
-- RACE RESULTS (extends races table)
-- ============================================================
alter table races add column actual_finish_time_seconds integer;
alter table races add column result_rating integer check (result_rating between 1 and 5);
alter table races add column result_notes text;
alter table races add column result_logged_at timestamptz;

-- ============================================================
-- HYDRATION GOAL on profiles
-- ============================================================
alter table profiles add column hydration_goal_ml integer default 3000;
alter table profiles add column carb_load_enabled boolean default true;
