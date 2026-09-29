# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 이 저장소의 정체

"수포자를 위한 AI 수학 시리즈"를 하나로 묶은 **모노레포**(npm workspaces). 11개 부의 웹 앱 + 통합 포털 +
공용 컴포넌트 패키지가 한 git 저장소 안에 있다.

기원: 원래 1부(선형대수)만 회사 해커톤 출품 목적이었고, 5부작으로 확장된 뒤 이 모노레포로 통합됐다.
(과거엔 부마다 **독립 저장소 + 공용 컴포넌트 5벌 복제**였고 1부가 "골든 카피" 기준이었다 — 지금은
`packages/ui` 공유 패키지가 그 역할을 대체해 **복제·드리프트가 사라졌다**.) **최우선 목적은 ① 이 프로그램을
사내 임직원이 실제로 쓰게 만드는 것(도입)과 ② 사용자 본인의 수학·AI 지식을 채우는 것, 두 가지다. 사내 해커톤은
목표가 아니라 도입을 이끄는 수단·계기다.**

> **특정 부 안에서 작업할 때는 그 부의 `apps/partN/CLAUDE.md` 가 우선이다** — 콘텐츠 규칙·함정이 거기 있다.
> 이 파일은 부를 가로지르는(모노레포 구조·공용 패키지) 사항만 담는다.

## 구조

> **전체가 어떻게 이어지는지**(제작 타임라인·전환점·설계 결정·불변식·산출물 지도)는 `docs/PROCESS.md`.
> 이 파일은 "지금 작업할 때의 규칙", 그쪽은 "왜 이렇게 됐는지".

배치는 `ls`로: `apps/`(portal + part1..N — 각각 web/·notebooks/·docs/), `packages/`(ui·tutor·store).
부 목록·주제·완결 상태·시리즈 커리큘럼·추천 학습 경로(1→2→3→4→5 순서가 아님)·부 간 연결은
루트 `README.md` 가 정본.

## 명령어 (npm workspaces — 루트에서 실행)

- 검증 수단은 `npm run build`(vue-tsc 타입체크 포함). `noUnusedLocals`/`noUnusedParameters` 가 켜져 있어 미사용 변수도 에러.
- 노트북: **루트 공용 venv 하나**(`.venv`, 커널 `math-platform`). 설치·실행·검증은 `docs/TESTING.md` 3절.

## 공용 컴포넌트 — `packages/ui` (@series/ui)

공용 컴포넌트(`MathBlock`·`ConceptCard`·`DetailsCard`·`ChartView`·`NotebookCard`·`ReviewFlag`·`PartLink`·`PortalLink`·`ConceptStrip`·`SearchPalette`·`Quiz`·`StepQuiz`·`QuizSet`)와
QuizSet↔StepQuiz 그룹 계약(`quizGroupKey`/`QuizGroup` — `quizGroup.ts`)은
**`packages/ui` 한 곳에만 있다.** 앱은 `import { Quiz } from '@series/ui'` 로 소비.

- **한 번 고치면 전 부에 반영** — 복제·전파·드리프트 점검 없음(옛 골든카피/`check_drift.py` 체제는 폐기).
- **QuizSet 제목과 문항 문구(`question`)는 학습자 풀이 기록의 키다** — 저장이 `{접두사}-quizset-v1:{세트 제목}` +
  맞힌 문항 문구 그대로라, 고치면 이미 푼 기록이 끊긴다. 고쳤다면 커밋 전에 `node scripts/quiz-aliases.mjs`
  (HEAD 대비 바뀐 문구를 `packages/ui/src/quizAliases.ts` 에 옛 → 새로 추가 — QuizSet 이 읽을 때 이어 준다).
  커밋 훅이 `--check` 로 빠진 것을 막는다. 문제를 넣거나 뺀 파일은 자동으로 짝짓지 않으니 표에 직접 적을 것.
- 패키지는 **주제 중립** 유지. 앱전용 결합은 **provide/inject** 로 분리 — 각 앱 `main.ts` 가 주입:
  - `storagePrefixKey` — QuizSet 저장 접두사. part1=`la` part2=`diff` part3=`stat` part4=`tf` part5=`it` part6=`tame` part7=`emb` part8=`opt` part9=`num` part10=`scale` part11=`agent` portal=`hub`.
    **바꾸면 사용자 진도가 끊긴다.** 포털은 진단 결과 저장(`hub-diagnosis-v1`·`hub-baseline-v1`)에 쓰고,
    각 부 진도(`{prefix}-progress-v1`)를 읽어 지도에 표시하므로 부 접두사 변경은 포털 연동도 깨뜨린다.
  - `reviewApiKey` — ReviewFlag ↔ 각 앱 `review` 스토어.
  - `notebookResolverKey` — NotebookCard ↔ 각 앱 `chapters`(part1·4·5·6·7·8·9·10·11).
  - `conceptGraphKey` — `ConceptStrip`(장 상단 개념 띠)이 읽는 `concept-graph.json` URL. **미주입이면 `<base>concept-graph.json`**
    이라 12앱 main.ts 가 안 건드린다. 띠는 각 부 `App.vue` 의 `<RouterView>` 위 한 줄로 마운트되고 챕터 라우트에서만 렌더된다.
  - `partNumberKey` — **협업 주석(NoteMarker/NotePanel) 게이트**: 부 번호를 주입한 부에서만 💬 마커가
    렌더된다(**전 11부 주입 완료**). 값이 곧 Supabase `annotations.part` 라 **부 번호가 틀리면 남의 부
    메모가 섞인다** — 같은 챕터 슬러그(`ch1`)·앵커 id(`ch1-s1`)를 여러 부가 공유하므로 part 가 유일한
    구분자다. 임의 항목 앵커는 `ConceptCard`·`Quiz`·`StepQuiz`·`MathBlock` 의 `anchorId`
    prop — 네이밍 정본 `{chapter}-{type}-{slug}` 와 금지사항(자동 인덱스·배포 후 변경 금지)은
    `packages/ui/src/anchor.ts` 참조. 설계: `docs/todo_협업주석_260716.md`.
- 소스 `.vue` 패키지라 각 앱 설정에: `vite.config.ts` 의 `optimizeDeps.exclude`(전 12앱 = `['@series/ui', '@series/tutor', '@series/store']`),
  `style.css` 의 `@source '../../../../packages/ui/src'`(Tailwind 가 패키지 클래스 스캔 — 빠지면 스타일이 조용히 누락),
  `style.css` 의 `@import '../../../../packages/ui/src/base.css'`(아래 공용 CSS).
- **공용 CSS 2벌도 `packages/ui` 에 있다** — 12개 앱의 `style.css` 가 `base.css` 하나만 import 하면 딸려온다:
  - `base.css` — 읽기 열(`article > *` 46rem 가운데 정렬)·제목 위계·`focus-visible` 링·터치 타깃·`prefers-reduced-motion`.
    **레이어 밖(unlayered) 평범한 CSS 로 쓴다** — Tailwind v4 가 유틸리티를 `@layer` 에 넣으므로 레이어 밖 규칙이
    마크업에 박힌 `text-xl`·`focus:outline-none` 을 이긴다. 덕분에 129개 챕터를 안 건드리고 본문 리듬을 바꾼다.
  - `tokens.css` — **데모 색 토큰 `--c-*`.** SVG 데모·차트에서 **hex 를 직접 쓰지 말고 토큰을 쓴다**
    (`stroke="var(--c-slate-200)"`, `{ color: 'var(--c-indigo-500)' }`). SVG 표현 속성의 `var()` 는 정상 동작하고,
    Chart.js 는 canvas 라 못 읽으므로 `ChartView` 가 실제 색으로 풀어준다. 새 hex 를 박으면 다크 모드에서 그 데모만 깨진다.
  - `dark.css` — **자동 생성물**(`npm run theme:dark` = `scripts/build-dark-theme.mjs`). 직접 고치지 말 것.
    **다크 모드. `dark:` 클래스는 하나도 쓰지 않는다.** Tailwind v4 가 유틸리티를
    `.bg-white{background-color:var(--color-white)}` 처럼 변수 참조로 내보내므로, 팔레트 변수(`--color-*`)와
    데모 토큰(`--c-*`) 값만 다시 정의해 전 앱을 한 번에 뒤집는다. **마크업에 `dark:` 를 추가하지 말 것** —
    이 방식과 섞이면 어느 쪽이 이기는지 예측이 어려워진다. 색을 바꾸고 싶으면 `dark.css` 를 고친다.
    - **런타임에 색을 조립하는 곳은 안 따라온다** — 1부 ch3 히트맵 `rgb(c,c,c)`, 8부 손실지형 `hsl(...)`.
      데이터 색이라 의도적으로 그대로 두고, 그 위 글자는 안 뒤집히는 `--c-on-light`/`--c-on-dark` 를 쓴다.
  - 전환 UI 는 `ThemeToggle`(시스템/라이트/다크 순환), 상태는 `theme.ts`. 각 앱 `main.ts` 가 `initTheme()` 호출,
    첫 페인트 깜빡임은 각 `index.html` 인라인 스크립트가 막는다(localStorage 키 `series-theme-v1` — 3곳이 같아야 함).

### 글자색 최소 단계 (WCAG AA 4.5:1)

**단계를 외우지 말고 검사기를 돌린다** — `npm run check:contrast` (미달이면 exit 1, `-- --fix` 로 자동 수정).
조상 배경·`:class` 동적 바인딩까지 추적해 **라이트·다크 양쪽**을 본다. 절차·한계는 `docs/TESTING.md` 5절.
`tokens.css` 를 건드렸으면 먼저 `npm run theme:dark` → 그다음 검사(잊으면 검사기가 "dark.css 가 낡았습니다"로 멈춘다).
**커밋 훅(`githooks/pre-commit`)이 자동으로 돌려 미달이면 커밋을 막는다** — 빌드는 이걸 못 잡기 때문이다.
- **THEMED(각 앱에 유지)**: `progress`/`review` 스토어, `TutorChat.vue`(튜터 주제), `notebooks/tutor.py`.
  단 `TutorChat` 의 **협업 주석 연동('🤖 AI에게 묻기' 수신·'메모에 저장' 제안)은 공용** `useNoteAsk`·`NoteAskSave`
  (packages/ui `noteAsk.ts`) — 각 부는 창 열기·전송만 연결한다. 튜터를 새로 만들거나 고칠 때 이 연결을 빠뜨리면 그 부에서
  버튼이 무반응이 된다(2026-09-28 까지 1부에만 있었다). 조립본 스모크가 부마다 1건씩 검사한다.
- **AI 튜터 클라이언트 = `packages/tutor`(@series/tutor)** — 로컬/원격 Ollama 전송 계층. 서버 주소는 빌드 환경변수
  **`VITE_OLLAMA_URL`** 로 바꾼다(미설정 시 `http://localhost:11434`) → 코드 수정 없이 local↔remote 전환.
  소비처: `TutorChat.vue`(각 부, 주제별) + 포털 `TutorExplain.vue`(추천 설명 재구술 — Ollama 미실행 시 규칙 템플릿 폴백).
- **백엔드 층 = `packages/store`(@series/store)** — Supabase 클라이언트 하나로 ① 인증(`AuthPanel`·`initAuth`·`isAllowedEmail`),
  ② 진도·복습 크로스기기 동기화(`registerProgressSync`/`registerReviewSync` — 각 앱 THEMED 스토어가 등록),
  ③ 협업 주석(`useChapterAnnotations` — 익명, 작성자 이름 컬럼 자체가 없음), ④ 도입 통계(`fetchAdoptionStats`)를 담당.
  **`VITE_SUPABASE_URL`·`VITE_SUPABASE_ANON_KEY` 미설정 시 전부 no-op** → 앱은 localStorage 만으로 정상 동작하므로,
  백엔드 없이 빌드해도 깨지지 않는다(로컬 개발의 기본 상태).
  `isAdmin` 의 `VITE_ADMIN_EMAILS` 는 **UI 표시용일 뿐 — 진짜 경계는 서버 `public.admins` 테이블 + RLS**(두 목록을 같게 유지).
  DB 스키마 `supabase/schema.sql`, 설계 `docs/todo_supabase백엔드_260715.md`.

## 개념 온톨로지 — `scripts/ontology/concepts.json`

시리즈의 개념(수학·AI 용어)과 관계(선수 `prereq` · 다시 쓰이는 곳 `usedAt` · 별칭 `aliases` · 비유 `metaphors`)의 **단일 정본**.
검색 인덱스(`search-index.json`)와 개념 그래프(`concept-graph.json`)가 여기서 생성되고, 각 부 `TutorChat` 은 그래프에서
질문에 나온 개념의 카드(배우는 곳·다시 쓰이는 곳·선수·비유)를 시스템 프롬프트에 덧붙여 **다른 부 개념도 'N부 M장'으로 안내**한다.
화면 소비처: 각 장 상단 띠 `ConceptStrip`(packages/ui) · 포털 `/concepts` 개념 지도(`ConceptsView`) · `/glossary` 용어 대조표
(`GlossaryView` — 정본 `metaphors` 의 통합 대조표) · 검색 팔레트 이웃 줄 · 포털 홈의 복습 경로(북마크 → 선수 개념)와 진단 개념 칩
(`diagnostic.ts` 의 `concepts` 태그) · 도입 현황의 질문 집계 · 각 부 `notebooks/tutor.py`(웹과 같은 개념 카드, 파이썬 이식) —
**전부 산출물 JSON 을 fetch/read** 하므로 정본을 고쳤으면 `npm run ontology:graph` 를 잊지 말 것.
비유어를 새로 만들면 정본 `metaphors` 에도 넣는다 — 그래야 대조표·튜터·검색이 함께 안다(각 장의 대조표만 고치면 드리프트).
주석·북마크 앵커를 개념으로 묶는 규칙은 `conceptsAtAnchor`(packages/ui) 한 곳 — 소비처마다 따로 만들지 말 것.
설계·규칙·단계는 `docs/todo_온톨로지_260906.md`.

- **개념 `id` 는 앵커처럼 배포 후 변경·삭제 금지.** 위치는 `part`+`slug`(chapters.ts 실재)+`anchor`(그 장의 `ReviewFlag` id).
- **회색 지대 비유어**(짝지을 실무 용어가 없는 것 — 7부 "길이 오염"·8부 "서성임"·9부 "칸")는 넣지 않는다(비유 앵커링 점검 ②).
- 검사: `npm run check:ontology` (위치·앵커 실재, `prereq` 순환, 본문 `PartLink` 대상 실재 — **pre-commit 이 자동으로 돈다**).
  `-- --suggest` 는 그래프에 없는 PartLink 쌍(누락 간선 후보), `-- --coverage` 는 개념이 없는 장을 보여 준다.
- 정본을 고치면 `npm run search:index && npm run ontology:graph` (postinstall·deploy:build 가 자동 실행, 산출물은 gitignore).

## 시리즈 설계 철학 (모든 부 공통)

1. 직관 먼저, 공식 나중 — 그림/비유 → 인터랙티브 조작 → 수식.
2. 새 용어·기호·수식은 예외 없이 즉시 설명 ("이름 + 읽는 법 + 뜻").
   역방향도 같다 — **비유어를 만들면 같은 자리에서 실제(실무·논문) 용어와 짝짓는다** (예: 6부 "조련" = 사후 학습·파인튜닝·정렬).
3. 각 챕터에 AI 연결 카드(`ConceptCard tone="ai"`) 필수 — 그 개념이 LLM 어디에 쓰이는지.
4. 문제 표준: 본문 미니체크 2~3개 + 챕터 끝 10문제 `QuizSet`(완료 시 진도 처리). 계산형은 `StepQuiz`.
5. 웹 챕터 ↔ 노트북 1:1, 같은 예제.
6. 의미 있는 작업 후 해당 앱(포털 포함)의 `docs/99_history.md` 맨 위에 이력 추가.
