# Python 노트북 안내 (처음이어도 괜찮아요)

> ### ⭐ 먼저 알아둘 것: 노트북은 **선택**입니다
> 웹 사이트만으로 11개 챕터 전부 학습하고 완주(진도 100%)할 수 있어요.
> 노트북은 "배운 걸 진짜 컴퓨터 계산으로 한 번 더 만져보고 싶은 분"을 위한 덤입니다.
> 지금 부담되면 건너뛰고, 나중에 궁금해질 때 돌아와도 전혀 문제없습니다.
> (단, 마지막 🎓 캡스톤의 두 실험은 노트북에서 벌어지니 — 완주 기분을 제대로 내려면 그때만이라도!)

---

## 준비물: Python 설치 (딱 한 번만)

이미 Python이 있는지 먼저 확인해 보세요:

1. **터미널 열기** — 키보드에서 `윈도우 키`를 누르고 `powershell` 이라고 입력한 뒤 Enter.
   (검은/파란 글자 창이 뜨면 성공. 이 창에 아래 명령들을 한 줄씩 붙여넣고 Enter를 치면 됩니다.)
2. 창에 `python --version` 을 입력하고 Enter.
   - `Python 3.11.x` 처럼 버전이 나오면 → 설치돼 있는 것. 다음 단계로.
   - 오류가 나면 → https://www.python.org/downloads/ 에서 다운로드해 설치하세요.
     **설치 첫 화면에서 "Add python.exe to PATH" 체크박스를 꼭 체크**하고 Install을 누르면 됩니다.

## 실행: 명령 5줄 붙여넣기

터미널에서 아래를 **한 줄씩** 붙여넣고 Enter (첫 줄의 경로는 이 폴더 위치에 맞게):

```powershell
cd C:\STUDY\MATH_PLATFORM\apps\part5\notebooks   # ① 노트북 폴더로 이동
python -m venv .venv                        # ② 전용 작업 공간 만들기 (최초 1회만)
.venv\Scripts\Activate.ps1                  # ③ 작업 공간 켜기 (줄 앞에 (.venv)가 붙으면 성공)
pip install -r requirements.txt             # ④ 필요한 도구 설치 (최초 1회만, 몇 분 걸려요)
python -m ipykernel install --user --name infotheory-venv --display-name "Python (information-theory .venv)"   # ⑤ 커널 등록 (최초 1회만)
```

> 몰라도 되는 용어: ②의 `venv`는 "이 프로젝트만의 독립된 Python 방"입니다.
> 컴퓨터의 다른 프로그램과 섞이지 않게 해주는 안전장치 — 만들어 두기만 하면 됩니다.
> ⑤는 이 방을 노트북(Jupyter)에게 소개하는 절차예요.
> ③에서 "스크립트를 실행할 수 없습니다" 오류가 나면, 같은 창에
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` 를 입력하고 Y를 누른 뒤 ③을 다시 하세요.

마지막으로:

```powershell
jupyter lab
```

브라우저가 자동으로 열립니다 (안 열리면 터미널에 표시된 `http://localhost:8888/...` 주소를 브라우저에 붙여넣기).

> 노트북을 열었을 때 **"Kernel not found" 같은 선택 창**이 뜨면 당황하지 말고
> 목록에서 `Python (information-theory .venv)` 를 고르고 Select — ⑤에서 등록한 그 방입니다.

## 노트북 사용법: 버튼 하나면 됩니다

1. 왼쪽 파일 목록에서 노트북(예: `ch00_sample.ipynb`)을 더블클릭.
2. **맨 위 셀(회색 상자)을 클릭하고 `Shift + Enter`** — 그 셀이 실행되고 다음 셀로 넘어갑니다.
3. 이걸 **위에서 아래로 반복**하면 끝. 코드를 이해하지 못해도 괜찮아요 —
   설명은 셀 사이의 글에 있고, 코드는 "실행해서 결과를 눈으로 보는" 용도입니다.
4. 숫자를 바꿔보고 싶으면 셀 안의 숫자만 고치고 다시 `Shift + Enter`. 망가져도
   메뉴의 `Kernel → Restart Kernel and Run All Cells` 로 언제든 처음부터 다시 실행됩니다.
5. 노트북 끝의 **✏️ 직접 풀어보기(TODO)** 셀은 `answer` 를 여러분의 답으로 바꿔 실행 —
   맞으면 ✅, 틀리면 힌트가 나옵니다(웹 챕터의 문제와 짝).

## 🤖 AI 튜터 — 공부하다 막히면

각 노트북 맨 위에 **AI 튜터 셀**이 있습니다. 실행하면 웹앱처럼 화면 오른쪽 아래에
🤖 버튼이 떠 있고(스크롤해도 유지), 누르면 채팅창이 열립니다.
웹앱의 튜터와 **같은 AI**가 지금 보는 챕터를 알고 답해 줍니다.
(버튼 대신 셀 안에 바로 열고 싶으면 `chat('ch1', floating=False)`)

- **📖 코드 설명**: 채팅창의 드롭다운에서 실행했던 코드 셀을 고르고(기본: 방금 실행한 셀)
  "코드 설명" 버튼을 누르면 그 코드를 수포자 눈높이로 풀어 설명해 줍니다.
  버튼 없이 쓰려면 궁금한 셀을 실행한 다음 셀에서 `from tutor import explain` 후 `explain('ch3')`.
- 준비물: [Ollama](https://ollama.com) 실행 + 모델 1개 (`ollama pull gemma4:e2b`) — 웹앱 튜터와 준비물이 같아요.
- Ollama가 꺼져 있으면 채팅창에 켜는 방법이 안내됩니다. **튜터 없이도 학습에는 지장 없습니다.**
- 답변은 로컬 AI 라 가끔 틀릴 수 있어요 — 본문 설명이 우선!
- 채팅창 대신 "ipywidgets 가 … 없어요" 메시지가 나오면: 노트북 커널이 venv 가 아닌 다른 Python 을
  쓰고 있는 경우입니다. 새 셀에서 `%pip install ipywidgets` 실행 후 커널 재시작(Restart Kernel)이
  가장 쉽고, 메뉴 `Kernel → Change Kernel` 에서 venv 커널을 골라도 됩니다.

## 다음에 다시 열 때

②④⑤는 최초 1회용이므로, 다음부터는 세 줄이면 됩니다:

```powershell
cd C:\STUDY\MATH_PLATFORM\apps\part5\notebooks
.venv\Scripts\Activate.ps1
jupyter lab
```

## 노트북 목록 (웹 챕터와 1:1)

| 노트북 | 웹 챕터 | 내용 |
|--------|---------|------|
| `ch00_sample.ipynb` | 워밍업 | 스무고개 시뮬레이션 — 노트북 사용법 몸풀기 |
| `ch01_surprise.ipynb` | ch1 | 놀람 log₂(1/p) 계산·곡선·가산성 검증 |
| `ch02_compression.ipynb` | ch2 | 허프만 코드 구현·실제 문장 압축 |
| `ch03_entropy.ipynb` | ch3 | 엔트로피 함수·균등 최대 실험·텍스트 H |
| `ch04_cross_entropy.ipynb` | ch4 | 지도 요금표·무작위 1만 장 바닥 검증·CE vs MSE |
| `ch05_kl_divergence.ipynb` | ch5 | 비대칭 산점도·증류 미니 실험 |
| `ch06_learning_as_kl.ipynb` | ch6 | 경사하강 흉내내기·샘플만으로 분포 복원 |
| `ch07_perplexity.ipynb` | ch7 | 비트↔갈래 환산·PPL 하강 곡선·nat 단위 |
| `ch08_temperature.ipynb` | ch8 | H(T) 곡선·T별 100회 생성·top-p 가위 |
| `ch09_conditional_mutual.ipynb` | ch9 | 실제 텍스트에서 문맥의 가치 실측 |
| `ch10_capstone.ipynb` | ch10 | 🎓 MSE→CE 교체 + bigram 언어모델 (5부 대단원) |
