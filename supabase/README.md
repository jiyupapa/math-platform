# supabase/ — 백엔드 P0 (진도 크로스기기 저장)

이 폴더 = 진도 백엔드의 **DB 정의 단일 소스**. 인증 방식은 **경로 B**(이메일+비밀번호 · 이메일 확인 OFF ·
`@solideos.com`만 등록 · 메일 발송 없음). 앱은 로그인해야만 동기화하고, **비로그인은 지금처럼 localStorage만** 쓴다.

- 설계: `../docs/todo_supabase백엔드_260715.md`
- 처음 사용자용 클릭 가이드: `../docs/supabase_설정가이드_260715.md`

---

## P0 체크리스트

### ① 콘솔에서만 가능 (SQL로 안 됨) — **직접 해야 함**
Supabase 대시보드 → **Authentication**:
- [ ] **Providers → Email** = Enabled, **"Confirm email" OFF** (경로 B 핵심)
- [ ] **"Allow new users to sign up"** = ON
- [ ] (선택) 비밀번호 최소 길이 설정

### ② DB 정의 — `schema.sql` 적용
도메인 잠금 트리거 + 테이블(`progress`/`reviews`/`kv`) + RLS. 둘 중 하나로:
- [ ] **SQL Editor**: `schema.sql` 전체 붙여넣고 Run, 또는
- [ ] **CLI**: `supabase link --project-ref <ref>` 후 `supabase db push`

`schema.sql`은 재실행 안전(idempotent)이라 여러 번 돌려도 됨.

> **P3 도입 대시보드**: `schema.sql`에 `adoption_stats()` 집계 함수(security definer·익명 집계만)가 포함됨.
> 이미 P0를 돌린 뒤라면 `schema.sql`을 **한 번 더 Run**하면 이 함수가 배포된다 → 포털 `/adoption`(로그인 시 헤더 "도입 현황")에서 집계가 뜬다.

### ③ 접속 정보 확보
- [ ] Project Settings → API 에서 **Project URL**·**anon public key** 복사 → `../.env.example` 참고해 각 앱 `.env` 에 (P1/P2 때)
- [ ] `service_role` key는 **절대 노출·커밋 금지** (이 프로젝트는 안 씀)

### ④ 검증
- [ ] Authentication → Users → Add user 로 `test@gmail.com` → **거부**되면 트리거 정상
- [ ] `test@solideos.com` → **통과**되면 정상 (테스트 유저는 삭제)
- [ ] Table Editor 에서 세 테이블 보이고 RLS **Enabled** 인지 확인

---

## 다음 단계
P0(콘솔+DB) 완료 후 → **P1**: `packages/store`(@series/store) 스캐폴드(동작 불변, env 미설정 시 현재와 동일)
→ **P2**: 포털 로그인 UI + 스토어 동기화 연동. (자세한 롤아웃은 설계 노트 §12)
