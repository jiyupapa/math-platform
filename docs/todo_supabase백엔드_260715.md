# TODO — Supabase 백엔드 도입 (진도 크로스기기 저장) 설계 노트

작성: 2026-07-15 · 상태: **설계 합의 단계(미구현)**

> localStorage 진도 유실(캐시삭제·다른 기기·시크릿 시 소멸)을 해결하기 위한 백엔드 도입 방안.
> 인증은 **경로 B — 이메일+비밀번호 · 이메일 확인 OFF · `@solideos.com`만 등록**으로 확정.
> 서버로 메일을 한 통도 안 보내고(브리티메일/SMTP 무관), 무마찰·비용 0·유출 최소를 지키면서
> "기기 바뀌어도 진도 따라옴"을 얻는 것이 목표.

---

## 1. 배경 — 왜 백엔드인가

현재 진도·복습·진단 결과는 전부 **localStorage**에 저장된다(각 부 `{prefix}-progress-v1`·
`{prefix}-review-v1`, 포털 `hub-diagnosis-v1` 등). `docs/TODO_260708.md`가 이미 이 한계를
구조적으로 분석해 뒀다:

- **문제 C — 기기 넘어 못 따라옴**: "폰·다른 브라우저·캐시삭제·시크릿 시 **진도 소멸**.
  localStorage = 계정이 아니라 익명 기기별 메모" → 해결책: **서버 per-user 저장** →
  "**localStorage로 해결 불가 — 구조적 천장**" (`docs/TODO_260708.md:151`)
- **문제 F — 내구성**: ~5MB 공유, Safari ITP 7일 미방문 시 삭제, 저장압박 시 축출.
  "영속 보장 없음" → 서버 저장 (`docs/TODO_260708.md:154`)

이 문서는 그 "서버 per-user 저장"을 **Supabase로 구체화**한 것이다. 스토어는 이미 교체 가능하게
설계돼 있다(`docs/hackathon/10_spec.md:148-150`).

---

## 2. 결정 요약

| 항목 | 결정 | 근거 |
|---|---|---|
| 백엔드 | **Supabase**(Postgres + Auth + RLS) | 무료 티어·RLS·즉시 API, self-host 가능 |
| 저장 모델 | **로컬 우선 + 선택 로그인** | 비로그인 = 현재와 100% 동일(유출 0 기본값) |
| 인증 방식 | **경로 B — 이메일+비밀번호, 이메일 확인 OFF** | 브리티메일/SMTP 무관·즉시 가능(§4) |
| 등록 제한 | **`@solideos.com` 도메인만** | 사내 도입, 서버 트리거로 강제(§5) |
| 게이팅 | env(`VITE_SUPABASE_URL`/`ANON_KEY`) 미설정 시 백엔드 OFF | `VITE_OLLAMA_URL`과 동일 패턴 |

---

## 3. 아키텍처 원칙 — 에토스와 충돌 없이

프로젝트 자부심(**비용 0 · 데이터 유출 0 · 무마찰**)을 지키는 3원칙:

1. **로컬 우선(local-first)** — 로그인 안 하면 순수 localStorage(현재 그대로). 로그인해야만 서버 동기화.
   → 유출 0이 *기본값*으로 유지, 무마찰 첫 체험 유지.
2. **env 게이팅** — `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` 미설정 시 백엔드 완전 비활성.
   코드 수정 없이 local↔backend 전환(`VITE_OLLAMA_URL` 선례).
3. **메타데이터만·유출 최소** — 서버로 나가는 건 "어느 챕터 완료"뿐. 학습 콘텐츠·튜터 대화는 안 나감.
   엄격하면 Supabase **self-host(Docker)**로 전부 사내 인프라화 가능.

> anon key는 **공개해도 안전**하다 — 실제 보안은 RLS(행 수준 잠금)와 도메인 트리거가 담당.

---

## 4. 인증 — 경로 B 확정 (이메일+비번, 이메일 확인 OFF)

### 왜 경로 B인가 (결정 궤적)
- 구글 워크스페이스 **미사용** → 구글 OAuth 배제.
- 사내 메일 = **삼성 브리티웍스/브리티메일**, SMTP 정보 불명 → 매직링크(메일 발송 필요)는
  도달성 확인 전엔 리스크. Microsoft/Azure OAuth·SAML도 해당 없음.
- **경로 B는 메일을 한 통도 안 보낸다** — Supabase에서 "Confirm email"을 OFF로 두면 이메일은
  로그인 ID일 뿐, 비밀번호가 열쇠. **브리티·SMTP·스팸필터를 전부 우회.**

### 흐름
- 가입: `supabase.auth.signUp({ email, password })` → 확인 OFF라 **즉시 세션**(메일 대기 없음).
- 로그인: `supabase.auth.signInWithPassword({ email, password })`.
- 세션은 리프레시 토큰으로 길게 유지 → 기기당 처음 한 번만 로그인.

### 대안 비교 (기각 사유 기록)
| 방식 | 기각 사유 |
|---|---|
| 구글 OAuth | 사내 구글 워크스페이스 미사용 |
| Microsoft/Azure OAuth | M365 미사용 |
| SAML/OIDC SSO | 전사 IdP 없음 + Supabase 유료 |
| 매직링크(이메일 OTP) | 브리티 SMTP 불명·외부발송 도달성 미확인 → **나중 업그레이드 후보**(§부록) |

---

## 5. 도메인 잠금 — `@solideos.com`만 (2겹)

- **1겹(UX)**: 클라이언트가 폼 제출 전 `@solideos.com` 검사 → 친절한 안내(경계 아님).
- **2겹(보안, 필수)**: `auth.users` 트리거가 **가입 자체를 서버에서 차단**(API 직접 호출해도 막힘).

```sql
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
```
> `%@solideos.com` 접미사 매칭이라 `x@sub.solideos.com`·`x@notsolideos.com`은 통과 못 한다(정확히 도메인 일치).
> 최신 Supabase는 `Before User Created` Auth Hook으로도 동일 처리 가능(둘 중 하나).

---

## 6. 스키마 + RLS

```sql
-- 진도: 한 행 = 한 챕터 완료 (분석 친화적)
create table progress (
  user_id uuid references auth.users on delete cascade,
  part smallint, slug text, completed_at timestamptz default now(),
  primary key (user_id, part, slug));

-- 복습 북마크 ({id, chapter, label})
create table reviews (
  user_id uuid references auth.users on delete cascade,
  part smallint, item_id text, chapter text, label text,
  created_at timestamptz default now(),
  primary key (user_id, part, item_id));

-- 기타 blob (진단결과 hub-diagnosis-v1, QuizSet 상세 등 조회 불필요)
create table kv (
  user_id uuid references auth.users on delete cascade,
  key text, value jsonb, updated_at timestamptz default now(),
  primary key (user_id, key));

-- RLS: 본인 행만 (보안 backbone)
alter table progress enable row level security;
alter table reviews  enable row level security;
alter table kv       enable row level security;
create policy own on progress for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy own on reviews  for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy own on kv       for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
```
- `part`(number)는 `useProgress.ts`의 `PART_META`(prefix↔part) 매핑. 각 앱 `main.ts`가 자기 part 주입.

---

## 7. 클라이언트 구조 — 모노레포 방식 그대로

`@series/tutor`가 Ollama 전송을 격리하듯 **`packages/store`(@series/store)** 신설:
- `supabase.ts` — env 기반 클라이언트(미설정 시 null → 로컬 폴백)
- `auth.ts` — `signUp`/`signInWithPassword`/`signOut`/세션·상태
- `syncedStore.ts` — 스토어의 `load()`/`persist()`를 대체할 어댑터(백엔드 없으면 localStorage no-op)

---

## 8. 동기화 전략 — 로컬 우선, 로그인 시 병합

1. **쓰기**: 항상 localStorage 즉시(오프라인·즉응) + 로그인 상태면 Supabase에 debounce push.
2. **로그인 시**: remote pull → local과 **병합** → push.
   - 진도 = **합집합**(챕터 완료는 취소 안 됨 → 무손실·충돌 없음)
   - 복습 = id 기준 합집합/최신우선
   - 진단 blob = `updated_at` 최신우선
3. **오프라인**: dirty 표시 → 온라인·포커스 시 flush.

→ 비로그인 무영향, 로그인 무손실 크로스기기.

---

## 9. 코드 변경점 (이 저장소)

| 위치 | 변경 |
|---|---|
| `packages/store`(신규) | Supabase 클라이언트·auth·synced 어댑터 |
| `apps/*/web/src/stores/progress.ts`·`review.ts` (12) | `load()`/`persist()` 어댑터 경유 + 로그인 시 sync |
| `apps/portal/web/src/data/useProgress.ts` | 로그인 시 각 부 localStorage 대신 **DB에서 한 번에 조회** |
| `apps/*/web/src/main.ts` (12) | Supabase 세션 초기화·provide + part 번호 주입(1줄) |
| 포털 신규 | Auth UI(가입/로그인/로그아웃), 클라 도메인 사전검증 |

> `load()`/`persist()`가 localStorage를 감싸는 유일 접점이라 교체가 깔끔하다(현 구조 확인 완료).

---

## 10. 경로 B 트레이드오프 — 정할 것

| 항목 | 상태 | 대응(결정 필요) |
|---|---|---|
| **비밀번호 재설정** | 메일 발송 없음 → self-service 불가 | ▶ **관리자 수동 리셋**(대시보드/Admin API)로 갈지 / 나중에 메일 되면 활성화 |
| **이메일 소유 미검증** | 도메인만 검사 → 동료가 남의 주소로 가입 가능성 | 신뢰 도메인이라 대개 무방. 엄격화하려면 나중에 확인메일 ON |
| **가입 개방 범위** | @solideos.com 누구나 자율가입 | 초대제로 좁힐지(운영 부담↑) |

특히 **비번 재설정 정책**만 정하면 착수 가능(권장: 초기엔 관리자 수동 리셋).

---

## 11. 공짜로 딸려오는 이득

- **문제 A·D(origin 제약) 해소** — 로그인 시 포털이 DB에서 읽으므로 `npm run dev`(포트 다름)에서도,
  부가 다른 도메인에 있어도 2층 개인화 동작. 조립본에서만 되던 제약이 로그인 유저에겐 사라짐.
- **사내 도입 대시보드** — `progress` 테이블 → `select part, count(distinct user_id) …`로
  **완주율·이탈 지점** 즉시 집계. 피치덱 파일럿 목표(`docs/hackathon/11_pitch_deck.md:59`) 충족.

---

## 12. 단계별 롤아웃

| 단계 | 내용 | 메일 필요? | 리스크 |
|---|---|---|---|
| **P0** ✅ | Supabase 콘솔 설정은 사용자, DB는 저장소(`supabase/schema.sql`·`README.md`·`.env.example`) | ❌ | 코드 0 |
| **P1** ✅ | `@series/store` 스캐폴드(클라이언트·인증·`SyncedStorage`, env 게이팅) + 포털 배선 — **동작 불변**(포털 빌드 통과) | ❌ | 낮음 |
| **P2** ✅ | **전 12부** 진도·복습 동기화(watch 기반, 스토어는 register 1줄) + 포털 Auth UI. 실 Supabase E2E 7/7(part1·part5 크로스기기 push/pull·도메인 잠금). 로그인 UI 는 포털만(세션은 같은 origin 공유) | ❌(확인 OFF) | 중 |
| **P3** ✅ | **도입 대시보드**(`adoption_stats` RPC 익명 집계 + 포털 `/adoption` KPI·완주율·이탈 펀넬, 실 Supabase 검증) **+ 개인 2층-DB-읽기**(로그인 시 포털이 내 진도를 DB 에서 하이드레이션 → 새 기기서도 지도/홈 즉시 반영, 실 Supabase 검증) | ❌ | 중 |
| P4(선택) | Realtime 탭간 동기화 / 나중에 매직링크·확인메일 업그레이드 | (그때) | 낮음 |

> **폴리시 완료(2026-07-16)**:
> - **supabase-js lazy-load** ✅ — 동적 import 로 별도 청크(~216KB) 분리. 세션 토큰이 있을 때/로그인
>   클릭 시에만 로드 → 비로그인·미설정 방문자는 안 받음. `getSupabase()` 1회 로드·캐시, auth/sync async 화.
>   실검증: 비로그인 청크 미로드 → 로그인 시 로드.
> - **진단결과(kv) 동기화** ✅ — `kvGet`/`kvSet` + `kv` 테이블(P0 배포분 재사용, 추가 SQL 없음).
>   진단 저장 시 DB 반영, 로그인 시 하이드레이션 → 다른 기기에서 맞춤 경로 복원. 실검증 완료.

---

## 13. 검증 계획

- [ ] `a@solideos.com` 가입 성공 · `a@gmail.com` **거부**(트리거) 실테스트
- [ ] 로그인 후 **다른 브라우저에서 진도 이어짐**(크로스기기)
- [ ] 비로그인 = 현재와 동일(로컬), env 미설정 빌드도 현재와 동일
- [ ] RLS: 다른 유저 데이터 조회 불가
- [ ] 병합: 로컬 진도 + 원격 진도 합집합(무손실)

---

## 14. 열린 결정

- [ ] **비밀번호 재설정 정책**: 관리자 수동 리셋(권장) vs 나중 메일 활성화
- [ ] **호스팅**: Supabase 클라우드(무료) vs 사내 self-host(유출 0 엄격)
- [ ] **가입 범위**: 도메인 자율가입(권장) vs 초대제
- [ ] 비밀번호 최소 정책(길이 등)

---

## 부록 A. SMTP는 "나중 교체"

경로 B는 메일 발송이 없어 SMTP 불필요. 향후 **매직링크·확인메일·비번재설정**을 켜고 싶으면
그때 발송 경로만 붙이면 된다(코드 변경 최소):
- 브리티/사내 SMTP 정보 확보 → Supabase Custom SMTP 입력, 또는
- 전송 서비스(Resend/SES 등) + `solideos.com` SPF/DKIM.
- ⚠️ 사내 그룹웨어(브리티)는 외부 자동메일을 스팸 격리할 수 있음 → **파일럿 실발송 테스트로 도달성 확인** 필요.

## 부록 B. 요약 한 줄
**"로컬 우선 + 선택 로그인(이메일+비번·확인 OFF·@solideos.com 트리거) + Supabase(RLS)"** —
메일 인프라를 전혀 건드리지 않고 진도 크로스기기 저장을 얻는다. 콘솔 설정 + SQL 1회 + `@series/store` +
포털 Auth UI + 스토어 12벌 연동이 전부.
