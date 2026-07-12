"""AI 튜터 — 웹앱 오른쪽 아래의 챗봇과 같은 튜터를 노트북 안에서 쓴다.

사용법 (노트북 셀에서):
    from tutor import chat
    chat('ch1')                          # 화면 오른쪽 아래에 🤖 버튼이 뜬다 (웹앱과 같은 UX)
    chat('ch1', floating=False)          # 셀 출력 안에 바로 열기

    from tutor import ask, explain
    ask('0.1이 왜 정확히 안 담겨요?', chapter='sample')  # 위젯 없이 한 번 묻고 답 받기
    explain('ch3')                        # 직전에 실행한 코드 셀을 튜터가 설명

- 로컬 Ollama(http://localhost:11434)를 쓰므로 API 키·비용·인터넷이 필요 없다.
- 챕터별 맥락은 웹앱과 같은 파일(web/src/data/tutorContext.json)을 읽는다 — 단일 소스.
- 웹앱의 @series/tutor(packages/tutor) · TutorChat.vue 와 로직을 맞춘 Python 이식판.
"""
from __future__ import annotations

import html as _html
import json
import re
import sys
import threading
import warnings
from pathlib import Path

import requests

OLLAMA_URL = 'http://localhost:11434'
DEFAULT_MODEL = 'gemma4:e2b'

# 주제 이탈 시 모델이 출력하는 신호. UI 가 감지해 안내 문구로 교체한다 (웹과 동일).
OFFTOPIC = '[OFFTOPIC]'

# 챕터 맥락 단일 소스 — 웹앱과 공유
_SHARED_JSON = Path(__file__).resolve().parents[1] / 'web' / 'src' / 'data' / 'tutorContext.json'

_NO_SERVER_TEXT = (
    '로컬 AI(Ollama)에 연결할 수 없어요.\n'
    '  1) Ollama 앱을 실행하세요 (또는 터미널에서: ollama serve)\n'
    '  2) 모델이 없다면: ollama pull gemma4:e2b\n'
    '준비되면 다시 시도하세요. (튜터 없이도 학습에는 지장 없습니다)'
)


def _shared() -> dict:
    """공용 JSON 로드. 저장소 밖으로 복사돼 파일이 없어도 튜터 자체는 동작하게 한다."""
    try:
        return json.loads(_SHARED_JSON.read_text(encoding='utf-8'))
    except (OSError, json.JSONDecodeError):
        return {
            'contexts': {},
            'curriculumIndex': '',
            'fallback': '[전체 과정 소개] 수포자를 위한 스케일링 법칙과 평가의 통계 10챕터 + 워밍업 과정(시리즈 10부, 평가·전략 트랙). '
                        "최종 목표는 '모델을 키우면 왜/얼마나 좋아지나'(멱법칙·Chinchilla)와 '그 점수 차이가 진짜인가'(신뢰구간·검정)를 스스로 계산해 AI 뉴스·리더보드를 숫자로 읽는 것. 핵심 한 줄: 성장은 로그-로그 위의 직선이고, 점수 차이는 오차범위 안에선 소음이다.",
        }


def context_for(slug: str | None) -> str:
    """슬러그에 맞는 챕터 맥락. 없으면 전체 과정 소개를 돌려준다."""
    data = _shared()
    if slug and slug in data['contexts']:
        return data['contexts'][slug]
    return data['fallback']


def chapter_title(slug: str | None) -> str:
    """맥락 문자열 머리의 [ ... ] 에서 챕터 이름을 뽑는다. 예: '1장 좌표와 벡터'."""
    m = re.match(r'\[(.+?)\]', context_for(slug))
    return m.group(1) if m else '전체 과정'


def system_prompt(slug: str | None) -> str:
    data = _shared()
    return (
        "너는 '수포자를 위한 스케일링 법칙과 평가의 통계' 학습 프로그램의 AI 튜터다. "
        '학습자는 중학교 수학까지만 기억하는 성인이며 수학에 공포가 있다.\n'
        '규칙: (1) 반드시 한국어 존댓말. (2) 새 용어·기호는 즉시 풀어서 설명. '
        '(3) 수식보다 비유·직관 먼저, LaTeX 대신 쉬운 일반 텍스트로. (4) 5문장 이내로 짧게. '
        '(5) 아래 챕터 맥락과 네 지식이 다르면 챕터 맥락을 우선. (6) 모르면 모른다고 말하기. '
        '(7) 학습자를 절대 무시하지 않고 격려하기.\n'
        "(8) 어떤 개념을 어디서 배우는지 물으면 아래 전체 목차에서 찾아 반드시 'N장' 형태로 "
        '안내하기. 목차에 없는 주제는 이 과정에 없다고 솔직히 말하기.\n'
        '가장 중요한 규칙: 너는 오직 수학·AI(스케일링 법칙·멱법칙·로그-로그·Chinchilla·컴퓨트 예산·벤치마크 평가·신뢰구간·오차범위·가설검정·p값·표본·오염 contamination·LLM 심판·창발·관련 수학·이 프로그램의 학습 내용·수학 학습 고민)와 '
        '간단한 인사에만 답한다. 연예·게임·요리·주식·코딩 대행·글쓰기 대행 등 학습과 무관한 '
        f'요청이면 다른 말 없이 정확히 {OFFTOPIC} 이라고만 출력하라.\n'
        f"{data['curriculumIndex']}\n"
        f'현재 학습자가 보고 있는 챕터 맥락:\n{context_for(slug)}'
    )


def list_models() -> list[str] | None:
    """서버가 떠 있는지 확인하고 채팅 가능한 모델 이름 목록을 돌려준다. 실패 시 None."""
    try:
        res = requests.get(f'{OLLAMA_URL}/api/tags', timeout=3)
        res.raise_for_status()
        models = res.json().get('models', [])
        # 임베딩 전용 모델(bge-m3 등)은 /api/chat 이 안 되므로 목록에서 뺀다
        return [m['name'] for m in models if 'completion' in m.get('capabilities', ['completion'])]
    except requests.RequestException:
        return None


def stream_chat(model: str, messages: list[dict], stop: threading.Event | None = None):
    """스트리밍 채팅. 토큰 조각(delta)을 순서대로 내는 제너레이터. stop 이벤트로 중단."""
    body = {
        'model': model,
        'messages': messages,
        'stream': True,
        'think': False,  # thinking 모델은 꺼야 함 — 안 끄면 생각만 하다 토큰 소진
        'keep_alive': '15m',  # 대화 중 모델이 메모리에서 내려가 재로딩되는 것 방지
        'options': {'temperature': 0.3, 'num_predict': 600},
    }
    with requests.post(f'{OLLAMA_URL}/api/chat', json=body, stream=True, timeout=(3, 120)) as res:
        res.raise_for_status()
        for line in res.iter_lines():  # NDJSON: 한 줄에 JSON 하나
            if stop is not None and stop.is_set():
                return
            if not line:
                continue
            chunk = json.loads(line.decode('utf-8'))
            delta = chunk.get('message', {}).get('content')
            if delta:
                yield delta
            if chunk.get('done'):
                return


def _strip_offtopic(raw: str) -> tuple[str, bool]:
    """스트림에서 [OFFTOPIC] 신호를 걷어낸다. 반환: (표시용 텍스트, 신호 감지 여부).

    로컬 모델이 규칙을 어기고 답변 끝·중간에 [OFFTOPIC] 을 섞어도 화면엔 안 보이게 한다.
    완성된 마커는 제거하고, 끝에 걸친 부분 마커(스트리밍 중)는 잠시 감춰 깜빡임을 막는다.
    """
    seen = OFFTOPIC in raw
    text = raw.replace(OFFTOPIC, '')
    for k in range(len(OFFTOPIC) - 1, 0, -1):
        if text.endswith(OFFTOPIC[:k]):
            text = text[:-k]
            break
    return text.lstrip(), seen


def _stream_answer(model, messages, on_text, stop=None) -> bool:
    """스트리밍하며 on_text(지금까지의 전체 표시 텍스트)를 반복 호출. 순수 주제이탈이면 True.

    [OFFTOPIC] 신호는 위치와 상관없이 걷어내고, 신호만 오고 실제 내용이 없을 때만 주제이탈로 본다.
    """
    raw = ''
    for delta in stream_chat(model, messages, stop=stop):
        raw += delta
        text, seen = _strip_offtopic(raw)
        if seen and text.strip() == '':
            return True  # 신호만 왔고 실제 내용 없음 → 순수 주제이탈
        on_text(text)
    on_text(_strip_offtopic(raw)[0])  # 끝에 걸친 부분 마커 정리 후 최종 표시
    return False


def _fmt(text: str) -> str:
    """모델이 규칙을 어기고 $...$ LaTeX 나 **굵게** 를 섞을 때 걷어낸다 (웹과 동일)."""
    text = re.sub(r'\$([^$\n]+)\$', r'\1', text)
    return re.sub(r'\*\*([^*\n]+)\*\*', r'\1', text)


def _print_stream(question: str, chapter: str | None, model: str | None) -> None:
    """질문 하나를 보내고 답을 print 로 스트리밍한다 (ask/explain 공용)."""
    models = list_models()
    if models is None:
        print(_NO_SERVER_TEXT)
        return
    if not models:
        print('채팅 가능한 모델이 없어요. 터미널에서: ollama pull gemma4:e2b')
        return
    use = model or (DEFAULT_MODEL if DEFAULT_MODEL in models else models[0])
    messages = [
        {'role': 'system', 'content': system_prompt(chapter)},
        {'role': 'user', 'content': question},
    ]
    # on_text 는 (원문 raw 가 아니라) 신호를 걷어낸 '누적 표시 텍스트'를 받는다.
    # 보통은 앞부분이 그대로 이어지므로 새로 늘어난 부분만 출력한다.
    printed = ''

    def on_text(text: str) -> None:
        nonlocal printed
        if text.startswith(printed):
            sys.stdout.write(text[len(printed):])
            sys.stdout.flush()
            printed = text
        elif text != printed:  # 드물게 앞부분이 바뀌면 줄을 새로 시작해 전체를 다시 표시
            sys.stdout.write('\n' + text)
            sys.stdout.flush()
            printed = text

    try:
        offtopic = _stream_answer(use, messages, on_text)
    except requests.RequestException:
        print('\n(⚠️ 연결이 끊겼어요. Ollama 가 실행 중인지 확인해 주세요.)')
        return
    except Exception as e:  # 응답 파싱 등 예상 밖 오류도 친절하게
        print(f'\n(⚠️ 답변 처리 중 오류: {type(e).__name__} — 다시 시도해 보세요.)')
        return
    if offtopic:
        print(f'저는 수학·AI 공부를 돕는 튜터라 그 주제는 도와드릴 수 없어요 😊\n'
              f'대신 「{chapter_title(chapter)}」 내용은 무엇이든 물어보세요!')
    elif not printed:
        print('(답변을 생성하지 못했어요 — 다시 시도해 보세요.)')
    else:
        print()


def ask(question: str, chapter: str | None = None, model: str | None = None) -> None:
    """위젯 없이 한 번 묻고 답을 셀 출력으로 스트리밍한다."""
    _print_stream(question, chapter, model)


# ── 코드 설명 ──────────────────────────────────────────────────────────────

# 튜터 자신을 부르는 셀(chat/ask/explain)은 설명 대상에서 제외하기 위한 패턴
_TUTOR_CALL = re.compile(r'\s*(tutor\s*\.\s*)?(chat|ask|explain)\s*\(')


def _executed_cells() -> list[str]:
    """이 커널에서 지금까지 실행된 코드 셀 소스 목록(오래된 순).

    IPython 이 실행 이력을 In 리스트로 보관하는 것을 이용한다.
    튜터 호출 셀·매직/셸 명령 셀·재실행 중복은 걸러낸다.
    """
    try:
        from IPython import get_ipython
        ip = get_ipython()
        if ip is None:
            return []
        hm = getattr(ip, 'history_manager', None)
        hist = list(getattr(hm, 'input_hist_parsed', None) or ip.user_ns.get('In', []))
    except Exception:
        return []
    seen: set[str] = set()
    out: list[str] = []
    for src in hist:
        if not isinstance(src, str):
            continue
        s = src.strip()
        if not s or s.startswith('%') or s.startswith('!'):
            continue
        if 'from tutor import' in s or 'import tutor' in s or _TUTOR_CALL.match(s):
            continue
        if s in seen:
            continue
        seen.add(s)
        out.append(s)
    return out


def _explain_question(code: str) -> str:
    """코드 설명 요청 프롬프트 (채팅창 버튼과 explain() 이 공용)."""
    return (
        '아래는 이 학습 프로그램의 노트북에서 학습자가 방금 실행한 파이썬 실습 코드야. '
        '학습 내용이니 꼭 답해줘. 무엇을 하는 코드인지 수포자 눈높이로 설명해줘 — '
        '전체 목적 한 문장, 핵심이 되는 줄 2~4개를 골라 각각 쉬운 한 문장, '
        '마지막에 이 챕터 개념과의 연결 한 문장. 코드 원문을 다시 출력하지는 마.\n'
        f'```python\n{code}\n```'
    )


def explain(chapter: str | None = None, model: str | None = None,
            code: str | None = None) -> None:
    """직전에 실행한 코드 셀(또는 code 로 준 코드)을 튜터가 설명한다.

    사용: 궁금한 코드 셀을 실행한 '다음' 셀에서
        from tutor import explain
        explain('ch3')
    """
    if code is None:
        cells = _executed_cells()
        if not cells:
            print('설명할 코드가 없어요 — 궁금한 코드 셀을 먼저 실행한 뒤 다시 불러 주세요.')
            return
        code = cells[-1]
    _print_stream(_explain_question(code), chapter, model)


# ── 채팅 위젯 ──────────────────────────────────────────────────────────────

_BUBBLE = ('max-width:85%;padding:8px 12px;border-radius:14px;font-size:14px;'
           'line-height:1.6;white-space:pre-wrap;word-break:break-word;')
_EMPTY_HTML = (
    '<div style="color:#64748b;font-size:13px;line-height:1.7;padding:4px 2px;">'
    '공부하다 막히면 무엇이든 물어보세요. 이 노트북의 챕터를 알고 답해 드려요.</div>'
)

# 첫 화면의 추천 질문 — 웹(TutorChat.vue)과 동일. 클릭하면 그대로 전송된다.
_SUGGESTIONS = [
    '방금 나온 개념을 더 쉬운 비유로 설명해 주세요',
    '0.1이 컴퓨터에 정확히 안 담기는 이유가 뭐예요?',
    'fp16이랑 bf16은 뭐가 달라요?',
    '양자화가 몇 장에 나오는지 까먹었어요',
]

# 플로팅 모드용 스타일 + 위젯을 document.body 로 옮기는 스크립트.
# - CSS 만으로도 화면 오른쪽 아래에 고정되지만(스크립트 미실행 환경 대비),
#   JupyterLab 4 는 화면 밖 셀을 DOM 에서 떼어내므로(가상 스크롤) 스크립트가
#   위젯과 스타일을 body/head 로 옮겨 어디를 스크롤해도 유지되게 한다.
# - 재실행하거나 다른 노트북에서 또 띄우면 이전 것을 지워 항상 하나만 남긴다.
_FLOAT_HTML = """
<style id="tutor-float-css">
.tutor-float-root {
  position: fixed;
  bottom: 18px;
  right: 18px;
  z-index: 10000;
  align-items: flex-end;
}
.tutor-float-panel {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.25);
  max-width: calc(100vw - 44px);
  margin-bottom: 10px !important;
}
button.tutor-fab, .tutor-fab button {
  width: 54px !important;
  height: 54px !important;
  border-radius: 50% !important;
  font-size: 22px;
  background: #4f46e5;
  color: #fff;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.3);
}
button.tutor-suggest, .tutor-suggest button {
  background: #fff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px !important;
  color: #475569 !important;
  font-size: 12px !important;
  text-align: left !important;
  height: auto !important;
  white-space: normal !important;
  line-height: 1.5 !important;
  padding: 6px 10px !important;
  margin: 2px 0 !important;
}
button.tutor-suggest:hover, .tutor-suggest button:hover {
  background: #f8fafc !important;
}
</style>
<script>
(function () {
  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    var fresh = document.querySelectorAll('.tutor-float-root:not([data-tutor-floated])');
    if (fresh.length > 0) {
      // 이미 떠 있는 이전 튜터(셀 재실행·다른 노트북)는 제거 — 마지막 하나만 유지
      document.querySelectorAll('.tutor-float-root[data-tutor-floated]').forEach(function (el) {
        el.remove();
      });
      var el = fresh[fresh.length - 1];
      el.setAttribute('data-tutor-floated', '1');
      document.body.appendChild(el);
      // 스타일은 head 로 — 원래 셀이 화면 밖으로 가상화돼도 CSS 가 살아있게
      var styles = document.querySelectorAll('style#tutor-float-css');
      if (styles.length > 0) {
        var keep = styles[styles.length - 1];
        styles.forEach(function (s) { if (s !== keep) { s.remove(); } });
        document.head.appendChild(keep);
      }
      clearInterval(timer);
    } else if (tries > 100) {
      clearInterval(timer);  // 위젯이 렌더되지 않는 환경(nbconvert 등)에서는 조용히 포기
    }
  }, 100);
})();
</script>
"""


def chat(chapter: str | None = None, model: str | None = None, floating: bool = True) -> None:
    """AI 튜터 채팅창을 띄운다. chapter: 'ch1'~'ch11' 또는 'sample'.

    floating=True(기본)면 웹앱처럼 화면 오른쪽 아래에 🤖 버튼으로 떠 있고
    (클릭으로 열고 닫기, 스크롤해도 유지), False 면 셀 출력 안에 바로 열린다.
    """
    try:
        import ipywidgets as W
        from IPython.display import HTML, display
    except ImportError:
        # 흔한 원인: venv 에는 설치했지만 노트북 커널이 다른 Python 을 쓰는 경우.
        # 커널이 실제로 쓰는 인터프리터를 보여주고, 그 커널에 설치하는 명령을 안내한다.
        print('채팅창에 필요한 ipywidgets 가 지금 노트북 커널에 없어요.')
        print(f'지금 커널의 Python: {sys.executable}')
        print('가장 쉬운 해결: 새 셀에서  %pip install ipywidgets  실행 후 커널 재시작(Restart Kernel).')
        print('또는 Jupyter 메뉴 Kernel → Change Kernel 에서 공용 커널(Python (MATH_PLATFORM))을 선택하세요.')
        print("위젯 없이 쓰려면: from tutor import ask 후 ask('질문', chapter='ch1')")
        return

    title = chapter_title(chapter)
    msgs: list[dict] = []  # {'role': 'user'|'assistant', 'content': str}
    busy = threading.Event()
    stop = threading.Event()
    ok = {'server': False}

    header = W.HTML(
        f'<b>🤖 AI 튜터</b> &nbsp;<span style="color:#64748b;font-size:12px;">'
        f'지금 보는 내용: {_html.escape(title)}</span>'
    )
    model_dd = W.Dropdown(options=[], layout=W.Layout(width='170px'))
    body = W.HTML(_EMPTY_HTML)
    hint = W.HTML()
    btn_retry = W.Button(description='다시 연결', button_style='primary',
                         layout=W.Layout(flex='0 0 auto', width='auto', display='none'))
    # 입력창은 남는 폭을 전부 차지(flex 1 1 0), 버튼들은 절대 줄어들지 않게(flex 0 0 auto)
    # — 그러지 않으면 행이 좁을 때 flexbox 가 버튼을 찌그러뜨려 글자가 잘린다
    box_in = W.Text(placeholder='질문을 입력하세요…', layout=W.Layout(flex='1 1 0', width='auto'))
    btn_send = W.Button(description='전송', button_style='primary',
                        layout=W.Layout(flex='0 0 auto', width='auto'))
    btn_stop = W.Button(description='중지', button_style='danger',
                        layout=W.Layout(flex='0 0 auto', width='auto'))
    btn_clear = W.Button(description='지우기', layout=W.Layout(flex='0 0 auto', width='auto'))

    # 첫 화면 추천 질문 — 웹과 동일하게 한 줄에 하나씩, 클릭하면 바로 전송
    sugg_buttons = []
    for s in _SUGGESTIONS:
        b = W.Button(description=f'💬 {s}', layout=W.Layout(width='100%'))
        b.add_class('tutor-suggest')
        sugg_buttons.append(b)
    suggest_box = W.VBox(sugg_buttons)

    # 코드 설명 줄 — 실행한 셀 목록에서 골라(기본: 방금 실행한 셀) 튜터에게 설명 요청
    cell_dd = W.Dropdown(options=[], layout=W.Layout(flex='1 1 0', width='auto'))
    btn_cells = W.Button(description='↻', tooltip='실행한 셀 목록 새로고침',
                         layout=W.Layout(flex='0 0 auto', width='auto'))
    btn_explain = W.Button(description='📖 코드 설명',
                           layout=W.Layout(flex='0 0 auto', width='auto'))

    def render() -> None:
        if not msgs:
            body.value = _EMPTY_HTML
            suggest_box.layout.display = ''
            return
        suggest_box.layout.display = 'none'
        rows = []
        for i, m in enumerate(msgs):
            user = m['role'] == 'user'
            # 코드 설명 요청은 전체 프롬프트 대신 짧은 표시용 문구(display)로 보여준다
            text = (m.get('display') or m['content']) if user else _fmt(m['content'])
            cursor = '▍' if busy.is_set() and i == len(msgs) - 1 and not user else ''
            side = ('align-self:flex-end;background:#4f46e5;color:#fff;' if user
                    else 'align-self:flex-start;background:#f1f5f9;color:#1e293b;')
            rows.append(f'<div style="{_BUBBLE}{side}">{_html.escape(text)}{cursor}</div>')
        # column-reverse: 최신 메시지가 DOM 앞 → 스크롤이 항상 아래(최신)에 붙는다
        body.value = ('<div style="display:flex;flex-direction:column-reverse;gap:8px;'
                      'max-height:340px;overflow-y:auto;padding:6px 2px;">'
                      + ''.join(reversed(rows)) + '</div>')

    def set_controls() -> None:
        streaming = busy.is_set()
        box_in.disabled = streaming or not ok['server']
        btn_send.disabled = streaming or not ok['server']
        btn_stop.disabled = not streaming
        btn_clear.disabled = streaming
        cell_dd.disabled = streaming
        btn_cells.disabled = streaming
        btn_explain.disabled = streaming or not ok['server']
        for b in sugg_buttons:
            b.disabled = streaming or not ok['server']

    def refresh_cells(_=None) -> None:
        """실행 이력에서 코드 셀 목록을 다시 읽어 드롭다운을 채운다 (최근 실행이 맨 위)."""
        opts = []
        for i, src in enumerate(_executed_cells(), start=1):
            first = src.splitlines()[0].strip()
            label = f'{i}. {first[:34]}' + ('…' if len(first) > 34 else '')
            opts.append((label, src))
        opts.reverse()
        if not opts:
            opts = [('(코드 셀을 실행한 뒤 ↻ 를 누르세요)', '')]
        cell_dd.options = opts
        set_controls()

    def render_hint() -> None:
        if not ok['server']:
            hint.value = ('<div style="font-size:13px;color:#334155;line-height:1.7;">'
                          '<b>로컬 AI(Ollama)에 연결할 수 없어요.</b><br>'
                          '1) Ollama 앱을 실행하세요 (또는 터미널에서 <code>ollama serve</code>)<br>'
                          '2) 모델이 없다면: <code>ollama pull gemma4:e2b</code></div>')
            btn_retry.layout.display = ''
        else:
            hint.value = ('<span style="color:#94a3b8;font-size:11px;">'
                          '로컬 AI 답변 — 가끔 틀릴 수 있어요. 본문 설명이 우선!</span>')
            btn_retry.layout.display = 'none'

    def connect(_=None) -> None:
        found = list_models()
        ok['server'] = bool(found)
        if found:
            model_dd.options = found
            want = model or DEFAULT_MODEL
            model_dd.value = want if want in found else found[0]
        set_controls()
        render_hint()

    def worker() -> None:
        # 최근 3왕복만 유지해 경량 모델의 컨텍스트를 아낀다 (웹과 동일)
        history = [{'role': m['role'], 'content': m['content']} for m in msgs[:-1]][-7:]
        payload = [{'role': 'system', 'content': system_prompt(chapter)}, *history]
        last = msgs[-1]

        def on_text(text: str) -> None:
            last['content'] = text
            render()

        try:
            offtopic = _stream_answer(model_dd.value or DEFAULT_MODEL, payload, on_text, stop=stop)
            if offtopic:
                last['content'] = ('저는 수학·AI 공부를 돕는 튜터라 그 주제는 도와드릴 수 없어요 😊\n'
                                   f'대신 지금 보고 있는 「{title}」 내용은 무엇이든 물어보세요!')
            elif not last['content']:
                last['content'] = '(답변을 생성하지 못했어요 — 다시 시도해 보세요.)'
        except requests.RequestException:
            last['content'] += '\n\n(⚠️ 연결이 끊겼어요. Ollama 가 실행 중인지 확인해 주세요.)'
            ok['server'] = False
            render_hint()
        except Exception as e:  # 응답 파싱 등 예상 밖 오류에 스레드가 조용히 죽지 않게
            last['content'] += f'\n\n(⚠️ 답변 처리 중 오류: {type(e).__name__} — 다시 시도해 보세요.)'
        finally:
            busy.clear()
            set_controls()
            render()

    def do_send(_=None) -> None:
        q = box_in.value.strip()
        if not q or busy.is_set() or not ok['server']:
            return
        box_in.value = ''
        msgs.append({'role': 'user', 'content': q})
        msgs.append({'role': 'assistant', 'content': ''})
        busy.set()
        stop.clear()
        set_controls()
        render()
        threading.Thread(target=worker, daemon=True).start()

    def do_explain(_=None) -> None:
        if busy.is_set() or not ok['server']:
            return
        code = cell_dd.value
        if not code:
            refresh_cells()  # 방금 실행한 셀이 있으면 여기서 잡힌다
            code = cell_dd.value
        if not code:
            msgs.append({'role': 'assistant', 'content':
                         '설명할 코드가 아직 없어요 — 저는 지금 커널 세션에서 실행한 셀만 볼 수 '
                         '있어요.\n궁금한 코드 셀을 Shift+Enter 로 실행한 뒤, ↻ 를 누르고 '
                         '목록에서 골라 주세요.'})
            render()
            return
        code = str(code)
        first = code.strip().splitlines()[0]
        # content 에는 코드 전체가 들어가 후속 질문("두 번째 줄이 왜 그래요?")에도 맥락이 남는다
        msgs.append({'role': 'user', 'content': _explain_question(code),
                     'display': f'📖 코드 설명: {first[:40]}'})
        msgs.append({'role': 'assistant', 'content': ''})
        busy.set()
        stop.clear()
        set_controls()
        render()
        threading.Thread(target=worker, daemon=True).start()

    def do_stop(_=None) -> None:
        stop.set()

    def do_clear(_=None) -> None:
        if not busy.is_set():
            msgs.clear()
            render()

    def suggest(text: str):
        def _click(_=None) -> None:
            box_in.value = text
            do_send()
        return _click

    for b, s in zip(sugg_buttons, _SUGGESTIONS):
        b.on_click(suggest(s))
    btn_send.on_click(do_send)
    btn_stop.on_click(do_stop)
    btn_clear.on_click(do_clear)
    btn_retry.on_click(connect)
    btn_cells.on_click(refresh_cells)
    btn_explain.on_click(do_explain)
    try:  # Enter 로 전송 (ipywidgets 8 에서 deprecated 지만 동작 — 경고만 숨김)
        with warnings.catch_warnings():
            warnings.simplefilter('ignore', DeprecationWarning)
            box_in.on_submit(do_send)
    except AttributeError:
        pass  # 미래 버전에서 제거되면 전송 버튼만 사용

    connect()
    refresh_cells()
    panel = W.VBox(
        [W.HBox([header, model_dd], layout=W.Layout(justify_content='space-between')),
         body,
         suggest_box,
         W.HBox([cell_dd, btn_cells, btn_explain]),
         W.HBox([hint, btn_retry], layout=W.Layout(align_items='center', gap='8px')),
         W.HBox([box_in, btn_send, btn_stop, btn_clear], layout=W.Layout(gap='4px'))],
        layout=W.Layout(border='1px solid #e2e8f0', padding='10px',
                        width='400px' if floating else None, max_width='620px'),
    )
    if not floating:
        display(panel)
        return

    # 플로팅 모드 — 웹앱과 동일하게 닫힌 채 시작, 🤖 버튼으로 열고 닫는다
    panel.add_class('tutor-float-panel')
    panel.layout.display = 'none'
    fab = W.Button(description='🤖', tooltip='AI 튜터 열기/닫기')
    fab.add_class('tutor-fab')

    def toggle(_=None) -> None:
        opened = panel.layout.display == 'none'
        if opened:
            refresh_cells()  # 열 때마다 실행한 셀 목록을 최신으로
        panel.layout.display = 'flex' if opened else 'none'
        fab.description = '✕' if opened else '🤖'

    fab.on_click(toggle)
    root = W.VBox([panel, fab], layout=W.Layout(align_items='flex-end', gap='10px'))
    root.add_class('tutor-float-root')
    display(root)
    display(HTML(_FLOAT_HTML))
