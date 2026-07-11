# 7부 — 임베딩 기하학: 작업 이력 (최신이 위)

## 2026-07-11

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
