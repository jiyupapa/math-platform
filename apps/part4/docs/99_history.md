# 작업 이력 (99_history)

> 최신 작업이 맨 위. 의미 있는 작업을 마칠 때마다 추가한다.

---

## 2026-07-18

### 📎 비유 앵커링 보수 — ch1 "마침표" → EOS 토큰 (시리즈 전수 점검 반영)
"마침표(문장 끝 신호)"가 부 전체(13챕터)에서 표준 용어와 한 번도 짝지어지지 않던 것 →
ch1(최초 도입) 새 용어 카드에 **EOS 토큰(end-of-sequence token)** 항목 추가("이 과정에서는 계속
마침표라 부를게요" 계약 포함). `npm run build` 통과.

## 2026-07-11 — ch2 BPE 상세 보강 (압축 점검 후속)

- "분량은 상세 우선" 방침의 소급 적용 — 아이디어 3줄로만 있던 BPE 카드에 **단계별 병합
  시연 표** 추가: 말뭉치 "바나나 바나나 나나"에서 (나,나) 3회 병합 → (바,나나) 2회 병합 →
  사전 완성, 처음 보는 "바나다"가 [UNK] 없이 3조각으로 처리되는 것까지.
- `ch02_tokenization.ipynb` 7절 신설: 미니 BPE 구현(pair_counts·apply_merge·탐욕 병합 루프 +
  학습된 규칙으로 bpe_encode) — 병합 순서·1토큰·OOV 처리 assert 3개. nbconvert 무에러.
- TODO_NEXT_STEP_260711 ⑥(BPE 탐욕 알고리즘 카드 소재)의 소화. 빌드 통과.

---

## 2026-07-08 — 디렉토리명 표준화: transformer-project → part4-transformer

시리즈 4개 저장소 순번 접두 통일(part1~4). 이 저장소 rename에 따라 docs/00_plan·notebooks/README·settings.local.json 의 절대경로·자기참조 갱신. 웹(@/ 상대경로)·localStorage 접두사(tf-)·git 무영향. 이 저장소는 venv 없음(노트북 시스템 커널 사용).

## 2026-07-08 — 시리즈 표준(1부 linear-algebra) 동기화

1부가 시리즈 골든 카피로 확정됨(1부 docs/00_plan.md 1-B)에 따라 공용 컴포넌트 전파 수령:
- `MathBlock` — KaTeX 폴백 HTML 이스케이프(하드닝), 사용 예시 주제 중립화.
- `progress` 스토어 — localStorage 손상값 형태 검증.
- **퀴즈 트리오** `Quiz`/`StepQuiz`/`QuizSet`/`quizGroup` — 1부 표준판으로 교체: 풀이 영속화(재방문 시 푼 문제 복원), 2회 오답 시 "해설 보기" 출구, 저장값 검증. 스토리지 키는 `tf-` 접두사 유지.
- 역수확: 이 저장소의 `DetailsCard`·`NotebookCard`·ConceptCard `ai` 톤이 1부 표준 세트로 편입됨.
- 검증: `npm run build` 통과. 드리프트 점검은 1부 `scripts/check_drift.py` (현재 무드리프트).

## 2026-07-08 — 프로젝트 위치 이동 (C:\STUDY\LLM → C:\STUDY\MATH)

시리즈 1~3부(stat4beginner 등)와 같은 `C:\STUDY\MATH` 아래로 repo 를 이동.
- `notebooks/README.md` 의 `cd` 안내 경로 2곳을 새 경로로 수정.
- `.claude/settings.local.json` 의 옛 경로 권한 항목 정리(죽은 임시 스크립트 허용 6건 제거, `cp` 목적지 5건 갱신).
- 코드·문서에는 그 외 절대 경로 참조 없음(전수 검색 확인).

---

## 2026-06-29 — 웹에 노트북 안내 추가 (항상 표시)

문제: 노트북 언급이 완료 배너(`v-if="progress.isDone"`) 안에만 있어 퀴즈 완료 전엔 안 보였음.
- **신규 재사용 컴포넌트 `NotebookCard.vue`** — 현재 챕터를 route 로 찾아 `chapters.ts` 의 `notebook`
  필드를 자동으로 읽어 "🐍 Python 노트북으로도 해보기" tip 카드로 항상 표시(+튜터 셀 안내). 참고 프로젝트와 동일 패턴.
- 전 13챕터 `</QuizSet>` 뒤에 `<NotebookCard />` 삽입(스크립트 일괄, import 포함).
- HomeView 에 "두 가지로 배웁니다"(웹+노트북+🤖 튜터) 안내 카드 추가.
- `npm run build` 통과.

---

## 2026-06-29 — AI 튜터(챗봇) 이식 — 1·2·3부 공통 기능을 4부에 추가

시리즈 1·2·3부(선형대수/미분/확률통계)에 있는 **로컬 Ollama 기반 AI 튜터**를 4부에 이식.
API 키·비용·인터넷 불필요, Ollama 미실행 시 안내만 뜨고 학습엔 지장 없음.
- **웹**: `lib/ollama.ts`(스트리밍 클라이언트)·`components/TutorChat.vue`(우하단 플로팅 🤖, 현재 챕터 맥락 주입,
  주제이탈 [OFFTOPIC] 필터, "N장" 링크 1~12, 답변 중 모델 선택/중지/지우기)·App.vue 에 전역 배치.
  stat4beginner 원본을 복사 후 주제부(시스템 프롬프트·추천질문·장 범위)만 트랜스포머용으로 교체.
- **맥락 단일 소스**: `data/tutorContext.ts`(로더) + `data/tutorContext.json`(신규 작성) — sample+ch1~12
  각 챕터 핵심·용어·비유·트랜스포머 연결을 `[N장 제목]` 으로 시작하는 문단으로. 웹·노트북 공유.
- **노트북**: `tutor.py`(chat/ask/explain·플로팅 위젯·코드설명·오프토픽 필터, 주제부만 교체) +
  13개 노트북 맨 위에 튜터 셀(`from tutor import chat; chat('<slug>')`) 삽입(기존 출력 보존).
  `README.md`(초보자용 Jupyter 안내+튜터 사용법, 경로·목록 교체) · `requirements.txt`에 requests·ipywidgets·ipykernel 추가.
- 검증: `npm run build` 통과 / `tutor.py` py_compile OK / tutorContext.json 로딩·chapter_title 정규식·nbformat 유효성 확인.
- `CLAUDE.md` 에 "AI 튜터" 절 추가(단일 소스·모델·오프토픽 규칙).

---

## 2026-06-29 — 수포자 관점 전수 점검 후 다듬기 (3에이전트 병렬 리뷰 → 15건 반영)

전 13챕터를 "수포자·초보자 이탈 지점" 기준으로 병렬 검토(3 subagent). "새 기호는 즉시 설명" 규칙이
수식 기호에서 반복적으로 깨지던 것을 중심으로 수정. 전 챕터 `npm run build` 통과.
- **무설명 수식 기호 즉시 설명(🔴)**: ch3 √·²·아래첨자 카드 신설 / ch11 ln을 "슬라이더 거동"으로 풀고
  가중치 정의 추가 / ch6 전치ᵀ·√·차원d·대문자Q vs 소문자q₁ 본문 명시 / ch5 Σ(시그마) 한 줄 /
  ch0 분모 첨자 j 설명 / ch9 소프트맥스 재등장 시 Σ·e 리마인드+LM head 뜻 / ch8 f(입력) 설명 &
  BlockLab "기울기"→"신호"(ch11 선행어 제거) / ch7 선형층 설명 / ch4 성분 덧셈 명시+이진수 비유→시계 비유.
- **데이터·콘텐츠 정합성(🟡)**: ch3 강아지 좌표 (-3.4,2.0)→(-3.3,2.2) 로 고양이와 0.5(호랑이 0.72)라
  "가장 가까움" 확정(embeddings.ts + 노트북 재실행) / ch1 NextWordGame 🎲→🎯(greedy 모순 제거) /
  ch2 hard 퀴즈 답 노출 제거(힌트로 이동).
- **인터랙티브 보강(🟢)**: ch12 SamplingLab top-k↔top-p 토글 신설(top-p는 "지금 N개" 표시로 유동성 체감)
  + 본문 "왜 T로 나누면 평평?"·온도 이름 비유 승격 / ch11 GradientDescentLab 접선(기울기) 시각화 추가.

---

## 2026-06-29 — 🎉 Phase 12 (샘플링) 완료 — 전 과정(Phase 0~12) 완주!

학습된 모델이 확률에서 다음 단어를 고르는 법: greedy · temperature · top-k · top-p.
- **신규 컴포넌트 `SamplingLab.vue`** — temperature 슬라이더(분포 뾰족/평평) + top-k 슬라이더(하위 단어 잘림 표시)
  + 🎲 뽑기(Math.random 실제 샘플링) + 최근 뽑힌 단어 나열. Phase 0 softmax 재사용.
- `Chapter12.vue` — ①greedy vs 샘플링(SamplingLab) → ②temperature(softmax(z/T), 낮음=안전/높음=창의) →
  ③top-k·top-p(후보 자르기) → DetailsCard(top-p 유동성, 실전 T 팁) → ④🤖 같은질문 다른답+환각 주의 →
  끝 10문제. 완료 시 🎉🎓🏁 **전 과정 완주** 배너(홈 링크).
- 노트북 `ch12_sampling.ipynb` — 분포 + greedy/샘플링 + temperature(0.3/1/2) + top-k + top-p 유동적 자르기
  + T=0.1≈greedy assert. 좋다 68.1% 웹과 일치.
- `chapters.ts` ch12 공개(+notebook) · router `/ch/ch12`. `npm run build` + nbconvert 검증 통과.

🏁 **전 시리즈 완성**: Phase 0(소프트맥스 샘플) + Phase 1~10(트랜스포머 본과정) + Phase 11~12(학습·샘플링 심화).
   웹 13챕터 + 대응 노트북 13개, 모든 `comingSoon` 제거 → 진도 13/13. 재사용 컴포넌트 다수 + 인터랙티브 랩
   (SoftmaxLab·NextWordGame·TokenizerLab·EmbeddingLab·PositionLab·AttentionLab·QKVLab·MultiHeadLab·
   BlockLab·OutputLab·PipelineLab·GradientDescentLab·SamplingLab). 전 챕터 build + nbconvert 검증 완료.

---

## 2026-06-29 — Phase 11 (학습, 심화) 완료

무작위 가중치 → 다음 단어 맞히기로 똑똑해지기: 손실(크로스 엔트로피) + 경사하강.
- **신규 컴포넌트 `GradientDescentLab.vue`** — 손실 곡선 f(w)=(w-2)² 위 SVG 공을 기울기 반대로 굴림.
  한걸음/자동(setInterval)/리셋, 학습률 슬라이더. lr>1이면 발산(공 빨강+경고).
- `Chapter11.vue` — ①손실(인라인 크로스엔트로피 슬라이더 p→ -ln(p), 손실/CE 용어) → ②경사하강
  (GradientDescentLab + 경사하강/기울기/학습률 용어) → DetailsCard(역전파, 사전학습→파인튜닝) →
  ③🤖 지식의 출처(다음단어맞히기=지식, 스케일) → 미니체크 2 + 끝 10문제(-ln(1)=0 numeric).
- 노트북 `ch11_training.ipynb` — CE 손실표 + 경사하강 수렴 + lr=1.05 발산 + **실제 학습 루프**
  (softmax+CE, 기울기 p-onehot, 정답확률 29%→95%) + 손실곡선. -ln(0.5)=0.69 웹과 일치.
- `chapters.ts` ch11 공개(+notebook) · router `/ch/ch11`. `npm run build` + nbconvert 검증 통과.

**다음(마지막)**: Phase 12 — 샘플링(temperature·top-k·top-p).

---

## 2026-06-29 — 🎯 Phase 10 (전체 조립) 완료 — 궁극 목표 도달, 본 과정(0~10) 완주

ch2~9 모든 조각을 한 흐름으로 조립 + 자기회귀 생성. LLM 총정리.
- **신규 컴포넌트 `PipelineLab.vue`** — "오늘 날씨가 정말"을 토큰화→임베딩→위치→어텐션·블록→출력층→다음단어
  까지 "다음 단계 →" 버튼으로 스텝별 공개. 각 단계에 대응 챕터 표시. 마지막 '좋다' 예측(ch9와 동일값).
- **`NextWordGame.vue` 재사용** — §2에서 자기회귀 생성 루프 다시 보여줌(이제 속을 다 아는 상태).
- `Chapter10.vue` — ①전체 파이프라인 스텝퍼(PipelineLab) → ②반복=생성(NextWordGame) → ③🤖 LLM 총정리
  (한 문장 요약 + "우리가 지나온 길" 8단계 챕터 링크 요약) → DetailsCard(디코더-only, 학습 ch11·샘플링 ch12 예고)
  → 종합 10문제(전 챕터 복습). 완료 시 🎓🏁 궁극 목표 달성 축하 배너.
- 노트북 `ch10_full_assembly.ipynb` — **작동하는 미니 트랜스포머**(numpy): 임베딩+PE, 인과마스킹 셀프어텐션,
  residual+layernorm+FFN 블록, tied-embedding 출력층, 자기회귀 generate. 무작위 가중치라 의미는 없지만
  end-to-end 완결(shape/확률합 assert 통과). "학습은 ch11" 명시.
- `chapters.ts` ch10 공개(+notebook) · router `/ch/ch10`. `npm run build` + nbconvert 검증 통과.

🎉 **본 과정 Phase 0~10 전부 완성** — 샘플(소프트맥스) + 트랜스포머 큰그림~전체조립. 진도 11/12 대상.
**다음(심화·선택)**: Phase 11 학습, Phase 12 샘플링.

---

## 2026-06-29 — Phase 9 (출력층) 완료

마지막 문맥 벡터 → 단어별 점수(logits) → 소프트맥스 → 다음 단어 확률. 샘플 챕터와 직결.
- **신규 컴포넌트 `OutputLab.vue`** — 문맥 벡터 슬라이더(2D) → 사전 6단어와 내적으로 logit →
  소프트맥스 확률 막대 + 예측 단어 강조. Phase 0 softmax 재사용. 벡터 방향이 가리키는 단어가 뽑힘.
- `Chapter9.vue` — ①벡터→모든 단어 점수(OutputLab + 출력층/logit/어휘 용어, 5만개) → ②logits→softmax
  →확률(샘플 공식 재등장, ch1 자기회귀로 링크) → DetailsCard(weight tying 입출력 임베딩 공유) →
  ③🤖 매 스텝 결승선(→다시 입력, 샘플링 ch12 예고, ch10 전체조립 예고) → 미니체크 2 + 끝 10문제(StepQuiz 내적=4).
- 노트북 `ch09_output_layer.ipynb` — W_out@context logits + softmax + 벡터방향 바꿔 다음단어 변화 데모.
  좋다 39.5%, 내적 4 — 웹과 일치.
- `chapters.ts` ch9 공개(+notebook) · router `/ch/ch9`. `npm run build` + nbconvert 검증 통과.

**다음**: Phase 10 — 전체 조립(모든 조각을 한 흐름으로, GPT 생성). 🎯 궁극 목표 도달.

---

## 2026-06-29 — Phase 8 (트랜스포머 블록) 완료

어텐션을 잔차연결·층정규화·피드포워드와 묶어 블록 완성, 여러 층 쌓기.
- **신규 컴포넌트 `BlockLab.vue`** — 층 수 슬라이더 + 잔차연결/층정규화 토글 → 신호 크기 변화를
  ChartView 라인으로. 둘 다 끄면 소멸/잔차만 폭발/정규화까지 안정 verdict. (ChartView 내부 재사용)
- `Chapter8.vue` — ①잔차연결(고속도로)·층정규화(눈금맞추기) + BlockLab → ②피드포워드(단어별 재가공,
  어텐션 vs FFN 대비) → ③블록 다이어그램(Add&Norm×2) + ×N 반복 → DetailsCard(FFN이 파라미터 2/3, 4배 확장+비선형)
  → 🤖 AI연결(깊이가 지능, 잔차 덕에 깊은 학습) → 미니체크 3 + 끝 10문제(StepQuiz 잔차덧셈).
- 노트북 `ch08_transformer_block.ipynb` — 신호크기 stack(소멸0.001/폭발57.7/안정1.0) + 블록 순전파
  (layer_norm+잔차) + 6층 쌓아도 크기 2.0 안정. 잔차덧셈 (2.5,1.3) 웹과 일치.
- `chapters.ts` ch8 공개(+notebook) · router `/ch/ch8`. `npm run build` + nbconvert 검증 통과.

**다음**: Phase 9 — 출력층(블록 출력 → logits → 소프트맥스 → 다음 단어 확률).

---

## 2026-06-29 — Phase 7 (멀티헤드 어텐션) 완료

어텐션을 여러 개(헤드) 동시에 = 여러 관점. 헤드1=주어, 헤드2=목적어에 집중 → concat.
- **신규 컴포넌트 `MultiHeadLab.vue`** — 질문 단어 선택 + 두 헤드의 집중도 막대 나란히(각 헤드 다른 focus)
  + 각 헤드 출력 + 이어붙이기(concat) 결과 실시간. '물었다'에서 헤드1→강아지, 헤드2→공.
- `Chapter7.vue` — ①헤드마다 다른 곳(MultiHeadLab + 헤드/멀티헤드 용어) → ②concat + W_O 혼합(공식,
  종합 보고서 비유) → DetailsCard(차원 나눠갖기 512/8=64, 계산량 안 폭증) → ③🤖 AI연결(헤드별 전문분야,
  병렬, 수십 헤드×여러 층) → 미니체크 2 + 끝 10문제(concat 길이=4, 512/8=64 numeric).
- 노트북 `ch07_multihead.ipynb` — 두 헤드 출력·concat·W_O 혼합 + 헤드수별 차원 표. 헤드1 [0.75,0.25],
  헤드2 [0.25,0.75], concat 4개 — 웹과 일치.
- `chapters.ts` ch7 공개(+notebook) · router `/ch/ch7`. `npm run build` + nbconvert 검증 통과.

**다음**: Phase 8 — 트랜스포머 블록(잔차연결·층정규화·피드포워드).

---

## 2026-06-29 — Phase 6 (Q·K·V & 셀프 어텐션, 🌟 핵심) 완료

ch5의 "점수는 누가 정하나"에 답: 점수 = Query·Key 내적 → 소프트맥스 → Value 가중합.
- **신규 컴포넌트 `QKVLab.vue`** — Query 벡터 슬라이더(+단어별 기본 Query 불러오기), 각 단어의
  Key·Value 표 + 점수(Q·K 내적)·집중도(softmax)·출력(Value 가중합) 실시간. Phase 0 softmax 재사용.
- `Chapter6.vue` — ①도서관 비유(검색어=Q, 제목표=K, 내용=V) + QKVLab → ②점수=내적, 전체 공식
  softmax(QKᵀ/√d)V 뜯어읽기(내적/스케일링/소프트맥스/가중합) → DetailsCard(Q=xWq 등 학습행렬, √d 이유,
  Scaled Dot-Product) → ③🤖 셀프어텐션(병렬, 새 문맥벡터) → 미니체크 2 + 끝 10문제(StepQuiz 내적=5).
- 노트북 `ch06_qkv_attention.ipynb` — Q·K·V 내적·가중합 + 전체 어텐션 행렬(스케일드) + 히트맵.
  물었다 기준 점수 1.70/1.70/0.80, 출력 [0.5,0.5], 내적 5 — 웹과 일치.
- `chapters.ts` ch6 공개(+notebook) · router `/ch/ch6`. `npm run build` + nbconvert 검증 통과.

**다음**: Phase 7 — 멀티헤드 어텐션(여러 관점으로 동시에).

---

## 2026-06-29 — Phase 5 (어텐션의 직관) 완료

트랜스포머의 심장 진입. "집중도(합 1)로 문맥을 가중 평균". Q·K·V 상세는 ch6로.
- **신규 컴포넌트 `AttentionLab.vue`** — 질문 단어 선택 + 각 단어 관련성 점수 슬라이더 →
  소프트맥스 집중도(합 100%) 막대 + 최다집중 강조 + 문맥 벡터(가중 평균) 실시간. Phase 0 softmax 재사용.
- `Chapter5.vue` — ①문맥이 필요(AttentionLab + 어텐션/집중도/가중평균 용어) → ②소프트맥스로 집중도→
  가중 평균 섞기(공식, "이미 배운 소프트맥스가 여기서" tip) → DetailsCard(점수는 누가? 셀프어텐션 예고) →
  ③🤖 AI연결(먼 거리 관계 한번에, 층마다 반복, Attention Is All You Need) → 미니체크 2 + 끝 10문제(StepQuiz 가중평균).
- 노트북 `ch05_attention_intuition.ipynb` — 집중도·가중평균 + 문장 전체 셀프어텐션 행렬 + 히트맵.
  물었다 기준 50/41/9%, 문맥 [0.57,0.48], 가중평균 17 — 웹과 일치.
- `chapters.ts` ch5 공개(+notebook) · router `/ch/ch5`. `npm run build` + nbconvert 검증 통과.

**다음**: Phase 6 — Q·K·V & 셀프 어텐션(핵심). 점수를 어떻게 계산하는지.

---

## 2026-06-29 — Phase 4 (위치 인코딩) 완료

임베딩에 "몇 번째 자리인지" 순서 정보를 더한다. "나 너 좋아해" vs "너 나 좋아해".
- **신규 컴포넌트 `PositionLab.vue`** — 같은 단어 두 순서(A/B) 토글 + '위치 정보 더하기' 체크박스.
  각 슬롯의 (단어벡터 + 위치벡터 = 최종벡터) 표를 실시간 계산. 위치 끄면 "같은 뭉치라 구분 불가" 경고.
- `Chapter4.vue` — ①순서가 뜻을 바꿈(PositionLab + 병렬처리라 순서 못 앎, 위치 인코딩 용어) →
  ②위치 벡터를 '더하기'(차원 유지, MathBlock) → DetailsCard(사인·코사인 PE + ChartView 파형 3개) →
  ③🤖 AI연결(RNN 대비 병렬처리 대가, 고정 sin/cos vs 학습 위치임베딩) → 미니체크 2 + 끝 10문제(StepQuiz 벡터덧셈).
- 노트북 `ch04_positional.ipynb` — 같은 값 벡터덧셈 + "위치 없으면 같은 집합(True)/켜면 다름(False)" 검증
  + 실제 sin/cos positional_encoding + 히트맵. 최종벡터 (2.5,1.3) 웹과 일치.
- `chapters.ts` ch4 공개(+notebook) · router `/ch/ch4`. `npm run build` + nbconvert 검증 통과.

**다음**: Phase 5 — 어텐션의 직관("어디에 집중할까"). 트랜스포머의 심장 진입.

---

## 2026-06-29 — Phase 3 (임베딩) 완료

뜻 없는 토큰 ID → 의미 담은 숫자 벡터(좌표). "가까움 = 비슷함".
- **공용 유틸 `utils/embeddings.ts`** — 2D 목업 임베딩 12단어(동물·과일·탈것·색 4무리, 사분면 배치),
  `distance()`(피타고라스), `lookup()`, 그룹 색.
- **신규 컴포넌트 `EmbeddingLab.vue`** — SVG 단어 지도. 점 두 개 클릭 → 잇는 선 + 거리 표시,
  같은 무리(초록)/다른 무리(빨강) 구분, 범례.
- `Chapter3.vue` — ①번호표 대신 의미 좌표(EmbeddingLab + 임베딩/벡터/차원 용어) → ②거리=비슷함
  (피타고라스 공식, 고차원 주의카드) → DetailsCard(왕−남자+여자≈여왕, 평행사변형 SVG) →
  ③🤖 AI연결(임베딩은 학습됨, 어텐션의 재료, 임베딩 검색) → 미니체크 2 + 끝 10문제(StepQuiz 거리계산 포함).
- 노트북 `ch03_embedding.ipynb` — 같은 좌표, 거리·최근접 계산, 지도 산점도. 값 웹과 일치(0.72 / 5.2).
- `chapters.ts` ch3 공개(+notebook) · router `/ch/ch3`. `npm run build` + nbconvert 검증 통과.

**다음**: Phase 4 — 위치 인코딩(순서 정보 더하기).

---

## 2026-06-29 — Phase 2 (토큰화) 완료

파이프라인 첫 칸: 글 → 토큰 → 숫자 ID. 단어/글자/서브워드 3방식과 [UNK] 개념.
- **공용 유틸 `utils/tokenizer.ts`** — 고정 목업 사전(통째단어+서브워드조각+낱글자, ID 1000~).
  `tokenize(text, 'word'|'char'|'subword')`, 서브워드는 그리디 최장일치, 사전에 없으면 [UNK](id 0).
- **신규 컴포넌트 `TokenizerLab.vue`** — 문장 입력/예시 + 방식 토글 → 토큰 칩(조각+ID) 실시간, [UNK] 강조,
  토큰 수·UNK 수 요약.
- `Chapter2.vue` — ①글→토큰→숫자(TokenizerLab + 토큰/토큰화/사전 용어) → ②단어 vs 글자 vs 서브워드
  (ChartView로 토큰 수 비교 2/5/8, [UNK] 용어) → ③🤖 AI연결(서브워드=BPE, 토큰=요금·컨텍스트 단위)
  → DetailsCard(BPE 원리) → 미니체크 2 + 끝 10문제(개념+토큰 수 세기).
- 노트북 `ch02_tokenization.ipynb` — 같은 사전·같은 로직 Python 구현. 카운트 웹과 일치(3/7/3, 2/5/8).
- `chapters.ts` ch2 공개(+notebook) · router `/ch/ch2`. `npm run build` + nbconvert 검증 통과.

**다음**: Phase 3 — 임베딩(토큰 ID를 의미 벡터로).

---

## 2026-06-29 — Phase 1 (트랜스포머 큰 그림) 완료

"LLM은 다음 단어 맞히기 게임"이라는 전체 흐름을 조망하는 챕터. `SampleChapter` 패턴 그대로 따름.
- **신규 컴포넌트 `NextWordGame.vue`** — 목업 모델(`MODEL[마지막단어]→후보+logit`)로 자기회귀 생성 체험.
  후보 클릭 → 문장에 붙고 다음 후보 갱신, 그리디 자동 버튼·리셋. 확률은 Phase 0 `softmax` 재사용. v-model 로 문장 공유.
- `Chapter1.vue` — ①직관(NextWordGame + 자기회귀 용어) → ②전체 파이프라인(`TransformerMap` 재사용 + 칸별
  한 줄 소개 = ch2~10 예고, 토큰·임베딩·파이프라인 용어) → ③🤖 AI연결(그리디 vs 확률 선택, ch12 예고)
  → DetailsCard(왜 한 단어씩?) → 미니체크 2 + 끝 10문제(개념·순서 위주).
- 노트북 `ch01_big_picture.ipynb` — 같은 MODEL로 자기회귀 루프 직접 구현(그리디 + 확률적 샘플링).
  그리디 결과 "나는 밥을 먹었다." 웹 게임과 일치.
- `chapters.ts` ch1 `comingSoon` 제거(+notebook) · router `/ch/ch1` 추가. `npm run build` + nbconvert 검증 통과.

**다음**: Phase 2 — 토큰화(글을 조각으로 쪼개기).

---

## 2026-06-29 — 샘플 챕터 초보자 관점 검토 후 다듬기 (5건)

`SampleChapter.vue` 를 초보자 눈높이로 점검하고 5가지 반영. 빌드 통과.
1. **흐름 정리**: `DetailsCard`(로짓 심화)를 미니체크 **뒤로** 이동 — 본류(실험→용어→tip→미니체크)를
   먼저 완결하고 무거운 곁가지(로그·오즈)는 그다음에 펼치도록.
2. **용어 보완**: "확률 분포(distribution)" 첫 등장(§1)에 한 줄 정의 추가(모든 용어 즉시 설명 원칙).
3. **정확성**: §4 어텐션을 "입구"→"중간"으로 수정(어텐션은 트랜스포머 중간 단계).
4. **중복 제거**: 본문 첫 미니체크를 "합=1"→"로짓은 음수도 되나?"로 교체(연습 1번 문제와 중복 해소).
5. **제목 친화화**: §2 "왜 그냥 비율로 안 나누고?"→"왜 지수(e)를 한 번 거칠까?".

---

## 2026-06-29 — 보완: 로그(log) 설명 추가 + `CLAUDE.md` 신설

- `SampleChapter.vue` 로짓 심화 카드 ②에 **"로그(log)" 즉시 설명** 삽입(원칙: 모든 용어 즉시 설명).
  로그=지수의 반대(자연로그 ln), 오즈→로짓 변환 표(75%→+1.10 / 50%→0 / 25%→−1.10, 0 중심 대칭). 빌드 통과.
- 루트에 **`CLAUDE.md`** 신설 — repo 작업 가드레일(궁극 목표, 규칙 7가지, 새 챕터 추가 5단계,
  재사용 컴포넌트 목록, KaTeX 백슬래시·중첩 따옴표 함정). `00_plan.md`와 중복 없이 포인터로 연결.

---

## 2026-06-29 — 샘플 챕터: 로짓 심화 카드 + `DetailsCard` 컴포넌트 추가

- 신규 재사용 컴포넌트 **`DetailsCard.vue`** — 접었다 펴는 "더 깊이 알아보기" 보조 카드.
  native `<details>`/`<summary>` 기반(JS·접근성 무료, 화살표 회전). 본문 흐름은 가볍게,
  심화 곁가지는 궁금한 학습자만 펼치도록 분리. (앞으로 모든 챕터 공용)
- `SampleChapter.vue` '새 용어: 로짓' 카드 아래에 심화 카드 삽입 — ①로짓은 차이로만 의미(상수 불변과 연결)
  ②이름의 유래(로그 오즈, 로그↔지수가 짝이라 공식에 e 등장) ③진짜 LLM은 단어 사전 크기만큼 로짓(Phase 9 예고)
  ④"원점수 vs 반에서의 몫" 비유. `docs/00_plan.md` 컴포넌트 목록에도 반영.
- `npm run build` 통과.

---

## 2026-06-29 — Phase 0 (기반 구축 + 샘플 챕터) 완료

**목표**: 프로젝트 뼈대 + 재사용 컴포넌트 + 샘플 챕터 1개로 "한 챕터의 완성형" 패턴 확정.

### 스캐폴딩
- `web/` — Vue 3 + TS + Vite + Tailwind v4 + Vue Router + Pinia + KaTeX + vue-chartjs 구성.
  참고 프로젝트 `C:\STUDY\MATH\linear-algebra` 와 동일 체계.
- `notebooks/` — `requirements.txt` (NumPy/Matplotlib/JupyterLab).

### 단일 소스 / 인프라
- `data/chapters.ts` — 목차·진도·라우팅의 단일 소스. Phase 0~12 로드맵 등록(샘플만 공개, 나머지 `comingSoon`).
- `stores/progress.ts`(`tf-progress-v1`) · `stores/review.ts`(`tf-review-v1`) — localStorage 진도/복습.
- `App.vue` · `AppSidebar.vue`(진도바·복습 배지) · `views/`(Home/Review/ComingSoon) · `router/`.
- `utils/softmax.ts` — `softmax()`(최댓값 빼기 수치 안정화) · `argmax()`.

### 재사용 컴포넌트 (8종)
- `ConceptCard`(note/tip/warn/goal/**ai** 톤) · `MathBlock`(KaTeX) · `ChartView`(vue-chartjs).
- `Quiz`(객관식·참거짓·숫자입력) · `StepQuiz`(단계별 계산) · `QuizSet`(집계→진도 완료) · `ReviewFlag`.
- **`SoftmaxLab`** — 인터랙티브 핵심: 점수(logit) 슬라이더 조작 → 확률 막대·승자 단어 실시간 갱신 (v-model).
- **`TransformerMap`** — 홈 화면 "트랜스포머 한눈에 보기" 단계 흐름도.

### 샘플 챕터 — 소프트맥스 (`chapters/SampleChapter.vue` + `notebooks/ch00_sample.ipynb`)
- 주제 선정 이유: 소프트맥스는 트랜스포머의 **출력층(다음 단어)과 어텐션(집중도) 양쪽**에서 쓰이는
  핵심 장치라, 샘플 하나로 궁극 목표와 직결되며 "직관→움직임→공식→AI연결"을 모두 보여주기 좋음.
- 구성: 목표 카드 → ①직관(SoftmaxLab 실험) → ②왜 지수를 쓰나 → ③공식+기호 4종 설명(z_i, e, e^z, Σ)
  + 지수단계 라이브 차트 → ④🤖 트랜스포머 연결 → ⑤연습 10문제(난이도/유형 혼합, StepQuiz 포함).
- 본문 미니체크 2개 + 끝 10문제(전부 풀면 `sample` 진도 완료).
- 노트북: 같은 예제("오늘 날씨가 정말 ___" → 좋다 73.3%)를 NumPy로 직접 계산, 막대 그래프,
  "상수 더해도 불변" 확인, 정규화 연습(assert 자동 검증).

### 검증
- `npm run build` (vue-tsc + vite) 통과. (초기 에러: 템플릿 속성 내 중첩 `\"` → 「」로 교체해 해결.)
- 노트북 `jupyter nbconvert --execute` 끝까지 정상 실행(출력 포함). 계산 결과 웹과 일치 확인.

**다음**: Phase 1 — 트랜스포머 큰 그림("다음 단어 맞히기" 게임으로 전체 흐름 조망).
