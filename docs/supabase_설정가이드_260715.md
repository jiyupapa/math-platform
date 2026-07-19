# Supabase 설정 가이드 (처음 사용자용 · 경로 B)

작성: 2026-07-15 · 대상: Supabase를 한 번도 안 써본 상태에서 이 프로젝트 백엔드를 준비하기.
설계 배경·결정은 `docs/todo_supabase백엔드_260715.md` 참고.

> **이 가이드의 끝 상태**: `@solideos.com`만 가입되는, 이메일+비밀번호(메일 발송 없음) 인증과
> 진도 저장용 테이블·보안(RLS)이 준비된 Supabase 프로젝트 하나. **소요 15~20분, 무료.**
>
> ⚠️ Supabase 화면(UI)은 종종 바뀝니다. 메뉴 이름이 조금 달라도 **여기 적힌 키워드로 찾으면** 됩니다.

---

## 0. 준비물

- 이메일 (또는 GitHub 계정) 하나
- 카드 등록 **불필요** (무료 플랜)

---

## 1. 계정 가입

1. 브라우저에서 **https://supabase.com** 접속 → 오른쪽 위 **"Start your project"**(또는 "Sign in") 클릭.
2. 가입 방법 선택:
   - **GitHub로 계속** (가장 간편), 또는
   - **이메일로 가입** — 이메일·비밀번호 입력 → 인증 메일 클릭.
3. 로그인되면 **대시보드**(dashboard)로 들어갑니다.

---

## 2. 프로젝트 생성

1. **"New project"** 클릭. (처음이면 먼저 **Organization** 하나 만들라고 함 → 이름 아무거나, 예: `solideos`, 플랜 **Free** 선택.)
2. 입력 항목:
   | 항목 | 입력 | 주의 |
   |---|---|---|
   | **Name** | `math-platform` (아무거나) | |
   | **Database Password** | 강한 비밀번호 생성 | ⚠️ **꼭 따로 저장**. DB 직접 접속 시 필요, 분실 시 재설정 번거로움 |
   | **Region** | **Northeast Asia (Seoul)** | 사용자와 가까울수록 빠름 (없으면 Tokyo) |
   | **Plan** | **Free** | |
3. **"Create new project"** → 프로비저닝에 **1~2분** 걸립니다. (커피 한 모금)

---

## 3. 접속 정보 확보 (URL · anon key)

앱이 Supabase에 연결할 때 쓰는 값 두 개입니다.

1. 왼쪽 메뉴 맨 아래 **Project Settings**(톱니바퀴) → **API** (또는 "API Keys").
2. 아래 두 값을 **복사해 안전한 곳에 메모**:
   - **Project URL** — 예: `https://abcxyz.supabase.co`  → 나중에 `VITE_SUPABASE_URL`
   - **anon public** key (긴 문자열) → 나중에 `VITE_SUPABASE_ANON_KEY`
3. ⚠️ 같은 화면의 **`service_role` key는 "관리자 만능키"** — **절대 프론트엔드·git·공유에 넣지 마세요.** (이 프로젝트에선 안 씀.)

> anon key는 공개돼도 안전합니다(보안은 뒤의 RLS·트리거가 담당). 하지만 service_role은 절대 노출 금지.

---

## 4. 인증 설정 (경로 B — 메일 발송 없음)

왼쪽 메뉴 **Authentication** 으로 이동.

### 4-1. 이메일 로그인 켜기 + 확인메일 끄기 (핵심)
1. **Authentication → Providers** (또는 "Sign In / Providers") → **Email** 클릭.
2. **Email** provider **Enabled(켜짐)** 확인.
3. **"Confirm email"**(또는 "Enable email confirmations") 토글을 **OFF(끄기)**.
   → 이게 경로 B의 핵심. 이메일을 **한 통도 안 보내고**, 가입 즉시 로그인됩니다. (브리티/SMTP 무관)
4. 저장(Save).

### 4-2. 자율 가입 허용
- **Authentication → Sign In / Providers** (또는 "Settings")에서 **"Allow new users to sign up"** 이 **ON** 인지 확인.
  (꺼져 있으면 아무도 가입 못 함.)

### 4-3. 비밀번호 정책 (선택)
- **Authentication → Settings**(또는 Policies)에서 **최소 비밀번호 길이**를 6~8 이상으로.

> 매직링크·비밀번호 재설정 메일은 지금 **안 씁니다**(경로 B). 나중에 SMTP가 준비되면 켤 수 있어요.

---

## 5. 데이터베이스 준비 (SQL 한 번 실행)

여기서 **① 도메인 잠금(@solideos.com) ② 진도 테이블 ③ 보안(RLS)** 을 한 번에 만듭니다.

1. 왼쪽 메뉴 **SQL Editor** → **"New query"**.
2. 아래 전체를 **붙여넣고** 오른쪽 아래 **"Run"**(또는 Ctrl+Enter).

```sql
-- ① @solideos.com 만 가입 허용 (서버 차단 — 우회 불가)
create or replace function public.enforce_email_domain()
returns trigger language plpgsql security definer as $$
begin
  if new.email is null or lower(new.email) not like '%@solideos.com' then
    raise exception 'solideos.com 계정만 등록할 수 있습니다';
  end if;
  return new;
end $$;

create trigger enforce_email_domain
  before insert on auth.users
  for each row execute function public.enforce_email_domain();

-- ② 진도·복습·기타 저장 테이블
create table progress (
  user_id uuid references auth.users on delete cascade,
  part smallint, slug text, completed_at timestamptz default now(),
  primary key (user_id, part, slug));

create table reviews (
  user_id uuid references auth.users on delete cascade,
  part smallint, item_id text, chapter text, label text,
  created_at timestamptz default now(),
  primary key (user_id, part, item_id));

create table kv (
  user_id uuid references auth.users on delete cascade,
  key text, value jsonb, updated_at timestamptz default now(),
  primary key (user_id, key));

-- ③ RLS — 로그인한 본인 행만 읽기/쓰기 (보안 핵심)
alter table progress enable row level security;
alter table reviews  enable row level security;
alter table kv       enable row level security;
create policy own on progress for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy own on reviews  for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy own on kv       for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
```

3. **"Success. No rows returned"** 이 나오면 성공.
4. 왼쪽 **Table Editor** 로 가면 `progress`·`reviews`·`kv` 테이블이 보입니다.

---

## 6. 동작 확인 (도메인 잠금 테스트)

콘솔에서 바로 검증할 수 있습니다.

1. **Authentication → Users → "Add user"**(또는 "Invite"/"Create new user") 클릭.
2. **막히는지 테스트**: 이메일 `test@gmail.com`, 비밀번호 아무거나 → 생성 시도 →
   **"solideos.com 계정만 등록할 수 있습니다" 에러로 거부**되면 정상. ✅
3. **통과 테스트**: 이메일 `test@solideos.com` → **생성 성공**하면 정상. ✅
4. 확인 끝났으면 그 테스트 유저는 삭제해도 됩니다.

> 만약 콘솔 "Add user"가 트리거를 안 거치는 것처럼 보이면, 나중에 앱 회원가입 폼에서 최종 확인하면 됩니다(앱 가입도 같은 `auth.users`에 들어가 트리거가 작동).

---

## 7. 이 값들을 어디에 쓰나 (다음 구현 단계 연결)

지금까지로 **백엔드 준비는 끝**입니다. 앱에 붙이는 건 다음 구현(P1/P2) 때이며, 3절에서 메모한 두 값을
각 앱 빌드에 환경변수로 넣습니다 (`VITE_OLLAMA_URL`과 같은 방식):

```
VITE_SUPABASE_URL=https://abcxyz.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```

- 미설정이면 앱은 **지금처럼 localStorage만** 씁니다(백엔드 OFF). 값이 있으면 로그인·동기화 활성.
- `.env` 파일은 **git에 커밋하지 않도록** `.gitignore`에 `.env`를 추가합니다(anon key는 공개 안전하지만 습관상).

---

## 8. 보안 체크리스트

- [ ] `service_role` key는 **어디에도 노출 금지** (프론트·git·채팅). 이 프로젝트는 anon key만 씀.
- [ ] DB Password는 별도 보관.
- [ ] RLS가 세 테이블 모두 **Enabled**인지 Table Editor에서 확인 (RLS 꺼지면 남의 데이터도 보임).
- [ ] `.env`는 커밋 안 함.
- [ ] (권장) **가입 허용목록** `public.allowed_emails` 에 직원 이메일 적재(`supabase/schema.sql` §1).
      비워두면 @solideos.com **문자열만** 검사한다 — 확인메일 OFF(경로 B)라 메일함 소유 증명이
      없어서, 외부인이 미사용 사내 주소로 가입해 공유 주석을 읽을 수 있다.
- [ ] 관리자 등록(`public.admins`)은 대상자가 **가입을 마친 뒤**에 — 미가입 주소는 가드 트리거가
      거부한다(주소 선점 가입에 의한 관리자 탈취 방지, `schema.sql` §6).

---

## 9. 알아둘 점 / 자주 막히는 곳

- **무료 플랜 자동 일시정지**: 프로젝트가 **7일간 요청이 없으면 일시정지(pause)** 됩니다. 대시보드에서
  "Restore"로 즉시 복구. 파일럿 중엔 트래픽이 있어 문제 없음.
- 무료 한도: DB 500MB · 월 활성유저(MAU) 50,000 — 사내 규모엔 충분(사실상 ₩0).
- "Confirm email"을 못 끄면: Providers→Email 안이 아니라 Authentication→Settings/Policies 쪽에 있을 수 있음. "confirm" 키워드로 찾기.
- SQL 재실행 에러(`already exists`): 이미 만든 것 → 무시하거나, 문제 시 해당 테이블/트리거를
  `drop` 후 다시 실행.

---

## 10. 완료 기준 (체크)

- [ ] 프로젝트 생성됨, URL·anon key 메모함
- [ ] Email 로그인 ON · **Confirm email OFF** · signup ON
- [ ] SQL 실행 성공 → `progress`·`reviews`·`kv` 테이블 보임, RLS Enabled
- [ ] `@gmail.com` 거부 / `@solideos.com` 통과 테스트 OK

여기까지 되면 **P0(콘솔+DB) 완료** 상태입니다. 다음은 `@series/store` 스캐폴드(P1) →
포털 로그인 UI(P2) 순으로, 위에서 메모한 URL·anon key를 앱에 주입해 연결합니다.
