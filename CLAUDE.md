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

배치는 `ls`로: `apps/`(portal + part1..N — 각각 web/·notebooks/·docs/), `packages/`(ui·tutor·store).
부 목록·주제·완결 상태·시리즈 커리큘럼·추천 학습 경로(1→2→3→4→5 순서가 아님)·부 간 연결은
루트 `README.md` 가 정본.

**스택**(전 12앱 공통): Vue 3 + TypeScript + Vite + Vue Router + KaTeX +
Tailwind v4(`@tailwindcss/vite` — **설정 파일 없이** `style.css` 의 `@import 'tailwindcss'` 로 시작).
각 부는 여기에 **Pinia**(진도·복습 스토어)와 **Chart.js**(vue-chartjs)를 더 쓴다 — **포털만 이 둘이 없다**.
노트북은 루트 공용 venv 하나: NumPy·Matplotlib·JupyterLab + SciPy(3부)·SymPy(2부)·scikit-learn(7부),
ipywidgets·requests(AI 튜터). 명세는 루트 `requirements.txt`.

## 명령어 (npm workspaces — 루트에서 실행)

```bash
npm install                                  # 최초 1회 (전 워크스페이스 링크)
npm run build --workspaces --if-present      # 전 앱 빌드 = 검증 (테스트·린트 없음)
npm run dev   -w apps/part1/web              # 특정 부 개발 서버
npm run build -w apps/part1/web              # 특정 부만 빌드
```
- 검증 수단은 `npm run build`(vue-tsc 타입체크 포함). `noUnusedLocals`/`noUnusedParameters` 가 켜져 있어 미사용 변수도 에러.
- 노트북: **루트 공용 venv 하나**(`.venv`, 커널 `math-platform`). 설치·실행·검증은 `docs/TESTING.md` 3절.

## 공용 컴포넌트 — `packages/ui` (@series/ui)

공용 컴포넌트(`MathBlock`·`ConceptCard`·`DetailsCard`·`ChartView`·`NotebookCard`·`ReviewFlag`·`PartLink`·`Quiz`·`StepQuiz`·`QuizSet`)와
QuizSet↔StepQuiz 그룹 계약(`quizGroupKey`/`QuizGroup` — `quizGroup.ts`)은
**`packages/ui` 한 곳에만 있다.** 앱은 `import { Quiz } from '@series/ui'` 로 소비.

- **한 번 고치면 전 부에 반영** — 복제·전파·드리프트 점검 없음(옛 골든카피/`check_drift.py` 체제는 폐기).
- 패키지는 **주제 중립** 유지. 앱전용 결합은 **provide/inject** 로 분리 — 각 앱 `main.ts` 가 주입:
  - `storagePrefixKey` — QuizSet 저장 접두사. part1=`la` part2=`diff` part3=`stat` part4=`tf` part5=`it` part6=`tame` part7=`emb` part8=`opt` part9=`num` part10=`scale` part11=`agent` portal=`hub`.
    **바꾸면 사용자 진도가 끊긴다.** 포털은 진단 결과 저장(`hub-diagnosis-v1`·`hub-baseline-v1`)에 쓰고,
    각 부 진도(`{prefix}-progress-v1`)를 읽어 지도에 표시하므로 부 접두사 변경은 포털 연동도 깨뜨린다.
  - `reviewApiKey` — ReviewFlag ↔ 각 앱 `review` 스토어.
  - `notebookResolverKey` — NotebookCard ↔ 각 앱 `chapters`(part1·4·5·6·7·8·9·10·11).
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
    - 생성 규칙: 강조색은 50↔950·100↔900·600↔400·700↔300(500 은 고정), 중립(slate)은 역할 기준으로
      별도 매핑(파일 상단 주석에 대비 수치와 함께 적어 뒀다).
    - **런타임에 색을 조립하는 곳은 안 따라온다** — 1부 ch3 히트맵 `rgb(c,c,c)`, 8부 손실지형 `hsl(...)`.
      데이터 색이라 의도적으로 그대로 두고, 그 위 글자는 안 뒤집히는 `--c-on-light`/`--c-on-dark` 를 쓴다.
  - 전환 UI 는 `ThemeToggle`(시스템/라이트/다크 순환), 상태는 `theme.ts`. 각 앱 `main.ts` 가 `initTheme()` 호출,
    첫 페인트 깜빡임은 각 `index.html` 인라인 스크립트가 막는다(localStorage 키 `series-theme-v1` — 3곳이 같아야 함).

### 글자색 최소 단계 (WCAG AA 4.5:1)

밝은 배경 위 **본문 글자**에 쓸 수 있는 최소 단계. 계열마다 밝기가 달라 "600이면 안전" 같은 규칙은 틀린다.
(Tailwind 원본 oklch 를 sRGB 로 변환해 slate-50 배경 기준으로 계산한 값)

| 500 | 600 | 700 |
|---|---|---|
| slate | indigo · violet · purple · blue · red | emerald · amber · rose · pink · cyan · sky · teal · orange · fuchsia · green |

- `text-slate-400` 은 흰 배경에서 **2.51:1** — 본문에 쓰지 말 것(장식이어도 500 을 쓴다).
- `bg-slate-100`/`bg-slate-200` **위**에서는 `text-slate-500` 도 미달(3.86~4.35) → `text-slate-600`.
- 데모 색과 본문 글자를 맞출 때(`<b style="color: var(--c-indigo-500)">`)도 같은 기준 —
  그래픽은 500 이어도 되지만(3:1) **글자는 위 표의 단계**를 쓴다.
- 위 단계보다 **밝은** 색(`text-*-300` 이하)은 어두운 배경 위 글씨일 수 있으니 표만 보고 올리지 말 것.

**표를 외우지 말고 검사기를 돌린다** — `npm run check:contrast` (미달이면 exit 1, `-- --fix` 로 자동 수정).
조상 배경·`:class` 동적 바인딩까지 추적해 **라이트·다크 양쪽**을 본다. 절차·한계는 `docs/TESTING.md` 5절.
`tokens.css` 를 건드렸으면 먼저 `npm run theme:dark` → 그다음 검사(잊으면 검사기가 "dark.css 가 낡았습니다"로 멈춘다).
**커밋 훅(`githooks/pre-commit`)이 자동으로 돌려 미달이면 커밋을 막는다** — 빌드는 이걸 못 잡기 때문이다.
- **THEMED(각 앱에 유지)**: `progress`/`review` 스토어, `TutorChat.vue`(튜터 주제), `notebooks/tutor.py`.
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

## 시리즈 설계 철학 (모든 부 공통)

1. 직관 먼저, 공식 나중 — 그림/비유 → 인터랙티브 조작 → 수식.
2. 새 용어·기호·수식은 예외 없이 즉시 설명 ("이름 + 읽는 법 + 뜻").
   역방향도 같다 — **비유어를 만들면 같은 자리에서 실제(실무·논문) 용어와 짝짓는다** (예: 6부 "조련" = 사후 학습·파인튜닝·정렬).
3. 각 챕터에 AI 연결 카드(`ConceptCard tone="ai"`) 필수 — 그 개념이 LLM 어디에 쓰이는지.
4. 문제 표준: 본문 미니체크 2~3개 + 챕터 끝 10문제 `QuizSet`(완료 시 진도 처리). 계산형은 `StepQuiz`.
5. 웹 챕터 ↔ 노트북 1:1, 같은 예제.
6. 의미 있는 작업 후 해당 앱(포털 포함)의 `docs/99_history.md` 맨 위에 이력 추가.
