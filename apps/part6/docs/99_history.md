# 6부 — LLM 조련: 작업 이력 (최신이 위)

## 2026-07-11

### 🧱 ch2(이어쓰기 기계의 한계) 공개
- 웹: `Chapter2.vue` + `FewShotLab.vue`(예시 0→1→3개로 응답 안정화 체험 — 보내는 프롬프트
  전체·줄 수 카운터 표시, 3샷 성공 후 💣돌발 실험: 기밀 유출 요청을 그냥 수행 → 거절 못 가르침).
  수학 한 줄 P(다음 단어|앞 문맥)(4부 9장 회수) → 실험 → 퍼플렉시티 연결(5부 7장) →
  4가지 한계 카드 → 핵심 한 줄("프롬프트는 분포를 잠깐 밀고, 조련은 분포 자체를 바꾼다")
  → 새 용어(제로샷/퓨샷/문맥 창) → 인컨텍스트 러닝 · instruct 모델 착각 주의 → 10문제.
- 노트북: `ch02_limits.ipynb` — 조건부 분포 뷰어(show_dist)로 '오늘' vs '답변:' 갈래 비교
  (문맥이 갈래를 줄임 = 퓨샷 원리) + 예시 밖 문맥('명령:')의 빈 분포 → 이어쓰기 후퇴.
  assert 2개. 공용 커널 무에러 실행 통과.
- 검증: 빌드 + 조립 + headless Edge E2E 13개(렌더·0/1/3샷 진행·돌발·퀴즈 채점) 통과.

### 🗺️ ch1(큰 그림 — 사전학습에서 비서까지) 공개
- 웹: `Chapter1.vue` + `PipelineExplorer.vue`(같은 요청 하나로 3단계 통과 — 단계별
  먹는 데이터/배우는 것/배우는 곳 + 응답 진화). 요리사 비유 → 실험 → 새 용어 3종
  (사전학습·SFT·선호 학습) → 핵심 한 줄("지식은 사전학습이, 행동은 SFT가, 취향은 선호 학습이")
  → 지도-챕터 매핑 표 → 실무 용어(-base/-instruct) → 10문제 QuizSet.
- 노트북: `ch01_big_picture.ipynb` — ch0 이어쓰기 기계 위에 SFT(모범답안 사례집)·선호 학습
  (선호 점수 최대) 층을 코드로 쌓아 같은 요청의 응답 진화 확인 + 행동 검증 assert 3개.
  공용 커널 무에러 실행 통과.
- 홈: 본 챕터 공개로 진도 박스 모드 전환(+첫 방문 워밍업 CTA). tutorContext ch1 맥락.
- 검증: 빌드 + 조립 + headless Edge E2E 15개(홈 전환·렌더·파이프라인 3단계 진행·퀴즈 채점) 통과.

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
