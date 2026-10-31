-- Service-only editorial settings. No public or authenticated table access.
-- Apply to the confirmed Little Portions project after reviewing this migration.
begin;
create table public.admin_taste_config (
  id text primary key check (id = 'current'),
  revision bigint not null default 0 check (revision >= 0),
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  published_revision bigint,
  history jsonb not null default '[]'::jsonb check (jsonb_typeof(history) = 'array'),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.admin_taste_config enable row level security;
revoke all on public.admin_taste_config from public, anon, authenticated;
grant select, insert, update on public.admin_taste_config to service_role;
insert into public.admin_taste_config(id,draft) values ('current', '{"schemaVersion":1,"questions":{"sunday":{"title":"This Sunday morning, what’s your plan?","choices":{"b":{"title":"A lazy brunch","description":"An easy start at 11"},"p":{"title":"A riverside picnic","description":"A picnic blanket and a breeze"},"n":{"title":"Netflix and snacks","description":"A cozy bowl under the covers"},"c":{"title":"Market shopping and cooking","description":"A stroll with your shopping bag"}}},"fridge":{"title":"What’s in your fridge?","choices":{"empty":{"title":"Almost empty","description":"Just a bottle of water"},"sauce":{"title":"Full of sauces","description":"Ketchup, soy sauce, mayo…"},"banchan":{"title":"Plenty of side dishes","description":"Homemade sides and leftovers"},"wilted":{"title":"Vegetables need using","description":"That forgotten bunch of green onions"}}}},"profiles":{"목":{"title":"A green table","copy":"Start the week fresh. Green ingredients are your match."},"화":{"title":"A vibrant table","copy":"A week full of energy. Try vibrant red ingredients."},"토":{"title":"A golden table","copy":"A grounded, comforting week. Warm golden ingredients are your match."},"금":{"title":"A simple table","copy":"Keep it simple this week. Gentle, light ingredients are your match."},"수":{"title":"A sea-inspired table","copy":"A calm, nourishing week. Explore seafood and savory flavors."}},"rules":{"elementWeight":3,"sundayWeight":2,"kitElementBonus":3},"recommendations":{"목":[],"화":[],"토":[],"금":[],"수":[]}}'::jsonb);
commit;
