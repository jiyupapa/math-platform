# 플랫폼 작업 이력 (MATH_PLATFORM)

> **모노레포·플랫폼 레벨** 작업 이력(전략·구조·인프라). 최신이 위로.
> **부별 콘텐츠 이력은 각 부의 `apps/partN/docs/99_history.md`** 에 따로 둔다(예: 챕터 추가는 거기).
> 전략 상세·근거는 같은 폴더 `TODO_260708.md`.

---

## 2026-07-12

### 🗺️ 포털 "학습 구조도"(/map) 신설 — 스모크 117 확장
업무구조도형 스윔레인 보드(열=학습 국면 8, 행=트랙 3레인, 노드 13 — 진도·진단 실데이터로
상태 칠함, ?node= 딥링크). 상세는 `apps/portal/docs/99_history.md`. 플랫폼 레벨 변화:
전 페이지 스모크에 /map 편입 → **117/117 통과**, 발표 덱 ⑧ 검증 수치 동기화(116→117 재생성).

### 🎬 3분 데모 영상 재제작 — 1부 단독 영상 → 플랫폼 스토리 (자동 녹화 파이프라인)
1부(선형대수) 시절이던 `demo_3min.mp4` 를 `13_demo_script.md` "3분 영상 축약판" 스토리보드
기준으로 재제작(**1:49**, 720p30, 자막 오버레이 + `.srt` 동반 갱신).
- **`scripts/record-demo.mjs`** — 조립본을 headless Edge 로 자동 시연·녹화: 문제 제기 →
  **진단 12문항 실클릭 → 경로 재구성**("55챕터·31.9시간" — 발표 덱 스크린샷과 동일 프로필) →
  4부 라이브 투어 3장면(토큰화 문장 타이핑·QKV 집중도·출력층 확률 슬라이더) → **AI 튜터
  실답변**(로컬 Ollama gemma4:e2b, 워밍업 선행) + **주제이탈 차단**("저녁 메뉴") → 숫자 클로징.
  가짜 커서·자막 바 주입, 장면 타이밍으로 SRT 자동 생성, ffmpeg 로 mp4 변환까지 한 번에.
- 함정 2건: 자막 바에 `pointer-events:none` 누락 → 페이지 하단 요소 클릭을 자막이 가로챔 /
  `scrollIntoViewIfNeeded` 가 sticky 헤더 밑에 클릭 지점을 둠 → `block:'center'` 로 교체.
- 검증: 프레임 추출 육안 확인(진단·어텐션 표·튜터 답변/차단·클로징) + 재생 메타(h264+aac).

### 🖼️ 발표 덱 pptx 재생성 — 실물 스크린샷 임베드, 생성 파이프라인 영속화
"선형대수 강의(1부 단독)" 프레임이던 `11_pitch_deck.pptx` 를 `11_pitch_deck.md` 구성안(10장)
기준으로 **코드 생성 방식으로 전면 재작성**. 잔여였던 "pptx 수동 갱신" 항목 해소.
- **`scripts/shoot-deck-assets.mjs`** — 조립본(deploy)을 headless Edge 로 돌며 **실물 스크린샷
  11종** 촬영(`docs/hackathon/assets/`): 진단 화면, 진단 전/후 경로 지도, 개인화 요약 카드
  (벡터·확률 통과 프로필 시드 → "55챕터 · 31.9시간"), 개인화 홈(타이틀 배경), 4부 라이브 투어
  5컷(토큰화·임베딩·어텐션·출력층·샘플링 랩).
- **`scripts/build-pitch-deck.py`** — python-pptx 로 10장 16:9 덱 생성(발표자 노트 = 말 노트
  포함, 한글 글꼴 ea 지정). 검증은 PowerPoint COM 으로 전 장 PNG 렌더 → 육안 확인(상자 겹침
  1건 발견·수정). 이후 수정은 pptx 직접 편집이 아니라 **스크립트 수정 → 재실행**이 정본.
- **`scripts/render-deck.ps1`** — 덱 전 장을 PNG 로 렌더해 `docs/hackathon/slides/`(slide01~10)
  에 저장(리허설·검토용 스냅숏, PowerPoint COM). 덱 재생성 후 이걸로 렌더도 갱신.
- 잔여: 슬라이드 ⑨ QR — 배포 호스트 확정 후 점선 자리에 삽입.

### 📦 해커톤 제출물 4종 개정 — "선형대수 강의" → "수포자 사관학교" 플랫폼 프레임
`docs/hackathon/` 의 제출물이 1부 단독 시절 그대로였던 것(제목부터 "선형대수학")을 전면 개정.
- `10_spec.md`: 플랫폼 명세 — 기능을 **A 강사(진단·경로·설명 3층) · B 교실(9부작 96챕터) ·
  C 튜터(로컬 LLM)** 로 재편, 아키텍처 mermaid(모노레포·단일 origin 조립), 5분 시나리오,
  품질 검증(자동화 3종) 현행화. 차별점 2축: "결정은 규칙·말은 LLM" + "완전 로컬 ₩0".
- `12_metrics.md`: **숫자 한 장(96·1,300+·107·₩0, 핵심 경로 37시간) 전수 실측** + "AI 강사"
  지표 절 신설(진단·설명 가능성·2층 코칭 E2E 16항목·향상도). 1부 실측값(튜터 6초·가드레일
  10/10)은 "1부에서 실측·전 부 공통 인프라"로 표기 유지.
- `13_demo_script.md`: 3분 1부 영상 대본 → **5분 라이브 플랫폼 대본**(문제 → 진단·경로 재구성 →
  청중 문장 라이브 투어(4부 5화면) → 튜터·오프라인 → 숫자 한 장·QR) + 실패 모드 대비 +
  3분 영상 축약판. 체크리스트에 조립본 구동·진도 시드·랩 입력 범위 리허설 명시.
- `11_pitch_deck.md` **신설**: .pptx 갱신 기준 구성안(슬라이드 10장 + 발표 운영·Q&A 노트).
  잔여: pptx 수동 갱신, QR(호스트 확정 대기), 리허설.

### 🧪 검증 인프라 확충 — 전 플랫폼 스모크 영속화 + 노트북 107권 전수 회귀
- **`scripts/verify-smoke.mjs` 신설** — 각 부 `chapters.ts` 에서 슬러그를 동적으로 읽어
  포털(홈·진단) + 9개 부 홈 + 전 공개 챕터를 순회(본문 렌더 + 콘솔 에러 0). 첫 실행
  **116/116 페이지 통과**(챕터 105 + 홈 10 + 진단 1). 콘텐츠 정정 후 회귀 안전망.
- **노트북 전수 회귀** — 마지막 전수 실행이 5부작 시절(60/61)이라 107권 전체를
  `nbconvert --execute` 로 재실행(공용 venv 커널). **결과 106/107 통과 — 유일한 실패는
  기지 예외**(`수포자를_위한_선형대수학.ipynb`, sentence-transformers 별도 필요 — 2026-07-09
  전수 때와 동일, 에러 로그로 원인 재확정). **신규 회귀 0건** — 그간의 콘텐츠 정정
  커밋들이 노트북을 깨지 않았음을 확인.
- part8 튜터 "N장" 링크 정규식 상한 10 → 11 수정 — 8부 캡스톤(11장) 링크 누락 버그
  (7부 셸 복제 잔재, 전 부 대조표로 확인 — part8 만 어긋나 있었음).

### ✅ 개인화 2층 실검증 — 포털↔각 부 localStorage 통합, 조립본에서 확정
전략(①-상세)의 2층 — "포털이 각 부의 학습 데이터를 직접 읽는다" — 를 실제 배포 형태
(`deploy:build` 전 10앱 재조립 → `deploy:serve` 단일 origin)에서 **headless Edge E2E
16항목으로 자동 검증, 전부 통과.**
- 시나리오: 대조군(기록 없음 → 배지·카드 없음, "여기서 시작") → `/part1/` 에서
  `la`(1부 ch1~6)·`tf`(4부 ch1·2·11)·`num`(9부 ch1·2)·`stat-review`(북마크 2건) 기록 →
  포털(`/`)이 읽어 표시.
- 확인된 것: 지도 카드 **진도 배지**(단계1 6/6 · 단계3 2/11 · 단계5 1/1 — `readStepProgress`
  의 쪼갠 단계(4부 추론/학습편) 정확 계산, 9부 신설 편입 포함, 단계8 심화는 미완이라 배지
  없음) · **다음 목적지**(완료 단계 건너뛰고 "이어서 학습 · 3부 전반") · **복습 먼저** 카드
  (3부 2건 + 미리보기 + `/part3/review` 링크) · **심화 해금** 카드(1부 필수 완주 → 6챕터) ·
  역방향(부 앱도 같은 키를 읽음) · 콘솔 에러 0.
- 당초 "헤드리스 브라우저 부재 → `deploy:serve` 수동 확인"으로 남겨둔 항목(2026-07-09) —
  9부 제작에서 구축한 playwright-core + Edge E2E 체계로 자동화. 스크립트는
  **`scripts/verify-layer2.mjs`** 로 영속화(사용법 헤더 포함 — 포털·useProgress 수정 후
  회귀 확인용, playwright-core 는 `npm i --no-save` 임시 설치). **티어 1 잔여 인프라 항목
  해소, 포털 데모 서사("AI 강사가 내 진도를 안다")의 마지막 미검증 구간 닫힘.**

## 2026-07-09

### 🔧 포털 타입체크 붙임 — 5부와 빌드 표준 통일
다른 세션 점검에서 포털만 build 가 `vite build`(타입체크 없음)인 게 지적됨 — 트라이얼 스캐폴드라 의도적이었으나, 포털이 곧 진단·추천 엔진(가장 중요한 앱)이 되므로 표준으로 승격. part1 구성을 이식: `tsconfig.json`/`tsconfig.app.json`/`tsconfig.node.json` + `src/vite-env.d.ts`(.vue 선언) 추가, build 를 **`vue-tsc -b && vite build`** 로, devDeps 에 typescript·vue-tsc·@types/node, vite.config 에 `@` alias. 전 6앱 빌드 통과 확인.

### 📁 전략 docs 일원화 — 플랫폼 레벨 `docs/` 로
`TODO_260708.md`(해커톤 출품 전략)를 `apps/part1/docs/` → **`docs/`** 로 이동(플랫폼 전략인데 part1 하위에 묻혀 있던 것). 이 `docs/99_history.md` 신설(플랫폼 이력). 나머지 해커톤 제출물·발표자료(`10_spec`·`11_pitch_deck`·`12_metrics`·`13_demo_script`·`14_*`·`presentation_*`·데모 영상)는 아직 `apps/part1/docs/` 에 있음(전략 §5 "제출물 개정" 때 정리 예정). 원본 `C:\STUDY\MATH` 트리는 얼어붙은 백업 — 손대지 않음.

### 🧹 정리 — 골든카피/드리프트 체제 폐기 (커밋 `be96deb`)
공유 패키지가 드리프트를 원천 제거하므로 옛 장치 정리: `check_drift.py` 제거, 루트+5부 `CLAUDE.md` 6개를 모노레포 방식으로 전면 갱신(골든카피 섹션 → `packages/ui`, `cd web` → `npm -w apps/partN/web`, 부별 venv → 루트 공용 venv).

### 📓 노트북 검증 — 공용 venv (커밋 `ebd1569`)
루트 공용 venv 하나(`.venv`, 커널 `math-platform`) + 루트 `requirements.txt`(5부 합집합)로 전 61개 노트북 실행 → **60 통과**. `ch08_pca.ipynb` 잠복 버그 수정(대칭행렬에 `eig`→`eigh` — 복소수가 matplotlib `plt.arrow` 에서 TypeError). `수포자를_위한_선형대수학.ipynb` 1개만 `sentence-transformers` 별도 필요(문서화). 상세 `docs/TESTING.md`.

### 🌐 웹 런타임 스모크 — headless Chrome
시스템 Chrome을 puppeteer-core로 헤드리스 구동, part1·portal 을 `vite preview` 로 띄워 검증. 앱 부팅 OK, MathBlock(KaTeX)·ConceptCard(Tailwind `@source` 배경색) 런타임 렌더 확인, **ReviewFlag 클릭 → `la-review-v1` 기록**으로 provide/inject 결합해제가 런타임에도 동작 + 접두사 보존 확인. 콘솔 에러는 favicon 404(무해) 1건.

### 🏗️ 모노레포 전환 — 독립 5부 → npm workspaces (커밋 `b3e3a00`→`71c1aff`→`deaed16`→`b0ee776`)
독립 저장소 5벌 + 골든카피 복제 구조를 **하나의 모노레포**로 통합. 원본 `C:\STUDY\MATH` 를 소스만 복사(.git·node_modules·.venv·dist 제외)해 `C:\STUDY\MATH_PLATFORM` 신설, `git init`.
- 구조: `apps/part1..5`(재배치) + `apps/portal`(신규 스캐폴드) + `packages/ui`(@series/ui) + npm workspaces.
- 공용 컴포넌트 11종을 `packages/ui` 로 추출, 앱전용 결합은 **provide/inject** 로 분리(`storagePrefixKey`·`reviewApiKey`·`notebookResolverKey`). 각 앱 `main.ts` 가 자기 접두사(la/diff/stat/tf/it)·스토어·chapters 주입.
- 소스 `.vue` 패키지 소비: `optimizeDeps.exclude:['@series/ui']` + Tailwind `@source`. localStorage 접두사 전부 보존.
- 검증: 전 5부+포털 빌드(vue-tsc+vite) 통과.

### ✅ 전략 확정 — 플랫폼 방향 → 모노레포 채택
"인증·유저 관리를 갖춘 실제 플랫폼인가?"에 사용자가 **예**로 확정 → 저장소는 모노레포로 결정(그 전 "독립 repo" → "모노레포 이월" → "지금 채택" → "재보류"의 반전 끝). 기술적 뿌리 = localStorage 는 계정처럼 기기 넘어 진도를 못 따라옴(문제 C) → 백엔드 필요 → 모노레포. 타임라인 분리: 구조는 지금, 백엔드는 필요할 때, 해커톤 데모는 정적 버전 그대로. 상세 = `TODO_260708.md`.
