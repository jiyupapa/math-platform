# 6부 — LLM 조련: 작업 이력 (최신이 위)

## 2026-07-10

### 🚀 ch0(워밍업 — 같은 모델, 다른 대답) 공개 — 첫 콘텐츠
- 웹: `SampleChapter.vue` + `BaseVsChatLab.vue`(프롬프트 3종 → 베이스/챗 응답 나란히 비교,
  오프라인·결정적 시뮬레이션). 목표 카드 → 실험 → 미니체크 2 → 새 용어(베이스/챗 모델) →
  3단 파이프라인 박스 → AI 연결(회수: 4부 전체) → 10문제 QuizSet(완료 시 진도) → 완료 박스.
- 노트북: `ch00_sample.ipynb` — 웹과 같은 비교 예제 + **초소형 이어쓰기 기계**(다음 단어 빈도표 →
  greedy 이어쓰기, "질문해도 이어 쓸 뿐" assert 검증). 공용 커널(math-platform) 무에러 실행 통과.
- `notebooks/tutor.py`(part5 이식·6부 주제 개조) + `requirements.txt` 신설. tutorContext 에 sample 맥락.
- 홈: 워밍업 CTA(제작 중 박스 안), 본 챕터(1장~) 공개 전까지 진도 박스 대신 안내 유지.
- 검증: 빌드 + headless Edge E2E 12개(렌더·실험 조작·퀴즈 채점 흐름) 통과.

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
