# 7부 — 임베딩 기하학: 작업 이력 (최신이 위)

## 2026-07-11

### 📖 ch3 공개 — 임베딩 공간 탐험
공간의 두 구조(클러스터·의미의 방향)와 벡터 산수를 다루는 장:
- `EmbeddingSpaceLab.vue`: toy 2D 임베딩 12단어(사람·동물·과일 클러스터, 성별 방향 (+2,0)으로
  설계). 실험① 남자→여자·왕자→공주·왕→여왕 화살표 토글 — 전부 평행·등길이("위치만이 아니라
  방향도 뜻이다"). 실험② 의미의 산수 — 프리셋 3개(왕−남자+여자=여왕 등) 좌표 계산 →
  ? 마커 → 최근접 이웃 공개(입력 단어 제외 관례).
- `Chapter3.vue`: 클러스터(검색이 작동하는 토대) → 방향 → 단어 유추(word analogy)·word2vec
  용어 앵커, 한글 KaTeX 수식(\text{} 감싸기), 현실 체크(수백 차원은 4장·≈ 근사·실무는
  문장 임베딩), 더 깊이(임베딩 편향 — 의사−남자+여자=간호사 사례, 6부 4장 교훈 재회),
  미니체크 3 + 10문제. PartLink 지정석 2곳(1부 2장 벡터 연산 · 4부 3장 임베딩).
- `ch03_space.ipynb`: matplotlib 지도(Malgun Gothic) + 클러스터 정량화(무리 안/밖 평균 거리
  assert) + 평행 화살표 assert(세 쌍 모두 (2,0)) + analogy() 3건 assert. nbconvert 무에러.
- 포털 scope '1~3장 공개'. 검증: 빌드 + 배포 조립 headless Edge E2E 19항목 통과.

### 📖 ch2 공개 — 가까움의 수학: 코사인 유사도 (첫 핵심) → 첫 묶음(ch0~2) 완결
1부 2장 내적을 회수해 유사도의 실무 표준을 완성하는 장:
- `CosineLab.vue`: 실험① 길이 오염 — 단어 빈도 벡터 SVG(질문 (1,1)·A (2,2)·B (6,6)·C (0,3))에서
  거리/코사인 토글: 거리로는 내용이 같은 B(3배 자세한 판)가 딴 주제 C보다 꼴찌, 코사인으로는
  A=B 동점 1.00 복귀. 실험② 각도 놀이터 — 사잇각·길이 슬라이더(+0°/90°/180° 프리셋):
  cos θ는 길이에 불변, 내적은 길이에 변함을 실시간 확인.
- `Chapter2.vue`: MathBlock 공식(내적 ÷ 길이 곱), 눈금표(1/0/−1 — 90° 직교는 4장 예고),
  손 계산 3단계, 정규화(단위 벡터 — 코사인=내적), 더 깊이(|a−b|²=2−2cosθ, 벡터 DB
  cosine/dot/L2 옵션), 미니체크 3 + 10문제(StepQuiz 1: a=(3,4)·b=(4,3) 4단계 계산).
  PartLink 지정석 2곳(1부 2장 내적 · 4부 6장 어텐션 Q·K — 관련성 = 내적).
- `ch02_cosine.ipynb`: 길이 오염 재현 assert(거리에서 B 꼴찌·C가 B 앞) → cos_sim으로 복귀
  assert(B=1.0, 길이 10배 불변, 직교=0) → 각도 눈금표 → 정규화(내적=코사인,
  |a−b|²=2−2cosθ) assert. nbconvert 무에러.
- 포털 scope 갱신: '1~2장 공개'. 검증: 빌드 + 배포 조립 headless Edge E2E 24항목 통과
  (KaTeX 렌더·토글·프리셋·StepQuiz 입력칸·PartLink href·완주 박스·홈 진도).

### 📖 ch1 공개 — 큰 그림: 검색의 진화와 RAG
7부의 지도 챕터. 6부와의 구도("지식 주입의 두 길: 조련 vs RAG", CLAUDE.md 규칙 8)가 처음 명시된 장:
- `RagPipelineLab.vue`: 실험① 같은 사내 문서 5건 × 두 검색기 — 표현이 다른 질문(키워드 전멸
  vs 의미 검색 성공)과 정확한 코드 질문(키워드 압승 vs 의미는 유사 문서가 바짝) 토글 비교
  → 하이브리드의 근거. 실험② RAG 파이프라인 5단계(질문→임베딩→검색→프롬프트 조립→생성)
  통과 — 각 단계에 담당 장 배지, 완료 시 "재훈련 없이 검색으로" 결론.
- `Chapter1.vue`: 지식 마감선(knowledge cutoff) → 두 길(가중치=조련 / 문맥=RAG), 새 용어
  RAG 풀네임(검색 증강 생성 Retrieval-Augmented Generation — 첫 정식 등장)·의미 검색·하이브리드,
  조련 vs RAG 비교표 + 핵심 한 줄("말투는 조련, 지식은 RAG — RAG는 재훈련이 아니라 검색"),
  여정 표(단계→장), 더 깊이(환각·BM25·접근 권한), 미니체크 3 + 10문제.
  PartLink 지정석 2곳(4부 3장 — 임베딩의 두 번째 직업 · 6부 2장 — 문맥 창 관찰의 자동화).
- `ch01_rag_map.ipynb`: 두 검색기 비교 assert(Q1 키워드 전멸·의미 성공, Q2 키워드 압승) +
  미니 RAG 5단계 함수 조립(embed→retrieve→build_prompt→generate) assert. nbconvert 무에러.
- 포털 연쇄: 경로 지도 9단계 comingSoon 해제(첫 본 챕터 공개 — scope 'ch1~10 · 제작 중(1장 공개)')
  → /part7/ 링크 활성, 상태 '예정'→'선택'. 7부 홈은 제작 중 안내→진도 박스 자동 전환.
- 검증: 7부·포털 빌드 + 배포 조립 headless Edge E2E 28항목 통과(홈 전환·실험 토글·5단계·
  PartLink href·완주 박스·포털 해제).

### 📖 ch0 공개 — 워밍업 "비슷한 문장 찾기"
7부 첫 콘텐츠. 핵심 문장 "의미는 위치다 — 비슷함은 가까움으로 잴 수 있다"를 실험 두 개로 체득:
- `MeaningMapLab.vue`: 실험① 비슷한 문장 고르기 — 글자 겹침 채점이 B(단어만 겹침)를 1등,
  정답 A를 무관한 C와 동점 꼴찌로 뽑는 맹점을 막대그래프로 노출. 실험② 의미 지도 —
  동물·탈것·과일 클러스터에 "토끼" 자리 고르기 → "여러분이 방금 임베딩을 했습니다."
- `SampleChapter.vue`: 새 용어(임베딩·유사도), RAG 풀네임(검색 증강 생성) 예고(더 깊이),
  키워드 검색이 강한 경우(고유명사)와의 균형, 미니체크 2 + 10문제 QuizSet, 완료 → ch1 안내.
  PartLink 지정석 2곳(4부 3장 임베딩 재등장 · 1부 1장 좌표평면 — AI 연결 카드).
- `ch00_sample.ipynb`: 웹과 1:1 — overlap_score 맹점 재현 assert + 2D toy 임베딩
  (WORD_MAP/SENT_MAP) 유클리드 거리 최근접 검색 성공 assert. nbconvert 실행 무에러.
- 연결: chapters.ts sample 공개(+notebook), 라우트 `/ch/sample`, tutorContext.json `sample` 맥락,
  notebooks/tutor.py(7부 개조)·requirements.txt 신설.
- 검증: 빌드 통과 + 배포 조립 headless Edge E2E 전 항목 통과(홈 CTA → 챕터 렌더 → 실험①
  채점 노출 → 실험② 오답 재시도/정답 → 미니체크 채점 → PartLink href 2건 → 완주 박스).

### 🏗️ 스캐폴드 생성 — 7부 착수
part6 패턴을 복제·개조해 앱 셸 완성 (콘텐츠 0/11):
- 목차 = 루트 README 로드맵 11챕터(워밍업 + ch1~10), 전부 comingSoon. `minutes` 초기 추정치 포함.
- 저장 접두사 **`emb`** 신설 (`emb-progress-v1` · `emb-review-v1` · `emb-quizset-v1:*`).
- 진도/복습 스토어, HomeView(제작 중 안내 — 본 챕터 공개 시 진도 박스로 자동 교체),
  AppSidebar(콘텐츠 0일 때 "제작 중" 표기 가드), ComingSoonView, ReviewView.
- AI 튜터: 7부 주제(임베딩·RAG·벡터 검색) 시스템 프롬프트 + 목차 인덱스 + RAG 풀네임
  (검색 증강 생성) 용어 앵커. 챕터 맥락(contexts)은 각 챕터 공개 시 추가.
- 통합: 배포 조립 `/part7/` 편입(폴백 part[1-7]), 포털 지도에 9단계(선택·실용 분기,
  role '실용' teal 신설, 예정) + 2층 PART_META(emb), 루트 CLAUDE.md·README 반영.
- 검증: `npm run build -w apps/part7/web` 통과(vue-tsc + vite).
