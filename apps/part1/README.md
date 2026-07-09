# 수포자를 위한 선형대수학 📐

![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646cff?logo=vite&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776ab?logo=python&logoColor=white)
![Jupyter](https://img.shields.io/badge/Jupyter-f37626?logo=jupyter&logoColor=white)
![Chapters](https://img.shields.io/badge/chapters-12%2F12-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

화살표를 직접 끌어보고, 격자가 휘어지는 걸 눈으로 보고, 바로 문제를 풀며 배우는
**선형대수학 인터랙티브 학습 프로그램**입니다. 수학에 겁먹은 분(수포자)을 위해 만들었습니다.
단순 수학 학습이 아니라, **선형대수를 통해 AI를 이해하는 토대**를 쌓는 것이 최종 목표입니다.

> 이 앱은 **MATH_PLATFORM 모노레포**의 1부(`apps/part1`)입니다. 시리즈 전체 개요는 저장소 루트 `README.md` 참고.

> 전체 계획과 Phase 로드맵은 [`docs/00_plan.md`](docs/00_plan.md) 참고.

## 구성

| 폴더 | 내용 |
|------|------|
| `web/` | 웹 앱 (Vue 3 + TypeScript + Vite). 설명·차트·인터랙티브 시각화·자동채점 문제 |
| `notebooks/` | 챕터별 Python 실습 노트북 (NumPy + Matplotlib) |
| `docs/` | 기획 문서 |

## 현재 상태: 전 과정 완성 🎓 (챕터 12/12)

- **핵심 토대 ch1~8**: 좌표·벡터 → 벡터 연산 → 행렬 → 연립방정식 → 선형변환 → 행렬식·역행렬 → 고유값·고유벡터 → PCA
- **AI 심화 ch9~12**: 기저·차원·rank / 직교성과 투영(최소제곱) / **특이값분해 SVD** / **그래디언트·경사하강**(AI 학습의 심장)
- 각 챕터는 웹(인터랙티브 시각화 + 자동채점 문제) + Python 노트북 1:1 대응, 진도·복습 저장
- 다음 여정: "수포자를 위한 수학" 시리즈 **2부 미적분 · 3부 확률통계** (계획 중 — `docs/00_plan.md` 1-B 참고)

## 실행 방법

### 웹 앱
```bash
cd web
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드
```

### Python 노트북 (선택)

**노트북은 선택입니다 — 웹 앱만으로 전 챕터 학습·완주가 가능해요.**
Python·터미널이 처음이라면 [`notebooks/README.md`](notebooks/README.md)의
step-by-step 가이드를 따라오세요.

```bash
cd notebooks
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
jupyter lab
```

## 🤖 AI 튜터 (선택)

공부하다 막히면 화면 우하단 🤖 버튼으로 **AI 튜터**에게 물어볼 수 있습니다.
지금 보고 있는 챕터의 맥락을 알고 수포자 눈높이로 답합니다.
**웹 앱과 노트북 양쪽에서 같은 튜터**를 쓸 수 있습니다.

- **웹**: 우하단 🤖 버튼 — 챕터 질문, 추천 질문, "그 내용은 N장에 있어요" 목차 안내.
- **노트북**: 각 노트북 맨 위의 튜터 셀을 실행하면 웹과 같은 🤖 버튼이 떠 있습니다.
  추가로 **📖 코드 설명** — 실행했던 코드 셀을 드롭다운에서 골라 누르면 그 코드를
  한 줄씩 풀어 설명해 줍니다 (버튼 없이 `explain('ch3')` 함수로도 가능).
- **로컬 LLM(Ollama)** 사용 — API 키·비용·인터넷 불필요, 오프라인 동작.
- 준비: [Ollama](https://ollama.com) 설치 후 `ollama pull gemma4:e2b` (다른 설치 모델로 전환 가능).
- Ollama 가 없어도 학습에는 지장 없습니다 (버튼을 누르면 안내가 표시될 뿐).

## 기술 스택

Vue 3 · TypeScript · Vite · Vue Router · Pinia · KaTeX · Chart.js(vue-chartjs) · Tailwind CSS
· NumPy · Matplotlib · JupyterLab · ipywidgets · Ollama(로컬 LLM)

## 새 챕터 추가하는 법 (개발 메모)

1. `web/src/data/chapters.ts` 에서 해당 챕터의 `comingSoon` 제거
2. `web/src/chapters/ChN.vue` 작성 (샘플 챕터 구조 참고)
3. `web/src/router/index.ts` 에 라우트 연결
4. `notebooks/chNN_*.ipynb` 대응 노트북 작성 (맨 위에 AI 튜터 셀 `chat('chN')` 포함)
5. `web/src/data/tutorContext.json` 에 챕터 맥락 추가 — AI 튜터가 읽는 단일 소스
   (웹 `tutorContext.ts` 와 `notebooks/tutor.py` 가 공용)

## 라이선스

[MIT](LICENSE) © 2026 jiyupapa
