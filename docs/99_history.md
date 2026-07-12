# 플랫폼 작업 이력 (MATH_PLATFORM)

> **모노레포·플랫폼 레벨** 작업 이력(전략·구조·인프라). 최신이 위로.
> **부별 콘텐츠 이력은 각 부의 `apps/partN/docs/99_history.md`** 에 따로 둔다(예: 챕터 추가는 거기).
> 전략 상세·근거는 같은 폴더 `TODO_260708.md`.

---

## 2026-07-12

### ✅ 개인화 2층 실검증 — 포털↔각 부 localStorage 통합, 조립본에서 확정
전략(①-상세)의 2층 — "포털이 각 부의 학습 데이터를 직접 읽는다" — 를 실제 배포 형태
(`deploy:build` 전 10앱 재조립 → `deploy:serve` 단일 origin)에서 **headless Edge E2E
16항목으로 자동 검증, 전부 통과.**
- 시나리오: 대조군(기록 없음 → 배지·카드 없음, "여기서 시작") → `/part1/` 에서
  `la`(1부 ch1~6)·`tf`(4부 ch1·2·11)·`num`(9부 ch1·2)·`stat-review`(북마크 2건) 기록 →
  포털(`/`)이 읽어 표시.
- 확인된 것: 지도 카드 **진도 배지**(단계1 6/6 · 단계3 2/11 · 단계5 1/1 — `readStepProgress`
  의 쪼갠 단계(4부 추론/학습편) 정확 계산, 9부 신설 편입 포함, 단계8 심화는 미완이라 배지
  없음) · **다음 목적지**(완료 단계 건너뛰고 "이어서 학습 · 3부 전반") · **복습 먼저** 카드
  (3부 2건 + 미리보기 + `/part3/review` 링크) · **심화 해금** 카드(1부 필수 완주 → 6챕터) ·
  역방향(부 앱도 같은 키를 읽음) · 콘솔 에러 0.
- 당초 "헤드리스 브라우저 부재 → `deploy:serve` 수동 확인"으로 남겨둔 항목(2026-07-09) —
  9부 제작에서 구축한 playwright-core + Edge E2E 체계로 자동화. 스크립트는
  **`scripts/verify-layer2.mjs`** 로 영속화(사용법 헤더 포함 — 포털·useProgress 수정 후
  회귀 확인용, playwright-core 는 `npm i --no-save` 임시 설치). **티어 1 잔여 인프라 항목
  해소, 포털 데모 서사("AI 강사가 내 진도를 안다")의 마지막 미검증 구간 닫힘.**

## 2026-07-09

### 🔧 포털 타입체크 붙임 — 5부와 빌드 표준 통일
다른 세션 점검에서 포털만 build 가 `vite build`(타입체크 없음)인 게 지적됨 — 트라이얼 스캐폴드라 의도적이었으나, 포털이 곧 진단·추천 엔진(가장 중요한 앱)이 되므로 표준으로 승격. part1 구성을 이식: `tsconfig.json`/`tsconfig.app.json`/`tsconfig.node.json` + `src/vite-env.d.ts`(.vue 선언) 추가, build 를 **`vue-tsc -b && vite build`** 로, devDeps 에 typescript·vue-tsc·@types/node, vite.config 에 `@` alias. 전 6앱 빌드 통과 확인.

### 📁 전략 docs 일원화 — 플랫폼 레벨 `docs/` 로
`TODO_260708.md`(해커톤 출품 전략)를 `apps/part1/docs/` → **`docs/`** 로 이동(플랫폼 전략인데 part1 하위에 묻혀 있던 것). 이 `docs/99_history.md` 신설(플랫폼 이력). 나머지 해커톤 제출물·발표자료(`10_spec`·`11_pitch_deck`·`12_metrics`·`13_demo_script`·`14_*`·`presentation_*`·데모 영상)는 아직 `apps/part1/docs/` 에 있음(전략 §5 "제출물 개정" 때 정리 예정). 원본 `C:\STUDY\MATH` 트리는 얼어붙은 백업 — 손대지 않음.

### 🧹 정리 — 골든카피/드리프트 체제 폐기 (커밋 `be96deb`)
공유 패키지가 드리프트를 원천 제거하므로 옛 장치 정리: `check_drift.py` 제거, 루트+5부 `CLAUDE.md` 6개를 모노레포 방식으로 전면 갱신(골든카피 섹션 → `packages/ui`, `cd web` → `npm -w apps/partN/web`, 부별 venv → 루트 공용 venv).

### 📓 노트북 검증 — 공용 venv (커밋 `ebd1569`)
루트 공용 venv 하나(`.venv`, 커널 `math-platform`) + 루트 `requirements.txt`(5부 합집합)로 전 61개 노트북 실행 → **60 통과**. `ch08_pca.ipynb` 잠복 버그 수정(대칭행렬에 `eig`→`eigh` — 복소수가 matplotlib `plt.arrow` 에서 TypeError). `수포자를_위한_선형대수학.ipynb` 1개만 `sentence-transformers` 별도 필요(문서화). 상세 `docs/TESTING.md`.

### 🌐 웹 런타임 스모크 — headless Chrome
시스템 Chrome을 puppeteer-core로 헤드리스 구동, part1·portal 을 `vite preview` 로 띄워 검증. 앱 부팅 OK, MathBlock(KaTeX)·ConceptCard(Tailwind `@source` 배경색) 런타임 렌더 확인, **ReviewFlag 클릭 → `la-review-v1` 기록**으로 provide/inject 결합해제가 런타임에도 동작 + 접두사 보존 확인. 콘솔 에러는 favicon 404(무해) 1건.

### 🏗️ 모노레포 전환 — 독립 5부 → npm workspaces (커밋 `b3e3a00`→`71c1aff`→`deaed16`→`b0ee776`)
독립 저장소 5벌 + 골든카피 복제 구조를 **하나의 모노레포**로 통합. 원본 `C:\STUDY\MATH` 를 소스만 복사(.git·node_modules·.venv·dist 제외)해 `C:\STUDY\MATH_PLATFORM` 신설, `git init`.
- 구조: `apps/part1..5`(재배치) + `apps/portal`(신규 스캐폴드) + `packages/ui`(@series/ui) + npm workspaces.
- 공용 컴포넌트 11종을 `packages/ui` 로 추출, 앱전용 결합은 **provide/inject** 로 분리(`storagePrefixKey`·`reviewApiKey`·`notebookResolverKey`). 각 앱 `main.ts` 가 자기 접두사(la/diff/stat/tf/it)·스토어·chapters 주입.
- 소스 `.vue` 패키지 소비: `optimizeDeps.exclude:['@series/ui']` + Tailwind `@source`. localStorage 접두사 전부 보존.
- 검증: 전 5부+포털 빌드(vue-tsc+vite) 통과.

### ✅ 전략 확정 — 플랫폼 방향 → 모노레포 채택
"인증·유저 관리를 갖춘 실제 플랫폼인가?"에 사용자가 **예**로 확정 → 저장소는 모노레포로 결정(그 전 "독립 repo" → "모노레포 이월" → "지금 채택" → "재보류"의 반전 끝). 기술적 뿌리 = localStorage 는 계정처럼 기기 넘어 진도를 못 따라옴(문제 C) → 백엔드 필요 → 모노레포. 타임라인 분리: 구조는 지금, 백엔드는 필요할 때, 해커톤 데모는 정적 버전 그대로. 상세 = `TODO_260708.md`.
