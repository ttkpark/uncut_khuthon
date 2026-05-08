-- users 프로필 (Supabase auth.users 확장)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email varchar(255) unique not null,
  nickname varchar(50) not null default '익명',
  created_at timestamptz default now()
);

-- works: 사용자가 등록한 작품
create table if not exists works (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  title varchar(255) not null,
  category varchar(20) not null check (category in ('book', 'lp', 'tv')),
  cover_url text,
  created_at timestamptz default now()
);

-- conversations: 작품별 대화 세션
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  work_id uuid references works(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  started_at timestamptz default now(),
  ended_at timestamptz
);

-- messages: 대화 메시지
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  role varchar(10) not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- summaries: AI 생성 독서록
create table if not exists summaries (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade unique not null,
  work_id uuid references works(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- RLS 활성화
alter table users enable row level security;
alter table works enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table summaries enable row level security;

-- RLS 정책
create policy "users_self" on users for all using (auth.uid() = id);
create policy "works_owner" on works for all using (auth.uid() = user_id);
create policy "conversations_owner" on conversations for all using (auth.uid() = user_id);
create policy "messages_owner" on messages for all
  using (conversation_id in (select id from conversations where user_id = auth.uid()));
create policy "summaries_owner" on summaries for all
  using (conversation_id in (select id from conversations where user_id = auth.uid()));

-- 신규 가입 시 users 행 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, nickname)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
