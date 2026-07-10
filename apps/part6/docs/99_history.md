# 6부 — LLM 조련: 작업 이력 (최신이 위)

## 2026-07-10

### 🏗️ 스캐폴드 생성 — 6부 착수
part5 패턴을 복제·개조해 앱 셸 완성 (콘텐츠 0/11):
- 목차 = 루트 README 로드맵 11챕터(워밍업 + ch1~10), 전부 comingSoon. `minutes` 초기 추정치 포함.
- 저장 접두사 **`tame`** 신설 (`tame-progress-v1` · `tame-review-v1` · `tame-quizset-v1:*`).
- 진도/복습 스토어, HomeView(제작 중 안내 — 첫 챕터 공개 시 진도 박스로 자동 교체),
  AppSidebar(콘텐츠 0일 때 "제작 중" 표기 가드), ComingSoonView, ReviewView.
- AI 튜터: 6부 주제(SFT·RLHF·DPO·LoRA) 시스템 프롬프트 + 목차 인덱스. 챕터 맥락(contexts)은
  각 챕터 공개 시 tutorContext.json 에 추가.
- 배포 조립(scripts/build-deploy.mjs)에 `/part6/` 편입. 루트 CLAUDE.md·README 반영.
- 검증: `npm run build -w apps/part6/web` 통과(vue-tsc + vite).
