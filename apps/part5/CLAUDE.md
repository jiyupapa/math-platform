# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 정체성

수포자(수학 포기자)를 위한 **정보이론 인터랙티브 학습 프로그램** — "수포자를 위한" 시리즈 5부.
**최종 목표: AI 의 손실함수(크로스 엔트로피)·성적표(퍼플렉시티)·창의성 다이얼(temperature)·정렬 페널티(KL)의 정체를 이해하는 것.**
- 전체 계획·커리큘럼(챕터 0~10): `docs/00_plan.md`
- 작업 이력(시간순, 최신 위로): `docs/99_history.md` — **의미 있는 작업을 마칠 때마다 여기에 항목을 추가한다**

두 갈래로 학습한다: 웹 앱(`web/`, 직관·인터랙션) + Python 노트북(`notebooks/`, 실제 계산). 각 챕터는 둘이 1:1 대응한다.

## 공용 컴포넌트 — 모노레포 `packages/ui`

이 부는 모노레포 `C:\STUDY\MATH_PLATFORM` 의 `apps/part5` 이다. 공용 컴포넌트(`Quiz`/`StepQuiz`/`QuizSet`/`quizGroup`·`MathBlock`·`ConceptCard`·`DetailsCard`·`NotebookCard`·`ChartView`·`ReviewFlag`)는 **`packages/ui`(@series/ui) 한 곳**에 있다. `import { Quiz } from '@series/ui'` 로 소비하며, **거기서 한 번 고치면 전 부에 반영**된다(옛 "1부=골든카피 → 전파" 및 `check_drift.py` 체제는 폐기됨).
- 상세·주입 계약(`storagePrefixKey` 등)은 루트 `CLAUDE.md` 참조.
- THEMED(이 부에 유지): `progress`/`review` 스토어(접두사 **`it`** — 바꾸면 진도 끊김), `TutorChat`(정보이론 주제), `notebooks/tutor.py`.
- 이 부의 전용 시각화(`TwentyQuestions` 등 `docs/00_plan.md` 6절의 9종)는 공용이 아니므로 `web/src/components/` 에 자유롭게 작성.

## 명령어

모노레포이므로 `npm install` 은 **루트에서 1회**. 이 부만 다룰 때(루트에서 실행):
```bash
npm run dev   -w apps/part5/web   # 개발 서버 (HMR)
npm run build -w apps/part5/web   # vue-tsc 타입체크 + vite 빌드 — 변경 후 이걸로 검증
```
- 테스트·린트 설정은 없음. **검증 수단은 `npm run build`** (vue-tsc가 타입/템플릿 오류를 잡음). `noUnusedLocals`/`noUnusedParameters` 가 켜져 있어 미사용 변수도 에러다.
- 노트북: **루트 공용 venv 하나**(`.venv`, 커널 `math-platform`) 사용. 설치·실행·검증은 루트 `docs/TESTING.md` 3절.

## 아키텍처

**챕터 = 콘텐츠 단위.** 챕터를 추가/수정하는 것이 이 저장소의 주된 작업이다.

데이터 흐름:
- `web/src/data/chapters.ts` — 모든 챕터 메타데이터의 **단일 소스**. 사이드바 목차, 홈 목차, 진도 분모(`availableChapters` = `comingSoon` 아닌 것)가 전부 여기서 나온다.
- `web/src/router/index.ts` — 챕터마다 **명시적 라우트** `/ch/chN → @/chapters/ChapterN.vue`. 콘텐츠 없는 챕터는 catch-all `/ch/:slug → ComingSoonView.vue` 로 빠진다.
- `web/src/stores/progress.ts` — Pinia 스토어, 완료 챕터를 localStorage 에 저장. 챕터는 끝의 `QuizSet @completed` 에서 `progress.markDone(slug)` 를 호출해 완료 처리.
- `web/src/data/tutorContext.json` — **AI 튜터 챕터 맥락의 단일 소스**. 웹(`tutorContext.ts` 래퍼)과 노트북(`notebooks/tutor.py`)이 함께 읽는다. 새 챕터를 만들면 여기에도 맥락 추가.
- `notebooks/tutor.py` — 노트북용 AI 튜터(로컬 Ollama). `chat('chN')` = 플로팅 채팅 위젯, `ask()` = 원샷 질문, `explain()` = 직전 실행 셀 코드 설명. 웹 `TutorChat.vue`·`lib/ollama.ts` 와 로직을 맞춘 이식판이므로 한쪽을 고치면 다른 쪽도 확인할 것.

재사용 컴포넌트 — **공용(`ConceptCard`·`DetailsCard`·`MathBlock`·`ChartView`·`Quiz`·`StepQuiz`·`QuizSet`·`quizGroup`)은 `packages/ui`(@series/ui) 에 있다**(수정은 거기서). `TwentyQuestions` 등 이 부 전용만 `web/src/components/` 에 있다. 아래는 역할 설명:
- `ConceptCard.vue` — 설명 카드. `tone` = note/tip/warn/goal/ai (**ai = 챕터 필수 "🤖 AI 연결" 카드**).
- `DetailsCard.vue` — 접었다 펴는 "더 깊이" 카드. 심화 곁가지(bit/nat 밑 변환, 0·log 0 관례, 최대우도 등)는 본문 대신 여기로 격리.
- `MathBlock.vue` — KaTeX 수식. `inline` 또는 블록.
- `ChartView.vue` — vue-chartjs 래퍼. `type` = bar/line/scatter.
- `Quiz.vue` — 자동채점. `type` = mc/truefalse/numeric. **truefalse 는 answer 0=참(O), 1=거짓(X)**. `difficulty` 배지(easy/medium/hard), 단계별 힌트, 해설.
- `StepQuiz.vue` — **계산형(2단계 이상) 문제 전용**. 공식의 중간 단계를 직접 입력·채점. `steps`=`{lhs(KaTeX), answer}[]`. 계산 문제는 최종 답만 받지 말고 이걸로.
- `QuizSet.vue` + `quizGroup.ts` — Quiz 들을 묶어 풀이 현황 자동 집계. 전부 풀면 `completed` 이벤트.
- `TwentyQuestions.vue` — 이 부 전용 1호 시각화(업다운 게임, 샘플 챕터). 이후 챕터마다 `docs/00_plan.md` 6절의 전용 시각화를 추가한다.

**새 챕터 추가 절차**: ① `chapters.ts` 에서 해당 챕터 `comingSoon` 제거 → ② `web/src/chapters/ChapterN.vue` 작성(샘플 챕터 구조 따름) → ③ `router/index.ts` 에 `/ch/chN` 라우트 추가 → ④ `notebooks/chNN_*.ipynb` 대응 노트북 작성(맨 위에 AI 튜터 안내 마크다운 + `chat('chN')` 셀 포함) → ⑤ `web/src/data/tutorContext.json` 에 챕터 맥락 추가.

## 콘텐츠 작성 규칙 (필수 — 대상이 수포자임)

- **모든 새 용어·기호·수식은 즉시 설명**한다. 기호는 "이름 + 읽는 법 + 뜻" 세트로. (수포자는 설명 없는 기호 하나에서 이탈)
- **log 가 최대 장벽**: "절반으로 몇 번 접나 / 2를 몇 번 곱하나" 게임 프레임을 유지하고, 공식보다 스무고개 질문 수로 먼저 체감시킨다. 2부 ch7(로그 미분)을 명시 복습.
- **크로스 엔트로피 vs KL 혼동 방지**: "지도 값 전체(H(p,q)) vs 초과분(D)" 비유 하나로 처음부터 구분해 도입.
- **AI 연결 필수**: 각 챕터에 `tone="ai"` ConceptCard 로 그 개념이 AI 에서 어떻게 쓰이는지 연결 (놀람→희귀 토큰 손실, 압축→BPE, 엔트로피→예측 자신감, 크로스 엔트로피→손실함수, KL→RLHF·증류, 퍼플렉시티→벤치마크, temperature→샘플링).
- **문제 구성 표준**: 본문 중간 **미니체크** 2~3개(단독 `Quiz`, 진도 미포함) + 챕터 끝 **난이도별 10문제 `QuizSet`**(유형 혼합, 힌트·해설 포함). 세트 완료 시 진도 처리.
- 직관 먼저, 공식 나중. 챕터당 30~45분 분량 유지 — **심화 욕심 금지** (곁가지는 DetailsCard 로).

## 자주 막히는 함정

- **스무고개 질문 수 세는 규칙**: "후보가 1개 남으면 물어볼 필요 없이 확정"으로 센다 — 그래야 64개 후보 = 최대 6번 = log₂64 가 정확히 성립한다. (마지막 확인 질문까지 세면 최악 7번이 되어 스토리가 깨짐. `TwentyQuestions.vue`·`ch00_sample.ipynb` 모두 이 규칙로 구현됨)
- **KaTeX 백슬래시**: Vue **정적 속성**에서는 백슬래시 **1개** (`expr="\log_2"`). `\\` 로 쓰면 KaTeX가 줄바꿈으로 해석해 깨진다. JS 문자열/바인딩(`:steps="[{ lhs: '\\sqrt{25}' }]"`)에서는 **2개**.
- **Vue 템플릿 속성 안의 따옴표**: `:hints="['...\"인용\"...']"` 처럼 백슬래시로 큰따옴표를 이스케이프할 수 없다(HTML 파싱 단계에서 깨짐). 속성 문자열 안에서는 따옴표 없이 쓰거나 「」로 대체.
- **`<input type="number">` + v-model**: Vue가 값을 number 로 캐스팅한다. 문자열 메서드를 바로 쓰지 말고 `String(...)` 후 사용.
- **노트북 한글 폰트**: Matplotlib 기본 폰트엔 한글이 없어 깨진다. 그래프 쓰는 노트북은 import 직후 `plt.rcParams['font.family']='Malgun Gothic'` + `plt.rcParams['axes.unicode_minus']=False` 필수.
- **Malgun Gothic 에 없는 수학 글리프**: matplotlib 라벨·제목에 `≈`(U+2248) · `−`(U+2212) · `‖`(U+2016) 를 쓰면 UserWarning + 네모 출력. 그래프 문자열에서는 `약`/`-`(ASCII)/`||` 로 치환할 것 (print 콘솔 출력에는 써도 됨).
- **.ipynb 편집은 `NotebookEdit`** 도구로만 (Read 선행 필수). 손으로 JSON을 쓸 때는 코드 셀마다 `"execution_count": null` 과 `"id"` 가 **둘 다** 있어야 한다. 작성 후 `nbconvert --execute` 로 무에러를 검증할 것.
- 모노레포이므로 `npm` 은 **루트에서 `-w apps/part5/web`** 로 실행한다(옛날처럼 각 부 `web/` 로 `cd` 하지 않는다). Bash 작업 디렉토리는 유지되니 루트인지 확인.

## 스택

Vue 3 + TypeScript + Vite + Vue Router + Pinia + KaTeX + Chart.js(vue-chartjs) + Tailwind CSS v4(`@tailwindcss/vite`, 설정 파일 없이 `@import 'tailwindcss'`) · NumPy + Matplotlib + JupyterLab.
