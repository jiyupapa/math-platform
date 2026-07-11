# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 정체성

"수포자를 위한 AI 수학 시리즈"의 **7부 — 임베딩 기하학 (RAG의 수학)**. 첫 **실용 확장 트랙** —
이해(1~6부)에서 활용으로. 임직원이 실제로 쓰는 "AI가 회사 문서를 아는 것처럼 답하는" 기능
(RAG·의미 검색·벡터 DB)의 수학을 직접 조작하며 이해하게 한다.
도달점은 **10장(캡스톤 — 사내 FAQ 검색봇 조립)**. 핵심 한 줄: **"의미는 위치다 — 가까움을 계산하는 법."**

> **상태: 콘텐츠 제작 중 (5/11 — 워밍업·1~4장 공개)** — 앱 셸·목차·스토어·튜터 완성, ch5~10은 comingSoon.
> 챕터 구성·회수하는 수학 매핑은 루트 `README.md` "7부 챕터 구성안" 표가 정본.

## 공용 컴포넌트 — 모노레포 `packages/ui`

공용 컴포넌트(`MathBlock`·`ConceptCard`·`Quiz`·`QuizSet`·`StepQuiz`·`PartLink` 등)와 규칙은 루트 `CLAUDE.md` 참조.
앱전용 결합은 `main.ts` 의 provide 로 주입(접두사·복습·노트북 리졸버).

## 명령어 (루트에서)

```bash
npm run dev   -w apps/part7/web    # 개발 서버
npm run build -w apps/part7/web    # 타입체크 + 빌드 (= 검증)
```

## 아키텍처

- **저장 접두사 `emb`** — `emb-progress-v1`(진도)·`emb-review-v1`(복습)·`emb-quizset-v1:*`(문제).
  **바꾸면 사용자 진도가 끊기고 포털 연동(2층)도 깨진다.**
- `src/data/chapters.ts` = 목차 단일 소스. 챕터 공개 = ① comingSoon 제거 ② `src/chapters/ChN.vue` 작성
  ③ 라우터에 동적 import 추가 ④ `notebooks/chNN_*.ipynb` 대응 노트북 ⑤ `tutorContext.json` 에 맥락 추가.
- `src/data/tutorContext.json` = AI 튜터 맥락 단일 소스(웹 `tutorContext.ts` + 노트북 `tutor.py` 공용).
- 포털(`apps/portal`)의 경로 지도 9단계(선택·실용 분기)가 이 부를 가리킨다 — 첫 챕터 공개 시 포털
  `curriculum.ts` 의 `comingSoon` 해제와 수치 갱신을 함께 할 것.

## 콘텐츠 작성 규칙 (필수 — 대상이 수포자임)

1. 직관 먼저, 공식 나중 — 그림/비유 → 인터랙티브 조작 → 수식.
2. 새 용어·기호·수식은 예외 없이 즉시 설명("이름 + 읽는 법 + 뜻").
   **비유어를 만들면 같은 자리에서 실무 용어와 짝지을 것** (예: RAG = 검색 증강 생성
   Retrieval-Augmented Generation — 첫 등장에서 풀네임 필수).
3. **"회수하는 수학" 연결 필수** — 각 장이 어느 부의 어느 개념을 회수하는지(루트 README 표)
   `ConceptCard` 로 명시: 2장=1부 2장 내적, 4장=3부 5·7장+1부 9장, 5장=1부 8장 PCA,
   7장=6부 9장 평가, 8장=6부 2~3장(RAG vs 파인튜닝), 9장=5부 4장 −log·6부 4장 쌍 학습.
4. 문제 표준: 본문 미니체크 2~3개 + 챕터 끝 10문제 `QuizSet`(완료 시 진도 처리). 계산형은 `StepQuiz`.
5. 웹 챕터 ↔ 노트북 1:1, 같은 예제.
6. **실습은 전부 오프라인 toy 임베딩** — 미리 준비한 저차원 벡터(2~10차원)·단어 빈도 벡터로.
   실제 임베딩 API·대형 모델 호출을 요구하지 말 것(수치는 결정적으로).
7. 부 간 참조 링크는 "지정석"(AI 연결 카드·완주 박스)에만 `PartLink` 사용, 본문 인라인은 텍스트.
8. **6부와의 구도 유지** — "지식 주입의 두 길: 조련(가중치, 6부) vs RAG(문맥, 7부)"를
   1장과 8장에서 명시적으로 대비시킬 것.

## 자주 막히는 함정

- Ollama 없는 환경에서도 학습이 막히면 안 된다 — 튜터·데모는 항상 폴백을 갖출 것.
- 챕터 라우트를 `router/index.ts` 에 등록하지 않으면 catch-all 이 ComingSoonView 로 보낸다.
- Tailwind `@source`(style.css)가 빠지면 공용 컴포넌트 스타일이 조용히 사라진다 — 빌드는 통과하므로 눈으로 확인.
- 고차원 수치 실험(4장)은 차원·표본 수를 작게 잡아 브라우저/노트북에서 즉시 돌게 할 것.

## 스택

Vue 3 + TypeScript + Vite + Pinia + Tailwind v4 + KaTeX + Chart.js. 튜터는 `@series/tutor`(로컬 Ollama).

## 이력

의미 있는 작업 후 `docs/99_history.md` 맨 위에 이력 추가.
