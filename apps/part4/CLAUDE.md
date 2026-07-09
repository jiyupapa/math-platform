# CLAUDE.md — 수포자를 위한 트랜스포머

> 이 repo에서 일하는 법(가드레일)만 짧게 담는다.
> **전체 계획·로드맵 → `docs/00_plan.md`**, **작업 이력 → `docs/99_history.md`**(최신이 위로). 중복 금지.

## 🎯 궁극 목표
LLM이 *"다음 단어를 확률로 고르는 기계"*이며 그 핵심 부품이 **트랜스포머**임을, 수포자·AI 초보자가
공식을 외우지 않고 직접 조작하며 이해하게 한다. 도달점은 **ch10(전체 조립)**.
→ **모든 챕터는 그 개념이 트랜스포머/LLM 어디에 쓰이는지 연결을 포함한다.**

## 반드시 지킬 규칙 (설계 철학)
1. **직관 먼저, 공식 나중** — 그림/비유 먼저, 수식은 마지막.
2. **글자보다 움직임** — 핵심 개념은 슬라이더/드래그로 실시간 조작하는 인터랙티브로.
3. **🔑 새 용어·기호·수식은 예외 없이 즉시 설명** — "이름 + 읽는 법 + 뜻" 세트.
4. **🤖 트랜스포머 연결 카드 필수** — 각 챕터에 `ConceptCard tone="ai"` 로 LLM 활용 연결.
5. **문제 구성** — 본문 미니체크 2~3개(진도 미포함) + 챕터 끝 10문제(`QuizSet`, 난이도별·유형 혼합,
   힌트·해설). 전부 풀면 진도 완료. **계산형(2단계 이상)은 `StepQuiz`** 로 중간 단계까지 채점.
6. **웹 ↔ 노트북 1:1** — 웹 챕터마다 대응 `.ipynb` 를 같은 예제로.
7. **톤** — 성인/학생 대상. 유치하지 않게, 지적 자존심 존중.

## 새 챕터 추가 절차
1. `web/src/data/chapters.ts` — 해당 항목의 `comingSoon` 제거 (목차·진도·라우팅의 단일 소스).
2. `web/src/chapters/ChapterN.vue` — **`SampleChapter.vue` 구조를 본보기로** 작성.
3. `web/src/router/index.ts` — 동적 import 라우트 추가 (`:slug` catch-all 위에).
4. `notebooks/chNN_*.ipynb` — 대응 노트북 (웹과 같은 예제).
5. `npm run build` 로 검증 → `docs/99_history.md` 에 이력 한 줄.

## 재사용 컴포넌트 (재발명 금지 — 먼저 이걸 쓴다)
- `ConceptCard`(note/tip/warn/goal/ai) · `DetailsCard`(접는 "더 깊이 알아보기") · `MathBlock`(KaTeX)
- `ChartView`(vue-chartjs) · `Quiz`/`StepQuiz` · `QuizSet`(집계→진도) · `ReviewFlag`(섹션 복습)
- 챕터별 인터랙티브는 새로 만들되(예: `SoftmaxLab`), `v-model` 로 상태를 챕터와 공유하는 패턴을 따른다.
- 공용 계산 로직은 `web/src/utils/` 에 (예: `softmax.ts`). 웹·노트북이 같은 결과를 내는지 확인.

## AI 튜터 (챗봇) — 시리즈 공통 기능
- 웹: `components/TutorChat.vue`(우하단 플로팅 🤖) + `lib/ollama.ts`(로컬 Ollama 클라이언트).
  노트북: `notebooks/tutor.py`(`chat/ask/explain`), 각 노트북 맨 위에 튜터 셀.
- **맥락 단일 소스**: `web/src/data/tutorContext.json`(`contexts`/`curriculumIndex`/`fallback`) — 웹·노트북 공유.
  각 context 는 `[N장 제목]` 으로 시작(노트북이 제목 추출). 새 챕터 추가 시 여기에 맥락 한 항목 추가.
- 로컬 LLM(Ollama, 기본 `gemma4:e2b`)이라 API 키·비용·인터넷 불필요. 미실행 시 안내만 뜨고 학습엔 지장 없음.
- 주제 이탈 방지: 시스템 프롬프트가 트랜스포머·LLM·관련 수학·학습 고민 외엔 `[OFFTOPIC]` 만 출력하게 함(UI가 걷어냄).

## 운영
- 스택: Vue 3 + TS + Vite + Vue Router + Pinia + KaTeX + vue-chartjs + Tailwind v4 / Jupyter + NumPy (+ Ollama 튜터).
- 진도·복습은 Pinia + localStorage(`tf-progress-v1`, `tf-review-v1`).
- 변경 후 반드시 `npm run build`(필요 시 노트북 `nbconvert --execute`)로 검증.
- KaTeX 수식을 `:steps`/`:hints` 같은 **JS 표현식 속성**에 넣을 땐 백슬래시 이스케이프 주의(`'\\div'`),
  정적 `expr="..."` 속성은 단일 백슬래시(`expr="\div"`). 속성 안 중첩 따옴표는 「」 등으로 회피.
