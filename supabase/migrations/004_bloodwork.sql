create table bloodwork_analyses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  filename    text not null,
  analyzed_at timestamptz default now(),
  summary     text,
  analysis    jsonb not null,
  created_at  timestamptz default now()
);
alter table bloodwork_analyses enable row level security;
create policy "Users own their bloodwork" on bloodwork_analyses for all using (auth.uid() = user_id);
create index on bloodwork_analyses (user_id, created_at desc);
