# 🤖 수포자를 위한 트랜스포머 학습 프로그램 — 전체 계획 (00_plan)

> 최종 수정: 2026-06-29
> 프레임워크: **Vue 3 + TypeScript + Vite** (참고: `C:\STUDY\MATH\part1-linear-algebra` 와 동일 체계)

---

## 1. 프로젝트 개요

- **대상**: 수학 포기자(수포자) 및 **AI 초보자**
- **🧭 가장 중요한 목적**: 외부 평가가 아니라 **"학습자 본인이 실제로 이해했는가"**가 성공 기준.
- **🎯 궁극 목표 — [LLM의 트랜스포머 이해]**: 거대해 보이는 LLM(대형 언어 모델)이 사실은
  **"다음 단어를 확률로 고르는 기계"**이며, 그 핵심 부품이 **트랜스포머(Transformer)**임을 이해한다.
  → **모든 챕터는 그 개념이 트랜스포머/LLM 안에서 어디에 쓰이는지 연결**을 반드시 포함한다.
  → 궁극 목표 도달점은 **ch10(전체 조립 — GPT가 글을 쓰는 법)**.
- **형태**: **웹 앱(브라우저)** + **Python 노트북** 병행 (1:1 대응)
- **실습 수준**: 인터랙티브 시각화(직접 조작) + 자동 채점 문제
- **진행 방식**: 한꺼번에 만들지 않고 **Phase 0(기반) → Phase 1~10(핵심) → Phase 11~12(심화)** 단계 구축

---

## 2. 핵심 설계 철학 (반드시 준수)

1. **직관 먼저, 공식 나중** — "왜 필요한가"를 그림/비유로 먼저, 수식은 마지막에.
2. **글자보다 움직임** — 핵심 개념은 직접 드래그/슬라이더 조작 → 결과가 실시간으로 바뀌는 시각화로.
3. **작은 성공의 반복** — 짧은 개념 → 즉시 자동채점 문제 → 즉시 해설. 막히면 단계별 힌트.
4. **두 가지 손맛** — 웹 앱에서 "감"을 잡고, Python 노트북에서 "진짜 계산"을 한다. 둘은 1:1 대응.
5. **🔑 모든 새 용어·기호·수식은 예외 없이 즉시 설명** — 기호는 "이름 + 읽는 법 + 뜻" 세트로.
   (대상은 설명 없는 기호 하나에서 이탈한다.) 예: `softmax` 의 `Σ` → "시그마, '전부 더해라'는 뜻".
6. **🤖 응용(AI) 연결 필수** — 각 챕터마다 그 개념이 트랜스포머/LLM에서 어떻게 쓰이는지 보여준다.
7. **톤** — 대상은 성인/학생. 유치하지 않게, 지적 자존심을 존중하는 톤.

---

## 3. 기술 스택 (확정)

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | **Vue 3 + TypeScript** | `<script setup>` 반응성이 인터랙티브 학습에 최적 |
| 빌드 | **Vite** | 빠른 개발/빌드 |
| 라우팅 | **Vue Router** | 챕터 네비게이션 |
| 상태관리·진도저장 | **Pinia** + localStorage | 진도/복습 저장 |
| 수식 | **KaTeX** | 가볍고 빠른 LaTeX 렌더 |
| 차트 | **vue-chartjs (Chart.js)** | 정적 그래프 |
| 인터랙티브 시각화 | **커스텀 SVG / 반응형 컴포넌트** | 슬라이더·드래그 조작 |
| 스타일 | **Tailwind CSS** | 빠른 UI 구성 |
| 실습 코드 | **Jupyter 노트북 + NumPy/Matplotlib** | 챕터별 대응 |

---

## 4. 폴더 구조

```
part4-transformer/
├─ docs/
│  ├─ 00_plan.md            # 이 문서 (전체 계획·로드맵)
│  └─ 99_history.md         # 작업 이력 (최신이 위로)
├─ web/                     # 웹 앱 (Vue 3 + Vite)
│  └─ src/
│     ├─ data/chapters.ts       # 단일 소스 — 목차·진도·라우팅이 전부 여기서 파생
│     ├─ components/            # 재사용 컴포넌트
│     │  ├─ ConceptCard.vue         # 설명 카드 (note/tip/warn/goal/ai)
│     │  ├─ DetailsCard.vue         # 접었다 펴는 "더 깊이 알아보기" 보조 카드 (심화 곁가지)
│     │  ├─ MathBlock.vue           # 수식 블록 (KaTeX)
│     │  ├─ ChartView.vue           # 차트 래퍼 (vue-chartjs)
│     │  ├─ SoftmaxLab.vue          # 인터랙티브 — 점수→확률 실시간 조작
│     │  ├─ TransformerMap.vue      # 홈 화면 "트랜스포머 지도"
│     │  ├─ Quiz.vue / StepQuiz.vue # 자동채점 (객관식·참거짓·숫자 / 단계별)
│     │  ├─ QuizSet.vue             # 문제 묶음 집계 → 진도 완료
│     │  └─ ReviewFlag.vue          # 섹션 복습 북마크
│     ├─ chapters/SampleChapter.vue # Phase 0 샘플 챕터
│     ├─ views/                     # HomeView / ReviewView / ComingSoonView
│     ├─ stores/                    # progress.ts / review.ts (Pinia)
│     ├─ router/ · utils/softmax.ts · App.vue · main.ts · style.css
└─ notebooks/               # 챕터별 Python 실습 노트북
   ├─ requirements.txt
   └─ ch00_sample.ipynb …
```

---

## 5. Phase 로드맵 (트랜스포머 분해)

| Phase | 주제 | 핵심 직관 / 시각화 | 트랜스포머 위치 |
|-------|------|--------------------|-----------------|
| **0** | 기반 + 샘플(소프트맥스) | 점수→확률 슬라이더 실험 | 출력층·어텐션 공통 장치 |
| **1** | 트랜스포머 큰 그림 | "다음 단어 맞히기" 게임 전체 흐름 | 전체 조망 |
| **2** | 토큰화 | 문장을 조각으로 쪼개 ID로 | 입력 |
| **3** | 임베딩 | 단어 → 의미 벡터(좌표) | 입력 |
| **4** | 위치 인코딩 | 순서 정보 더하기 | 입력 |
| **5** | 어텐션의 직관 | "어디에 집중할까" 가중치 | 핵심 |
| **6** | 🌟 Q·K·V & 셀프 어텐션 | 질문·열쇠·값으로 관계 계산 | 핵심 |
| **7** | 멀티헤드 어텐션 | 여러 관점 동시에 | 핵심 |
| **8** | 트랜스포머 블록 | 잔차연결·층정규화·피드포워드 | 블록 조립 |
| **9** | 출력층 | logits → 소프트맥스 → 확률 | 출력 |
| **10** | 🎯 전체 조립 | 모든 조각을 이어 문장 생성(autoregressive) | **궁극 목표 도달** |
| **11** | 학습 (심화) | 손실·경사하강, 사전학습/파인튜닝 | 학습 원리 |
| **12** | 샘플링 (심화) | temperature·top-k·top-p | 생성 다양성 |

> **0~10이 본 과정**(트랜스포머 추론 전체), **11~12는 심화 확장**(학습·생성 제어).

---

## 6. 각 내용 Phase 공통 산출물 체크리스트

- [ ] 웹 챕터 `.vue` (설명 카드 + 수식 + 차트 + **인터랙티브 조작 시각화**)
- [ ] **본문 미니체크** 2~3개 (개념 설명 중간중간, 진도 미포함)
- [ ] **챕터 끝 문제 세트 10문제** (`QuizSet`) — 난이도별(쉬움/보통/어려움), 유형 혼합(객관식·참거짓·숫자입력), 힌트·해설 포함. 전부 풀면 진도 완료
- [ ] **계산형(2단계 이상) 문제는 `StepQuiz`** — 최종 답만 받지 말고 공식의 중간 단계를 직접 입력·채점
- [ ] 대응 Python 노트북 (`.ipynb`) — 웹과 1:1
- [ ] 사이드바 목차/진도 연동 (`data/chapters.ts` 에 항목 추가)
- [ ] **모든 새 용어·기호·수식 설명** (설계 철학 5번)
- [ ] **🤖 트랜스포머/LLM 연결 카드** (설계 철학 6번)

> 새 챕터 추가 절차: ① `data/chapters.ts` 의 `comingSoon` 제거 → ② `src/chapters/ChapterN.vue` 작성 →
> ③ `router/index.ts` 에 동적 import 라우트 추가 → ④ 대응 노트북 작성 → ⑤ `npm run build` 검증.

---

## 7. 실행 방법 (Run)

### 웹 앱
```bash
cd web
npm install
npm run dev      # 개발 서버 → http://localhost:5173
npm run build    # 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과 미리보기 → http://localhost:4173
```
샘플 챕터 직접 보기: `http://localhost:5173/ch/sample`

### Python 노트북
```bash
cd notebooks
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
jupyter lab                     # → http://localhost:8888
```

---

## 8. 진행 현황 / 다음 행동

- ✅ **Phase 0 (기반 구축) 완료** — 스캐폴딩, 재사용 컴포넌트, 진도/복습 인프라,
  **샘플 챕터(소프트맥스)** + 대응 노트북. `npm run build` 및 nbconvert 실행 검증 통과.
- ✅ **Phase 1 (트랜스포머 큰 그림) 완료** — 자기회귀 "다음 단어 맞히기" 조망.
  신규 `NextWordGame.vue`, `Chapter1.vue`, `ch01_big_picture.ipynb`. 빌드·nbconvert 검증 통과.
- ✅ **Phase 2 (토큰화) 완료** — 글→토큰→ID, 단어/글자/서브워드와 [UNK].
  신규 `utils/tokenizer.ts`, `TokenizerLab.vue`, `Chapter2.vue`, `ch02_tokenization.ipynb`. 검증 통과.
- ✅ **Phase 3 (임베딩) 완료** — 토큰 ID를 의미 벡터로, "가까움=비슷함".
  신규 `utils/embeddings.ts`, `EmbeddingLab.vue`, `Chapter3.vue`, `ch03_embedding.ipynb`. 검증 통과.
- ✅ **Phase 4 (위치 인코딩) 완료** — 순서 정보를 벡터로 더하기. "나 너 좋아해" vs "너 나 좋아해".
  신규 `PositionLab.vue`, `Chapter4.vue`, `ch04_positional.ipynb`. 검증 통과.
- ✅ **Phase 5 (어텐션의 직관) 완료** — "집중도(합 1)로 문맥을 가중 평균". 트랜스포머의 심장.
  신규 `AttentionLab.vue`, `Chapter5.vue`, `ch05_attention_intuition.ipynb`. 검증 통과.
- ✅ **Phase 6 (Q·K·V & 셀프 어텐션, 🌟 핵심) 완료** — 점수=Q·K 내적 → softmax → Value 가중합.
  신규 `QKVLab.vue`, `Chapter6.vue`, `ch06_qkv_attention.ipynb`. 검증 통과.
- ✅ **Phase 7 (멀티헤드 어텐션) 완료** — 여러 헤드가 각기 다른 관점, concat으로 합침.
  신규 `MultiHeadLab.vue`, `Chapter7.vue`, `ch07_multihead.ipynb`. 검증 통과.
- ✅ **Phase 8 (트랜스포머 블록) 완료** — 잔차연결·층정규화·피드포워드로 블록 완성, ×N 쌓기.
  신규 `BlockLab.vue`, `Chapter8.vue`, `ch08_transformer_block.ipynb`. 검증 통과.
- ✅ **Phase 9 (출력층) 완료** — 마지막 벡터 → logits → 소프트맥스 → 다음 단어 확률.
  신규 `OutputLab.vue`, `Chapter9.vue`, `ch09_output_layer.ipynb`. 검증 통과.
- ✅ **🎯 Phase 10 (전체 조립) 완료 — 궁극 목표 도달, 본 과정 0~10 완주.**
  신규 `PipelineLab.vue`(스텝퍼) + `NextWordGame` 재사용, `Chapter10.vue`, `ch10_full_assembly.ipynb`(미니
  트랜스포머 numpy 구현). 검증 통과.
- ✅ **Phase 11 (학습, 심화) 완료** — 손실(크로스 엔트로피) + 경사하강으로 가중치 다듬기.
  신규 `GradientDescentLab.vue`, `Chapter11.vue`, `ch11_training.ipynb`. 검증 통과.
- ✅ **🎉 Phase 12 (샘플링, 심화) 완료 — 전 시리즈(Phase 0~12) 완주!**
  신규 `SamplingLab.vue`, `Chapter12.vue`, `ch12_sampling.ipynb`. 검증 통과.

### 🏁 전 과정 완성 (2026-06-29)
- 웹 **13챕터**(sample + ch1~12) + 대응 **노트북 13개**, 모든 `comingSoon` 제거 → 진도 13/13.
- 인터랙티브 랩 13종 + 재사용 컴포넌트(ConceptCard·DetailsCard·MathBlock·ChartView·Quiz·StepQuiz·
  QuizSet·ReviewFlag·TransformerMap) + 진도/복습 인프라. 전 챕터 `npm run build` + `nbconvert` 검증 완료.
- 궁극 목표 달성: 학습자가 "LLM = 다음 단어를 확률로 고르는 기계, 핵심 부품은 트랜스포머"를 스스로 설명 가능.
- 향후(선택): 시각 디테일 다듬기, 접근성/모바일 점검, README 갱신, 배포. (핵심 콘텐츠는 완결)

확정 스택: **Vue 3 + TypeScript + Vite + Vue Router + Pinia + KaTeX + vue-chartjs + Tailwind**

---

## 9. Phase 1 착수 가이드 (다음 세션 시작점)

> 새 세션은 먼저 **`CLAUDE.md`** 와 이 절을 읽고 시작한다. 작업 전 `cd web && npm install`(이미 됐으면 생략) → `npm run dev` 로 샘플(`/ch/sample`)을 한 번 띄워 패턴을 눈으로 확인.

### 목표 / 한 줄 컨셉
**"LLM은 거대한 다음 단어 맞히기 게임이다"** — 트랜스포머 내부를 뜯기 전에, 입력 글이 들어가 다음 단어가 나오기까지의 **전체 흐름을 새가 내려다보듯** 조망한다. (세부는 ch2~10에서 하나씩 확대.)

### 콘텐츠 뼈대 (SampleChapter 구조를 그대로 따른다)
1. **목표 카드**(goal) — 이 챕터에서 "큰 그림"만 잡고 세부는 다음 챕터로 미룬다고 안내.
2. **①직관**: "오늘 날씨가 정말 ___" → 모델이 다음 단어를 **확률로** 내놓고 하나 고른 뒤,
   그걸 입력 뒤에 붙여 **다시 반복**(자기회귀, autoregressive)하며 문장이 자라는 과정.
3. **인터랙티브** (신규 컴포넌트 `NextWordGame.vue` 제안): 시작 문장에서 후보 단어 확률을 보여주고,
   사용자가 단어를 고르면 문장에 붙고 다음 후보가 갱신 → "한 단어씩 생성"을 직접 클릭 체험.
   (확률 표시는 Phase 0의 `softmax` 유틸 재사용. 값은 미리 정한 작은 사전으로 목업.)
4. **②전체 파이프라인 그림**: 홈의 `TransformerMap` 흐름(토큰화→임베딩→…→출력)을 챕터 안에서
   각 단계가 "무엇을 하는 칸인지" 한 줄씩 소개 — 각 칸이 곧 ch2~10 예고.
5. **③🤖 AI 연결 카드**(ai): 이 "다음 단어 예측" 반복이 곧 ChatGPT가 답을 쓰는 방식임을 명시.
6. **본문 미니체크 2~3개** + **끝 10문제 `QuizSet`**(난이도·유형 혼합; 큰 그림 개념 위주라
   계산형은 적게, 대신 흐름 순서 맞히기·개념 객관식 중심).
7. 완료 시 `progress.markDone('ch1')`.

### 대응 노트북 `notebooks/ch01_*.ipynb`
- 작은 목업 사전 + 고정 확률표로 **자기회귀 생성 루프**를 직접 구현(가장 확률 높은 단어를 골라
  문장에 이어붙이기를 반복). Phase 0 `softmax` 와 동일 계산이 흐름 속에서 어떻게 반복되는지 보여준다.

### 작업 절차 (CLAUDE.md "새 챕터 추가 5단계")
1. `web/src/data/chapters.ts` — `ch1` 의 `comingSoon` 제거(+ `notebook` 필드 추가).
2. `web/src/chapters/Chapter1.vue` 작성(위 뼈대) + 필요 시 `web/src/components/NextWordGame.vue`.
3. `web/src/router/index.ts` — `/ch/ch1` 동적 import 라우트를 `:slug` catch-all **위**에 추가.
4. `notebooks/ch01_*.ipynb` 작성 → `jupyter nbconvert --execute` 로 검증.
5. `npm run build` 통과 확인 → `docs/99_history.md` 에 이력 한 줄.

### 주의
- **모든 새 용어 즉시 설명**: "토큰·자기회귀·파이프라인" 등 첫 등장 시 "이름+읽는 법+뜻".
- 큰 그림 챕터이므로 **깊이 들어가지 말 것** — 각 단계는 "무엇을 하는지"만, "어떻게"는 해당 챕터로 미룬다.
- KaTeX를 JS 표현식 속성에 넣을 때 백슬래시/중첩 따옴표 함정 주의(`CLAUDE.md` 운영 절 참고).
