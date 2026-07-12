# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 정체성

"수포자를 위한 AI 수학 시리즈"의 **6부 — LLM 조련** (시리즈 피날레). 다음 단어 예측 기계(베이스 모델)가
어떻게 지시를 따르는 비서(ChatGPT)가 되는지를, 수포자가 공식을 외우지 않고 직접 조작하며 이해하게 한다.
도달점은 **10장(캡스톤 — 조련 파이프라인 전체 조립: SFT → 보상 → DPO 시뮬레이션)**.

> **상태: 완결 (전 11챕터 공개, 2026-07-11)** — 웹 챕터 ↔ 노트북 1:1 전부 완성.
> 챕터 구성·회수하는 수학 매핑은 루트 `README.md` "6부 챕터 구성" 표가 정본.

## 공용 컴포넌트 — 모노레포 `packages/ui`

공용 컴포넌트(`MathBlock`·`ConceptCard`·`Quiz`·`QuizSet`·`StepQuiz` 등)와 규칙은 루트 `CLAUDE.md` 참조.
앱전용 결합은 `main.ts` 의 provide 로 주입(접두사·복습·노트북 리졸버).

## 명령어 (루트에서)

```bash
npm run dev   -w apps/part6/web    # 개발 서버
npm run build -w apps/part6/web    # 타입체크 + 빌드 (= 검증)
```

## 아키텍처

- **저장 접두사 `tame`** — `tame-progress-v1`(진도)·`tame-review-v1`(복습)·`tame-quizset-v1:*`(문제).
  **바꾸면 사용자 진도가 끊기고 포털 연동(2층)도 깨진다.**
- `src/data/chapters.ts` = 목차 단일 소스. 챕터 공개 = ① comingSoon 제거 ② `src/chapters/ChN.vue` 작성
  ③ 라우터에 동적 import 추가 ④ `notebooks/chNN_*.ipynb` 대응 노트북 ⑤ `tutorContext.json` 에 맥락 추가.
- `src/data/tutorContext.json` = AI 튜터 맥락 단일 소스(웹 `tutorContext.ts` + 노트북 `tutor.py` 공용).
- 포털(`apps/portal`)의 경로 지도 7단계가 이 부를 가리킨다 — 첫 챕터 공개 시 포털
  `curriculum.ts` 의 `comingSoon` 해제와 `chapterCount`/`minutes` 갱신을 함께 할 것.

## 콘텐츠 작성 규칙 (필수 — 대상이 수포자임)

1. 직관 먼저, 공식 나중 — 그림/비유 → 인터랙티브 조작 → 수식.
2. 새 용어·기호·수식은 예외 없이 즉시 설명("이름 + 읽는 법 + 뜻").
3. **"회수하는 수학" 연결 필수** — 6부의 존재 이유는 1~5부 수학의 총회수다. 각 장이 어느 부의 어느
   개념을 회수하는지(루트 README 표) `ConceptCard` 로 명시: 3장=5부 4장 CE, 4장=3부 4장 조건부확률+2부 7장
   시그모이드, 6·7장=5부 5장 KL, 8장=1부 9장 rank·11장 SVD.
4. 문제 표준: 본문 미니체크 2~3개 + 챕터 끝 10문제 `QuizSet`(완료 시 진도 처리). 계산형은 `StepQuiz`.
5. 웹 챕터 ↔ 노트북 1:1, 같은 예제.
6. 1부 8~12장을 건너뛴 학습자를 위해 **8장(LoRA)에 rank·저차원 최소 직관을 자체 포함**시킨다(로드맵 명시).
7. **"조련"은 비유어 — 실무 용어 앵커를 유지할 것.** 실무 명칭(사후 학습 post-training ·
   파인튜닝 fine-tuning · 정렬 alignment)은 ch0 새 용어 카드에서 정의하고 ch10 치환표에서 회수한다.
   비유(심판·목줄·시범 등)를 새로 만들면 반드시 같은 자리에서 실무 용어와 짝지을 것 —
   학습자가 이 과정 밖(동료·논문·문서)에서도 대화할 수 있어야 한다.
8. **부 간 참조 링크는 "지정석"에만** — AI 연결 카드(회수하는 수학)·완주 박스의 "N부 M장"은
   `<PartLink :part="N" ch="chM">` (@series/ui)로 연결하고, 본문 인라인 참조는 텍스트 유지
   (링크밭 방지). PartLink 는 조립 배포본에서만 링크로 동작(dev 단독 실행에선 텍스트).

## 자주 막히는 함정

- Ollama 없는 환경에서도 학습이 막히면 안 된다 — 튜터·데모는 항상 폴백을 갖출 것.
- 챕터 라우트를 `router/index.ts` 에 등록하지 않으면 catch-all 이 ComingSoonView 로 보낸다.
- Tailwind `@source`(style.css)가 빠지면 공용 컴포넌트 스타일이 조용히 사라진다 — 빌드는 통과하므로 눈으로 확인.
- 실습(조련 시뮬레이션)은 브라우저/노트북 안에서 도는 초소형 모델·시뮬레이션으로 — 실제 GPU 학습을 요구하지 말 것.

## 스택

Vue 3 + TypeScript + Vite + Pinia + Tailwind v4 + KaTeX + Chart.js. 튜터는 `@series/tutor`(로컬 Ollama).

## 이력

의미 있는 작업 후 `docs/99_history.md` 맨 위에 이력 추가.
