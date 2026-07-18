# 작업 이력 (최신 위로)

## 2026-07-18

### 📎 비유 앵커링 보수 — ch10 "오르막/내리막" (시리즈 전수 점검 반영, A급)
상관의 방향을 본문·정의 카드·퀴즈까지 "오르막/내리막"으로만 부르고 **양의 상관/음의 상관**이라는
표준 어휘가 챕터 전체에 없던 것 → 새 기호 카드(r 의 부호=방향)에 **양의 상관(positive correlation)/
음의 상관(negative correlation)** 병기 + 미니체크 해설에 재확인. `npm run build` 통과.

## 2026-07-08 (5차 — 목차 필수/심화 트랙 표시)

- 시리즈 루트 `C:\STUDY\MATH\README.md` 추천 학습 경로 연동: 트랜스포머(4부) 이해에 필수가 아닌
  ch8~ch10(추정·신뢰구간, 가설검정·p값, 상관·회귀)을 심화 트랙으로 구분.
- `chapters.ts` 에 `ChapterMeta.advanced?: boolean` 추가, `AppSidebar`·`HomeView` 목차에 「심화」 배지(violet)
  + 홈 목차 상단 안내 문구. 1부(ch7~ch12)에도 동일 적용. `npm run build` 통과.

## 2026-07-08 (4차 — 디렉토리명 표준화)

- 저장소 디렉토리명 통일: **stat4beginner → part3-probstat** (시리즈 순번 접두 part1~4).
  docs/00_plan·CLAUDE.md·notebooks/README·settings.local.json 의 절대경로·자기참조 갱신.
- 웹(@/ 상대경로)·localStorage 접두사(stat-)·git 무영향. venv 는 `python -m venv` 로 스크립트 복구.

## 2026-07-08 (3차 — 시리즈 표준 동기화)

- 1부(linear-algebra)가 시리즈 골든 카피로 확정됨(1부 docs/00_plan.md 1-B)에 따라 공용 컴포넌트 전파 수령:
  - `MathBlock` KaTeX 폴백 HTML 이스케이프(하드닝) + 사용 예시 주제 중립화, `ConceptCard` `ai` 톤 추가,
    `progress` 스토어 localStorage 형태 검증.
  - **퀴즈 트리오** `Quiz`/`StepQuiz`/`QuizSet`/`quizGroup` 를 1부 표준판으로 교체 — 풀이 영속화(재방문 복원),
    2회 오답 시 "해설 보기" 출구. 스토리지 키는 `stat-` 접두사 유지.
- 검증: `npm run build` 통과. 드리프트 점검은 1부 `scripts/check_drift.py` (현재 무드리프트).

## 2026-07-08 (2차 — 수포자 자기완결성 검수·보완)

- **전 챕터 "수포자 자기완결성" 검수**: "중학 수학만 기억하는 학습자가 외부 자료 없이 완주 가능한가"
  기준(무설명 용어·계산기 없이 못 푸는 문제·선행지식 가정·포기 위험 지점·본문-문제 불일치)으로
  11개 챕터 전문 감사 → 전 챕터 완주 가능 판정, 보완 사항 중 4건·하 10여 건 발견.
- **보완 수정 반영**:
  - ch4: ⟺ 기호 제거(평문화), ∝ 기호 괄호 설명, 위양성 89.1→89 반올림 언급.
  - ch8: "%p(퍼센트포인트)" 새 단위 카드 신설. ch9: α 카드에 "참인 H₀을 5%까지 잘못 기각 허용"
    해석 추가(문제 세트 hard 출제 근거), StepQuiz 합동 비율 괄호 정의.
  - 샘플: "경험적 비율"→평이화, "계산기 OK" 안내 추가. ch1: "분포" 괄호 정의. ch2: "2부에서
    배운"→"2부에서 다루는". ch3: 덧셈법칙 뒤 미니체크 1개 추가. ch5: μ 읽는 법, C(n,k)=이항계수
    표기 동일 명시. ch6: N(μ,σ²) 둘째 자리=분산 관례 설명. ch7: "주사위에서 이미 본"→동전 사실화.
  - 홈: "처음이신가요? 샘플 챕터부터" 안내 박스, chapters.ts 샘플 요약을 학습자 문구로.
- **검수 오탐 기각 1건**: ch10 상관계수 "약 0.98"이 틀렸다는 지적은 검수자 오산(Syy 2150≠2050)
  — 실측 r=0.9815 로 본문이 정확해 수정하지 않음.
- 검증: `npm run build` 통과, 보완 문구 존재 grep 확인. (노트북은 미변경)

## 2026-07-08

- **전 챕터 콘텐츠 완성 + 최종 검증 (Phase 0~10 전부 공개)**
  - 웹 챕터 11개 작성: 샘플(동전 던지기 맛보기) + Chapter1~10 (각 300~450줄).
    챕터마다 목표 카드 → 용어 즉시 설명(ConceptCard) → 인터랙티브 시각화 → 미니체크 3~5개 →
    🤖 AI 연결 섹션 → 난이도별 10문제 QuizSet(StepQuiz 포함, 완료 시 진도 처리) → 완료 박스.
  - 확률통계 전용 시각화 13종 신규 작성: CoinFlipSim, MeanMedianExplorer, HistogramBuilder,
    DeviationExplorer, DiceSim, BayesGrid, BinomialExplorer, NormalExplorer, GaltonBoard,
    CLTSimulator, CISimulator, ABTestSimulator, RegressionExplorer.
  - 짝 노트북 11개 작성 (`ch00_sample` ~ `ch10_correlation_regression`): AI 튜터 셀,
    Malgun Gothic 폰트 설정, 시드 고정(`default_rng(42)`), scipy 검산 포함.
  - 검증: `npm run build`(vue-tsc 타입체크) 통과 · 노트북 11개 전부 `jupyter-nbconvert.exe
    --execute` 무에러 · 구조 점검(챕터별 markDone/QuizSet 10문제/question 중복 없음/ReviewFlag/
    KaTeX 백슬래시 규칙) 통과.
  - 함정 발견 → CLAUDE.md 반영: 노트북 검증은 `python -m jupyter nbconvert` 가 아니라
    **venv 의 `jupyter-nbconvert.exe` 직접 호출**로 할 것 (PATH 의 시스템 Python 으로 새는 문제).

## 2026-07-07

- **프로젝트 기반 구축 (Phase 0 스캐폴딩)**
  - 2부(`differentiation`)의 web 스캐폴딩·공통 컴포넌트 복제 후 확률과 통계로 브랜딩
    (타이틀, localStorage 키 `stat-progress-v1`/`stat-review-v1`, AI 튜터 프롬프트·추천 질문).
  - 커리큘럼 확정: 워밍업(동전 던지기) + 10챕터, 종착점 = "AI 는 확률로 예측하고 데이터로 배운다"
    (`docs/00_plan.md`). `chapters.ts` · `router/index.ts` · `tutorContext.json`(챕터별 튜터 맥락) 작성.
  - 노트북 인프라: `tutor.py` 이식(확률통계 문구), `requirements.txt`(scipy 추가), `README.md`, venv 구성.
  - 검증: `npm run build` 통과 (플레이스홀더 챕터 11개 포함).
