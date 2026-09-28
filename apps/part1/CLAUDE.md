# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 정체성

수포자(수학 포기자)를 위한 **선형대수학 인터랙티브 학습 프로그램**.
**최종 목표: 선형대수학을 통해 AI 기반 지식을 갖추는 것** — 단순 수학 학습이 아니라 AI 이해의 토대 쌓기가 목적이다.
- 전체 계획·로드맵: `docs/00_plan.md`
- 작업 이력(시간순, 최신 위로): `docs/99_history.md` — **의미 있는 작업을 마칠 때마다 여기에 항목을 추가한다**

두 갈래로 학습한다: 웹 앱(`web/`, 직관·인터랙션) + Python 노트북(`notebooks/`, 실제 계산). 각 챕터는 둘이 1:1 대응한다.

## 공용 컴포넌트 — 모노레포 `packages/ui`

- 상세·주입 계약(`storagePrefixKey` 등)은 루트 `CLAUDE.md` 참조.
- THEMED(이 부에 유지): `progress`/`review` 스토어(접두사 **`la`** — 바꾸면 진도 끊김), `TutorChat`, `notebooks/tutor.py`.

## 아키텍처

**챕터 = 콘텐츠 단위.** 챕터를 추가/수정하는 것이 이 저장소의 주된 작업이다.

데이터 흐름:
- `web/src/data/chapters.ts` — 모든 챕터 메타데이터의 **단일 소스**. 사이드바 목차, 홈 목차, 진도 분모(`availableChapters` = `comingSoon` 아닌 것)가 전부 여기서 나온다.
- `web/src/router/index.ts` — 챕터마다 **명시적 라우트** `/ch/chN → @/chapters/ChapterN.vue`. 콘텐츠 없는 챕터는 catch-all `/ch/:slug → ComingSoonView.vue` 로 빠진다.
- `web/src/stores/progress.ts` — Pinia 스토어, 완료 챕터를 localStorage 에 저장. 챕터는 끝의 `QuizSet @completed` 에서 `progress.markDone(slug)` 를 호출해 완료 처리.
- `web/src/data/tutorContext.json` — **AI 튜터 챕터 맥락의 단일 소스**. 웹(`tutorContext.ts` 래퍼)과 노트북(`notebooks/tutor.py`)이 함께 읽는다. 새 챕터를 만들면 여기에도 맥락 추가.
- `notebooks/tutor.py` — 노트북용 AI 튜터(로컬 Ollama). `chat('chN')` = 플로팅 채팅 위젯, `ask()` = 원샷 질문, `explain()` = 직전 실행 셀 코드 설명. 웹 `TutorChat.vue`·`@series/tutor`(`packages/tutor`의 `ollama.ts`) 와 로직을 맞춘 이식판이므로 한쪽을 고치면 다른 쪽도 확인할 것.

재사용 컴포넌트 — **공용(`ConceptCard`·`MathBlock`·`ChartView`·`Quiz`·`StepQuiz`·`QuizSet`·`quizGroup`)은 `packages/ui`(@series/ui) 에 있다**(수정은 거기서). `VectorCanvas` 등 이 부 전용만 `web/src/components/` 에 있다. 아래는 역할 설명:
- `VectorCanvas.vue` — SVG 인터랙티브 좌표평면. `v-model` 은 `Vec[]`. 핵심 옵션: `showArrows`(false면 점만), `Vec.tail`(원점 아닌 시작점), `Vec.dashed`(보조선). **드래그 시 성분 = 팁 − 꼬리**로 갱신.
- `Quiz.vue` — 자동채점. `type` = mc/truefalse/numeric. **truefalse 는 answer 0=참(O), 1=거짓(X)**. `difficulty` 배지(easy/medium/hard), 단계별 힌트, 해설.

**새 챕터 추가 절차**: ① `chapters.ts` 에서 해당 챕터 `comingSoon` 제거 → ② `web/src/chapters/ChapterN.vue` 작성(기존 챕터 구조 따름) → ③ `router/index.ts` 에 `/ch/chN` 라우트 추가 → ④ `notebooks/chNN_*.ipynb` 대응 노트북 작성(맨 위에 AI 튜터 안내 마크다운 + `chat('chN')` 셀 포함) → ⑤ `web/src/data/tutorContext.json` 에 챕터 맥락 추가.

## 콘텐츠 작성 규칙 (필수 — 대상이 수포자임)

- **모든 새 용어·기호·수식은 즉시 설명**한다. 기호는 "이름 + 읽는 법 + 뜻" 세트로. (수포자는 설명 없는 기호 하나에서 이탈)
- **AI 연결 포함**: 각 챕터에 그 개념이 AI에서 어떻게 쓰이는지 보여준다 (내적→코사인 유사도/추천/어텐션, 행렬→데이터·가중치, 행렬곱→신경망 층, 고유값/PCA→차원축소 등). 프로젝트 최종 목표.
- **문제 구성 표준**: 본문 중간 **미니체크** 2~3개(단독 `Quiz`, 진도 미포함) + 챕터 끝 **난이도별 10문제 `QuizSet`**(유형 혼합, 힌트·해설 포함). 세트 완료 시 진도 처리.
- 직관 먼저, 공식 나중. 움직이는 시각화로 "감"부터 잡게 한다.

## 자주 막히는 함정

- **KaTeX 백슬래시**: Vue **정적 속성**에서는 백슬래시 **1개** (`expr="\vec{a}"`). `\\` 로 쓰면 KaTeX가 줄바꿈으로 해석해 "veca"로 깨진다. JS 문자열/바인딩(`:expr="`...\\vec...`"`)에서는 **2개**.
- **`<input type="number">` + v-model**: Vue가 값을 number 로 캐스팅한다. 문자열 메서드(`.trim()` 등)를 바로 쓰지 말고 `String(...)` 후 사용.
- **노트북 한글 폰트**: Matplotlib 기본 폰트엔 한글이 없어 깨진다. 그래프 쓰는 노트북은 import 직후 `plt.rcParams['font.family']='Malgun Gothic'` + `plt.rcParams['axes.unicode_minus']=False` 필수.
- **.ipynb 편집은 `NotebookEdit`** 도구로만 (Read 선행 필수). 손으로 JSON을 쓸 때는 코드 셀마다 `"execution_count": null` 과 `"id"` 가 **둘 다** 있어야 한다(없으면 `nbconvert --execute` 가 "execution_count is a required property"로 실패). 작성 후 `nbconvert --execute` 로 무에러를 검증할 것.
- 모노레포이므로 `npm` 은 **루트에서 `-w apps/part1/web`** 로 실행한다(옛날처럼 각 부 `web/` 로 `cd` 하지 않는다). Bash 작업 디렉토리는 유지되니 루트인지 확인.
