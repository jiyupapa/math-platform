# scripts/build-pitch-deck.py
# 해커톤 발표 덱 생성 — docs/hackathon/11_pitch_deck.pptx (10장, 16:9)
# 구성 정본: docs/hackathon/11_pitch_deck.md · 임베드 자산: docs/hackathon/assets/*.png
#   (자산 재생성은 scripts/shoot-deck-assets.mjs — 실물 스크린샷)
#
# 사용법:
#   1) python-pptx 설치 (공용 venv 오염 방지 — 임시 폴더에 --target 설치 권장)
#      .venv\Scripts\python.exe -m pip install --target <임시폴더> python-pptx
#   2) PYTHONPATH=<임시폴더> .venv\Scripts\python.exe scripts/build-pitch-deck.py
from pathlib import Path

from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'docs' / 'hackathon' / 'assets'
OUT = ROOT / 'docs' / 'hackathon' / '11_pitch_deck.pptx'

# ── 디자인 토큰 ──────────────────────────────────────────────────────────────
FONT = '맑은 고딕'
INK = RGBColor.from_string('0F172A')      # slate-900
BODY = RGBColor.from_string('334155')     # slate-700
MUTED = RGBColor.from_string('64748B')    # slate-500
LINE = RGBColor.from_string('E2E8F0')     # slate-200
PANEL = RGBColor.from_string('F8FAFC')    # slate-50
WHITE = RGBColor.from_string('FFFFFF')
INDIGO = RGBColor.from_string('4F46E5')   # indigo-600 (제품 UI와 동일 계열)
INDIGO_SOFT = RGBColor.from_string('EEF2FF')  # indigo-50
INDIGO_INKY = RGBColor.from_string('312E81')  # indigo-900
RED = RGBColor.from_string('DC2626')
GREEN = RGBColor.from_string('059669')
AMBER = RGBColor.from_string('D97706')
NAVY = RGBColor.from_string('0F172A')

SW, SH = Inches(13.333), Inches(7.5)


def kfont(run, name=FONT):
    """라틴·한글(ea)·복합(cs) 모두 같은 글꼴로 — 한글이 테마 기본체로 빠지는 것 방지."""
    run.font.name = name
    rPr = run._r.get_or_add_rPr()
    for tag in ('a:latin', 'a:ea', 'a:cs'):
        e = rPr.find(qn(tag))
        if e is None:
            e = rPr.makeelement(qn(tag), {})
            rPr.append(e)
        e.set('typeface', name)


def para(tf, runs, size=13, color=BODY, bold=False, align=PP_ALIGN.LEFT,
         space_before=0, space_after=0, line=None, first=False):
    """단락 추가. runs 는 문자열 하나 또는 [(텍스트, {size,color,bold}) ...]."""
    p = tf.paragraphs[0] if first and not tf.paragraphs[0].runs else tf.add_paragraph()
    p.alignment = align
    if space_before:
        p.space_before = Pt(space_before)
    if space_after:
        p.space_after = Pt(space_after)
    if line:
        p.line_spacing = line
    if isinstance(runs, str):
        runs = [(runs, {})]
    for text, st in runs:
        r = p.add_run()
        r.text = text
        r.font.size = Pt(st.get('size', size))
        r.font.bold = st.get('bold', bold)
        r.font.color.rgb = st.get('color', color)
        kfont(r)
    return p


def box(slide, x, y, w, h):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    return tf


def card(slide, x, y, w, h, fill=WHITE, line_c=LINE, radius=0.055, shadow=False):
    sp = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h)
    try:
        sp.adjustments[0] = radius
    except Exception:
        pass
    sp.fill.solid()
    sp.fill.fore_color.rgb = fill
    if line_c is None:
        sp.line.fill.background()
    else:
        sp.line.color.rgb = line_c
        sp.line.width = Pt(1)
    sp.shadow.inherit = shadow
    tf = sp.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = Inches(0.16)
    tf.margin_top = tf.margin_bottom = Inches(0.10)
    tf.vertical_anchor = MSO_ANCHOR.TOP
    return sp


def rect(slide, x, y, w, h, fill, line_c=None):
    sp = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    sp.fill.solid()
    sp.fill.fore_color.rgb = fill
    if line_c is None:
        sp.line.fill.background()
    else:
        sp.line.color.rgb = line_c
        sp.line.width = Pt(1)
    sp.shadow.inherit = False
    return sp


def arrow(slide, x, y, w, h, fill=INDIGO):
    sp = slide.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, x, y, w, h)
    sp.fill.solid()
    sp.fill.fore_color.rgb = fill
    sp.line.fill.background()
    sp.shadow.inherit = False
    return sp


def pic_fit(slide, path, x, y, w, h, border=LINE):
    """박스(x,y,w,h) 안에 비율 유지로 맞춰 넣고 가운데 정렬(레터박스)."""
    iw, ih = Image.open(path).size
    scale = min(w / iw, h / ih)
    pw, ph = int(iw * scale), int(ih * scale)
    px = int(x + (w - pw) / 2)
    py = int(y + (h - ph) / 2)
    pic = slide.shapes.add_picture(str(path), px, py, pw, ph)
    if border is not None:
        pic.line.color.rgb = border
        pic.line.width = Pt(1)
    pic.shadow.inherit = False
    return pic


def notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text


prs = Presentation()
prs.slide_width = SW
prs.slide_height = SH
BLANK = prs.slide_layouts[6]
TOTAL = 10


def new_slide():
    return prs.slides.add_slide(BLANK)


def chrome(slide, no, kicker, title):
    """콘텐츠 슬라이드 공통 상단(키커·제목·밑줄)과 하단(쪽번호·푸터)."""
    rect(slide, 0, 0, SW, SH, WHITE)
    tf = box(slide, Inches(0.9), Inches(0.42), Inches(11.5), Inches(0.3))
    para(tf, kicker, size=13, color=INDIGO, bold=True, first=True)
    tf = box(slide, Inches(0.9), Inches(0.74), Inches(11.5), Inches(0.62))
    para(tf, title, size=27, color=INK, bold=True, first=True)
    rect(slide, Inches(0.92), Inches(1.42), Inches(0.55), Pt(3.2), INDIGO)
    tf = box(slide, Inches(0.9), Inches(7.08), Inches(6), Inches(0.3))
    para(tf, '수포자 사관학교 — AI 를 가르치는 AI 강사', size=9.5, color=MUTED, first=True)
    tf = box(slide, Inches(11.9), Inches(7.08), Inches(0.55), Inches(0.3))
    para(tf, f'{no} / {TOTAL}', size=10, color=MUTED, align=PP_ALIGN.RIGHT, first=True)


# ═════════════════════════════ ① 타이틀 ═════════════════════════════
s = new_slide()
rect(s, 0, 0, SW, SH, NAVY)
tf = box(s, Inches(0.95), Inches(1.55), Inches(5.4), Inches(4.6))
para(tf, '사내 AI 리터러시 플랫폼', size=14, color=RGBColor.from_string('A5B4FC'), bold=True, first=True)
para(tf, '수포자 사관학교', size=47, color=WHITE, bold=True, space_before=10)
para(tf, 'AI 를 가르치는 AI 강사', size=21, color=RGBColor.from_string('C7D2FE'), bold=True, space_before=6)
para(tf, '"수학을 포기했던 직원도, ChatGPT 의 내부까지."', size=14.5,
     color=RGBColor.from_string('E2E8F0'), space_before=22, line=1.25)
para(tf, '진단 5분 → 개인 경로 → 10부작 교실 + 로컬 AI 튜터', size=13,
     color=RGBColor.from_string('94A3B8'), space_before=10)
tf = box(s, Inches(0.95), Inches(6.55), Inches(5.6), Inches(0.4))
para(tf, '10부작 106챕터  ·  완전 로컬 ₩0  ·  브라우저만으로', size=12,
     color=RGBColor.from_string('818CF8'), bold=True, first=True)
pic_fit(s, ASSETS / 'home_hero.png', Inches(6.75), Inches(1.35), Inches(5.9), Inches(4.8),
        border=RGBColor.from_string('334155'))
tf = box(s, Inches(6.75), Inches(6.2), Inches(5.9), Inches(0.35))
para(tf, '실제 화면 — 진단 후 개인화된 포털 홈', size=10.5, color=RGBColor.from_string('64748B'),
     align=PP_ALIGN.CENTER, first=True)
notes(s, '발표 운영: 전체 5분이면 슬라이드 ④·⑤는 슬라이드 대신 실물 시연으로 대체하고 나머지 8장을 빠르게 넘긴다. '
         '오프닝 한 문장 — "AI 를 매일 쓰는 회사에서, 원리를 아는 사람을 길러내는 AI 강사를 만들었습니다."')

# ═════════════════════════════ ② 문제 ═════════════════════════════
s = new_slide()
chrome(s, 2, '문제', '전 직원이 AI 를 쓰는데, 원리를 아는 사람은?')
tf = box(s, Inches(0.9), Inches(1.75), Inches(5.7), Inches(3.4))
para(tf, [('직원 대부분이 매일 AI 를 씁니다.', {'bold': True, 'color': INK})], size=15, first=True, line=1.3)
para(tf, '그러나 내부 원리를 아는 사람은 극소수 — 격차의 원인은 수학입니다.',
     size=15, space_before=4, line=1.3)
para(tf, '프롬프트를 잘 쓰는 것과 도구를 이해하는 것은 다릅니다. 이해가 있어야 한계·보안·활용을 판단할 수 있습니다.',
     size=13, color=MUTED, space_before=14, line=1.35)
c = card(s, Inches(0.9), Inches(4.6), Inches(5.7), Inches(1.95), fill=INDIGO_SOFT, line_c=None)
tf = c.text_frame
para(tf, '그래서 "강의"가 아니라 "강사"가 필요합니다', size=14, color=INDIGO_INKY, bold=True, first=True)
para(tf, '출발점이 전부 다른 성인 학습자에겐, 같은 진도를 트는 동영상이 아니라 각자의 출발점을 진단하고 경로를 짜 주는 존재가 필요합니다.',
     size=12.5, color=INDIGO_INKY, space_before=6, line=1.3)

tf = box(s, Inches(7.1), Inches(1.75), Inches(5.3), Inches(0.35))
para(tf, '기존 수학 강의가 실패하는 방식', size=13.5, color=INK, bold=True, first=True)
steps = ['1부\n선형대수', '2부\n미분', '3부\n확률']
BW, STEP = 1.15, 1.39  # 상자 폭 · 간격(상자+화살표) — 겹침 없이 ✕까지 한 줄
for i, t in enumerate(steps):
    cx = Inches(7.1 + i * STEP)
    c = card(s, cx, Inches(2.3), Inches(BW), Inches(0.95), fill=PANEL)
    tf = c.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    for j, ln in enumerate(t.split('\n')):
        para(tf, ln, size=12 if j else 11.5, color=BODY, bold=bool(j), align=PP_ALIGN.CENTER, first=(j == 0))
    arrow(s, Inches(7.1 + i * STEP + BW + 0.03), Inches(2.63), Inches(0.18), Inches(0.28), fill=LINE)
c = card(s, Inches(11.32), Inches(2.3), Inches(1.10), Inches(0.95), fill=RGBColor.from_string('FEF2F2'), line_c=None)
tf = c.text_frame
tf.vertical_anchor = MSO_ANCHOR.MIDDLE
para(tf, '✕ 이탈', size=13, color=RED, bold=True, align=PP_ALIGN.CENTER, first=True)
tf = box(s, Inches(7.1), Inches(3.45), Inches(5.3), Inches(1.0))
para(tf, '순서대로 수학만 하다가, 정작 AI 를 만나기 전에 지칩니다.', size=12.5, color=BODY, first=True, line=1.3)
c = card(s, Inches(7.1), Inches(4.6), Inches(5.32), Inches(1.95), fill=WHITE)
tf = c.text_frame
para(tf, '이 플랫폼의 답 — 비선형 경로', size=13, color=INDIGO, bold=True, first=True)
para(tf, '트랜스포머(4부)를 가장 빨리 만나도록 경로를 재배열하고, 필요한 수학만 그 직전에 배웁니다.',
     size=12.5, color=BODY, space_before=6, line=1.3)
para(tf, '1→2→3→4→5 가 아니라  1전반 → 3전반 → 4부 → …', size=11.5, color=MUTED, space_before=6)
notes(s, '말 노트: "프롬프트를 잘 쓰는 것과 도구를 이해하는 것은 다릅니다 — 이해가 있어야 한계·보안·활용을 판단합니다." '
         '기존 강의의 실패: 1→2→3 순서로 수학만 하다 AI 를 만나기 전에 지친다.')

# ═════════════════════════════ ③ 해법 ═════════════════════════════
s = new_slide()
chrome(s, 3, '해법', '강사처럼 — 진단하고, 경로를 짜고, 옆에서 가르친다')
cols = [
    ('① 진단 — 5분', '12문항 · 관문 4개', '벡터 · 확률 · 미분 · log 감각을 관문 단위로 측정. 시험이 아니라 경로 설계용.'),
    ('② 개인 경로 — 규칙 엔진', '결정은 규칙이', '통과한 관문의 단계는 접고(빠른 복습), 부족한 수학은 쓰이기 직전에 배치. 근거가 화면에 나옵니다.'),
    ('③ 교실 + 튜터', '10부작 106챕터 · 로컬 LLM', '조작하는 실험실 → 자동채점 문제 → 막히면 지금 보는 챕터를 아는 AI 튜터에게 질문.'),
]
for i, (t1, t2, body_txt) in enumerate(cols):
    cx = Inches(0.9 + i * 4.03)
    c = card(s, cx, Inches(2.0), Inches(3.55), Inches(2.9), fill=WHITE)
    tf = c.text_frame
    tf.margin_left = tf.margin_right = Inches(0.2)
    tf.margin_top = Inches(0.18)
    para(tf, t1, size=16.5, color=INK, bold=True, first=True)
    para(tf, t2, size=12, color=INDIGO, bold=True, space_before=3)
    para(tf, body_txt, size=12.5, color=BODY, space_before=10, line=1.35)
    if i < 2:
        arrow(s, Inches(0.9 + i * 4.03 + 3.6), Inches(3.28), Inches(0.38), Inches(0.34))
c = card(s, Inches(0.9), Inches(5.35), Inches(11.55), Inches(1.15), fill=INDIGO, line_c=None)
tf = c.text_frame
tf.vertical_anchor = MSO_ANCHOR.MIDDLE
para(tf, [('핵심 설계 — ', {'color': RGBColor.from_string('C7D2FE'), 'bold': True}),
          ('"결정은 규칙, 말은 LLM"', {'color': WHITE, 'bold': True}),
          ('   추천은 재현 가능하고 근거가 보이며, LLM 은 그 결정을 쉬운 말로 풀어 주기만 합니다.',
           {'color': RGBColor.from_string('E0E7FF'), 'size': 12.5})],
     size=15, first=True)
notes(s, '키 카피: "강의가 아니라 강사입니다". 3층 구조 = 진단(규칙) → 경로(규칙 엔진) → 학습(교실)+튜터(로컬 LLM).')

# ═════════════════════════════ ④ 데모 1 — 진단 ═════════════════════════════
s = new_slide()
chrome(s, 4, '데모 1 — AI 강사', '진단 5분, 커리큘럼이 다시 그려진다')
pic_fit(s, ASSETS / 'diagnose.png', Inches(0.9), Inches(1.8), Inches(5.5), Inches(3.45))
tf = box(s, Inches(0.9), Inches(5.32), Inches(5.5), Inches(0.6))
para(tf, '① 12문항 진단 — "시험이 아니라 경로를 짜기 위한 것"', size=12.5, color=INK, bold=True,
     align=PP_ALIGN.CENTER, first=True)
arrow(s, Inches(6.5), Inches(3.3), Inches(0.45), Inches(0.4))
pic_fit(s, ASSETS / 'summary_card.png', Inches(7.05), Inches(1.95), Inches(5.4), Inches(2.35), border=None)
tf = box(s, Inches(7.05), Inches(4.42), Inches(5.4), Inches(1.9))
para(tf, '② 경로가 다시 그려지고, 이유가 화면에 나옵니다', size=12.5, color=INK, bold=True, first=True)
para(tf, '실측 예시 — 벡터·확률은 기억, 미분·log 는 리셋된 직장인: 106챕터 중 55챕터 · 31.9시간 경로로 압축, 아는 단계는 "빠른 복습"으로 접힘.',
     size=11.5, color=BODY, space_before=5, line=1.3)
notes(s, '시연에서 청중이 직접 진단 — 그 자리에서 "그 사람의 지도"가 되는 순간이 와우 포인트 1. '
         '"왜 이 경로냐"는 질문에 화면의 근거(관문 통과/미통과)로 답한다. 결정은 규칙이므로 같은 답이 항상 재현된다.')

# ═════════════════════════════ ⑤ 데모 2 — 라이브 투어 ═════════════════════════════
s = new_slide()
chrome(s, 5, '데모 2 — 라이브 투어', '당신의 문장이 ChatGPT 안에서 움직인다')
cells = [
    ('lab_ch2_tokenize.png', '① 토큰화 — 문장이 조각·ID 로'),
    ('lab_ch3_embedding.png', '② 임베딩 — 단어가 좌표로'),
    ('lab_ch6_attention.png', '③ 어텐션 — Q·K·V 집중도'),
    ('lab_ch9_output.png', '④ 출력층 — 다음 단어 확률'),
    ('lab_ch12_sampling.png', '⑤ 샘플링 — temperature·top-k'),
]
GX, GY = Inches(0.9), Inches(1.7)
CW, CH, GAP = Inches(3.85), Inches(2.42), Inches(0.13)
for i, (fn, cap) in enumerate(cells):
    r, cidx = divmod(i, 3)
    x = GX + cidx * (CW + GAP)
    y = GY + r * (CH + Inches(0.18))
    tf = box(s, x, y, CW, Inches(0.28))
    para(tf, cap, size=11.5, color=INK, bold=True, first=True)
    pic_fit(s, ASSETS / fn, x, y + Inches(0.3), CW, CH - Inches(0.3))
x = GX + 2 * (CW + GAP)
y = GY + 1 * (CH + Inches(0.18))
c = card(s, x, y + Inches(0.05), CW, CH - Inches(0.1), fill=INDIGO, line_c=None)
tf = c.text_frame
tf.margin_left = tf.margin_right = Inches(0.2)
tf.vertical_anchor = MSO_ANCHOR.MIDDLE
para(tf, '당신의 문장으로 라이브 시연', size=13, color=WHITE, bold=True, first=True, line=1.25)
para(tf, '다섯 화면이 1·3·5부 수학과 1:1 — 커리큘럼이 곧 ChatGPT 해부도입니다.',
     size=12, color=RGBColor.from_string('E0E7FF'), space_before=8, line=1.3)
notes(s, '말 노트: "청중 문장으로 라이브 시연"이 와우 포인트 2 — 토큰화(ch2) → 임베딩(ch3) → 어텐션(ch6) → 확률(ch9) → temperature(ch12). '
         '각 컷이 1·3·5부 수학과 1:1. 5분 발표에선 이 슬라이드 대신 실물 시연.')

# ═════════════════════════════ ⑥ 완전 로컬 ═════════════════════════════
s = new_slide()
chrome(s, 6, '인프라', '완전 로컬 — 서버 0 · 비용 ₩0 · 데이터 유출 0')
trio = [
    ('서버 0', '정적 웹', '서버 없이 URL 하나로 배포 — 사내 파일 서버·정적 호스트면 충분합니다.'),
    ('₩0', '로컬 LLM 튜터', 'AI 튜터가 각자 PC 의 Ollama 로 동작 — 질문이 무제한이어도 비용이 없습니다.'),
    ('유출 0건', '질문이 밖으로 안 나감', '학습 데이터도 질문도 PC 를 떠나지 않습니다 — 보안 검토가 짧아집니다.'),
]
for i, (n, t, d) in enumerate(trio):
    cx = Inches(0.9 + i * 4.03)
    c = card(s, cx, Inches(1.85), Inches(3.55), Inches(2.5), fill=WHITE)
    tf = c.text_frame
    tf.margin_left = tf.margin_right = Inches(0.2)
    tf.margin_top = Inches(0.16)
    para(tf, n, size=30, color=INDIGO, bold=True, first=True)
    para(tf, t, size=13, color=INK, bold=True, space_before=2)
    para(tf, d, size=12, color=BODY, space_before=8, line=1.35)
c = card(s, Inches(0.9), Inches(4.75), Inches(11.55), Inches(1.7), fill=NAVY, line_c=None)
tf = c.text_frame
tf.margin_left = Inches(0.3)
tf.vertical_anchor = MSO_ANCHOR.MIDDLE
para(tf, [('시연 —  ', {'color': RGBColor.from_string('94A3B8'), 'bold': True}),
          ('Wi-Fi 를 끄고, 튜터에게 질문합니다.', {'color': WHITE, 'bold': True})], size=17, first=True)
para(tf, '덤: 9부(수치 계산)가 이 인프라 자체를 가르칩니다 — "튜터가 왜 4GB 로 내 PC 에서 도는가".',
     size=12.5, color=RGBColor.from_string('CBD5E1'), space_before=8)
notes(s, '오프라인 시연이 곧 보안 답변: 질문·데이터가 외부로 나가지 않음을 눈앞에서 증명. '
         '기술 스택 질문 대비 — 정적 웹(브라우저 저장) + 로컬 Ollama, 서버·계정 없음.')

# ═════════════════════════════ ⑦ 숫자 한 장 ═════════════════════════════
s = new_slide()
chrome(s, 7, '숫자 한 장 — 전 항목 전수 실측', '규모 · 비용 · 실측 성능')
stats = [
    ('106', '학습 챕터', '10부작 완결 — 선형대수→LLM 조련→스케일링·평가'),
    ('1,400+', '자동채점 문항', '즉시 채점 + 단계별 힌트·해설'),
    ('118', '실습 노트북', '웹 챕터 ↔ Jupyter 1:1 — 전수 무에러 실행'),
    ('₩0', '운영비', '로컬 AI 튜터 · 정적 웹 · 오프라인'),
]
for i, (n, t, d) in enumerate(stats):
    cx = Inches(0.9 + i * 2.99)
    c = card(s, cx, Inches(1.8), Inches(2.75), Inches(2.15), fill=PANEL, line_c=LINE)
    tf = c.text_frame
    tf.margin_left = tf.margin_right = Inches(0.16)
    tf.margin_top = Inches(0.14)
    para(tf, n, size=34, color=INDIGO, bold=True, first=True)
    para(tf, t, size=13.5, color=INK, bold=True, space_before=2)
    para(tf, d, size=10.5, color=MUTED, space_before=6, line=1.25)
row2 = [
    ('핵심 경로 55챕터 ≈ 37시간', '진단으로 개인별 단축 — 실측 예시 31.9시간'),
    ('튜터 완답 5~6초', '경량 로컬 모델(레거시 노트북 기준) — 1부에서 실측, 전 부 공통 인프라'),
    ('가드레일 10/10 차단 · 지연 +0초', '주제 이탈 질문 전부 차단, 스트리밍 보류 감지로 추가 지연 없음'),
]
for i, (t, d) in enumerate(row2):
    cx = Inches(0.9 + i * 3.98)
    c = card(s, cx, Inches(4.35), Inches(3.72), Inches(1.55), fill=WHITE)
    tf = c.text_frame
    tf.margin_left = tf.margin_right = Inches(0.18)
    tf.margin_top = Inches(0.12)
    para(tf, t, size=13.5, color=INK, bold=True, first=True, line=1.2)
    para(tf, d, size=11, color=MUTED, space_before=5, line=1.3)
tf = box(s, Inches(0.9), Inches(6.25), Inches(11.5), Inches(0.4))
para(tf, '산출 근거·측정 방법은 12_metrics.md — 전 항목 재측정 가능', size=11, color=MUTED, first=True)
notes(s, '전 항목 전수 실측(2026-07-13 기준). 106챕터·1,400+ 문항·118 노트북은 코드에서 직접 집계, '
         '튜터 성능은 1부에서 실측(전 부 동일 인프라).')

# ═════════════════════════════ ⑧ 품질 ═════════════════════════════
s = new_slide()
chrome(s, 8, '품질', '수포자 페르소나 검수 + 자동 검증 3종')
rows = [
    ('① 페르소나 검수', '"중학 수학까지만 기억하는 성인"으로 전 챕터 통독 — 이탈 위험 40여 건을 찾아 전량 수정, 전 부 "학습 적합" 판정.'),
    ('② 자동 검증 3종', '전 11앱 타입체크·빌드  /  노트북 118권 무에러 실행  /  브라우저 E2E — 전 페이지 스모크 129 항목 + 개인화 통합 16항목.'),
    ('③ 회귀 안전망', '검증 스크립트를 저장소에 영속화 — 콘텐츠를 고칠 때마다 전체를 다시 돌려 깨짐을 자동으로 잡습니다.'),
]
for i, (t, d) in enumerate(rows):
    c = card(s, Inches(0.9), Inches(1.85 + i * 1.35), Inches(11.55), Inches(1.15), fill=WHITE)
    tf = c.text_frame
    tf.margin_left = Inches(0.25)
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    para(tf, t, size=14.5, color=INDIGO, bold=True, first=True)
    para(tf, d, size=12.5, color=BODY, space_before=4, line=1.3)
c = card(s, Inches(0.9), Inches(6.0), Inches(11.55), Inches(0.75), fill=INDIGO_SOFT, line_c=None)
tf = c.text_frame
tf.vertical_anchor = MSO_ANCHOR.MIDDLE
para(tf, '"콘텐츠도 소프트웨어처럼 회귀 테스트를 돕니다."', size=13.5, color=INDIGO_INKY, bold=True,
     align=PP_ALIGN.CENTER, first=True)
notes(s, '품질 질문("정확도는?") 대비: 가드레일 실측 10/10 + 본문 우선 고지 + 페르소나 검수. '
         '유지보수 질문 대비: 모노레포 공용 패키지 — 한 번 고치면 전 부 반영.')

# ═════════════════════════════ ⑨ 도입 ═════════════════════════════
s = new_slide()
chrome(s, 9, '도입', '오늘 바로 시작할 수 있습니다')
scen = [
    ('신입 온보딩', '진단으로 각자 출발점부터 — 배경이 달라도 같은 목적지(4부 트랜스포머)에 도착.'),
    ('전사 AI 리터러시', '핵심 경로 55챕터 ≈ 37시간, 진단으로 개인별 단축 — 완주 기준이 명확한 사내 과정.'),
    ('실무 직결 트랙', '7부 RAG(사내 챗봇의 수학) · 9부 수치 계산(로컬 모델 선택) · 10부 평가 통계("새 모델이 2점 높대요" 도입 판단).'),
]
for i, (t, d) in enumerate(scen):
    c = card(s, Inches(0.9), Inches(1.85 + i * 1.42), Inches(7.3), Inches(1.22), fill=WHITE)
    tf = c.text_frame
    tf.margin_left = Inches(0.22)
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    para(tf, t, size=14, color=INK, bold=True, first=True)
    para(tf, d, size=12, color=BODY, space_before=4, line=1.3)
c = card(s, Inches(8.5), Inches(1.85), Inches(3.95), Inches(2.6), fill=PANEL)
tf = c.text_frame
tf.margin_left = tf.margin_right = Inches(0.2)
tf.margin_top = Inches(0.15)
para(tf, '온보딩 마찰 0', size=15, color=INDIGO, bold=True, first=True)
para(tf, '·  URL / QR 로 즉시 접속', size=12.5, color=BODY, space_before=8)
para(tf, '·  로그인 · 설치 없음', size=12.5, color=BODY, space_before=4)
para(tf, '·  진도 자동 저장 (브라우저)', size=12.5, color=BODY, space_before=4)
qr = card(s, Inches(8.5), Inches(4.7), Inches(3.95), Inches(1.55), fill=WHITE, line_c=MUTED)
qr.line.dash_style = 2  # 점선 (배포 URL 확정 대기)
tf = qr.text_frame
tf.vertical_anchor = MSO_ANCHOR.MIDDLE
para(tf, 'QR', size=18, color=MUTED, bold=True, align=PP_ALIGN.CENTER, first=True)
para(tf, '배포 호스트 확정 후 삽입', size=11, color=MUTED, align=PP_ALIGN.CENTER, space_before=3)
notes(s, '도입 시나리오 3종 — 온보딩·전사 교육·실무 트랙. QR 은 사내 호스트 확정 후 교체. '
         '접속 후 첫 화면이 곧 진단 입구라 안내 비용이 없다.')

# ═════════════════════════════ ⑩ 로드맵 + 클로징 ═════════════════════════════
s = new_slide()
chrome(s, 10, '로드맵', '다음 단계 — 파일럿에서 전사로')
road = [
    ('1  파일럿', '동료 5~10명 — 완주율·이탈 지점·진단 체감을 측정'),
    ('2  도입 지점 확정', '온보딩 과정 · 사내 교육 커리큘럼 편입 결정'),
    ('3  확장', '계정·서버 진도(백엔드) — 기기를 넘어 이어지는 학습'),
]
for i, (t, d) in enumerate(road):
    cx = Inches(0.9 + i * 4.03)
    c = card(s, cx, Inches(1.95), Inches(3.55), Inches(1.75), fill=WHITE)
    tf = c.text_frame
    tf.margin_left = tf.margin_right = Inches(0.2)
    tf.margin_top = Inches(0.15)
    para(tf, t, size=15, color=INDIGO, bold=True, first=True)
    para(tf, d, size=12, color=BODY, space_before=8, line=1.35)
    if i < 2:
        arrow(s, Inches(0.9 + i * 4.03 + 3.6), Inches(2.68), Inches(0.38), Inches(0.34))
tf = box(s, Inches(0.9), Inches(4.05), Inches(11.5), Inches(0.4))
para(tf, '콘텐츠 확장 — 10부 "스케일링 법칙과 평가의 통계" 완결·편입(2026-07-13), 다음 후보: 확산 모델의 수학(조건부)',
     size=11.5, color=MUTED, first=True)
c = card(s, Inches(0.9), Inches(4.75), Inches(11.55), Inches(1.75), fill=INDIGO, line_c=None)
tf = c.text_frame
tf.vertical_anchor = MSO_ANCHOR.MIDDLE
para(tf, '전 직원의 AI 리터러시 —', size=20, color=RGBColor.from_string('C7D2FE'), bold=True,
     align=PP_ALIGN.CENTER, first=True)
para(tf, '비용 0원으로, 오늘부터.', size=27, color=WHITE, bold=True, align=PP_ALIGN.CENTER, space_before=4)
notes(s, '클로징 — "저장소를 사내 호스트에 올리는 순간 전 직원의 AI 강사가 생깁니다. 파일럿 대상 추천을 부탁드립니다."')

prs.core_properties.title = '수포자 사관학교 — AI 를 가르치는 AI 강사'
prs.core_properties.author = 'jiyupapa'
prs.save(OUT)
print('저장 →', OUT)
