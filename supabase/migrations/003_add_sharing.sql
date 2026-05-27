-- ============================================================
-- RACE SHARING
-- ============================================================
alter table races add column share_slug text unique;
alter table races add column shared_at timestamptz;

-- Public read policy: anyone can read a race row if share_slug is not null
-- and they're querying by it
create policy "Public can view shared races" on races
  for select
  using (share_slug is not null);

create index on races (share_slug) where share_slug is not null;
