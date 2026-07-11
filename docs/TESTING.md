# 전체 테스트 수행 방법 — MATH_PLATFORM 모노레포

> 대상: `C:\STUDY\MATH_PLATFORM` (npm workspaces 모노레포). 5개 부(`apps/part1..5`) + 포털(`apps/portal`) + 공용 패키지(`packages/ui`·`packages/tutor`).
> 원본 `C:\STUDY\MATH` 는 손대지 않은 백업. 문제가 생기면 이 폴더를 지우고 원본에서 다시 시작해도 무손실.
>
> **이 테스트로 확인하려는 것**: 모노레포 전환(공용 컴포넌트를 `@series/ui` 패키지로 분리, provide/inject 결합해제) 후에도
> ① 타입·빌드가 깨지지 않고 ② 화면·스타일이 정상이고 ③ 퀴즈/진도/복습이 실제로 동작하고 ④ 부별 저장 접두사가 보존됐는가.

명령은 모두 모노레포 루트에서 실행:

```cmd
cd /d C:\STUDY\MATH_PLATFORM
```

> **셸 안내**: 개별 명령(`npm ...`, `python ...`, 단일 `nbconvert`)은 **cmd · PowerShell · Git Bash 어디서나 동일**하다.
> 셸마다 문법이 다른 건 **여러 항목을 도는 반복문**뿐 — 그 자리에만 `🪟 cmd` / `PowerShell` 두 버전을 나란히 둔다.
> (cmd 에서는 `cd /d` 로 드라이브까지 이동. PowerShell·Git Bash 는 `cd` 만.)

---

## 0. 사전 준비

- **Node.js** (npm 포함). 확인: `node -v` / `npm -v` (개발 시 npm 11.x, Node 20+ 권장).
- **Ollama** (선택) — AI 튜터 챗봇용. 없어도 학습·테스트에 지장 없음(튜터 자리에 설치 안내만 뜸).
- 최초 1회 의존성 설치:

```powershell
npm install
```

> 워크스페이스라 루트에서 한 번 설치하면 6개 앱 + 패키지가 모두 링크된다. `@series/ui` 는 `node_modules/@series/ui` 심링크로 연결됨.

---

## 1. 빌드 테스트 (타입체크 + 프로덕션 빌드)

**이 프로젝트의 1차 검증 수단.** 각 앱의 `build` 는 `vue-tsc -b`(타입체크) + `vite build`(번들)이며,
`tsconfig` 에 `noUnusedLocals`/`noUnusedParameters` 가 켜져 있어 **미사용 변수·타입 오류·템플릿 오류를 전부 잡는다.**

### 전 앱 한 번에

```powershell
npm run build --workspaces --if-present
```

- 6개 앱 전부 `built in ...` 이 뜨면 통과. (`packages/ui` 는 build 스크립트가 없어 자동 건너뜀.)
- 하나라도 `error TS...` 또는 `Cannot find module` 이 뜨면 실패 → 5절 참고.

### 개별 앱만

```powershell
npm run build -w apps/part1/web      # part1 (선형대수)
npm run build -w apps/part4/web      # part4 (트랜스포머)
npm run build -w apps/portal/web     # 포털
```

---

## 2. 런타임 스모크 테스트 (dev 서버) — 가장 중요

빌드 통과는 "타입·구조 OK"까지만 보증한다. **inject 결합해제와 Tailwind 스타일이 런타임에도 맞는지**는 실제 구동으로 확인한다.

### 2-1. 앱 띄우기

```powershell
npm run dev -w apps/part1/web
```

- 브라우저에서 안내된 주소(보통 http://localhost:5173) 열기.
- 다른 부/포털도 같은 방식: `npm run dev -w apps/part4/web`, `npm run dev -w apps/portal/web`.
- 여러 개를 동시에 띄우면 포트가 5173, 5174… 로 자동 증가.

### 2-2. 확인 체크리스트 (전환에서 바뀐 부분 위주)

한 부(예: **part1**)를 열고 아래를 확인. 이게 통과하면 공용 패키지 소비가 런타임에도 정상이라는 뜻:

| # | 확인 항목 | 무엇을 검증하나 |
|---|---|---|
| 1 | **수식이 보인다** (챕터 본문의 KaTeX 수식) | `MathBlock` 패키지 소비 + KaTeX |
| 2 | **설명 카드에 배경·테두리 색이 있다** (ConceptCard: 파랑/초록/보라 등) | Tailwind `@source` 가 패키지 클래스를 생성했는가 (색이 없고 흰 네모면 실패) |
| 3 | **차트가 그려진다** (차트 쓰는 챕터) | `ChartView` (chart.js) 패키지 소비 |
| 4 | **미니 퀴즈·문제 세트 풀이가 채점된다**, 세트를 다 풀면 완료 표시 | `Quiz`/`StepQuiz`/`QuizSet` + provide/inject 집계 |
| 5 | **새로고침 후에도 푼 문제·진도가 유지된다** | `QuizSet` 의 `storagePrefixKey` 주입 (저장 키 `la-quizset-v1:*`) |
| 6 | **섹션 제목 옆 "☆ 복습에 추가" 를 누르면 ★ 로 바뀌고, 새로고침 후 유지** | `ReviewFlag` 의 `reviewApiKey` 주입 (스토어 결합해제) |
| 7 | **"🐍 Python 노트북으로도 해보기" 카드가 챕터에 뜬다** (part1·4·5) | `NotebookCard` 의 `notebookResolverKey` 주입 |
| 8 | **AI 튜터(우하단 🤖)** — Ollama 실행 중이면 답변, 아니면 설치 안내 | 튜터(부별 유지분) |

**포털**(`apps/portal/web`)은 트라이얼 스캐폴드라, 카드 2장 + 수식 한 줄이 색·수식과 함께 보이면 "포털이 패키지를 소비한다"가 확인된 것.

### 2-3. ⚠️ dev 서버의 origin 주의 (개인화 2층 관련)

각 부를 따로 `npm run dev` 하면 포트가 달라 **서로 다른 origin** 이 된다 → 브라우저 localStorage 가 분리되어,
"포털이 다른 부의 진도를 읽는" 기능(개인화 2층)은 **dev 에서는 재현되지 않는다.** 그건 정상이며,
동일 origin 하위 경로로 **배포(빌드)한 뒤**에만 확인 가능하다. 각 부 자체의 진도 저장(체크리스트 5·6)은 dev 에서도 정상 동작한다.

---

## 3. 노트북 테스트 (선택)

**부별 venv 는 필요 없다.** 5개 부의 의존성은 거의 동일(공통 6개 + part2 `sympy` + part3 `scipy`)하고 서로 충돌이 없으므로,
모노레포답게 **루트에 공용 venv 하나**를 만들어 모든 부의 노트북을 실행한다. 합집합 명세는 루트 `requirements.txt`.
(부별 `apps/part*/notebooks/requirements.txt` 는 "그 부가 무엇을 쓰는지" 명세로 남겨둔다 — 참고용.)

### 설정 (최초 1회) — cmd·PowerShell 공통

```cmd
cd /d C:\STUDY\MATH_PLATFORM
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m ipykernel install --user --name math-platform --display-name "Python (MATH_PLATFORM)"
```

### 무에러 실행 검증 (한 개) — cmd·PowerShell 공통 (한 줄)

```cmd
.venv\Scripts\python.exe -m jupyter nbconvert --to notebook --execute --stdout --ExecutePreprocessor.kernel_name=math-platform apps\part1\notebooks\ch00_sample.ipynb
```

- `--ExecutePreprocessor.kernel_name=math-platform` 를 주면, 노트북에 박힌 옛 부별 커널명과 무관하게 공용 커널로 실행된다.
- Jupyter Lab 에서 직접 열 때는 **Kernel → Change Kernel → "Python (MATH_PLATFORM)"** 선택.

### 전 부 노트북 일괄 검증 (선택)

🪟 **cmd** (한 줄 붙여넣기):

```cmd
for %p in (part1 part2 part3 part4 part5) do @for %f in (apps\%p\notebooks\*.ipynb) do @echo [%f] & .venv\Scripts\python.exe -m jupyter nbconvert --to notebook --execute --stdout --ExecutePreprocessor.kernel_name=math-platform "%f" >nul && echo   OK || echo   FAIL
```

> `.bat` 파일로 저장해 쓰려면 `%p`·`%f` 를 `%%p`·`%%f` 로 바꾼다.

**PowerShell**:

```powershell
Get-ChildItem apps\part*\notebooks\*.ipynb | ForEach-Object {
  Write-Host "=== $($_.FullName) ===" -ForegroundColor Cyan
  .venv\Scripts\python.exe -m jupyter nbconvert --to notebook --execute --stdout `
    --ExecutePreprocessor.kernel_name=math-platform $_.FullName | Out-Null
  if ($?) { Write-Host "  OK" -ForegroundColor Green } else { Write-Host "  FAIL" -ForegroundColor Red }
}
```

> 노트북 자체는 모노레포 전환의 영향을 받지 않는다(웹만 재구조화됨). 우선순위는 낮음.

### 예외: 별도 의존성이 필요한 노트북

- **`apps/part1/notebooks/수포자를_위한_선형대수학.ipynb`** — ch01~13 시리즈와 별개인 **독립 데모 노트북**으로,
  실제 문장 임베딩에 `sentence-transformers`(→ `torch` 까지 딸려옴, 수백 MB~GB)가 필요하다. 공용 `requirements.txt` 에는 **일부러 넣지 않았다**(무겁고 시리즈 학습엔 불필요).
  이 노트북만 돌려보려면 별도 설치:

  ```cmd
  .venv\Scripts\python.exe -m pip install sentence-transformers
  ```

- 그 외 60개 노트북(ch* 시리즈)은 루트 `requirements.txt` 만으로 전부 무에러 실행됨(2026-07-09 검증).

### 검증 이력 (2026-07-09)

전 61개 노트북 실행 결과 **60 통과** + 위 데모 1개(별도 의존성). `ch08_pca.ipynb` 는 이때 발견된 잠복 버그를 수정:
대칭 공분산행렬에 `np.linalg.eig`(복소수 반환) 대신 **`np.linalg.eigh`**(실수 보장) 사용 — matplotlib 최신 버전의 `plt.arrow` 에서 나던 `hypot` TypeError 해소.

---

## 4. 빠른 전체 점검 스크립트

**반복문 필요 없음** — 1절의 이 한 줄이 이미 6앱을 전부 빌드한다(cmd·PowerShell·Git Bash 공통):

```cmd
npm run build --workspaces --if-present
```

앱마다 `[앱이름]` 라벨을 찍으며 돌리고 싶을 때만 반복문을 쓴다:

🪟 **cmd** (한 줄 붙여넣기 — `call` 필수: npm 은 `npm.cmd` 라 안 붙이면 첫 앱에서 멈춘다):

```cmd
for %a in (part1 part2 part3 part4 part5 portal) do @echo [%a] & call npm run build -w apps/%a/web
```

**PowerShell**:

```powershell
foreach ($a in 'part1','part2','part3','part4','part5','portal') {
  Write-Host "=== $a ===" -ForegroundColor Cyan
  npm run build -w "apps/$a/web"
}
```

각 앱 끝에 `built in ...` 이 뜨면 성공.

---

## 5. 문제 해결

- **카드/버튼에 색이 없다 (흰 네모)** — Tailwind `@source` 누락. 각 부 `web/src/style.css` 에
  `@source '../../../../packages/ui/src';` 줄이 있어야 한다. **이 실패는 `npm run build` 가 못 잡는다**(타입은 통과, 스타일만 누락) → 반드시 눈으로 확인.
- **`Cannot find module '@series/ui'`** — 루트에서 `npm install` 을 다시 실행(워크스페이스 링크 재생성).
- **`Failed to resolve ... .vue`** 또는 패키지 컴포넌트가 안 뜸 — 해당 앱 `vite.config.ts` 에
  `optimizeDeps: { exclude: [...] }` 가 있는지 확인 (part1~5=`['@series/ui', '@series/tutor']`, portal=`['@series/ui']`).
- **진도/복습이 새로고침 후 사라진다** — 각 부 `web/src/main.ts` 의 `app.provide(storagePrefixKey, '...')`
  와 `reviewApiKey` 주입이 있는지 확인. 접두사는 부마다 고정: part1=`la`, part2=`diff`, part3=`stat`, part4=`tf`, part5=`it`. **바꾸면 기존 진도가 끊긴다.**
- **타입 에러 `... is declared but never used`** — `noUnusedLocals` 규칙. 미사용 import/변수 제거.

---

## 부록: 현재 상태

- 구조: `apps/part1..6` + `apps/portal` + `packages/ui`(공용 컴포넌트 10종: MathBlock·ConceptCard·DetailsCard·ChartView·NotebookCard·ReviewFlag·PartLink·Quiz·StepQuiz·QuizSet + quizGroup 그룹계약 + injection) + `packages/tutor`(AI 튜터 Ollama 클라이언트).
- 결합해제 주입 계약: `storagePrefixKey`(QuizSet 접두사) · `reviewApiKey`(ReviewFlag) · `notebookResolverKey`(NotebookCard).
- 검증됨(빌드): 전 5부 + 포털 `vue-tsc + vite` 통과, Tailwind `@source` 로 패키지 클래스 생성 전 부 확인.
- 미검증(이 문서의 2절이 그 확인 절차): 런타임 동작(퀴즈·진도·복습·튜터).
- 커밋 되돌림 지점: `b3e3a00`(baseline) → `71c1aff`(trial) → `deaed16`(패키지 완성) → `b0ee776`(2~5부 전파).
