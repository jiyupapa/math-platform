# 🤖 수포자를 위한 트랜스포머

수학 포기자(수포자)와 AI 초보자를 위한 **LLM 트랜스포머 인터랙티브 학습 프로그램**.

> **궁극 목표**: 거대해 보이는 LLM(ChatGPT 등)이 사실은 *"다음 단어를 확률로 고르는 기계"*이며,
> 그 핵심 부품이 **트랜스포머(Transformer)**임을 — 공식을 외우지 않고 직접 조작하며 — 이해한다.

웹 앱에서 슬라이더·드래그로 "감"을 잡고, 짝을 이루는 Python 노트북에서 "진짜 계산"을 한다.
공식보다 **직관 먼저**, 글자보다 **움직임**, 그리고 모든 새 용어·기호는 즉시 설명한다.

## ✨ 특징

- **인터랙티브 우선** — 챕터마다 직접 조작하면 결과가 실시간으로 바뀌는 실험실(랩)이 있다.
- **웹 ↔ 노트북 1:1** — 웹에서 잡은 직관을 노트북에서 같은 예제로 손계산해 굳힌다.
- **자동채점 문제** — 본문 미니체크 + 챕터 끝 10문제(객관식·참거짓·숫자·단계별), 힌트·해설 포함.
- **진도·복습 저장** — 완료/복습 표시가 브라우저(localStorage)에 남는다.
- **🤖 AI 튜터(챗봇)** — 우하단 플로팅 챗봇 + 노트북 튜터. 지금 보는 챕터를 알고 답한다.
  로컬 **Ollama** 기반이라 API 키·비용·인터넷이 필요 없다(꺼져 있으면 켜는 법만 안내, 학습엔 지장 없음).
- **모든 개념을 트랜스포머에 연결** — 각 챕터에 🤖 "LLM 어디에 쓰이나" 카드.

## 📚 커리큘럼 (전 13챕터 완성)

| # | 챕터 | 핵심 | 인터랙티브 |
|---|------|------|-----------|
| 0 | 샘플 — 소프트맥스 | 점수를 확률로 | SoftmaxLab |
| 1 | 트랜스포머 큰 그림 | "다음 단어 맞히기" 게임 | NextWordGame |
| 2 | 토큰화 | 글을 토큰으로 쪼개 ID로 | TokenizerLab |
| 3 | 임베딩 | 단어를 의미 벡터로 | EmbeddingLab |
| 4 | 위치 인코딩 | 순서 정보 더하기 | PositionLab |
| 5 | 어텐션의 직관 | 집중도로 문맥 가중 평균 | AttentionLab |
| 6 | **Q·K·V & 셀프 어텐션** 🌟 | 점수 = Query·Key 내적 | QKVLab |
| 7 | 멀티헤드 어텐션 | 여러 관점 동시에 | MultiHeadLab |
| 8 | 트랜스포머 블록 | 잔차·정규화·FFN | BlockLab |
| 9 | 출력층 | logits → 소프트맥스 → 다음 단어 | OutputLab |
| 10 | **🎯 전체 조립** | 모든 조각을 이어 문장 생성 | PipelineLab |
| 11 | 학습 (심화) | 손실 + 경사하강 | GradientDescentLab |
| 12 | 샘플링 (심화) | temperature·top-k·top-p | SamplingLab |

→ **ch10(전체 조립)에서 궁극 목표에 도달**한다. 11~12는 학습·생성 제어 심화.

## 🗂️ 구성

- `web/` — Vue 3 + TS + Vite 웹 앱 (인터랙티브 시각화 + 자동채점 문제)
- `notebooks/` — 챕터별 Jupyter 실습 노트북 (웹과 1:1 대응, `ch00`~`ch12`)
- `docs/` — [전체 계획·로드맵](docs/00_plan.md) · [작업 이력](docs/99_history.md)
- `CLAUDE.md` — repo 작업 가드레일(설계 철학·새 챕터 추가 절차)

## 🚀 실행

### 웹 앱
```bash
cd web
npm install
npm run dev        # 개발 서버 → http://localhost:5173
npm run build      # 프로덕션 빌드 (dist/)
npm run preview    # 빌드 미리보기 → http://localhost:4173
```
바로 보기: `http://localhost:5173/ch/sample` (샘플 챕터)

### Python 노트북
```bash
cd notebooks
python -m venv .venv
.venv\Scripts\activate            # Windows (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
jupyter lab                       # → http://localhost:8888
```

### 🤖 AI 튜터 (선택)
로컬 [Ollama](https://ollama.com)를 쓰므로 API 키·비용·인터넷이 필요 없다.
```bash
ollama serve                 # Ollama 실행
ollama pull gemma4:e2b       # 모델 1개 (최초 1회)
```
- 웹: 어느 페이지든 **우하단 🤖 버튼** → 지금 보는 챕터를 알고 답한다.
- 노트북: 각 노트북 맨 위 튜터 셀 실행(웹과 같은 챗봇). Ollama가 꺼져 있으면 켜는 법만 안내되고,
  튜터 없이도 학습에는 전혀 지장 없다. (챕터 맥락 단일 소스: `web/src/data/tutorContext.json`)

## 🛠 기술 스택

Vue 3 + TypeScript + Vite + Vue Router + Pinia · KaTeX(수식) · vue-chartjs(차트) ·
커스텀 SVG/반응형 인터랙티브 · Tailwind CSS v4 / Jupyter + NumPy + Matplotlib.

## ✅ 진행 현황

**전 과정(Phase 0~12) 완성.** 웹 13챕터 + 노트북 13개, 전 챕터 `npm run build` 및
`nbconvert --execute` 검증 통과. 자세한 이력은 [docs/99_history.md](docs/99_history.md).
