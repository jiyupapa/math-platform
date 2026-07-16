-- Supabase 스키마 — 진도 크로스기기 저장 (경로 B: 이메일+비번·확인 OFF·@solideos.com)
-- 적용:
--   A) 대시보드 → SQL Editor 에 이 파일 전체를 붙여넣고 Run, 또는
--   B) Supabase CLI:  supabase db push   (supabase link 후)
-- 재실행 안전(idempotent) — 여러 번 돌려도 에러 없이 같은 상태.
-- 설계: docs/todo_supabase백엔드_260715.md · 콘솔 절차: docs/supabase_설정가이드_260715.md

-- ─────────────────────────────────────────────────────────────
-- 1) @solideos.com 도메인만 가입 허용 (서버 차단 — API 직접 호출해도 막힘)
-- ─────────────────────────────────────────────────────────────
create or replace function public.enforce_email_domain()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.email is null or lower(new.email) not like '%@solideos.com' then
    raise exception 'solideos.com 계정만 등록할 수 있습니다';
  end if;
  return new;
end $$;

drop trigger if exists enforce_email_domain on auth.users;
create trigger enforce_email_domain
  before insert on auth.users
  for each row execute function public.enforce_email_domain();

-- ─────────────────────────────────────────────────────────────
-- 2) 저장 테이블 (진도 = 행당 완료 챕터 · 복습 · 기타 blob)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.progress (
  user_id      uuid        not null references auth.users on delete cascade,
  part         smallint    not null,
  slug         text        not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, part, slug)
);

create table if not exists public.reviews (
  user_id    uuid        not null references auth.users on delete cascade,
  part       smallint    not null,
  item_id    text        not null,   -- 섹션 앵커 id, 예: 'ch2-s4'
  chapter    text        not null,   -- 예: 'ch2'
  label      text        not null,
  created_at timestamptz not null default now(),
  primary key (user_id, part, item_id)
);

create table if not exists public.kv (
  user_id    uuid        not null references auth.users on delete cascade,
  key        text        not null,   -- 예: 'hub-diagnosis-v1', QuizSet 상세 키
  value      jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- ─────────────────────────────────────────────────────────────
-- 3) RLS — 로그인한 본인 행만 읽기/쓰기 (보안 backbone)
-- ─────────────────────────────────────────────────────────────
alter table public.progress enable row level security;
alter table public.reviews  enable row level security;
alter table public.kv       enable row level security;

drop policy if exists own on public.progress;
drop policy if exists own on public.reviews;
drop policy if exists own on public.kv;

create policy own on public.progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy own on public.reviews  for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy own on public.kv       for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 4) 도입 대시보드용 집계 (P3)
--    RLS 는 본인 행만 읽게 하므로, 전체 집계는 security definer 함수로만 노출한다.
--    ⚠️ 개인 식별 정보(PII) 없이 "익명 집계 수치"만 반환한다. 로그인 사용자(authenticated)만 호출 가능.
--    관리자 전용으로 좁히려면 함수 앞에 이메일 화이트리스트 검사를 넣으면 된다(주석 참고).
-- ─────────────────────────────────────────────────────────────
create or replace function public.adoption_stats()
returns jsonb
language sql
security definer
set search_path = public
as $$
  -- 관리자 전용으로 좁히려면(선택): 아래 두 줄을 함수 본문 위에 plpgsql 로 옮겨 검사.
  --   if (auth.jwt() ->> 'email') <> all (array['admin@solideos.com']) then raise exception '권한 없음'; end if;
  select jsonb_build_object(
    'total_users', (select count(distinct user_id) from progress),
    'total_completions', (select count(*) from progress),
    'per_part', coalesce((
      select jsonb_agg(jsonb_build_object('part', part, 'users', users, 'completions', completions) order by part)
      from (select part, count(distinct user_id) as users, count(*) as completions from progress group by part) a
    ), '[]'::jsonb),
    'per_chapter', coalesce((
      select jsonb_agg(jsonb_build_object('part', part, 'slug', slug, 'users', users))
      from (select part, slug, count(distinct user_id) as users from progress group by part, slug) b
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.adoption_stats() from public, anon;
grant execute on function public.adoption_stats() to authenticated;
