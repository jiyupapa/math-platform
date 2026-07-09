# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 이 디렉토리의 정체

"수포자를 위한 AI 수학 시리즈"의 **우산 디렉토리**. 루트 자체는 git 저장소가 아니고,
`part1` ~ `part5` 각각이 **독립 git 저장소**이며 각자 자기 `CLAUDE.md` 를 갖고 있다.

기원: 원래 1부(선형대수)만 회사 해커톤 출품 목적으로 만들어졌고, 이후 시리즈로 확장되었다.
1부가 공용 컴포넌트의 표준(골든 카피)인 것은 이 때문 — 가장 먼저 만들어져 검증되었고,
나머지 부들이 그 스캐폴딩을 복제했다. **현재 최우선 목적은 사용자 본인의 수학·AI 지식을
채우는 것이며, 해커톤 등 외부 평가는 부차적이다.**

> **특정 부 안에서 작업할 때는 그 부의 `CLAUDE.md` 가 우선이다** — 명령어·아키텍처·콘텐츠
> 규칙·함정이 거기에 상세히 있다. 이 파일은 부를 가로지르는 사항만 담는다.

| 폴더 | 내용 |
|---|---|
| `part1-linear-algebra` | 1부 선형대수 — **시리즈 공용 컴포넌트의 표준(골든 카피)** |
| `part2-differentiation` | 2부 미분 |
| `part3-probstat` | 3부 확률통계 |
| `part4-transformer` | 4부 트랜스포머 — 시리즈의 정점 |
| `part5-information-theory` | 5부 정보이론 |
| *(예정)* `part6-llm-taming` | 6부 LLM 조련 — 챕터 구성안은 루트 `README.md` 로드맵 참조 |
| `선형대수학_자료` | 참고 자료(PDF 등), 코드 아님 |

시리즈 전체 커리큘럼·추천 학습 경로(1→2→3→4→5 순서가 아님)·부 간 연결 지점은 루트 `README.md` 에 있다.

## 모든 부 공통 구조

각 부는 동일한 이중 구조: **웹 앱**(`web/`, Vue 3 + TS + Vite + Pinia + KaTeX + Tailwind v4)
+ **Jupyter 노트북**(`notebooks/`, NumPy). 웹 챕터와 노트북은 1:1 대응.

공통 명령어 (각 부의 해당 디렉토리에서):

```bash
# web/ 에서 — 테스트·린트 없음. 검증 수단은 npm run build (vue-tsc 타입체크 포함)
npm run dev
npm run build

# notebooks/ 에서 (부별 .venv 사용) — 노트북 무에러 검증:
.venv\Scripts\python.exe -m jupyter nbconvert --to notebook --execute --stdout chXX.ipynb
```

## 공용 컴포넌트 규칙 — 1부가 표준

공용 파일(`Quiz`/`StepQuiz`/`QuizSet`/`quizGroup` · `MathBlock` · `ConceptCard` · `DetailsCard` ·
`NotebookCard` · `ChartView` · `ReviewFlag` · `TutorChat` · `lib/ollama.ts` · `notebooks/tutor.py` ·
`progress`/`review` 스토어)은 **1부가 기준 사본**이다.

- 2~5부에서 공용 파일을 임의로 고치지 않는다. 고쳐야 하면 **1부에 먼저 반영 → 각 부에 전파**.
- 드리프트 점검: `python part1-linear-algebra/scripts/check_drift.py` (EXACT 불일치 시 exit 1).
- 공용 파일에는 특정 부 주제의 예시·문구를 넣지 않는다(주제 중립). 부별 설정은 THEMED 파일에만:
  localStorage 접두사 `la`/`diff`/`stat`/`tf`/`it` (바꾸면 사용자 진도가 끊긴다), 튜터 프롬프트 주제.
- 새 부를 추가하면 `check_drift.py` 의 `PARTS` 에 (디렉토리명, 접두사) 등록.

## 시리즈 설계 철학 (모든 부 공통)

1. 직관 먼저, 공식 나중 — 그림/비유 → 인터랙티브 조작 → 수식.
2. 새 용어·기호·수식은 예외 없이 즉시 설명 ("이름 + 읽는 법 + 뜻").
3. 각 챕터에 AI 연결 카드(`ConceptCard tone="ai"`) 필수 — 그 개념이 LLM 어디에 쓰이는지.
4. 문제 표준: 본문 미니체크 2~3개 + 챕터 끝 10문제 `QuizSet`(완료 시 진도 처리). 계산형은 `StepQuiz`.
5. 웹 챕터 ↔ 노트북 1:1, 같은 예제.
6. 의미 있는 작업 후 각 부의 `docs/99_history.md` 맨 위에 이력 추가.
