# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 정체성

"수포자를 위한 AI 수학 시리즈"의 **8부 — 최적화 (학습의 다이얼)**. **이론 심화 트랙** —
2부 9장이 "경사하강이 뭔가"에서 멈춘 이야기의 실전층. 실제 학습을 지배하는 다이얼들
(학습률·미니배치·모멘텀·Adam·스케줄·정규화)의 수학을 직접 조작하며 이해하게 한다.
도달점은 **11장(캡스톤 — 파인튜닝 설정 파일 완독)**: `lr`·`warmup_steps`·`batch_size`·
`weight_decay` 가 전부 읽히고 손실 곡선을 보고 무엇을 고칠지 아는 상태. **6부(조련)의 실전 짝꿍.**
핵심 한 줄: **"학습은 안개 낀 산을 내려가는 여행이다 — 보폭·관성·일정표가 도착지를 정한다."**

> **상태: 콘텐츠 제작 중 (2/12 — 워밍업·1장 공개)** — 앱 셸·목차·스토어·튜터 완성, ch2~11은 comingSoon.
> 챕터 구성·회수하는 수학 매핑은 루트 `README.md` "8부 챕터 구성안" 표가 정본.

## 공용 컴포넌트 — 모노레포 `packages/ui`

공용 컴포넌트(`MathBlock`·`ConceptCard`·`Quiz`·`QuizSet`·`StepQuiz`·`PartLink` 등)와 규칙은 루트 `CLAUDE.md` 참조.
앱전용 결합은 `main.ts` 의 provide 로 주입(접두사·복습·노트북 리졸버).

## 명령어 (루트에서)

```bash
npm run dev   -w apps/part8/web    # 개발 서버
npm run build -w apps/part8/web    # 타입체크 + 빌드 (= 검증)
```

## 아키텍처

- **저장 접두사 `opt`** — `opt-progress-v1`(진도)·`opt-review-v1`(복습)·`opt-quizset-v1:*`(문제).
  **바꾸면 사용자 진도가 끊기고 포털 연동(2층)도 깨진다.**
- `src/data/chapters.ts` = 목차 단일 소스. 챕터 공개 = ① comingSoon 제거 ② `src/chapters/ChN.vue` 작성
  ③ 라우터에 동적 import 추가 ④ `notebooks/chNN_*.ipynb` 대응 노트북 ⑤ `tutorContext.json` 에 맥락 추가.
- `src/data/tutorContext.json` = AI 튜터 맥락 단일 소스(웹 `tutorContext.ts` + 노트북 `tutor.py` 공용).
- 포털(`apps/portal`)의 경로 지도 10단계(선택·심화 분기)가 이 부를 가리킨다 — 첫 챕터 공개 시 포털
  `curriculum.ts` 의 `comingSoon` 해제와 수치 갱신을 함께 할 것.

## 콘텐츠 작성 규칙 (필수 — 대상이 수포자임)

1. 직관 먼저, 공식 나중 — 그림/비유 → 인터랙티브 조작 → 수식.
2. 새 용어·기호·수식은 예외 없이 즉시 설명("이름 + 읽는 법 + 뜻").
   **비유어를 만들면 같은 자리에서 실무 용어와 짝지을 것** — 이 부의 비유 체계(여행/등산):
   보폭=학습률(learning rate)·안개 낀 산=손실 지형(loss landscape)·흔들리는 나침반=미니배치
   SGD·관성=모멘텀(momentum)·여행 일정표=학습률 스케줄(lr schedule)·통째로 외움=과적합
   (overfitting)·안전장치=정규화(regularization).
3. **"회수하는 수학" 연결 필수** — 각 장이 어느 부의 어느 개념을 회수하는지(루트 README 표)
   `ConceptCard` 로 명시: 2장=2부 9장 경사하강, 3장=3부 5·7장(표본·1/√B), 8장=6부 6장 KL 목줄,
   10장=7부 4·5장(고차원·PCA 슬라이스), 6·11장=6부 3장(SFT 설정 직결).
4. 문제 표준: 본문 미니체크 2~3개 + 챕터 끝 10문제 `QuizSet`(완료 시 진도 처리). 계산형은 `StepQuiz`.
5. 웹 챕터 ↔ 노트북 1:1, 같은 예제.
6. **실습은 전부 오프라인·결정적** — 브라우저/노트북에서 즉시 도는 1~2차원 toy 손실 지형과
   초소형 모델(시드 고정). 실제 GPU 학습을 요구하지 말 것.
7. 부 간 참조 링크는 "지정석"(AI 연결 카드·완주 박스)에만 `PartLink` 사용, 본문 인라인은 텍스트.
8. **6부와의 구도 유지** — 6부가 "무엇을 배우게 할까"(데이터·손실)라면 8부는 "**어떻게 잘 배우게
   할까**"(다이얼). 8장 weight decay ↔ 6부 6장 KL 목줄("멀리 못 가게 묶는다"의 두 얼굴)을 명시 대비.
9. **분량 방침: 줄이지 않는다** — 장 병합·주제 삭제 금지, 자세한 설명을 위한 확장은 환영
   (2026-07-11 사용자 지침 — 메모리 `content-depth-over-brevity`).

## 자주 막히는 함정

- Ollama 없는 환경에서도 학습이 막히면 안 된다 — 튜터·데모는 항상 폴백을 갖출 것.
- 챕터 라우트를 `router/index.ts` 에 등록하지 않으면 catch-all 이 ComingSoonView 로 보낸다.
- Tailwind `@source`(style.css)가 빠지면 공용 컴포넌트 스타일이 조용히 사라진다 — 빌드는 통과하므로 눈으로 확인.
- 손실 지형·훈련 시뮬은 차원·스텝 수를 작게 잡아 브라우저/노트북에서 즉시 돌게 할 것.
- 훈련 시뮬의 난수는 반드시 시드 고정(웹 mulberry32 · 노트북 default_rng(시드)) — 결정적이어야 E2E·assert 가 성립.

## 스택

Vue 3 + TypeScript + Vite + Pinia + Tailwind v4 + KaTeX + Chart.js. 튜터는 `@series/tutor`(로컬 Ollama).

## 이력

의미 있는 작업 후 `docs/99_history.md` 맨 위에 이력 추가.
