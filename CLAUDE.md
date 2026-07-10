# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 이 저장소의 정체

"수포자를 위한 AI 수학 시리즈"를 하나로 묶은 **모노레포**(npm workspaces). 5개 부의 웹 앱 + 통합 포털 +
공용 컴포넌트 패키지가 한 git 저장소 안에 있다.

기원: 원래 1부(선형대수)만 회사 해커톤 출품 목적이었고, 5부작으로 확장된 뒤 이 모노레포로 통합됐다.
(과거엔 부마다 **독립 저장소 + 공용 컴포넌트 5벌 복제**였고 1부가 "골든 카피" 기준이었다 — 지금은
`packages/ui` 공유 패키지가 그 역할을 대체해 **복제·드리프트가 사라졌다**.) **최우선 목적은 ① 이 프로그램을
사내 임직원이 실제로 쓰게 만드는 것(도입)과 ② 사용자 본인의 수학·AI 지식을 채우는 것, 두 가지다. 사내 해커톤은
목표가 아니라 도입을 이끄는 수단·계기다.**

> **특정 부 안에서 작업할 때는 그 부의 `apps/partN/CLAUDE.md` 가 우선이다** — 콘텐츠 규칙·함정이 거기 있다.
> 이 파일은 부를 가로지르는(모노레포 구조·공용 패키지) 사항만 담는다.

## 구조

```
apps/
  portal/            통합 포털(part0 — 진단·학습경로 추천): web/ + docs/. packages/ui·tutor 소비
  part1/ .. part6/   각 부: web/(Vue 앱) + notebooks/(Jupyter) + docs/
packages/
  ui/                공용 컴포넌트 단일 소스 (@series/ui)
  tutor/             AI 튜터 클라이언트 (@series/tutor — 로컬/원격 Ollama)
docs/TESTING.md      전체 테스트 방법
requirements.txt     공용 노트북 venv 의존성(5부 합집합)
```

| 부 | 폴더 | 주제 |
|---|---|---|
| 포털 | `apps/portal` | 진단·경로 추천 허브 |
| 1부 | `apps/part1` | 선형대수 |
| 2부 | `apps/part2` | 미분 |
| 3부 | `apps/part3` | 확률통계 |
| 4부 | `apps/part4` | 트랜스포머 — 시리즈의 정점 |
| 5부 | `apps/part5` | 정보이론 |
| 6부 | `apps/part6` | LLM 조련 — 피날레 (전 11챕터 공개, 2026-07-11 완결) |

시리즈 커리큘럼·추천 학습 경로(1→2→3→4→5 순서가 아님)·부 간 연결은 루트 `README.md`.

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

공용 컴포넌트(`MathBlock`·`ConceptCard`·`DetailsCard`·`ChartView`·`NotebookCard`·`ReviewFlag`·`Quiz`·`StepQuiz`·`QuizSet`)와
QuizSet↔StepQuiz 그룹 계약(`quizGroupKey`/`QuizGroup` — `quizGroup.ts`)은
**`packages/ui` 한 곳에만 있다.** 앱은 `import { Quiz } from '@series/ui'` 로 소비.

- **한 번 고치면 전 부에 반영** — 복제·전파·드리프트 점검 없음(옛 골든카피/`check_drift.py` 체제는 폐기).
- 패키지는 **주제 중립** 유지. 앱전용 결합은 **provide/inject** 로 분리 — 각 앱 `main.ts` 가 주입:
  - `storagePrefixKey` — QuizSet 저장 접두사. part1=`la` part2=`diff` part3=`stat` part4=`tf` part5=`it` part6=`tame` portal=`hub`.
    **바꾸면 사용자 진도가 끊긴다.** 포털은 진단 결과 저장(`hub-diagnosis-v1`·`hub-baseline-v1`)에 쓰고,
    각 부 진도(`{prefix}-progress-v1`)를 읽어 지도에 표시하므로 부 접두사 변경은 포털 연동도 깨뜨린다.
  - `reviewApiKey` — ReviewFlag ↔ 각 앱 `review` 스토어.
  - `notebookResolverKey` — NotebookCard ↔ 각 앱 `chapters`(part1·4·5만).
- 소스 `.vue` 패키지라 각 앱 설정에: `vite.config.ts` 의 `optimizeDeps.exclude`(전 7앱 = `['@series/ui', '@series/tutor']`),
  `style.css` 의 `@source '../../../../packages/ui/src'`(Tailwind 가 패키지 클래스 스캔 — 빠지면 스타일이 조용히 누락).
- **THEMED(각 앱에 유지)**: `progress`/`review` 스토어, `TutorChat.vue`(튜터 주제), `notebooks/tutor.py`.
- **AI 튜터 클라이언트 = `packages/tutor`(@series/tutor)** — 로컬/원격 Ollama 전송 계층. 서버 주소는 빌드 환경변수
  **`VITE_OLLAMA_URL`** 로 바꾼다(미설정 시 `http://localhost:11434`) → 코드 수정 없이 local↔remote 전환.
  소비처: `TutorChat.vue`(각 부, 주제별) + 포털 `TutorExplain.vue`(추천 설명 재구술 — Ollama 미실행 시 규칙 템플릿 폴백).

## 시리즈 설계 철학 (모든 부 공통)

1. 직관 먼저, 공식 나중 — 그림/비유 → 인터랙티브 조작 → 수식.
2. 새 용어·기호·수식은 예외 없이 즉시 설명 ("이름 + 읽는 법 + 뜻").
   역방향도 같다 — **비유어를 만들면 같은 자리에서 실제(실무·논문) 용어와 짝짓는다** (예: 6부 "조련" = 사후 학습·파인튜닝·정렬).
3. 각 챕터에 AI 연결 카드(`ConceptCard tone="ai"`) 필수 — 그 개념이 LLM 어디에 쓰이는지.
4. 문제 표준: 본문 미니체크 2~3개 + 챕터 끝 10문제 `QuizSet`(완료 시 진도 처리). 계산형은 `StepQuiz`.
5. 웹 챕터 ↔ 노트북 1:1, 같은 예제.
6. 의미 있는 작업 후 해당 앱(포털 포함)의 `docs/99_history.md` 맨 위에 이력 추가.
