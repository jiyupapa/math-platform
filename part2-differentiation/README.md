# 미분 학습 프로그램 — 실행 방법

수포자(개발자)를 위한 미분 학습 웹앱. 두 부분으로 구성됩니다.

- **`web/`** — 브라우저에서 보는 학습 웹앱 (Vue 3 + Vite + TypeScript + Tailwind v4)
- **`notebooks/`** — 웹 챕터와 짝지은 Python 실습 노트북 (Jupyter)

전체 기획·커리큘럼은 [`docs/00_plan.md`](docs/00_plan.md), 개발 가이드는 [`CLAUDE.md`](CLAUDE.md) 참조.

---

## 1. 웹앱 실행 (`web/`)

### 사전 준비
- **Node.js 18+** (Vite 6 / Vue 3 기준 권장 20 LTS 이상)
- npm (Node 설치 시 함께 설치됨)

### 실행 절차

```powershell
cd web
npm install          # 최초 1회 — 의존성 설치
npm run dev          # 개발 서버 시작
```

`npm run dev` 실행 후 터미널에 표시되는 주소(기본 **http://localhost:5173**)를 브라우저에서 연다. 소스를 수정하면 자동으로 새로고침된다(HMR).

### 그 외 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (핫 리로드) |
| `npm run build` | 타입체크(`vue-tsc`) + 프로덕션 빌드 → `web/dist/` 생성. **타입 에러가 있으면 빌드 실패** |
| `npm run preview` | 빌드 결과(`dist/`)를 로컬에서 미리보기 |

> 별도의 테스트 러너는 없다. 변경 검증은 `npm run build`(타입체크 포함) 통과 + dev 서버 동작 확인으로 한다.

---

## 2. 실습 노트북 실행 (`notebooks/`)

### 사전 준비
- **Python 3.10+**

### 실행 절차 (Windows / PowerShell)

```powershell
cd notebooks
python -m venv .venv          # 가상환경 생성 (최초 1회)
.venv\Scripts\Activate.ps1    # 가상환경 활성화
pip install -r requirements.txt   # numpy, matplotlib, sympy, jupyterlab
jupyter lab                   # JupyterLab 실행 (또는 jupyter notebook)
```

`jupyter lab` 실행 시 브라우저가 자동으로 열린다. `ch00_sample.ipynb` 등 챕터별 노트북을 연다.

> PowerShell에서 `Activate.ps1` 실행이 막히면(실행 정책 오류) 다음을 한 번 실행:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
> 또는 `cmd` 환경에서는 `.venv\Scripts\activate.bat` 사용.

---

## 빠른 시작 요약

```powershell
# 웹앱
cd web && npm install && npm run dev      # → http://localhost:5173

# 노트북
cd notebooks
python -m venv .venv; .venv\Scripts\Activate.ps1
pip install -r requirements.txt; jupyter lab
```
