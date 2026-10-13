# E2E — 협업 주석 회귀 스위트

**실 Supabase + 실 브라우저 + 조립 배포본**으로 검증한다. 모킹 없음 — 이 저장소의 검증 철학이
"빌드 통과"에서 멈추지 않고 실제 흐름을 몰아보는 것이기 때문이다.

대상 기능: 협업 주석(공유 메모·질문·AI 답변·강사 Q&A) — 설계는 `docs/todo_협업주석_260716.md`.

## 준비

```bash
# 1) 의존성 (루트 1회) — playwright-core 포함. 브라우저는 내려받지 않고 설치된 Edge/Chrome 을 쓴다.
npm install

# 2) 조립본 띄우기 (별도 터미널) — 포털+각 부가 한 origin 이어야 세션이 공유된다.
npm run deploy:build
PORT=4291 npm run deploy:serve
```

> ⚠️ `npm run dev` 로는 검증할 수 없다. 부마다 포트가 달라 origin 이 갈리고, 로그인 UI 는 포털에만 있다.

### 설정 (루트 `.env` — gitignore)

| 키 | 필수 | 뜻 |
|---|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | ✅ | 앱 빌드와 같은 원천 |
| `E2E_PASSWORD` | ✅ | 테스트 계정 공통 비밀번호 |
| `E2E_USER_A` / `E2E_USER_B` | | 테스트 계정 (기본 `anna@` / `annb@solideos.com`) |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | | 관리자 시나리오용 — **아래 주의** |
| `E2E_BASE` | | 조립본 주소 (기본 `http://localhost:4291`) |
| `E2E_BROWSER` | | Edge/Chrome 실행 파일 경로 (미지정 시 자동 탐색) |
| `E2E_HEADED=1` | | 브라우저를 눈으로 보며 실행 |

테스트 계정은 `@solideos.com` 도메인 트리거를 통과해야 한다(포털에서 가입).

## 실행

```bash
npm run e2e                 # 전 스위트
npm run e2e:p1              # 공유·RLS·익명
npm run e2e:p0              # 임의 항목 앵커 + 백필 복습
npm run e2e:expand          # 부 확대 + 부 격리
npm run e2e:p2              # AI 답변 (Ollama 필요 — 없으면 건너뜀)
npm run e2e:p3              # 강사 Q&A·관리자 (아래 주의)
```

## 주의 — 실수하기 쉬운 세 가지

**① 실사용 데이터를 지우지 말 것.** `part1 / ch1-s1` 에는 사용자가 실제로 남긴 메모·질문이 있다.
한 번 테스트 청소가 이걸 지웠다(백업본으로 복구). 그래서 `lib.mjs` 의 `PROTECTED_ANCHORS` 가
방어한다 — `safeDeleteAnnotations()` 는 보호 앵커를 만나면 **삭제 대신 즉시 실패**한다.
새 스위트를 쓸 때도 반드시 `safeDeleteAnnotations()` 를 쓰고, 빈 앵커(`ch1-s4` 등)를 골라라.

**② 복습 토글은 서버 동기화다.** `reviews` 테이블에 남으므로 사전 정리 없이 실행하면
매번 ON↔OFF 가 뒤집혀 단언이 한 번 걸러 실패한다(비멱등). `clearReview()` 를 먼저 부를 것.

**③ 관리자 권한은 테스트 계정에 주지 않는다.** 관리자는 실제 강사 계정 한 명으로 한정한다는
사용자 결정이 있다 — 검증 편의로 테스트 계정을 `admins` 에 넣지 말 것. 그래서 P3 스위트는
기본적으로 **차단 경로만** 검증하고, 관리자 시나리오(답변·큐·해결)는 건너뛴다.
전체를 돌리려면 `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` 를 넘기고, 평소엔 사람이 UI 로 확인한다.

## 커버리지

| 스위트 | 검증 | 비고 |
|---|---|---|
| `annotations-p1-share` | A 작성 → B 열람(공유 RLS) · 남의 글 수정/삭제/사칭 차단 · **익명**(API 로도 이름 못 얻음) · 서버 제약(kind·빈 본문·위치 불변) · 브라우저 마커/배지/패널 | |
| `annotations-p0-anchor` | 개념카드 `anchorId` 로 메모 저장 · 6부 백필 앵커로 복습 토글 → `/review` 등재 | |
| `annotations-expand` | 전 12부 마커 렌더 · **부 격리**(같은 `ch1-s1` 이라도 part 다르면 안 섞임, 양방향) · 비로그인 마커 0 | 부 번호 오주입 회귀 방지 |
| `annotations-p2-ai` | 질문 → 튜터에 항목 맥락 전달 → 답변 → **누를 때만** 저장 → 동료 열람 | Ollama 필요 |
| `annotations-p3-admin` | 일반 유저 답변/해결 차단 · (관리자 시) 큐 → 답변 → 해결 → 질문자 화면 반영 · 모더레이션 | 관리자 자격증명 선택 |

## 새 스위트를 추가할 때

`lib.mjs` 의 `reporter()` · `signIn()` · `loginPage()` · `safeDeleteAnnotations()` 를 쓰면
설정 검증·실패 메시지·집계·데이터 보호가 공짜로 딸려온다. `run-all.mjs` 의 `SUITES` 에 파일명을 더할 것.
