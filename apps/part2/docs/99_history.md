# 작업 이력 (History)

이 프로젝트의 작업 내역을 시간순으로 기록한다. **최신 항목이 맨 위**.
새 작업을 마칠 때마다 항목을 추가한다 (형식: 날짜 · 무엇을 · 산출물/검증).

---

## 2026-07-18

### 📎 비유 앵커링 보수 — ch1 "골짜기" (시리즈 전수 점검 반영)
ch1 AI 미리보기에서 코인되는 "가장 낮은 골짜기"가 실제 용어 없이 8챕터 뒤(ch9)에야 앵커되던 것
→ 코인 자리에 **최솟값(minimum, 미니멈)** 병기 + "골짜기 = 손실의 최솟값" 명시. `npm run build` 통과.

## 2026-07-08

### 📁 디렉토리명 표준화 — differentiation → part2-differentiation
시리즈 4개 저장소 순번 접두 통일(1부 part1-linear-algebra … 4부 part4-transformer). 이 저장소 rename에 따라 docs/00_plan·CLAUDE.md·notebooks/README·settings.local.json 의 절대경로·자기참조 갱신. 웹(@/ 상대경로)·localStorage 접두사(diff-)는 무영향. venv 는 `python -m venv` 로 스크립트 복구 + Jupyter 커널(part2-differentiation-venv) 재등록.

### 시리즈 표준(1부 linear-algebra) 동기화 — 공용 컴포넌트 일괄 수령
1부가 시리즈 골든 카피로 확정됨(1부 docs/00_plan.md 1-B)에 따라 전파 수령:
- `MathBlock` — KaTeX 렌더 실패 폴백에 HTML 이스케이프(보안 하드닝), 사용 예시 주제 중립화.
- `ConceptCard` — `ai` 톤 추가 (🤖, violet).
- `progress` 스토어 — localStorage 손상값 형태 검증(Array.isArray + 문자열 필터).
- **퀴즈 트리오** `Quiz`/`StepQuiz`/`QuizSet`/`quizGroup` — 1부 표준판으로 교체: 풀이 현황 localStorage 영속화(재방문 시 푼 문제 복원), 2회 오답 시 "📖 막혔어요 — 해설 보기" 출구, 저장값 형태 검증. 스토리지 키는 `diff-` 접두사 유지.
- 검증: `npm run build` 통과. 드리프트 점검 도구는 1부 `scripts/check_drift.py` (현재 무드리프트).

## 2026-07-07

### 후속 학습 메모 추가 — 적분 필요성 정리 (완료)
- `docs/00_plan.md`에 §7 "후속 학습 메모 — 적분은 필요한가?" 추가.
- 요지: 본 커리큘럼 종착점(경사하강법·역전파)까지 적분 불필요. 확률·통계(기댓값)·생성 모델 단계에서 개념 직관 수준만 필요. 우선순위 = 미분 ≫ 선형대수 > 확률·통계 > 적분 테크닉(생략 가능).

---

## 2026-06-17

### 노트북 자기완결성 감사 + 보완 (완료)
- 목적: 웹과 같은 기준으로 노트북(개발자-수포자 대상, 웹의 선택적 보충)의 자기완결성 감사. 서브에이전트 3팀이 11개 노트북의 마크다운/주석을 정독.
- **수학 정확성: 전 노트북 오류 0** (ch06 (x²+1)³ 주석 `6x(x²+1)²`·ch07 σ'=σ(1−σ)·ch10 역전파 42/28/14·미니 루프 수렴까지 실행 검증). 외부참조 떠넘김(유형4) 없음(실습셀이 답 인라인 제공).
- **실제 이슈 수정:** `ch01_functions_slope.ipynb` 에 잘못된 커널로 in-place 실행됐던 `ModuleNotFoundError: sympy` 출력 5셀이 커밋돼 있던 것 → 전 노트북과 동일하게 출력 비움(clean).
- **마크다운 자기완결성 보완(첫 등장 기호 정의):** ch00 `f'` 프라임 명명; ch01 `Δ` 델타 명명; ch02 "왜 h=0 을 못 넣나 = 0/0" 극한 동기 + (2+h) 전개; ch07 시그모이드 정의 σ(t)=1/(1+e⁻ᵗ)를 마크다운에도 명시; ch08 `∂` 기호 명명; ch09 `η`(에타=학습률=보폭) 정의 + "기울기는 오르막이라 부호를 뺀다" 직관; ch10 국소미분 규칙 근거(덧셈=국소미분 1 통과, 곱셈=∂(xy)/∂x=y, 상류×국소=연쇄법칙).
- **검증:** 보완 후 11개 노트북 전부 `differentiation-venv` 커널 재실행 통과, 각 보완 문구 정확히 1회 삽입·JSON 유효 확인.

### 수포자 자기완결성 감사 + 보완 (완료)
- 목적: "수포자가 다른 자료 참조 없이 이해 가능한가" 관점 감사(정답 정확성과 별개). 서브에이전트 4팀이 전 11챕터를 '중학수학만 기억하는 초보' 눈으로 정독, 선사용·미정의·도약을 위치별로 지적.
- **내용 오류 1건 수정:** Chapter6 (x²+1)³ 미디엄 퀴즈 해설 `6x(x²+1)` → `6x(x²+1)²` (제곱 누락, 같은 챕터 StepQuiz 표기와 모순이던 것).
- **설명 없이 전제된 대수 보완:** sample에 x²=x×x 리마인더; ch2 (1+h)² 전개 한 줄 삽입(최대 이탈 지점) + f(3)=9·f(1)=1 명시; ch3 (x+h)² 전개·h 약분 근거 추가; ch4 프라임 (식)'의 뜻·x^n/x^{n-1} 거듭제곱 설명·계수 용어 정의 앞당김; ch5 지수법칙 x·x³=x⁴ 해설 보강·u,v=f,g 명시.
- **미정의 기호/용어 선사용 보완:** ch7 e^x는 지수 자리에 x(밑 변수 x^n과 대비)·음수지수 e^{-x}=1/e^x·σ '시그마' 읽기·ln 미분 직관(1/x 완만) 추가; ch9 벡터=숫자 목록 정의·그래디언트 오르막 직관·`←`는 대입(등호 아님) 설명; ch10 역전파 시작값 ∂L/∂L=1 근거; ch1 `·`→`×` 통일.
- **검증:** `npm run build` 통과(110 모듈), KaTeX 434식 throwOnError 전부 정상.
- 총평: 설계(그림→숫자→공식, 새 기호마다 ConceptCard)는 원래도 자기완결성이 높았고, 위 소수의 구멍(대수 전제·기호 선사용)을 메워 실제 초보 이탈 지점을 제거함. 남은 극히 사소한 항목(x⁰=1 근거 등)은 학습을 멈출 수준 아님.

### 전체 QA 패스 (완료 — 결함 0, 수정 불필요)
- **빌드/타입:** `npm run build` 통과(110 모듈, 타입에러 0).
- **퀴즈 정답 검증:** 서브에이전트 4팀 병렬로 전 11챕터의 모든 Quiz/StepQuiz를 SymPy·수기 재계산 — 숫자 정답, 객관식 보기 인덱스, 참/거짓 극성, 오차허용(비정수 답 tolerance 존재), 해설 일관성까지 전부 정확. 문제 0건.
- **집계 안전:** 각 QuizSet 문제 10개 모두 고유 question 문자열(중복 없음) → provide/inject 집계 정상.
- **라우팅/메타:** /ch/ch1~ch10 + sample 라우트 완비, chapters.ts 에 comingSoon:true 잔여 없음(전 챕터 공개), tutorContext 챕터 맥락 11/11 완비·'(예정)' 잔여 0.
- **노트북 실행:** 11개 전부 `differentiation-venv` 커널로 헤드리스 실행(nbconvert --execute) 통과 — sympy 계산·각 실습셀 assert 포함 무오류. (주의: 노트북 kernelspec 기본값 python3=시스템 파이썬은 sympy 미설치라 반드시 differentiation-venv 커널 선택 필요 — requirements.txt·README에 안내됨.)
- **수식 렌더:** 전 챕터 KaTeX 수식 390개를 throwOnError로 렌더 검증 — 전부 정상, 깨지는 식 0.
- **결론:** 콘텐츠·문제·시각화·노트북 전 영역 QA 통과. 미검증 항목은 실제 브라우저에서의 시각적 반응성/모바일 레이아웃뿐(반응형 Tailwind 클래스·SVG max-w-full 적용됨).

### Phase 10 — 미분의 응용: 역전파 직관 (마지막, 완료·검증) 🎓
- 챕터 작성 — `Chapter10.vue`: 계산그래프(L=(xy+z)² → p=xy,q=p+z,L=q²), 국소 미분, 순전파→역전파(상류×국소미분=연쇄법칙 반복; 덧셈=복사, 곱셈=상대편 값), 한 번의 역전파로 전체 ∇L→경사하강 갱신. 전 과정 총정리 + 완주 축하 카드. 미니체크 3 + 본문 StepQuiz 1(순전파+역전파) + 난이도별 10문제(StepQuiz 1).
- 미분 전용 시각화 신규 작성 — `Backprop.vue`: 계산그래프 SVG, x·y·z 슬라이더로 순전파 값, '역전파 한 단계' 버튼으로 출력→입력 기울기 단계별 공개(제곱 2q → 덧셈 복사 → 곱셈 상대편), 단계별 설명.
- 새 용어(ConceptCard) — 계산그래프, 국소 미분, 순전파/역전파, 상류 기울기.
- `chapters.ts` ch10 공개, router `/ch/ch10`, `tutorContext.json` ch10 맥락 갱신.
- 짝 노트북 — `notebooks/ch10_backprop.ipynb`(순전파/역전파 직접 코딩, SymPy 검산, 미니 학습 루프=역전파+경사하강, 미니 autograd).
- **검증:** `npm run build` 통과, dev 서버 HTTP 200.

> 🎉 **커리큘럼 전체 완성**: Phase 0(샘플)~Phase 10(역전파) 전 챕터 공개. 웹 챕터 11편 + 짝 노트북 11개 + 미분 전용 시각화 11종(TangentExplorer, LineExplorer, LimitZoom, DerivativeExplorer, PowerRule, ProductRuleArea, ChainRule, SigmoidExplorer, PartialDerivative, GradientDescent, Backprop). 접선→극한→도함수→공식→연쇄→활성화→편미분→그래디언트→경사하강→역전파로 이어지는 'AI 학습 원리' 완주 경로 완성.

### Phase 9 — 그래디언트와 경사하강법 (완료·검증)
- 챕터 작성 — `Chapter9.vue`: 그래디언트 ∇f(편미분 벡터·가장 가파른 오르막, 내려가려면 −∇), 경사하강 w←w−η∇L, 학습률 η(작으면 느림/적당하면 수렴/크면 진동·발산), 수렴·발산·지역 최소값. AI 연결(학습 루프=예측→손실→∇L(10장 역전파)→갱신 반복). 미니체크 3 + 본문 StepQuiz 1(w² 두 걸음) + 난이도별 10문제(StepQuiz 1).
- 미분 전용 시각화 신규 작성 — `GradientDescent.vue`: 손실 곡선 위 '공 굴리기', η 슬라이더 + 한 걸음/자동 재생(setInterval)/리셋, 자취·기울기·수렴/발산 표시. 기본 손실 (w−1)².
- 새 기호·용어(ConceptCard) — 그래디언트 ∇(나블라), 경사하강법, 학습률 η(에타), 수렴/발산, 지역 최소값.
- `chapters.ts` ch9 공개, router `/ch/ch9`, `tutorContext.json` ch9 맥락 갱신.
- 짝 노트북 — `notebooks/ch09_gradient_descent.ipynb`(경사하강 루프·자취 그래프·학습률 실험(수렴/발산)·2D ∇f 벡터 갱신).
- **검증:** `npm run build` 통과, dev 서버 HTTP 200.

### Phase 8 — 다변수 함수와 편미분 (완료·검증)
- 챕터 작성 — `Chapter8.vue`: 다변수 함수 f(x,y)·곡면, 편미분 ∂f/∂x(한 변수만·나머지 상수), 기호 ∂, 편미분=단면 곡선의 기울기. AI 연결(∂L/∂wᵢ=가중치별 민감도→9장 그래디언트). 미니체크 2 + 본문 StepQuiz 1((3,2)) + 난이도별 10문제(StepQuiz 1, xy·x²y 포함).
- 미분 전용 시각화 신규 작성 — `PartialDerivative.vue`: 위 f(x,y) 히트맵+두 절단선(가로 y=y0/세로 x=x0)+점, 아래 x방향·y방향 단면 곡선과 각 접선(∂f/∂x, ∂f/∂y). x·y 슬라이더.
- 새 기호·용어(ConceptCard) — 다변수 함수/곡면, 편미분, ∂(라운드 디/파셜), 상수 취급.
- `chapters.ts` ch8 공개, router `/ch/ch8`, `tutorContext.json` ch8 맥락 갱신.
- 짝 노트북 — `notebooks/ch08_partial_derivatives.ipynb`(SymPy 편미분 x²+y²·xy·x²y, 3D 곡면+두 방향 단면 접선 그래프).
- **검증:** `npm run build` 통과, dev 서버 HTTP 200.

### Phase 7 — 지수·로그·시그모이드 미분 (완료·검증)
- 챕터 작성 — `Chapter7.vue`: (eˣ)'=eˣ(자기 자신), (ln x)'=1/x, 시그모이드 σ'=σ(1−σ)·활성화 함수, 연쇄법칙 결합((e^{2x})'=2e^{2x}). AI 연결(활성화 미분이 역전파에서 곱해짐; σ' 최대 0.25 → 기울기 소실 → ReLU). 미니체크 3 + 본문 StepQuiz 1(σ'(0)) + 난이도별 10문제(StepQuiz 2).
- 미분 전용 시각화 신규 작성 — `SigmoidExplorer.vue`(상: σ S자, 하: σ' 종 모양, x 슬라이더로 σ·1−σ·σ' 표시 + 최대 0.25/기울기 소실 안내). eˣ 는 `DerivativeExplorer` 재사용(fn=dfn=exp → f·f' 동일 곡선으로 자기미분 성질 시각화).
- 새 기호·용어(ConceptCard) — 자연상수 e, 지수함수 eˣ/exp, 자연로그 ln, 시그모이드 σ·활성화 함수, 기울기 소실.
- `chapters.ts` ch7 공개, router `/ch/ch7`, `tutorContext.json` ch7 맥락 갱신.
- 짝 노트북 — `notebooks/ch07_exp_log_sigmoid.ipynb`(SymPy eˣ·ln·시그모이드 미분, σ'=σ(1−σ) 확인, σ/σ' 그래프·양끝 소실 수치).
- **검증:** `npm run build` 통과, dev 서버 HTTP 200.

### Phase 6 — 연쇄법칙 (핵심, 완료·검증)
- 챕터 작성 — `Chapter6.vue`: 합성함수(겉/속/중간변수) → 연쇄법칙 (f(g(x)))'=f'(g(x))·g'(x)=겉미분×속미분 → 라이프니츠 형 dy/dx=(dy/du)(du/dx) 톱니바퀴 직관. AI 연결(역전파=연쇄법칙 반복 적용, 층층이 국소미분 곱). 미니체크 3 + 본문 StepQuiz 1((2x+1)²) + 난이도별 10문제(StepQuiz 2 포함, (2x+1)²·(x²+1)³).
- 미분 전용 시각화 신규 작성 — `ChainRule.vue`: x→[속 g]→u→[겉 f]→y 기계 사슬, 각 화살표 국소 변화율(g'·f') 표시 + dy/dx=곱 + Δ 밀기(nudge)로 Δx→Δu→Δy 증폭 확인. (역전파 축소판)
- 새 용어(ConceptCard) — 합성함수/겉·속함수/중간변수, 연쇄법칙, 라이프니츠 형.
- `chapters.ts` ch6 공개, router `/ch/ch6`, `tutorContext.json` ch6 맥락 갱신.
- 짝 노트북 — `notebooks/ch06_chain_rule.ipynb`(SymPy 합성함수 미분·연쇄법칙 검산 (2x+1)²·(x²+1)³, 국소 미분 곱=전체 미분 수치 확인=역전파 축소판).
- **검증:** `npm run build` 통과, dev 서버 HTTP 200.

### Phase 5 — 곱과 몫의 법칙 (완료·검증)
- 챕터 작성 — `Chapter5.vue`: (fg)'≠f'g' 함정 → 곱의 법칙 (fg)'=f'g+fg'(직사각형 넓이 직관) → 몫의 법칙 (f/g)'=(f'g−fg')/g²(부호·순서·g² 주의). AI 연결(역전파 곱셈 노드=상대편 값 곱해 기울기 갈라짐). 미니체크 2 + 본문 StepQuiz 2(곱·몫) + 난이도별 10문제(StepQuiz 2 포함).
- 미분 전용 시각화 신규 작성 — `ProductRuleArea.vue`: 두 변 u·v 직사각형 넓이, x·Δ 슬라이더로 증가분을 오른쪽 띠(Δu·v)+위 띠(u·Δv)+모서리(Δu·Δv)로 분해, Δ→0 에서 모서리 소멸 → f'g+fg'. 넓이변화/Δ vs 정확값 비교.
- 새 규칙(ConceptCard) — 곱의 법칙, 몫의 법칙(외우는 요령), 곱의 함정 반례.
- `chapters.ts` ch5 공개, router `/ch/ch5`, `tutorContext.json` ch5 맥락 갱신.
- 짝 노트북 — `notebooks/ch05_product_quotient.ipynb`(SymPy 곱·몫 손계산 검산, 넓이 수치 수렴 확인).
- **검증:** `npm run build` 통과, dev 서버 HTTP 200.

### Phase 4 — 기본 미분 공식 (완료·검증)
- 챕터 작성 — `Chapter4.vue`: 멱법칙 (xⁿ)'=n·xⁿ⁻¹, 상수의 미분 0, 상수배 (c·f)'=c·f', 합·차 (f±g)'=f'±g' → 다항식 통째 미분. AI 연결(합의 미분=미분의 합 → 역전파의 기울기 합산). 미니체크 4 + 난이도별 10문제(StepQuiz 1: x³ 멱법칙→f'(2)). 본문 StepQuiz 1(x²+3x+5 → f'(1)).
- 미분 전용 시각화 신규 작성 — `PowerRule.vue`: 지수 n 슬라이더로 (xⁿ)'=n·xⁿ⁻¹ 결과 수식이 즉시 갱신 + "지수 내려와 계수, 지수 1 감소" 패턴 강조 + xⁿ 모양 그래프.
- 새 용어(ConceptCard) — 멱법칙/멱(거듭제곱), 상수의 미분=0(수평선), 상수배·합차, 계수.
- `chapters.ts` ch4 공개, router `/ch/ch4`, `tutorContext.json` ch4 맥락 갱신.
- 짝 노트북 — `notebooks/ch04_power_rule.ipynb`(SymPy 멱법칙 패턴 n=1..5, 상수/상수배/합차, 다항식 손계산 검산, lambdify 로 f·f' 그래프).
- **검증:** `npm run build` 통과, dev 서버 HTTP 200.

### Phase 3 — 미분계수와 도함수의 정의 (완료·검증)
- 챕터 작성 — `Chapter3.vue`: 미분계수 f'(a)(한 점의 수) vs 도함수 f'(x)(함수) 구분, 정의로 (x²)'=2x 유도(전개→소거→약분→h→0), 표기 3종(f'(x)·dy/dx·d/dx). AI 연결(도함수=재사용 가능한 기울기 공식, 자동미분 기반). 미니체크 4 + 난이도별 10문제(StepQuiz 1: 도함수 대입→미분계수).
- 미분 전용 시각화 신규 작성 — `DerivativeExplorer.vue`: 상하 2패널(위 f+접선 / 아래 f' 그래프), x 슬라이더로 위 접선 기울기가 아래 도함수 점 높이로 동시에 나타나 "기울기 모음 = 함수 f'(x)" 직관.
- 새 기호·용어(ConceptCard) — 미분계수, 도함수/미분하다, 라이프니츠 표기 dy/dx·d/dx.
- `chapters.ts` ch3 공개, router `/ch/ch3`, `tutorContext.json` ch3 맥락 갱신.
- 짝 노트북 — `notebooks/ch03_derivative_definition.ipynb`(정의로 근사, f·f' 나란히 그래프, SymPy limit=diff 확인 후 대입해 미분계수).
- **검증:** `npm run build` 통과, dev 서버 HTTP 200.

### Phase 2 — 변화율과 극한 (완료·검증)
- 챕터 작성 — `Chapter2.vue`: 평균변화율(차분몫) → "한 점의 기울기 = 0/0 딜레마" → 극한(lim, 수렴) → 순간변화율. 세 각도로 극한 체감: (a) 숫자 극한표(양쪽 h→0 수렴), (b) 할선→접선(TangentExplorer 재사용, x=1, 2+h→2), (c) 극한 줌인(LimitZoom, 국소 선형성). AI 연결(경사하강은 한 점 순간 기울기 사용). 미니체크 4 + 난이도별 10문제(StepQuiz 2 포함).
- 미분 전용 시각화 신규 작성 — `LimitZoom.vue`: 한 점 주위를 확대할수록 곡선이 접선과 겹쳐 보이는 국소 선형성 시각화(확대 배율 슬라이더).
- 새 기호·용어 설명(ConceptCard) — 평균변화율/차분몫, 순간변화율, 극한 lim·h→0·수렴, 0÷0 함정.
- `chapters.ts` ch2 공개, router `/ch/ch2` 추가, `tutorContext.json` ch2 맥락 실제 내용으로 갱신.
- 짝 노트북 — `notebooks/ch02_limits.ipynb`(튜터 셀·한글폰트, h 축소 극한표, 할선→접선 그림, SymPy `sp.limit` 로 순간변화율 검산).
- **검증:** `npm run build` 통과, dev 서버 HTTP 200.

### AI 튜터 [OFFTOPIC] 신호 노출 버그 수정 (웹·노트북)
- 증상: 챗봇 답변 끝(또는 중간)에 리터럴 `[OFFTOPIC]` 이 그대로 표시됨.
- 원인: 주제이탈 감지가 "응답 맨 앞에 마커 단독"일 때만 걸리도록 돼 있어(1부에서 복제), 경량 로컬 모델이 답변 끝에 마커를 덧붙이면 걸러지지 못하고 노출.
- 수정: 위치와 무관하게 마커를 항상 걷어내는 `stripOfftopic`(웹 TutorChat.vue) / `_strip_offtopic`(tutor.py) 도입. 마커만 오고 실제 내용이 없을 때만 주제이탈 안내로 교체하고, 답변에 덧붙은 마커는 제거 후 답변 유지. 스트리밍 중 끝에 걸친 부분 마커는 잠시 감춰 깜빡임 방지. 콘솔 출력(ask/explain)은 접두 안전 방식으로 변경.
- **검증:** `npm run build` 통과(74 모듈), `python -m py_compile tutor.py` 통과, `_strip_offtopic` 단위 케이스 6종 통과.

### AI 튜터 챗봇 + 노트북 공통 기능 이식 (1부 → 2부, 완료·검증)
- 웹 AI 튜터 이식 — `lib/ollama.ts`(로컬 Ollama 스트리밍 클라이언트, API 키·비용 불필요), `data/tutorContext.json`(미분 커리큘럼 챕터별 맥락·전체 목차·fallback), `data/tutorContext.ts`, `components/TutorChat.vue`(🤖 플로팅 버튼, 현재 챕터 맥락 주입, 주제이탈 [OFFTOPIC] 가드, "N장"→챕터 링크 1~10, 모델 선택). `App.vue` 에 마운트.
- 노트북 AI 튜터 이식 — `notebooks/tutor.py`(웹과 같은 JSON 단일 소스 사용; `chat()` 플로팅 위젯 + `ask()` + `explain()` 코드설명). `requirements.txt` 에 ipywidgets·requests 추가, jupyterlab 4.5.9+.
- 노트북 공통 기능 반영 — ch00·ch01 에 상단 AI 튜터 셀 추가, matplotlib 한글 폰트 설정(Malgun Gothic + 음수부호 깨짐 방지) 추가. `notebooks/README.md`(수포자용 설치·사용·튜터 안내) 신설.
- **검증:** `npm run build` 통과(74 모듈), dev 서버 HTTP 200 + 튜터 모듈 Vite 변환 OK, `python -m py_compile tutor.py` 통과, 노트북 JSON 유효.

### Phase 1 — 함수와 그래프, 기울기 직관 (완료·검증)
- 챕터 작성 — `Chapter1.vue`: 함수 기계(입력→출력) 인라인 인터랙티브, 함수 그래프(ChartView), 일차함수 y=ax+b, 두 점으로 기울기 계산(StepQuiz), AI 연결(손실곡선·경사하강법 예고), 미니체크 5 + 난이도별 10문제.
- 미분 전용 시각화 신규 작성 — `LineExplorer.vue`: 기울기 a·y절편 b 슬라이더로 직선 조종 + rise/run 삼각형으로 기울기 시각화.
- 새 기호·용어 설명(ConceptCard) — `f(x)`, 좌표평면/그래프, 일차함수·기울기·y절편, Δ(변화율).
- 복습 기능 이식(linear-algebra 스타일) — `stores/review.ts`(키 `diff-review-v1`), `ReviewFlag.vue`(섹션별 ☆복습에 추가), `views/ReviewView.vue`(복습 목록), `AppSidebar` 복습 링크 + 공개 Phase 자동 표시, router `/review` 및 앵커 스크롤.
- `chapters.ts` ch1 `comingSoon` 해제(공개), router `/ch/ch1` 개별 라우트 추가.
- 짝 노트북 작성 — `notebooks/ch01_functions_slope.ipynb` (NumPy 그래프 · 두 점 기울기 · SymPy로 일차함수 미분→기울기 확인).
- **검증:** `npm run build` 통과, dev 서버 HTTP 200 확인.

### 프로젝트 문서화
- 루트 `CLAUDE.md` 작성 — Claude Code용 아키텍처·명령어·챕터 추가 패턴 가이드.
- 루트 `README.md` 작성 — 웹앱(`npm run dev`)·노트북(`jupyter lab`) 실행 방법, Windows 주의사항.
- `docs/99_history.md`(본 문서) 신설 — 작업 이력 관리 시작.

### Phase 0 — 기반 구축 (완료·검증)
- `web/` 스캐폴딩 구성 — Vue 3 + Vite + TypeScript + Tailwind v4 + Pinia + vue-router (`linear-algebra` 구조 복제).
- 공통 컴포넌트 7종 이식 — `MathBlock`(KaTeX), `ChartView`(Chart.js), `ConceptCard`, `Quiz`(객관식·OX·숫자입력 3종), `StepQuiz`(중간단계 입력 채점), `QuizSet`(난이도 배지·집계), `progress.ts`(localStorage 진도).
- 미분 전용 시각화 신규 작성 — `TangentExplorer.vue`(접선/할선 슬라이더).
- 샘플 챕터 작성 — `SampleChapter.vue` "접선 맛보기" (f(x)=x² 기준, 새 기호 Δ·f'(x)·lim·h→0 설명 + 미니체크 + 난이도별 10문제).
- 짝 노트북 작성 — `notebooks/ch00_sample.ipynb` (numpy 차분몫 · matplotlib 접선 · sympy 기호미분), `requirements.txt`.
- 기획 문서 `docs/00_plan.md` 작성 (커리큘럼·아키텍처·Phase 계획 확정).
- **검증:** `npm run build` 통과, dev 서버 HTTP 200 확인.

---

## 다음 작업 예정 (커리큘럼 완주 — 이후 개선 후보)
- 전체 QA 패스: 각 챕터 문제 정답/오차허용 재검토, 시각화 반응성 점검, 모바일 레이아웃 확인.
- 노트북 실제 실행 검증(커널 differentiation-venv 로 Run All) — 셀 오류 없는지.
- 선택: 종합 복습/미니 퀴즈 챕터, 홈 화면 완주 축하, README 갱신, 1부처럼 데모/발표 자료.
