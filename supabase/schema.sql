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

-- ─────────────────────────────────────────────────────────────
-- 5) 협업 주석 (메모 + 질문) — 항목별 · 공유(로그인 전원 열람) · **익명**
--    진도/복습/kv 와 달리 "본인 행만"이 아니다: 읽기는 로그인 전원, 쓰기·수정·삭제만 본인.
--    **작성자 이름을 저장하지 않는다** — 수포자가 "이런 것도 모르나" 눈치 안 보고 묻게 하려는 것.
--    화면에서 가리기만 하면 read_all 이라 동료가 API 로 이름을 그대로 읽는다 → 컬럼 자체를 없앤다.
--    남는 것은 user_id(불투명 UUID) 뿐 — RLS(본인만 수정/삭제)에 필요하고, 이름 매핑은
--    auth.users 를 볼 수 있는 관리자(대시보드)만 가능하다. 즉 동료에겐 익명, 운영자에겐 추적 가능.
--    설계: docs/todo_협업주석_260716.md §10
-- ─────────────────────────────────────────────────────────────
create table if not exists public.annotations (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users on delete cascade,
  part        smallint    not null,
  chapter     text        not null,                 -- 예: 'ch6'
  item_id     text        not null,                 -- 앵커 id, 예: 'ch6-s2'
  kind        text        not null default 'note',  -- 'note' | 'question'
  body        text        not null,
  ai_answer   text,                                 -- AI 답변(질문일 때, 사용자가 저장 시)
  resolved    boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint annotations_kind_chk check (kind in ('note', 'question')),
  constraint annotations_body_chk check (char_length(body) between 1 and 2000)
);

-- 익명화 — 이미 author_name 이 있는 기존 배포분에서 컬럼을 제거한다(신규 설치엔 애초에 없음).
-- ⚠️ 기존에 쌓인 작성자 이름은 이 시점에 사라진다(되돌릴 수 없음). 익명 전환의 핵심 단계.
alter table public.annotations drop column if exists author_name;

-- 항목별 조회(패널 열 때) · 미해결 질문 큐(P3 관리자 뷰)
create index if not exists annotations_item_idx  on public.annotations (part, chapter, item_id);
create index if not exists annotations_queue_idx on public.annotations (kind, resolved) where kind = 'question';

alter table public.annotations enable row level security;

drop policy if exists read_all  on public.annotations;
drop policy if exists write_own on public.annotations;
drop policy if exists edit_own  on public.annotations;
drop policy if exists del_own   on public.annotations;

-- 읽기 = 로그인 전원(공유) · 쓰기/수정/삭제 = 본인만.
-- 관리자 삭제(모더레이션)는 P3 에서 정책에 이메일 화이트리스트 or 를 더한다(설계노트 §7).
create policy read_all  on public.annotations for select to authenticated
  using (true);
create policy write_own on public.annotations for insert to authenticated
  with check (auth.uid() = user_id);
create policy edit_own  on public.annotations for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy del_own   on public.annotations for delete to authenticated
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 6) 협업 주석 P3 — 사람(강사) Q&A + 관리자 모더레이션
--    설계: docs/todo_협업주석_260716.md §7·§8 P3
--
--    ⚠️ 관리자 목록은 두 곳에 있다 — 같게 유지할 것:
--      · 아래 admin_emails() 배열 = **진짜 경계**(RLS 가 이걸 본다. API 직접 호출도 막힘)
--      · 루트 .env 의 VITE_ADMIN_EMAILS = **UI 표시용**(답변 폼·큐 메뉴를 그릴지만 결정)
--    env 만 고치고 SQL 을 안 고치면 화면엔 폼이 보여도 저장이 거부된다(안전한 방향).
-- ─────────────────────────────────────────────────────────────
create or replace function public.admin_emails()
returns text[] language sql immutable as $$
  select array[
    'admin@solideos.com','doskey@solideos.com'   -- ← 실제 관리자(강사) 이메일로 교체. 콤마로 여러 명 가능.
  ]
$$;

create or replace function public.is_admin()
returns boolean language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = any (public.admin_emails())
$$;

-- 질문에 대한 사람(강사) 답변 — 스레드.
-- 익명 원칙 유지: author_name 없음. 작성자는 관리자뿐이라 화면엔 "강사" 배지만 표시한다.
create table if not exists public.annotation_answers (
  id            uuid        primary key default gen_random_uuid(),
  annotation_id uuid        not null references public.annotations on delete cascade,
  user_id       uuid        not null references auth.users on delete cascade,
  body          text        not null,
  created_at    timestamptz not null default now(),
  constraint answers_body_chk check (char_length(body) between 1 and 4000)
);
create index if not exists answers_annotation_idx on public.annotation_answers (annotation_id);

alter table public.annotation_answers enable row level security;

drop policy if exists read_all_a  on public.annotation_answers;
drop policy if exists write_admin on public.annotation_answers;
drop policy if exists del_own_a   on public.annotation_answers;

-- 읽기 = 로그인 전원(질문자·동료가 답을 본다) · 쓰기 = 관리자만(§7 강사 답변) · 삭제 = 본인(=관리자)
create policy read_all_a  on public.annotation_answers for select to authenticated
  using (true);
create policy write_admin on public.annotation_answers for insert to authenticated
  with check (public.is_admin() and auth.uid() = user_id);
create policy del_own_a   on public.annotation_answers for delete to authenticated
  using (auth.uid() = user_id);

-- 모더레이션: 관리자는 남의 주석(스팸 등)을 지울 수 있다 (§7)
drop policy if exists del_admin on public.annotations;
create policy del_admin on public.annotations for delete to authenticated
  using (public.is_admin());

-- resolved 토글은 관리자 전용 + resolved 칼럼만 — 넓은 update 정책 대신 RPC 로 좁힌다
-- (update 정책은 칼럼을 못 가려서, 관리자에게 남의 글 본문 수정 권한까지 주게 된다)
create or replace function public.set_resolved(aid uuid, val boolean)
returns void language sql security definer set search_path = public as $$
  update annotations set resolved = val, updated_at = now()
  where id = aid and public.is_admin();
$$;
revoke all on function public.set_resolved(uuid, boolean) from public, anon;
grant execute on function public.set_resolved(uuid, boolean) to authenticated;
