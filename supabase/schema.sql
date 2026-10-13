-- Supabase 스키마 — 진도 크로스기기 저장 (경로 B: 이메일+비번·확인 OFF·@solideos.com)
-- 적용:
--   A) 대시보드 → SQL Editor 에 이 파일 전체를 붙여넣고 Run, 또는
--   B) Supabase CLI:  supabase db push   (supabase link 후)
-- 재실행 안전(idempotent) — 여러 번 돌려도 에러 없이 같은 상태.
-- 설계: docs/todo_supabase백엔드_260715.md · 콘솔 절차: docs/supabase_설정가이드_260715.md

-- ─────────────────────────────────────────────────────────────
-- 1) @solideos.com 도메인만 가입 허용 (서버 차단 — API 직접 호출해도 막힘)
--    Confirm email OFF(경로 B — 사내 SMTP 불가)라 메일함 소유 증명은 없다. 즉 도메인
--    문자열만 맞으면 누구나 가입할 수 있는데, 이는 **수용한 위험**이다(2026-07-19 결정):
--    주석 데이터가 익명·저민감이고, 관리자 권한은 admins 테이블 + 가입완료 가드(§6)로
--    별도 보호되므로 도메인 검사로 충분하다. 가입 허용목록(allowed_emails)을 잠깐
--    도입했다가 같은 날 제거 — 직원 명단 관리 부담 대비 실익 없음. 다시 필요해지면
--    git 이력(7eaa63e)의 §1 참조.
-- ─────────────────────────────────────────────────────────────
create or replace function public.enforce_email_domain()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null or lower(new.email) not like '%@solideos.com' then
    raise exception 'solideos.com 계정만 등록할 수 있습니다';
  end if;
  return new;
end $$;

-- 허용목록 제거 이관 — 잠깐 존재했던 배포분 정리(신규 설치엔 애초에 없음).
drop table if exists public.allowed_emails;

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
--      · 아래 admins 테이블 = **진짜 경계**(RLS 가 이걸 본다. API 직접 호출도 막힘)
--      · 루트 .env 의 VITE_ADMIN_EMAILS = **UI 표시용**(답변 폼·큐 메뉴를 그릴지만 결정)
--    env 만 고치고 DB 를 안 고치면 화면엔 폼이 보여도 저장이 거부된다(안전한 방향).
--
--    ⚠️ 관리자 목록은 **스키마가 아니라 설정값**이다 → 함수 본문에 하드코딩하지 않는다.
--    하드코딩하면 이 파일을 다시 Run 할 때마다 지정한 관리자가 템플릿으로 되돌아간다
--    (2026-07-18 실제로 두 번 리셋됨). 그래서 테이블에 두고, 파일 재실행은 테이블을 건드리지 않는다.
-- ─────────────────────────────────────────────────────────────

-- 관리자(강사) 명단. create table if not exists 라 **재실행해도 내용이 보존된다.**
create table if not exists public.admins (
  email      text        primary key,
  created_at timestamptz not null default now()
);

-- 명단 자체는 비공개 — RLS 를 켜고 정책을 하나도 만들지 않는다(= API 로는 아무도 못 읽음).
-- 조회는 아래 security definer 함수만 가능하다.
alter table public.admins enable row level security;
revoke all on table public.admins from anon, authenticated;

-- 1회 이관 — 예전(하드코딩) 버전에서 올라오는 경우, 명단이 비어 있을 때만 값을 옮긴다.
-- 재실행 시엔 명단이 차 있어 건너뛰고, 관리자를 전부 지운 뒤 재실행해도 되살아나지 않는다
-- (그때는 새 admin_emails() 가 빈 테이블을 읽으므로 옮길 값이 없다).
do $$
declare old_list text[];
begin
  if not exists (select 1 from public.admins)
     and to_regprocedure('public.admin_emails()') is not null then
    begin
      execute 'select public.admin_emails()' into old_list;
      insert into public.admins(email)
      select distinct lower(e)
      from unnest(coalesce(old_list, '{}'::text[])) as e
      where lower(e) <> 'admin@solideos.com'   -- 템플릿 플레이스홀더는 이관하지 않는다
      on conflict do nothing;
    exception when others then
      null;  -- 옛 함수 시그니처가 다르면 조용히 건너뜀(신규 설치 경로)
    end;
  end if;
end $$;

-- 읽기 인터페이스는 그대로 유지(is_admin·RLS·클라이언트 계약 무변경) — 저장 위치만 테이블로.
-- security definer: 위에서 RLS 를 전면 거부해 뒀으므로 이 함수만 명단을 읽을 수 있다.
-- ⚠️ 노출 주의: 이 함수는 authenticated 전원이 직접 호출할 수 있다(is_admin 이 아래에서 이걸 쓰기 때문).
--    즉 로그인한 @solideos.com 사용자는 select public.admin_emails() 로 **관리자 목록을 읽을 수 있다.**
--    관리자 이메일은 클라이언트 번들 VITE_ADMIN_EMAILS 에도 들어 있어 비밀이 아니므로 수용 가능한 노출이다.
--    완전히 감추려면(선택, DB 에서 검증 후 적용): is_admin 을 security definer 로 바꿔 admins 를 직접 읽고
--    (아래 주석 참조) admin_emails 의 authenticated 실행 권한을 회수한다 — 그러면 목록 반환 경로가 사라진다.
create or replace function public.admin_emails()
returns text[]
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(array_agg(lower(email)), array[]::text[]) from admins
$$;
revoke all on function public.admin_emails() from public, anon;
grant execute on function public.admin_emails() to authenticated;

create or replace function public.is_admin()
returns boolean language sql stable set search_path = public as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = any (public.admin_emails())
$$;
-- 목록 노출을 없애는 하드닝(선택 — DB 에서 검증 후 위 두 줄을 대체):
--   create or replace function public.is_admin()
--   returns boolean language sql stable security definer set search_path = public as $$
--     select exists (select 1 from public.admins
--                    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
--   $$;
--   revoke execute on function public.admin_emails() from authenticated;   -- is_admin 이 더는 안 씀

-- 관리자 추가·삭제는 이 두 줄로 (SQL Editor 에서 실행 — 파일 재실행과 무관하게 유지된다):
--   insert into public.admins(email) values ('hong@solideos.com') on conflict do nothing;
--   delete from public.admins where email = 'hong@solideos.com';
-- ⚠️ 등록 순서: 대상자가 **가입을 마친 뒤** 넣는다 — 아래 가드가 미가입 주소를 거부한다.
--    왜: "Confirm email OFF" 라 이메일 소유 증명이 없다. 미가입 주소를 먼저 명단에 올려두면
--    그 주소를 선점 가입한 사람이 그대로 관리자가 된다. 넣기 전에 대시보드 auth.users 에서
--    본인 계정이 맞는지(가입 시각 등) 확인할 것.

create or replace function public.require_registered_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from auth.users where lower(email) = lower(new.email)) then
    raise exception '가입을 마친 계정만 관리자로 지정할 수 있습니다: %', new.email;
  end if;
  new.email := lower(new.email);
  return new;
end $$;

drop trigger if exists require_registered_admin on public.admins;
create trigger require_registered_admin
  before insert on public.admins
  for each row execute function public.require_registered_admin();

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

-- ─────────────────────────────────────────────────────────────
-- 7) 협업 주석 데이터 위생 + 수정 가드 (시큐어코딩 점검 2026-07-19)
--    ① 위치 칼럼 서버측 제약 — 클라이언트는 정상값만 보내지만 anon key 가 공개라
--       직접 API 호출로 임의 문자열을 넣을 수 있다(렌더링은 전부 이스케이프돼 XSS 는
--       아니고 데이터 위생 문제). 현 최장 앵커 21자 — 상한은 여유 있게.
--    ② edit_own(RLS)은 칼럼 단위를 못 가린다 → 본인 행이면 위치·resolved 도 직접 API 로
--       바꿀 수 있었다. 트리거로 좁힌다: 위치·종류·작성자·작성시각은 생성 후 불변
--       (수정 대상은 body·ai_answer·updated_at 뿐), resolved 는 관리자만
--       (set_resolved RPC 의 update 도 이 트리거를 지난다 — is_admin 검사가 일관됨).
-- ─────────────────────────────────────────────────────────────
alter table public.annotations drop constraint if exists annotations_part_chk;
alter table public.annotations add constraint annotations_part_chk
  check (part between 1 and 32);                      -- 현재 1~12부 + 확장 여유
alter table public.annotations drop constraint if exists annotations_chapter_chk;
alter table public.annotations add constraint annotations_chapter_chk
  check (char_length(chapter) between 1 and 32);      -- 예: 'ch6' · 'warmup'
alter table public.annotations drop constraint if exists annotations_item_chk;
alter table public.annotations add constraint annotations_item_chk
  check (char_length(item_id) between 1 and 80);      -- 앵커 정본 {chapter}-{type}-{slug}

create or replace function public.guard_annotation_update()
returns trigger
language plpgsql
as $$
begin
  if new.part          is distinct from old.part
     or new.chapter    is distinct from old.chapter
     or new.item_id    is distinct from old.item_id
     or new.kind       is distinct from old.kind
     or new.user_id    is distinct from old.user_id
     or new.created_at is distinct from old.created_at then
    raise exception '주석의 위치·종류·작성자는 수정할 수 없습니다';
  end if;
  if new.resolved is distinct from old.resolved and not public.is_admin() then
    raise exception '해결 처리는 관리자만 할 수 있습니다';
  end if;
  return new;
end $$;

drop trigger if exists guard_annotation_update on public.annotations;
create trigger guard_annotation_update
  before update on public.annotations
  for each row execute function public.guard_annotation_update();
