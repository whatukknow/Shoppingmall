begin;
create table public.admin_operation_events (
  id uuid primary key,
  sequence bigint generated always as identity unique check (sequence <= 9007199254740991),
  entity_kind text not null check (entity_kind in ('order','pod')),
  entity_id text not null check (entity_id ~ '^[a-zA-Z0-9_-]{1,100}$'),
  action text not null check (action in ('note','flag','resolve','archive','restore')),
  note text not null check (char_length(btrim(note)) between 1 and 1000),
  actor_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create index admin_operation_events_target on public.admin_operation_events(entity_kind,entity_id,sequence desc);
alter table public.admin_operation_events enable row level security;
revoke all on public.admin_operation_events from public,anon,authenticated,service_role;
grant select,insert on public.admin_operation_events to service_role;
revoke all on sequence public.admin_operation_events_sequence_seq from public,anon,authenticated,service_role;
grant usage,select on sequence public.admin_operation_events_sequence_seq to service_role;
create function public.admin_record_operation(p_id uuid,p_actor uuid,p_entity_kind text,p_entity_id text,p_action text,p_note text,p_expected_revision bigint)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare existing public.admin_operation_events; current_revision bigint; result public.admin_operation_events;
begin
  if p_id is null or p_actor is null or p_entity_kind is null or p_entity_id is null or p_action is null or p_note is null or p_expected_revision is null or p_entity_kind not in ('order','pod') or p_action not in ('note','flag','resolve','archive','restore') or p_entity_id !~ '^[a-zA-Z0-9_-]{1,100}$' or char_length(btrim(p_note)) not between 1 and 1000 or p_expected_revision < 0 then
    raise exception 'OP_INVALID';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_entity_kind || ':' || p_entity_id,0));
  select * into existing from public.admin_operation_events where id=p_id;
  if found then
    if existing.actor_id=p_actor and existing.entity_kind=p_entity_kind and existing.entity_id=p_entity_id and existing.action=p_action and existing.note=btrim(p_note) then return to_jsonb(existing); end if;
    raise exception 'OP_CONFLICT';
  end if;
  if p_entity_kind='order' then
    perform 1 from public.orders where id::text=p_entity_id;
  else
    perform 1 from public.pods where id::text=p_entity_id;
  end if;
  if not found then raise exception 'OP_NOT_FOUND'; end if;
  select coalesce(max(sequence),0) into current_revision from public.admin_operation_events where entity_kind=p_entity_kind and entity_id=p_entity_id;
  if current_revision<>p_expected_revision then raise exception 'OP_CONFLICT'; end if;
  insert into public.admin_operation_events(id,actor_id,entity_kind,entity_id,action,note)
  values(p_id,p_actor,p_entity_kind,p_entity_id,p_action,btrim(p_note)) returning * into result;
  return to_jsonb(result);
end;
$$;
revoke all on function public.admin_record_operation(uuid,uuid,text,text,text,text,bigint) from public,anon,authenticated,service_role;
grant execute on function public.admin_record_operation(uuid,uuid,text,text,text,text,bigint) to service_role;
commit;
