# 7부 — 임베딩 기하학: 작업 이력 (최신이 위)

## 2026-07-11

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
