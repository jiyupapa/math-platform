# 수포자를 위한 정보이론 학습 프로그램 — 전체 계획

> 최종목표: **정보이론 지식을 이용해 AI 기반지식을 완성한다 — AI 의 손실함수(크로스 엔트로피)·성적표(퍼플렉시티)·창의성 다이얼(temperature)·정렬 페널티(KL)의 정체를 이해한다.**
> 대상: 수포자(단, 개발자) · 작성일: 2026-07-08 · 시리즈 5부 (1부 선형대수 · 2부 미분 · 3부 확률통계 · 4부 트랜스포머에 이어)

---

## 0. 시리즈에서의 위치 — 왜 정보이론인가

1~4부가 계속 밟고 지나가면서도 한 번도 뚜껑을 열지 않은 마지막 수학 조각이다:

- **1부 캡스톤**이 손실을 MSE 로 쓴 것은 사실 **log 를 피하려던 우회**였다. 진짜 LLM 손실은 크로스 엔트로피 — 그 복선을 여기서 회수한다.
- **4부**의 소프트맥스·temperature·다음 단어 확률이 전부 정보이론 위에 서 있는데 "그렇다더라"로 넘어갔다.
- LLM 성능 지표 **퍼플렉시티**, RLHF·증류(distillation)의 **KL 발산**, "압축 = 지능" 담론까지 — 요즘 AI 이야기를 읽는 데 바로 쓰인다.
- **3부 확률**(확률·분포·기대값) 위에 바로 쌓이고, **2부**의 로그·미분을 재사용한다. 분량은 기존 부들보다 한 단계 작다(10챕터 + 샘플).

---

## 1. 개발환경

- **웹 앱(브라우저):** Vue 3 + Vite + TypeScript + Tailwind v4 + Pinia + vue-router
- **실습 노트북:** Python Jupyter (`numpy` · `matplotlib` · `jupyterlab`) — **신규 수학 패키지 불필요** (엔트로피·허프만·bigram 모델 전부 numpy 로 가능)
- 대상이 개발자이므로 본격 빌드 파이프라인 사용 OK
- 참조 프로젝트: `C:\STUDY\MATH\part1-linear-algebra` (1부 — **시리즈 표준·골든 카피**. 2026-07-08 확정,
  `DetailsCard`·`NotebookCard` 포함 공용 컴포넌트 전체 보유)

## 2. 학습 방식 요구사항 (시리즈 공통)

- 단계별 자세한 설명 + 차트 + 인터랙티브 시각화 — **직관 먼저, 공식 나중**
- **새 용어·기호·수식이 나오면 반드시 설명**(`ConceptCard`) — 기호는 "이름 + 읽는 법 + 뜻" 세트로
- 계산형 문제는 최종 답만 받지 않고 **공식대로 중간 단계를 입력**하게 한다(`StepQuiz`)
- 문제 유형 3종: **객관식 + 참/거짓(O·X) + 숫자입력**
- 문제 구성: **본문 중간 미니체크 2~3개** + **챕터 끝 난이도별 10문제 세트**(완료 시 진도 처리)
- 다른 자료를 찾아보지 않아도 여기서 학습을 완료할 수 있게 **자기완결적으로** 쓴다
- 각 챕터에 **🤖 AI 연결 카드** 필수 + 웹/노트북 **AI 튜터**(로컬 Ollama, 챕터 맥락 인식)

## 3. 재사용 전략

1부(`part1-linear-algebra` — 시리즈 표준)의 web 스캐폴딩과 검증된 공통 컴포넌트를 **복제 후 정보이론에 맞게 수정**한다.
실제 작업의 핵심은 **정보이론 전용 시각화**와 **콘텐츠(커리큘럼)**.

| 자산 | 내용 | 충족 요구사항 |
|------|------|--------------|
| 웹 스택 | Vue 3 + Vite + TS + Tailwind v4 + Pinia + Router | 개발환경 |
| `MathBlock.vue` | KaTeX 수식 렌더 (inline/block) | 수식 표시 |
| `ChartView.vue` | Chart.js 래퍼 (bar/line/scatter) | 차트 |
| `ConceptCard.vue` | note/tip/warn/goal/ai 설명 카드 | 용어·기호 설명 |
| `DetailsCard.vue` | 접었다 펴는 "더 깊이" 보조 카드 | 심화 곁가지 격리 (bit/nat, 최대우도 등) |
| `Quiz.vue` / `StepQuiz.vue` | 자동채점 3종 / 단계별 입력 채점 | 문제 표준 |
| `QuizSet.vue` | 문제 묶음 집계 + 난이도 배지 | 난이도별 세트·진도 |
| `ReviewFlag.vue` + `ReviewView` | 섹션 복습 표시·복습 목록 | 복습 기능 |
| `NotebookCard.vue` | 짝 노트북 안내 카드 (항상 표시) | 웹↔노트북 연결 |
| `TutorChat.vue` + `tutor.py` | AI 튜터 (로컬 Ollama, 챕터 맥락 인식) | 질문 해결 |
| `progress.ts` / `review.ts` | localStorage 진도·복습 저장 | 진도 관리 |
| `notebooks/` | 웹 챕터와 1:1 짝 Jupyter + requirements.txt | Python 노트북 |

> **스캐폴딩 기점 확정(2026-07-08)**: **1부 복제**. 1부가 시리즈 표준(골든 카피)로 확정됐다(1부 `docs/00_plan.md` 1-B 참고 — 별도 허브/템플릿 저장소 구상은 이 결정으로 대체).
> 공용 파일 드리프트 점검은 1부 `scripts/check_drift.py` — **이 저장소를 생성하면 스크립트의 `PARTS` 목록에 (`information-theory`, `it`) 를 추가**할 것. QuizSet 스토리지 키 접두사는 `it-`.

## 4. 커리큘럼 (확정, 종착점 = AI 의 손실·평가·생성을 정보로 읽기)

모든 챕터가 "AI 는 불확실성을 줄이는 기계이고, 학습 = 세상 분포 흉내내기(KL 최소화)"라는
종착점을 향하도록 배열. ★ = 핵심 챕터.

| Phase | 챕터 | 핵심 | AI 연결고리 |
|-------|------|------|------------|
| **0** | 샘플 — 스무고개, 질문 하나의 가치 | 정보 = 줄어드는 불확실성, 좋은 질문 = 후보 절반 소거 | AI = 불확실성을 줄이는 기계 |
| **1** | 놀람의 크기 — 정보를 숫자로 재다 | 놀람 I = log₂(1/p), 비트, log 재도입("2를 몇 번 곱하나") | 희귀 토큰일수록 손실 기여가 큰 이유 |
| **2** | 아껴 쓰는 비트 — 압축의 원리 | 자주 나오면 짧게(허프만 직관), 압축의 한계 | **BPE 토큰화 = 압축** (4부 ch2 재회) |
| **3** | **엔트로피** ★ | 평균 놀람 H(p) = Σ p·log₂(1/p), 균등분포가 최대 | 모델 예측의 "자신 없음"을 재는 자 |
| **4** | **크로스 엔트로피** ★ | 틀린 지도(q)로 세상(p)을 부호화한 비용 H(p,q), 정답 원핫이면 −log q(정답) | **분류·LLM 손실함수의 정체** — MSE 와 비교 |
| **5** | **KL 발산** ★ | 초과 비트 D(p‖q) = H(p,q) − H(p), 비대칭성 | RLHF 의 KL 페널티, 증류(distillation) |
| **6** | AI 학습의 정체 — 흉내내기의 수학 | 훈련 = 데이터 분포와 모델 분포의 **KL 최소화** = 크로스 엔트로피 최소화 | "AI 가 배운다"의 한 줄 정의 (최대우도는 DetailsCard) |
| **7** | 퍼플렉시티 — LLM 의 성적표 | 2^(크로스 엔트로피) = "평균 몇 갈래에서 고민하나" | GPT 벤치마크 지표 읽기 |
| **8** | temperature — 창의성 다이얼의 정체 | 소프트맥스 온도 = 분포의 **엔트로피 조절기** | 4부 ch12(top-k·top-p) 재해석 |
| **9** | 문맥의 가치 — 조건부 엔트로피·상호정보량 | 알면 줄어드는 불확실성 H(X\|Y), I(X;Y) 벤다이어그램 | 문맥이 다음 단어 예측을 쉽게 만드는 이유, 어텐션 직관 보강 |
| **10** | 🎓 캡스톤 — 손실함수를 갈아 끼우다 | 1부 미니 신경망의 MSE → 크로스 엔트로피 교체 + 문자 언어모델 퍼플렉시티 | **시리즈 대단원** |

각 챕터 = (1) 웹 인터랙티브 본문 + 본문 중간 미니체크 + 챕터 끝 난이도별 10문제 + (2) 짝 Jupyter 노트북.

### 흐름 설계

- **직관 트랙 (0~3)**: 게임(스무고개)에서 출발해 놀람 → 비트 → 엔트로피까지. log 는 1장에서 게임으로 재도입.
- **손실 트랙 (4~6)**: 크로스 엔트로피 → KL → "학습 = KL 최소화" — 이 세 챕터가 5부의 심장.
- **LLM 트랙 (7~8)**: 퍼플렉시티·temperature — 4부에서 기계적으로 배운 것을 정보이론으로 재해석.
- **심화 + 대단원 (9~10)**: 상호정보량, 그리고 캡스톤.

### 시리즈 연결 (대단원)

- **1부 캡스톤 회수**: MSE 를 크로스 엔트로피로 교체하면 출력층 기울기가 (ŷ − y) 로 **오히려 단순해짐**을 확인 — 1부에서 "받아 적은 선물"(σ′)과 5부의 −log q 가 만나 풀리는 순간.
- **2부**: log 와 그 미분(ch7), 경사하강(ch9) 재사용. **3부**: 확률·분포·기대값(ch3·5) 위에 엔트로피를 쌓는다.
- **4부**: 토큰화(ch2)=압축, 소프트맥스(ch0·9)·temperature(ch12)를 정보이론 언어로 다시 읽는다.

## 5. 캡스톤 (노트북 전용, 1부 전례를 따름)

1. **손실 교체 실험**: 1부 캡스톤의 동심원 분류 신경망을 가져와 MSE → 크로스 엔트로피(BCE)로 교체.
   기울기 단순화 확인(수치미분 검산 재사용) + 두 손실의 학습 곡선 비교.
2. **미니 언어모델**: 문자 단위 bigram 모델로 실제 텍스트의 퍼플렉시티를 계산하고,
   temperature 샘플링으로 문장 생성 — 4부 이론을 numpy 로 손수 재현.

## 6. 정보이론 전용 신규 시각화

| 컴포넌트 | 챕터 | 내용 |
|----------|------|------|
| `TwentyQuestions` | 0 | 업다운 게임 — 질문마다 남은 후보 수가 절반씩 (log 체감) |
| `SurpriseMeter` | 1 | 확률 슬라이더 → 놀람 게이지 (p→1 이면 0, p→0 이면 폭발) |
| `CodeBuilder` | 2 | 글자 빈도 조절 → 코드 길이·평균 비트 실시간 |
| `EntropyExplorer` | 3 | 분포 막대 드래그 → H 실시간, 균등에서 최대 확인 |
| `CrossEntropyLab` | 4 | 세상 p 고정, 내 예측 q 드래그 → 비용 H(p,q), q=p 에서 최소 체감 |
| `KLVisualizer` | 5 | 두 분포 겹쳐 그리기 → D(p‖q) vs D(q‖p) 비대칭 체감 |
| `PerplexityGauge` | 7 | 문장의 토큰별 −log p 막대 + "몇 갈래 고민" 환산 |
| `TemperatureDial` | 8 | 로짓 고정, T 슬라이더 → 분포와 엔트로피가 함께 변함 |
| `InfoVenn` | 9 | 결합분포 조작 → H(X)·H(X\|Y)·I(X;Y) 벤다이어그램 |

## 7. 수포자 함정 관리

- **log 가 최대 장벽**: ch1 에서 "절반으로 몇 번 접나 / 2를 몇 번 곱하나" 게임으로 재도입하고 2부 ch7 을 명시 복습. 공식보다 스무고개 질문 수로 먼저 체감시킨다.
- **0·log 0 = 0 관례**, **bit(log₂) vs nat(ln) 밑 변환**은 본문에서 다루지 않고 `DetailsCard` 로 격리.
- **크로스 엔트로피 vs KL 혼동**: "지도 값 전체(H(p,q)) vs 초과분(D)" 비유 하나로 처음부터 구분해 도입.
- 챕터당 30~45분, 총 10챕터 + 샘플 — 기존 부들보다 짧게 끝나는 설계를 유지할 것 (심화 욕심 금지).

## 8. 디렉터리 구조 (예정)

```
information-theory/
├─ docs/
│  ├─ 00_plan.md            ← 본 문서 (단일 기획 문서)
│  └─ 99_history.md         ← 작업 이력 (최신 위로)
├─ web/                     ← Vue 앱 (1부 복제 후 수정)
│  └─ src/
│     ├─ data/chapters.ts       ← 단일 소스 — 목차·진도·라우팅 파생
│     ├─ data/tutorContext.json ← AI 튜터 챕터 맥락 (웹·노트북 공용)
│     ├─ components/            ← 공통 + 6절의 전용 시각화
│     ├─ chapters/ · views/ · stores/ · router/
└─ notebooks/               ← 챕터별 Python 실습 노트북 + tutor.py
   ├─ requirements.txt
   └─ ch00_sample.ipynb …
```

## 9. 실행 방법 (Run)

### 웹 앱
```bash
cd web
npm install
npm run dev      # 개발 서버 → http://localhost:5173
npm run build    # 검증 수단 (vue-tsc 타입체크 + vite 빌드)
```

### Python 노트북
```bash
cd notebooks
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m ipykernel install --user --name infotheory-venv --display-name "Python (information-theory .venv)"
jupyter lab
```

## 10. 진행 현황 / 다음 행동

- ✅ **커리큘럼 확정** (본 문서, 2026-07-08) — 챕터 0~10 + 전용 시각화 9종 + 캡스톤 설계.
- ✅ **스캐폴딩 기점 확정** (2026-07-08) — 1부 복제 (1부 = 시리즈 표준, 3절 참고).
- ✅ **Phase 0 완료** (2026-07-08) — 1부 복제 스캐폴딩(`it-` 접두사, 드리프트 점검 통과) + `TwentyQuestions` 시제품 + 샘플 챕터 "스무고개" + 짝 노트북 `ch00_sample.ipynb`. 상세는 `99_history.md`.
- ✅ **Phase 1 완료** (2026-07-08) — 1장 "놀람의 크기": `SurpriseMeter` + `Chapter1.vue`(미니체크 4 + 10문제) + `ch01_surprise.ipynb`. 상세는 `99_history.md`.
- ✅ **Phase 2 완료** (2026-07-08) — 2장 "아껴 쓰는 비트": `CodeBuilder`(허프만 실시간) + `Chapter2.vue` + `ch02_compression.ipynb`. 상세는 `99_history.md`.
- ✅ **Phase 3 완료** (2026-07-08) — 3장 "엔트로피" ★: `EntropyExplorer`(막대 드래그) + `Chapter3.vue` + `ch03_entropy.ipynb`. 상세는 `99_history.md`.
- ✅ **Phase 4 완료** (2026-07-08) — 4장 "크로스 엔트로피" ★: `CrossEntropyLab`(q 드래그, 바닥 눈금) + `Chapter4.vue` + `ch04_cross_entropy.ipynb`. 상세는 `99_history.md`.
- ✅ **Phase 5 완료** (2026-07-08) — 5장 "KL 발산" ★: `KLVisualizer`(두 분포 드래그, 두 게이지) + `Chapter5.vue` + `ch05_kl_divergence.ipynb`. 상세는 `99_history.md`.
- ✅ **Phase 6 완료** (2026-07-08) — 6장 "AI 학습의 정체": `MimicTrainer`(진짜 경사하강 훈련소) + `Chapter6.vue` + `ch06_learning_as_kl.ipynb`. 손실 트랙(4~6) 완주. 상세는 `99_history.md`.
- ✅ **Phase 7 완료** (2026-07-08) — 7장 "퍼플렉시티": `PerplexityGauge`(토큰별 q 슬라이더 채점기) + `Chapter7.vue` + `ch07_perplexity.ipynb`. 상세는 `99_history.md`.
- ✅ **Phase 8 완료** (2026-07-08) — 8장 "temperature": `TemperatureDial`(T 슬라이더 + 🎲 생성) + `Chapter8.vue` + `ch08_temperature.ipynb`. LLM 트랙(7~8) 완주. 상세는 `99_history.md`.
- ✅ **Phase 9 완료** (2026-07-08) — 9장 "문맥의 가치": `InfoVenn`(적중률 슬라이더 + 벤다이어그램) + `Chapter9.vue` + `ch09_conditional_mutual.ipynb`(실제 텍스트로 문맥 가치 실측). 상세는 `99_history.md`.
- ✅ **Phase 10 완료** (2026-07-08) — 🎓 캡스톤: `ch10_capstone.ipynb`(MSE→CE 교체 + σ′ 소거 수치검산 + bigram LM 퍼플렉시티·temperature 생성) + `Chapter10.vue`(여정 지도 + 졸업 시험). 상세는 `99_history.md`.
- 🎉 **5부 콘텐츠 전체 완성** (2026-07-08) — 챕터 0~10 전부 공개(11개), 전용 시각화 10종(6절 9종 + `MimicTrainer`), 짝 노트북 11개(전부 `nbconvert --execute` 무에러), AI 튜터 맥락 11개, 드리프트 없음. 남은 것: 실사용 피드백 반영·오탈자 수정 등 유지보수.
