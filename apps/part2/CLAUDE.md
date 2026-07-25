# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

수포자(개발자 대상)를 위한 **미분 학습 웹앱**. 최종 종착점은 미분 지식으로 AI 기반(경사하강법·역전파)을 직관적으로 이해하는 것. 모든 챕터가 Phase 0(접선 맛보기) → Phase 10(역전파 직관)으로 배열되어 있다. 전체 커리큘럼·Phase 계획은 `docs/00_plan.md`에 있다 (단일 기획 문서, 작업 전 반드시 참조).

모노레포 `C:\STUDY\MATH_PLATFORM` 의 `apps/part2` 이다. 공용 컴포넌트는 `packages/ui`(@series/ui) 에서 소비하며 **수정은 거기서**(옛 "1부 복제·전파" 체제는 폐기 — 루트 `CLAUDE.md` 참조). 실제 작업의 핵심은 **미분 전용 시각화**와 **콘텐츠(챕터)**이다.

## 작업 이력 기록 (필수)

의미 있는 작업(챕터 추가, 컴포넌트 작성/수정, 문서 작업 등)을 마칠 때마다 **`docs/99_history.md`** 맨 위에 항목을 추가한다. 형식: 날짜(절대일자) · 무엇을 했는지 · 산출물/검증 결과. 같은 날짜 섹션이 있으면 그 안에 덧붙인다.

## 명령어

모노레포 npm workspaces — `npm install` 은 **루트에서 1회**, 이 부 대상 명령은 루트에서 `-w apps/part2/web` 로 실행한다.
테스트 러너는 없다. 검증은 `npm run build`(타입체크 포함) 통과 + dev 서버 동작 확인으로 한다.
노트북은 **루트 공용 venv 하나**(`.venv`, 커널 `math-platform`) 사용 — 설치·검증은 루트 `docs/TESTING.md` 3절.

## 아키텍처

### 챕터 추가 흐름 (핵심 패턴)

새 챕터를 추가하려면 **세 곳**을 함께 수정해야 한다:

1. `web/src/data/chapters.ts` — `chapters[]` 배열에 메타 추가. **목차·라우터·진도의 단일 소스**. 콘텐츠가 아직 없으면 `comingSoon: true`.
2. `web/src/chapters/ChapterN.vue` — 실제 챕터 본문 작성 (`SampleChapter.vue`가 완성형 레퍼런스).
3. `web/src/router/index.ts` — 해당 슬러그용 동적 import 라우트 추가. (현재 `sample`만 개별 라우트, 나머지 `comingSoon`은 `/ch/:slug` → `ComingSoonView.vue`로 모음.)

`@` 는 `web/src` 의 별칭 (vite.config.ts).

### 챕터 한 편의 구성 (요구사항)

`docs/00_plan.md`의 학습 방식 요구사항을 모든 챕터가 따른다:

- **새 용어·기호·수식**이 나오면 반드시 `ConceptCard`로 설명.
- **계산형 문제**는 최종 답만 받지 말고 `StepQuiz`로 공식의 중간 단계를 입력하게 한다.
- 문제 유형 3종: 객관식(`mc`) + 참/거짓(`truefalse`) + 숫자입력(`numeric`) — 모두 `Quiz` 컴포넌트.
- 문제 구성: 본문 중간 **미니체크** + 챕터 끝 **난이도별(easy/medium/hard) 10문제 세트**(`QuizSet`).

### 공통 컴포넌트

**공용(`MathBlock`·`ChartView`·`ConceptCard`·`Quiz`·`StepQuiz`·`QuizSet`·`quizGroup`)은 `packages/ui`(@series/ui) 에 있다**(수정은 거기서). `TangentExplorer` 등 미분 전용만 `web/src/components/` 에 있다. 아래는 역할 설명:

| 컴포넌트 | 역할 |
|---------|------|
| `MathBlock.vue` | KaTeX 수식 렌더 (`inline` prop, `expr`) |
| `ChartView.vue` | Chart.js 래퍼 (bar/line/scatter) |
| `ConceptCard.vue` | 설명 카드, `tone`: note/tip/warn/goal |
| `Quiz.vue` | 자동채점 퀴즈 3종 + 단계별 힌트 + 해설 |
| `StepQuiz.vue` | 공식 중간단계 입력 채점 (모든 단계 정답 시 통과) |
| `QuizSet.vue` | Quiz 묶음 진행률 집계 + 완료 처리 |
| `TangentExplorer.vue` | **미분 전용** 시각화 — 접선/할선 슬라이더 (신규 작성분) |

### Quiz 집계 메커니즘 (provide/inject)

`QuizSet`(부모)와 `Quiz`/`StepQuiz`(자식)는 `quizGroupKey`(InjectionKey)로 연결된다 (`packages/ui`의 `quizGroup.ts` — `@series/ui`):

- 각 Quiz는 `onMounted`에 `group.register(uid)`, 정답 시 `group.report(uid)` 호출. `uid`는 `props.question` 문자열 → **한 QuizSet 안에서 question 텍스트가 중복되면 집계가 깨진다.**
- 모든 등록 문제가 풀리면 `QuizSet`이 `completed` 이벤트 발생 → 챕터가 `@completed="progress.markDone('slug')"`로 진도 처리.

### 진도 저장 (stores/progress.ts)

Pinia 스토어. 완료 챕터 슬러그를 localStorage(`diff-progress-v1`)에 저장. `totalCount`/`percent`는 `availableChapters`(= `comingSoon`이 아닌 챕터) 기준으로 계산되므로, 챕터를 실제 공개할 때 `comingSoon` 플래그를 제거하면 전체 진도율 분모가 자동 반영된다.

### 노트북 (notebooks/)

각 웹 챕터와 1:1로 짝지은 Jupyter 노트북(`chXX_*.ipynb`). `linear-algebra`엔 없던 **sympy**를 추가 — 미분을 기호로 직접 계산·검증.

## 콘텐츠 작성 시 주의

- 수식 특수문자(Δ, f'(x), lim, h→0, ∂, ∇ 등)는 `MathBlock`의 KaTeX로 렌더한다.
- 본문/문제는 한국어로 작성. 수포자 대상이므로 용어를 처음 쓸 때 풀어 설명한다.
