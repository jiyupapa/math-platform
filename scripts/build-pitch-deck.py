# scripts/build-pitch-deck.py
# 해커톤 발표 덱 생성 — docs/hackathon/11_pitch_deck.pptx (11장, 16:9)
# 구성 정본: docs/hackathon/11_pitch_deck.md · 임베드 자산: docs/hackathon/assets/*.png
#   (스크린샷 재생성은 scripts/shoot-deck-assets.mjs, 선 아이콘(assets/icons)은 scripts/render-deck-icons.mjs)
#
# 디자인(2026-10-12 개편): 표지·⑦ 로컬·⑪ 클로징은 어두운 그라데이션, 나머지는 밝은 바탕 + 그림자 카드.
#   카드마다 선 아이콘(Lucide — 검정 PNG 를 알파 마스크로 받아 여기서 색을 입힌다), 스크린샷은 브라우저 창 틀에 넣는다.
#   색은 제품 UI 의 인디고에 보라를 더한 그라데이션.
#   QR: docs/hackathon/assets/qr.png 가 있으면 ⑩ 오른쪽 카드에 자동으로 들어간다(사내 호스트 확정 후 넣고 재생성).
#
# 사용법:
#   1) python-pptx 설치 (공용 venv 오염 방지 — 임시 폴더에 --target 설치 권장)
#      .venv\Scripts\python.exe -m pip install --target <임시폴더> python-pptx
#   2) PYTHONPATH=<임시폴더> .venv\Scripts\python.exe scripts/build-pitch-deck.py
from io import BytesIO
from pathlib import Path

from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml import parse_xml
from pptx.oxml.ns import nsdecls, qn
from pptx.util import Inches, Pt

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'docs' / 'hackathon' / 'assets'
ICONS = ASSETS / 'icons'
QR = ASSETS / 'qr.png'
OUT = ROOT / 'docs' / 'hackathon' / '11_pitch_deck.pptx'


def C(h):
    return RGBColor.from_string(h)


# ── 디자인 토큰 ──────────────────────────────────────────────────────────────
FONT = '맑은 고딕'
INK = C('0F172A')          # slate-900
BODY = C('334155')         # slate-700
MUTED = C('64748B')        # slate-500
FAINT = C('94A3B8')        # slate-400 (어두운 바탕 보조 글자)
SLATE_300 = C('CBD5E1')
SLATE_200 = C('E2E8F0')
LINE = C('E2E8F0')
PANEL = C('F8FAFC')
BG = C('F4F6FB')           # 밝은 슬라이드 바탕 — 흰 카드가 그림자로 떠 보이게
WHITE = C('FFFFFF')
INDIGO = C('4F46E5')       # indigo-600 (제품 UI와 동일 계열)
VIOLET = C('7C3AED')       # violet-600 (그라데이션 짝)
INDIGO_SOFT = C('EEF2FF')
VIOLET_SOFT = C('F5F3FF')
INDIGO_100 = C('E0E7FF')
INDIGO_200 = C('C7D2FE')
INDIGO_300 = C('A5B4FC')
INDIGO_INKY = C('312E81')
LILAC = C('D8B4FE')        # 어두운 바탕 그라데이션 글자 끝색
ROSE = C('E11D48')
ROSE_SOFT = C('FFE4E6')
ROSE_INK = C('BE123C')
TEAL = C('0D9488')
TEAL_SOFT = C('CCFBF1')
TEAL_INK = C('0F766E')
AMBER = C('D97706')
AMBER_SOFT = C('FEF3C7')
AMBER_INK = C('92400E')
NAVY = C('0B1026')
NAVY2 = C('1E1B4B')        # indigo-950
SOFT = {str(INDIGO): INDIGO_SOFT, str(VIOLET): VIOLET_SOFT, str(TEAL): TEAL_SOFT,
        str(ROSE): ROSE_SOFT, str(AMBER): AMBER_SOFT}

SW, SH = 13.333, 7.5       # 인치
X0 = 0.8                   # 좌우 여백
CW = SW - 2 * X0           # 본문 폭


def I(v):
    return Inches(v)


# ── 글자 ────────────────────────────────────────────────────────────────────
def kfont(run, name=FONT):
    """라틴·한글(ea)·복합(cs) 모두 같은 글꼴로 — 한글이 테마 기본체로 빠지는 것 방지."""
    run.font.name = name
    rPr = run._r.get_or_add_rPr()
    rPr.set('lang', 'ko-KR')  # 한국어로 지정해야 PowerPoint 가 한글을 단어 단위로 줄바꿈한다(아래 para 의 eaLnBrk 와 짝)
    rPr.set('altLang', 'en-US')
    for tag in ('a:latin', 'a:ea', 'a:cs'):
        e = rPr.find(qn(tag))
        if e is None:
            e = rPr.makeelement(qn(tag), {})
            rPr.append(e)
        e.set('typeface', name)


def _clr(color, alpha=None):
    """srgbClr XML. alpha 는 불투명도 %(0~100)."""
    a = f'<a:alpha val="{int(alpha * 1000)}"/>' if alpha is not None else ''
    return f'<a:srgbClr val="{color}">{a}</a:srgbClr>'


def grad_run(run, c1, c2, ang=0):
    """글자에 가로 그라데이션 채우기."""
    rPr = run._r.get_or_add_rPr()
    for e in rPr.findall(qn('a:solidFill')):
        rPr.remove(e)
    rPr.insert(0, parse_xml(
        f'<a:gradFill {nsdecls("a")}><a:gsLst><a:gs pos="0">{_clr(c1)}</a:gs>'
        f'<a:gs pos="100000">{_clr(c2)}</a:gs></a:gsLst><a:lin ang="{ang * 60000}" scaled="0"/></a:gradFill>'))


def para(tf, runs, size=13, color=BODY, bold=False, align=PP_ALIGN.LEFT,
         space_before=0, space_after=0, line=None, first=False):
    """단락 추가. runs 는 문자열 하나 또는 [(텍스트, {size,color,bold,grad}) ...]."""
    p = tf.paragraphs[0] if first and not tf.paragraphs[0].runs else tf.add_paragraph()
    # 한글을 글자가 아니라 단어(띄어쓰기) 단위로 줄바꿈 — 기본값은 "구 / 현돼"처럼 단어 중간에서 끊는다.
    p._p.get_or_add_pPr().set('eaLnBrk', '0')
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
        if 'grad' in st:
            grad_run(r, *st['grad'])
    return p


def text_w(text, size):
    """맑은 고딕 기준 대략의 글자 폭(인치) — 알약(pill) 폭 계산용."""
    em = 0.0
    for ch in text:
        o = ord(ch)
        if 0xAC00 <= o <= 0xD7A3 or 0x3130 <= o <= 0x318F:
            em += 1.0
        elif ch == ' ':
            em += 0.3
        elif ch in '.,·:;\'"()!|/':
            em += 0.35
        elif ch.isdigit() or ch.isupper():
            em += 0.62
        elif ch.isascii():
            em += 0.52
        else:
            em += 0.85
    return em * size / 72


def box(slide, x, y, w, h, anchor=None):
    tb = slide.shapes.add_textbox(I(x), I(y), I(w), I(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    if anchor is not None:
        tf.vertical_anchor = anchor
    return tf


# ── 도형 (채우기·선·효과는 XML 로 직접 — 투명도·그라데이션·그림자) ─────────────
_FILLS = ('a:noFill', 'a:solidFill', 'a:gradFill', 'a:blipFill', 'a:pattFill', 'a:grpFill')


def _spPr(shape):
    return shape._element.spPr


def _set_fill(shape, xml):
    spPr = _spPr(shape)
    for t in _FILLS:
        for e in spPr.findall(qn(t)):
            spPr.remove(e)
    geom = spPr.find(qn('a:prstGeom'))
    if geom is None:
        geom = spPr.find(qn('a:custGeom'))
    geom.addnext(parse_xml(xml))


def solid(shape, color, alpha=None):
    _set_fill(shape, f'<a:solidFill {nsdecls("a")}>{_clr(color, alpha)}</a:solidFill>')


def grad(shape, c1, c2, ang=45, a1=None, a2=None):
    """선형 그라데이션. ang 은 OOXML 각도(왼쪽→오른쪽 0°, 시계 방향)."""
    _set_fill(shape, f'<a:gradFill {nsdecls("a")} rotWithShape="1"><a:gsLst>'
                     f'<a:gs pos="0">{_clr(c1, a1)}</a:gs><a:gs pos="100000">{_clr(c2, a2)}</a:gs>'
                     f'</a:gsLst><a:lin ang="{int(ang * 60000)}" scaled="0"/></a:gradFill>')


def outline(shape, color=None, width=1.0, alpha=None):
    ln = shape.line
    if color is None:
        ln.fill.background()
        return
    ln.width = Pt(width)
    ln.color.rgb = color
    if alpha is not None:
        clr = _spPr(shape).find(qn('a:ln')).find(qn('a:solidFill')).find(qn('a:srgbClr'))
        clr.append(parse_xml(f'<a:alpha {nsdecls("a")} val="{int(alpha * 1000)}"/>'))


def _effects(shape, inner=''):
    """효과 목록을 통째로 교체(빈 값이면 테마 기본 그림자 제거)."""
    spPr = _spPr(shape)
    for e in spPr.findall(qn('a:effectLst')):
        spPr.remove(e)
    anchor = None
    for t in ('a:ln',) + _FILLS + ('a:prstGeom', 'a:custGeom'):
        anchor = spPr.find(qn(t))
        if anchor is not None:
            break
    anchor.addnext(parse_xml(f'<a:effectLst {nsdecls("a")}>{inner}</a:effectLst>'))


def shadow(shape, blur=16, dist=4, alpha=10, color='0F172A'):
    _effects(shape, f'<a:outerShdw blurRad="{Pt(blur)}" dist="{Pt(dist)}" dir="5400000" algn="t" rotWithShape="0">'
                    f'{_clr(color, alpha)}</a:outerShdw>')


def _shape(slide, kind, x, y, w, h, fill=WHITE, alpha=None, line=None, lw=1.0, line_alpha=None,
           adj=None, sh=False):
    sp = slide.shapes.add_shape(kind, I(x), I(y), I(w), I(h))
    if adj is not None:
        sp.adjustments[0] = adj
    if fill is None:
        _set_fill(sp, f'<a:noFill {nsdecls("a")}/>')
    else:
        solid(sp, fill, alpha)
    outline(sp, line, lw, line_alpha)
    if sh:
        shadow(sp)
    else:
        _effects(sp)
    tf = sp.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    return sp


def rect(slide, x, y, w, h, fill, **kw):
    return _shape(slide, MSO_SHAPE.RECTANGLE, x, y, w, h, fill=fill, **kw)


def rrect(slide, x, y, w, h, fill=WHITE, radius=0.12, **kw):
    """둥근 사각형. radius 는 인치."""
    return _shape(slide, MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h, fill=fill,
                  adj=min(0.5, radius / min(w, h)), **kw)


def card(slide, x, y, w, h, fill=WHITE, radius=0.14, **kw):
    """밝은 슬라이드의 기본 카드 — 흰 바탕 + 부드러운 그림자, 테두리 없음."""
    kw.setdefault('sh', True)
    return rrect(slide, x, y, w, h, fill=fill, radius=radius, **kw)


def oval(slide, x, y, d, fill, **kw):
    return _shape(slide, MSO_SHAPE.OVAL, x, y, d, d, fill=fill, **kw)


def blob(slide, x, y, d, color, alpha):
    """가장자리로 갈수록 투명해지는 원 — 배경의 은은한 빛."""
    sp = oval(slide, x, y, d, color)
    _set_fill(sp, f'<a:gradFill {nsdecls("a")} rotWithShape="1"><a:gsLst>'
                  f'<a:gs pos="0">{_clr(color, alpha)}</a:gs><a:gs pos="35000">{_clr(color, alpha * 0.55)}</a:gs>'
                  f'<a:gs pos="70000">{_clr(color, 0)}</a:gs><a:gs pos="100000">{_clr(color, 0)}</a:gs></a:gsLst>'
                  f'<a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path></a:gradFill>')
    return sp


# ── 아이콘 · 알약 · 번호 ─────────────────────────────────────────────────────
_icon_cache = {}


def _icon_png(name, color, alpha=1.0):
    key = (name, str(color), alpha)
    if key not in _icon_cache:
        im = Image.open(ICONS / f'{name}.png').convert('RGBA')
        a = im.getchannel('A')
        if alpha < 1:
            a = a.point(lambda v: int(v * alpha))
        out = Image.new('RGBA', im.size, tuple(color) + (0,))
        out.putalpha(a)
        buf = BytesIO()
        out.save(buf, 'PNG')
        _icon_cache[key] = buf.getvalue()
    return BytesIO(_icon_cache[key])


def icon(slide, name, x, y, size, color=INDIGO, alpha=1.0):
    return slide.shapes.add_picture(_icon_png(name, color, alpha), I(x), I(y), I(size), I(size))


def chip(slide, name, x, y, size=0.56, style='soft', color=INDIGO):
    """아이콘 칩: soft(연한 바탕 + 색 아이콘) · grad(그라데이션 + 흰 아이콘) · glass(어두운·색 바탕용 반투명)."""
    sp = rrect(slide, x, y, size, size, radius=size * 0.28)
    if style == 'grad':
        grad(sp, INDIGO, VIOLET, 45)
        ic = WHITE
    elif style == 'glass':
        solid(sp, WHITE, 12)
        outline(sp, WHITE, 0.75, 22)
        ic = WHITE
    else:
        solid(sp, SOFT[str(color)])
        ic = color
    pad = size * 0.23
    icon(slide, name, x + pad, y + pad, size - 2 * pad, ic)
    return sp


def pill(slide, text, x, y, size=11, fill=INDIGO_SOFT, color=INDIGO, h=None, bold=True,
         alpha=None, line=None, line_alpha=None, padx=0.15):
    """알약 모양 라벨. 폭은 글자 폭 추정치로 정한다. (도형, 폭) 반환."""
    h = h or size / 72 * 2.1
    w = text_w(text, size) + 2 * padx
    sp = rrect(slide, x, y, w, h, fill=fill, radius=h / 2, alpha=alpha, line=line, lw=0.75,
               line_alpha=line_alpha)
    tf = sp.text_frame
    tf.word_wrap = False
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    para(tf, text, size=size, color=color, bold=bold, align=PP_ALIGN.CENTER, first=True)
    return sp, w


def badge(slide, n, x, y, d=0.34, size=12):
    """그라데이션 원 번호."""
    sp = oval(slide, x, y, d, WHITE)
    grad(sp, INDIGO, VIOLET, 45)
    tf = sp.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    para(tf, str(n), size=size, color=WHITE, bold=True, align=PP_ALIGN.CENTER, first=True)
    return sp


def arrow_dot(slide, cx, cy, d=0.5, dark=False):
    """카드 사이 연결 — 그림자 진 흰 원 + 화살표."""
    if dark:
        sp = oval(slide, cx - d / 2, cy - d / 2, d, WHITE, alpha=12, line=WHITE, lw=0.75, line_alpha=22)
        ic = INDIGO_200
    else:
        sp = oval(slide, cx - d / 2, cy - d / 2, d, WHITE, sh=True)
        ic = INDIGO
    s = d * 0.5
    icon(slide, 'arrow-right', cx - s / 2, cy - s / 2, s, ic)
    return sp


# ── 그림 ────────────────────────────────────────────────────────────────────
def _round_pic(pic, ratio=0.04):
    geom = pic._element.spPr.find(qn('a:prstGeom'))
    geom.set('prst', 'roundRect')
    av = geom.find(qn('a:avLst'))
    if av is None:
        av = parse_xml(f'<a:avLst {nsdecls("a")}/>')
        geom.append(av)
    for e in list(av):
        av.remove(e)
    av.append(parse_xml(f'<a:gd {nsdecls("a")} name="adj" fmla="val {int(ratio * 100000)}"/>'))


def pic_fit(slide, path, x, y, w, h):
    """박스(x,y,w,h) 안에 비율 유지로 맞춰 넣고 가운데 정렬. (그림, 실제 x,y,w,h) 반환."""
    iw, ih = Image.open(path).size
    scale = min(w / iw, h / ih)
    pw, ph = iw * scale, ih * scale
    px, py = x + (w - pw) / 2, y + (h - ph) / 2
    pic = slide.shapes.add_picture(str(path), I(px), I(py), I(pw), I(ph))
    return pic, (px, py, pw, ph)


def browser(slide, path, x, y, w, dark=False, crop_bottom=0.0, glow=False):
    """스크린샷을 브라우저 창 틀에 넣는다(주소 막대 + 신호등 점). 틀 전체 높이 반환."""
    bar, bez = 0.30, 0.06
    iw, ih = Image.open(path).size
    pw = w - 2 * bez
    ph = pw * ih / iw * (1 - crop_bottom)
    h = bar + ph + bez
    fr = rrect(slide, x, y, w, h, fill=C('1E293B') if dark else WHITE, radius=0.12)
    if glow:
        shadow(fr, blur=48, dist=0, alpha=55, color=str(INDIGO))
    else:
        shadow(fr, blur=18, dist=5, alpha=14)
    if not dark:
        outline(fr, LINE, 0.75)
    for i, c in enumerate(('F87171', 'FBBF24', '34D399')):
        oval(slide, x + 0.16 + i * 0.15, y + 0.105, 0.09, C(c))
    rrect(slide, x + 0.72, y + 0.075, min(3.0, w * 0.45), 0.15,
          fill=C('334155') if dark else C('F1F5F9'), radius=0.075)
    pic = slide.shapes.add_picture(str(path), I(x + bez), I(y + bar), I(pw), I(ph))
    if crop_bottom:
        pic.crop_bottom = crop_bottom
    return h


def notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text


# ── 슬라이드 틀 ──────────────────────────────────────────────────────────────
prs = Presentation()
prs.slide_width = I(SW)
prs.slide_height = I(SH)
BLANK = prs.slide_layouts[6]
TOTAL = 11


def new_slide():
    return prs.slides.add_slide(BLANK)


def dark_bg(slide):
    bg = rect(slide, 0, 0, SW, SH, NAVY)
    grad(bg, NAVY, NAVY2, 35)
    blob(slide, 8.4, -3.2, 8.0, INDIGO, 32)
    blob(slide, -2.8, 4.4, 6.0, VIOLET, 24)


def light_bg(slide):
    rect(slide, 0, 0, SW, SH, BG)
    blob(slide, 9.6, -3.4, 6.4, INDIGO, 9)
    top = rect(slide, 0, 0, SW, 0.06, INDIGO)
    grad(top, INDIGO, VIOLET, 0)


def footer(slide, no, dark=False):
    m = rrect(slide, X0, 7.0, 0.2, 0.2, radius=0.06)
    grad(m, INDIGO, VIOLET, 45)
    tf = box(slide, X0 + 0.3, 6.98, 6, 0.24, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, [('수포자 아카데미', {'bold': True, 'color': SLATE_300 if dark else BODY}),
              ('  ·  AI 를 가르치는 AI 강사', {})], size=9.5, color=FAINT if dark else MUTED, first=True)
    tf = box(slide, SW - X0 - 1.2, 6.98, 1.2, 0.24, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, [(f'{no:02d}', {'bold': True, 'color': SLATE_300 if dark else BODY}), (f' / {TOTAL}', {})],
         size=10, color=FAINT if dark else MUTED, align=PP_ALIGN.RIGHT, first=True)


def chrome(slide, no, kicker, title, dark=False):
    """콘텐츠 슬라이드 공통: 바탕, 번호·구역 알약, 제목, 바닥글."""
    if dark:
        dark_bg(slide)
        pill(slide, f'{no:02d}   {kicker}', X0, 0.5, size=11, fill=WHITE, alpha=10, color=INDIGO_200,
             line=WHITE, line_alpha=20)
    else:
        light_bg(slide)
        pill(slide, f'{no:02d}   {kicker}', X0, 0.5, size=11)
    tf = box(slide, X0, 0.92, CW, 0.7)
    para(tf, title, size=28, color=WHITE if dark else INK, bold=True, first=True)
    footer(slide, no, dark)


# ═════════════════════════════ ① 타이틀 ═════════════════════════════
s = new_slide()
dark_bg(s)
pill(s, '사내 AI 리터러시 플랫폼', 0.95, 1.45, size=12, fill=WHITE, alpha=10, color=INDIGO_200,
     line=WHITE, line_alpha=20)
tf = box(s, 0.95, 1.95, 6.0, 1.0)
para(tf, '수포자 아카데미', size=54, color=WHITE, bold=True, first=True)
tf = box(s, 0.95, 3.0, 6.0, 0.6)
para(tf, [('AI 를 가르치는 AI 강사', {'grad': (INDIGO_300, LILAC)})], size=26, bold=True, first=True)
tf = box(s, 0.95, 3.85, 5.8, 0.45)
para(tf, '"수학을 포기했던 직원도, ChatGPT 의 내부까지."', size=16, color=SLATE_200, first=True)
x = 0.95
for i, t in enumerate(['진단 5분', '개인 경로', '11부 교실 + 로컬 AI 튜터']):
    _, w = pill(s, t, x, 4.5, size=12, fill=WHITE, alpha=10, color=WHITE, h=0.42, padx=0.2,
                line=WHITE, line_alpha=20)
    x += w
    if i < 2:
        icon(s, 'arrow-right', x + 0.08, 4.58, 0.26, INDIGO_300)
        x += 0.42
for i, (n, t) in enumerate([('11부', '118챕터 완결'), ('₩0', '완전 로컬'), ('설치 0', '브라우저만으로')]):
    sx = 0.95 + i * 1.85
    if i:
        rect(s, sx - 0.25, 5.62, 0.012, 0.75, WHITE, alpha=18)
    tf = box(s, sx, 5.5, 1.6, 0.5)
    para(tf, n, size=26, color=WHITE, bold=True, first=True)
    tf = box(s, sx, 6.05, 1.6, 0.3)
    para(tf, t, size=11, color=INDIGO_300, bold=True, first=True)
fh = browser(s, ASSETS / 'home_hero.png', 6.85, 1.55, 5.75, dark=True, glow=True)
tf = box(s, 6.85, 1.55 + fh + 0.18, 5.75, 0.3)
para(tf, '실제 화면: 진단 후 개인화된 포털 홈', size=10.5, color=FAINT, align=PP_ALIGN.CENTER, first=True)
notes(s, '발표 운영: 전체 5분이면 슬라이드 ④·⑤는 슬라이드 대신 실물 시연으로 대체하고 나머지 8장을 빠르게 넘긴다. '
         '오프닝 한 문장: "AI 를 매일 쓰는 회사에서, 원리를 아는 사람을 길러내는 AI 강사를 만들었습니다."')

# ═════════════════════════════ ② 문제 ═════════════════════════════
s = new_slide()
chrome(s, 2, '문제', '전 직원이 AI 를 쓰는데, 원리를 아는 사람은?')
chip(s, 'users', X0, 1.95, 0.6)
tf = box(s, X0, 2.75, 5.35, 1.6)
para(tf, '직원 대부분이 매일 AI 를 씁니다.', size=21, color=INK, bold=True, first=True, line=1.2)
para(tf, [('그러나 내부 원리를 아는 사람은 ', {}), ('극소수', {'color': ROSE, 'bold': True}), ('입니다.', {})],
     size=17.5, color=BODY, space_before=8, line=1.25)
para(tf, [('격차의 원인은 ', {}), ('수학', {'color': INDIGO, 'bold': True}), ('입니다.', {})],
     size=17.5, color=BODY, space_before=2, line=1.25)
tf = box(s, X0, 4.25, 5.35, 0.6)
para(tf, '프롬프트를 잘 쓰는 것과 도구를 이해하는 것은 다릅니다. 이해가 있어야 한계·보안·활용을 판단할 수 있습니다.',
     size=12.5, color=MUTED, first=True, line=1.35)
c = card(s, X0, 5.15, 5.35, 1.5)
grad(c, INDIGO, VIOLET, 20)
icon(s, 'quote', X0 + 5.35 - 0.7, 5.15 + 1.5 - 0.62, 0.5, WHITE, alpha=0.22)
tf = box(s, X0 + 0.3, 5.32, 4.55, 1.2)
para(tf, '그래서 "강의"가 아니라 "강사"가 필요합니다', size=15.5, color=WHITE, bold=True, first=True)
para(tf, '출발점이 전부 다른 성인 학습자에겐, 같은 진도를 트는 동영상이 아니라 각자의 출발점을 진단하고 경로를 짜 주는 존재가 필요합니다.',
     size=11.5, color=INDIGO_100, space_before=6, line=1.3)

RX, RW = 6.5, SW - X0 - 6.5           # 오른쪽 비교 카드
card(s, RX, 1.95, RW, 4.7)
IX, IW = RX + 0.32, RW - 0.64
DEPTH, GAP, CH = 0.25, 0.06, 0.82   # 갈매기표 꼭지 깊이 · 간격 · 높이


def chevrons(slide, items, x, y, w, fills):
    """진행 단계 화살 띠. items=[(윗줄, 아랫줄)], fills=[(채우기|'grad', 글자색)]."""
    for i, ((top, bottom), (fill, tc)) in enumerate(zip(items, fills)):
        kind = MSO_SHAPE.PENTAGON if i == 0 else MSO_SHAPE.CHEVRON
        sp = _shape(slide, kind, x + i * (w - DEPTH + GAP), y, w, CH, fill=WHITE, adj=DEPTH / CH)
        if fill == 'grad':
            grad(sp, INDIGO, VIOLET, 0)
        else:
            solid(sp, fill)
        tf = sp.text_frame
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf.margin_left = I(0 if i else 0.05)
        para(tf, top, size=10.5 if bottom else 15, color=tc, align=PP_ALIGN.CENTER, first=True)
        if bottom:
            para(tf, bottom, size=12.5, color=tc, bold=True, align=PP_ALIGN.CENTER)
    return x + len(items) * (w - DEPTH + GAP) + DEPTH - GAP


pill(s, '기존 수학 강의', IX, 2.25, size=11, fill=ROSE_SOFT, color=ROSE_INK)
end = chevrons(s, [('1부', '선형대수'), ('2부', '미분'), ('3부', '확률')], IX, 2.75, 1.42,
               [(C('F1F5F9'), BODY)] * 3)
xb = rrect(s, end + 0.1, 2.75, IX + IW - end - 0.1, CH, fill=ROSE_SOFT, radius=0.1)
icon(s, 'circle-x', end + 0.3, 2.75 + CH / 2 - 0.15, 0.3, ROSE)
tf = box(s, end + 0.68, 2.75, IX + IW - end - 0.75, CH, anchor=MSO_ANCHOR.MIDDLE)
para(tf, '이탈', size=14, color=ROSE, bold=True, first=True)
tf = box(s, IX, 3.72, IW, 0.4)
para(tf, '순서대로 수학만 하다가, 정작 AI 를 만나기 전에 지칩니다.', size=12, color=MUTED, first=True)
rect(s, IX, 4.25, IW, 0.012, LINE)
pill(s, '이 플랫폼: 4부로 가는 지름길', IX, 4.45, size=11)
chevrons(s, [('1부', '전반'), ('3부', '전반'), ('4부', '트랜스포머'), ('…', '')], IX, 4.95,
         (IW + 3 * (DEPTH - GAP)) / 4,
         [(INDIGO_100, INDIGO_INKY), (INDIGO_100, INDIGO_INKY), ('grad', WHITE), (C('F1F5F9'), MUTED)])
tf = box(s, IX, 5.92, IW, 0.6)
para(tf, '트랜스포머(4부)를 가장 빨리 만나도록 경로를 재배열하고, 필요한 수학만 그 직전에 배웁니다.',
     size=12, color=BODY, first=True, line=1.3)
notes(s, '말 노트: "프롬프트를 잘 쓰는 것과 도구를 이해하는 것은 다릅니다. 이해가 있어야 한계·보안·활용을 판단합니다." '
         '기존 강의의 실패: 1→2→3 순서로 수학만 하다 AI 를 만나기 전에 지친다. '
         '이 플랫폼은 1→2→3→4→5 가 아니라 1전반 → 3전반 → 4부 → … 로 간다.')

# ═════════════════════════════ ③ 해법 ═════════════════════════════
s = new_slide()
chrome(s, 3, '해법', '강사처럼 진단하고, 경로를 짜고, 옆에서 가르친다')
cols = [
    ('stethoscope', '진단 (5분)', '12문항 · 관문 4개',
     '벡터 · 확률 · 미분 · log 감각을 관문 단위로 측정. 시험이 아니라 경로 설계용.'),
    ('route', '개인 경로 (규칙 엔진)', '결정은 규칙이',
     '통과한 관문의 단계는 접고(빠른 복습), 부족한 수학은 쓰이기 직전에 배치. 근거가 화면에 나옵니다.'),
    ('graduation-cap', '교실 + 튜터', '11부 118챕터 · 로컬 LLM',
     '조작하는 실험실 → 자동채점 문제 → 막히면 지금 보는 챕터를 아는 AI 튜터에게 질문.'),
]
W3 = 3.6
G3 = (CW - 3 * W3) / 2
for i, (ic, t1, t2, body_txt) in enumerate(cols):
    cx = X0 + i * (W3 + G3)
    card(s, cx, 1.95, W3, 3.2)
    chip(s, ic, cx + 0.3, 2.25, 0.62, 'grad')
    tf = box(s, cx + W3 - 1.3, 2.13, 1.0, 0.7)
    para(tf, f'0{i + 1}', size=36, color=INDIGO_100, bold=True, align=PP_ALIGN.RIGHT, first=True)
    tf = box(s, cx + 0.3, 3.08, W3 - 0.6, 0.45)
    para(tf, t1, size=18.5, color=INK, bold=True, first=True)
    pill(s, t2, cx + 0.3, 3.58, size=10.5)
    tf = box(s, cx + 0.3, 4.05, W3 - 0.6, 1.0)
    para(tf, body_txt, size=12.5, color=BODY, first=True, line=1.35)
    if i < 2:
        arrow_dot(s, cx + W3 + G3 / 2, 3.55, 0.46)
c = card(s, X0, 5.42, CW, 1.2)
grad(c, INK, NAVY2, 0)
icon(s, 'quote', X0 + 0.38, 5.74, 0.56, INDIGO_300)
tf = box(s, X0 + 1.2, 5.5, CW - 1.5, 1.04, anchor=MSO_ANCHOR.MIDDLE)
para(tf, [('핵심 설계   ', {'color': INDIGO_300, 'size': 13}),
          ('"결정은 규칙, 말은 LLM"', {'color': WHITE, 'size': 22})], bold=True, first=True)
para(tf, '추천은 재현 가능하고 근거가 보이며, LLM 은 그 결정을 쉬운 말로 풀어 주기만 합니다.',
     size=12.5, color=INDIGO_200, space_before=4)
notes(s, '키 카피: "강의가 아니라 강사입니다". 3층 구조 = 진단(규칙) → 경로(규칙 엔진) → 학습(교실)+튜터(로컬 LLM).')

# ═════════════════════════════ ④ 데모 1 — 진단 ═════════════════════════════
s = new_slide()
chrome(s, 4, '데모 1 · AI 강사', '진단 5분, 커리큘럼이 다시 그려진다')
fh = browser(s, ASSETS / 'diagnose.png', X0, 1.95, 6.1, crop_bottom=0.24)
badge(s, 1, X0, 1.95 + fh + 0.25)
tf = box(s, X0 + 0.5, 1.95 + fh + 0.2, 5.6, 0.8)
para(tf, '12문항 진단', size=14, color=INK, bold=True, first=True)
para(tf, '"시험이 아니라 내게 맞는 학습 순서를 짜기 위한 것"', size=12, color=BODY, space_before=3)
arrow_dot(s, 7.27, 3.3, 0.52)
RX = 7.8
RW = SW - X0 - RX
iw, ih = Image.open(ASSETS / 'summary_card.png').size
ph = RW * ih / iw
pic = s.shapes.add_picture(str(ASSETS / 'summary_card.png'), I(RX), I(1.95), I(RW), I(ph))
_round_pic(pic, 0.07)
shadow(pic, blur=24, dist=6, alpha=22, color=str(INDIGO))
ty = 1.95 + ph + 0.3
badge(s, 2, RX, ty + 0.03)
tf = box(s, RX + 0.5, ty, RW - 0.5, 1.4)
para(tf, '경로가 다시 그려지고, 이유가 화면에 나옵니다', size=14, color=INK, bold=True, first=True, line=1.15)
para(tf, '실측 예시(벡터·확률은 기억하고 미분·log 는 잊은 직장인): 118챕터 중 55챕터 · 31.9시간 경로로 압축, 아는 단계는 "빠른 복습"으로 접힘.',
     size=11.5, color=BODY, space_before=5, line=1.3)
_, w = pill(s, '118챕터 → 55챕터 · 31.9시간', RX + 0.5, 5.98, size=10, fill=TEAL_SOFT, color=TEAL_INK, padx=0.12)
pill(s, '결정은 규칙: 근거가 화면에', RX + 0.5 + w + 0.08, 5.98, size=10, padx=0.12)
notes(s, '시연에서 임원이 직접 진단하면 그 자리에서 "그 사람의 지도"가 되는 순간이 와우 포인트 1. '
         '"왜 이 경로냐"는 질문에 화면의 근거(관문 통과/미통과)로 답한다. 결정은 규칙이므로 같은 답이 항상 재현된다.')

# ═════════════════════════════ ⑤ 데모 2 — 라이브 투어 ═════════════════════════════
s = new_slide()
chrome(s, 5, '데모 2 · 라이브 투어', '내 문장이 ChatGPT 안에서 움직인다')
cells = [
    ('lab_ch2_tokenize.png', '토큰화: 문장이 조각·ID 로'),
    ('lab_ch3_embedding.png', '임베딩: 단어가 좌표로'),
    ('lab_ch6_attention.png', '어텐션: Q·K·V 가중치'),
    ('lab_ch9_output.png', '출력층: 다음 단어 확률'),
    ('lab_ch12_sampling.png', '샘플링: temperature·top-k'),
]
GG = 0.22
GW = (CW - 2 * GG) / 3
GH = (6.75 - 1.85 - GG) / 2
for i, (fn, cap) in enumerate(cells):
    r, k = divmod(i, 3)
    x = X0 + k * (GW + GG)
    y = 1.85 + r * (GH + GG)
    card(s, x, y, GW, GH)
    badge(s, i + 1, x + 0.18, y + 0.16, d=0.3, size=11)
    tf = box(s, x + 0.58, y + 0.14, GW - 0.7, 0.34, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, cap, size=12, color=INK, bold=True, first=True)
    pic_fit(s, ASSETS / fn, x + 0.15, y + 0.6, GW - 0.3, GH - 0.75)
x = X0 + 2 * (GW + GG)
y = 1.85 + GH + GG
c = card(s, x, y, GW, GH)
grad(c, INDIGO, VIOLET, 45)
chip(s, 'presentation', x + 0.3, y + 0.3, 0.6, 'glass')
tf = box(s, x + 0.3, y + 1.08, GW - 0.6, 1.2)
para(tf, '여러분의 문장으로 라이브 시연', size=16, color=WHITE, bold=True, first=True)
para(tf, '다섯 화면이 1·3·5부 수학과 1:1입니다.', size=12, color=INDIGO_100, space_before=8, line=1.3)
para(tf, '커리큘럼이 곧 ChatGPT 해부도입니다.', size=12, color=WHITE, bold=True, space_before=2, line=1.3)
notes(s, '말 노트: "본부장님 문장으로 라이브 시연"이 와우 포인트 2. 토큰화(ch2) → 임베딩(ch3) → 어텐션(ch6) → 확률(ch9) → temperature(ch12). '
         '각 컷이 1·3·5부 수학과 1:1. 5분 발표에선 이 슬라이드 대신 실물 시연.')

# ═════════════════════════════ ⑥ 개념 온톨로지 ═════════════════════════════
s = new_slide()
chrome(s, 6, '개념 온톨로지', '같은 수학이 여러 부에 다시 나온다, 그 지도를 한 파일로')
LW = 7.4
card(s, X0, 1.9, LW, 4.4)
pic_fit(s, ASSETS / 'concept_map.png', X0 + 0.16, 2.06, LW - 0.32, 4.08)
tf = box(s, X0, 6.42, LW, 0.4)
para(tf, '개념 지도: KL 발산을 누르면 먼저 알아야 하는 사슬(실선)과 그 개념을 쓰는 다음 개념(점선)이 이어집니다',
     size=10.5, color=MUTED, align=PP_ALIGN.CENTER, first=True, line=1.25)
RX = X0 + LW + 0.28
RW = SW - X0 - RX
facts = [
    ('network', '개념 114 · 관계 446', '정본 파일 하나에 "먼저 알아야 · 다시 쓰인다 · 이 과정의 비유"를 부·장·섹션 앵커까지 적습니다.'),
    ('book-open', '읽는 곳 9', '검색 · 튜터(웹·노트북) · 챕터 띠 · 개념 지도 · 용어 대조표 · 복습 경로 · 진단 · 질문 집계가 같은 파일을 읽습니다.'),
    ('shield-check', '커밋마다 검사', '위치·앵커 실재, 선수 순환, 본문 링크 151개를 검사기가 확인합니다. 콘텐츠에도 린터가 있습니다.'),
]
FH = 1.12
for i, (ic, t, d) in enumerate(facts):
    y = 1.9 + i * (FH + 0.1)
    card(s, RX, y, RW, FH)
    chip(s, ic, RX + 0.2, y + (FH - 0.5) / 2, 0.5)
    tf = box(s, RX + 0.86, y + 0.06, RW - 1.02, FH - 0.12, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, t, size=13.5, color=INDIGO, bold=True, first=True)
    para(tf, d, size=10.5, color=BODY, space_before=2, line=1.25)
y = 1.9 + 3 * (FH + 0.1) + 0.08
card(s, RX, y, RW, 6.72 - y)
tf = box(s, RX + 0.22, y + 0.1, RW - 0.4, 0.26)
para(tf, '튜터 실측', size=10.5, color=INDIGO, bold=True, first=True)
for j, (ic, col, label, quote) in enumerate([
        ('circle-x', ROSE, '카드 없이', '"N부 2장"(자리표시자)'),
        ('circle-check', TEAL, '카드 붙이면', '"2부 6장, 먼저 도함수 2부 3장"')]):
    ry = y + 0.38 + j * 0.32
    icon(s, ic, RX + 0.22, ry + 0.02, 0.24, col)
    tf = box(s, RX + 0.56, ry, RW - 0.7, 0.3, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, [(label + '  ', {'color': MUTED}), (quote, {'color': INK, 'bold': True})], size=10.5, first=True)
notes(s, '시리즈의 핵심 주장("같은 수학이 재등장한다")을 화면 하나로 보이는 슬라이드. '
         '예상 질문 "그냥 JSON 아닌가요?": 관계에 타입이 있고 검사기가 규칙을 지키며 아홉 곳이 같은 파일을 읽어 같은 답을 한다. 형식이 아니라 계약이 온톨로지. '
         '"왜 벡터 DB·RAG 로 안 했나?": 129개 장 규모에선 손으로 큐레이션한 그래프가 더 정확하고 결정적이며 오프라인. 7부 8장이 이 기법 자체를 가르친다.')

# ═════════════════════════════ ⑦ 완전 로컬 ═════════════════════════════
s = new_slide()
chrome(s, 7, '인프라', '기본은 완전 로컬: 서버 0 · 비용 ₩0 · 유출 0', dark=True)
trio = [
    ('server-off', '서버 0', '정적 웹', '배포는 URL 하나. 학습·진단·튜터 모두 로그인 없이 브라우저에서 돌아갑니다.'),
    ('coins', '₩0', '로컬 LLM 튜터', 'AI 튜터가 각자 PC 의 Ollama 로 동작해, 질문이 무제한이어도 비용이 없습니다.'),
    ('lock', '유출 0건', '튜터 대화는 밖으로 안 나감', '튜터 대화는 PC 를 떠나지 않습니다. 로그인하지 않으면 학습 기록도 이 브라우저에만 남습니다.'),
]
for i, (ic, n, t, d) in enumerate(trio):
    cx = X0 + i * (W3 + G3)
    rrect(s, cx, 1.95, W3, 2.8, fill=WHITE, alpha=6, radius=0.16, line=WHITE, lw=0.75, line_alpha=14)
    chip(s, ic, cx + 0.3, 2.25, 0.56, 'glass')
    tf = box(s, cx + 0.3, 2.95, W3 - 0.6, 0.65)
    para(tf, [(n, {'grad': (INDIGO_300, LILAC)})], size=34, bold=True, first=True)
    tf = box(s, cx + 0.3, 3.6, W3 - 0.6, 0.32)
    para(tf, t, size=13.5, color=WHITE, bold=True, first=True)
    tf = box(s, cx + 0.3, 3.95, W3 - 0.6, 0.6)
    para(tf, d, size=11.5, color=SLATE_300, first=True, line=1.3)
c = rrect(s, X0, 4.95, CW, 1.38, radius=0.16)
grad(c, INDIGO, VIOLET, 0)
shadow(c, blur=30, dist=0, alpha=45, color=str(INDIGO))
chip(s, 'wifi-off', X0 + 0.32, 4.95 + (1.38 - 0.74) / 2, 0.74, 'glass')
tf = box(s, X0 + 1.32, 5.0, CW - 1.6, 1.28, anchor=MSO_ANCHOR.MIDDLE)
para(tf, [('시연  ', {'color': INDIGO_200, 'size': 13}),
          ('Wi-Fi 를 끄고, 튜터에게 다른 부의 개념을 묻습니다.', {'color': WHITE, 'size': 18})], bold=True, first=True)
para(tf, '"KL 발산은 어디서 배워요?" → "5부 5장, 먼저 크로스 엔트로피(5부 4장)". 개념 그래프의 카드 한 장(약 100토큰)으로 답합니다. 벡터 DB 없이, 경량 로컬 모델로.',
     size=12, color=INDIGO_100, space_before=6, line=1.25)
para(tf, '덤: 9부(수치 계산)가 이 인프라 자체를 가르칩니다. "7B 모델이 왜 4GB 로 내 PC 에서 도는가".',
     size=11, color=INDIGO_200, space_before=4)
pill(s, '선택 로그인', X0, 6.48, size=10.5, fill=WHITE, alpha=10, color=INDIGO_200, line=WHITE, line_alpha=20)
tf = box(s, X0 + 1.25, 6.44, CW - 1.25, 0.45)
para(tf, '사내 이메일 계정으로 로그인하면 기기 간 진도 동기화와 협업 메모를 씁니다. 서버로 가는 건 완료한 챕터·복습 표시·진단 결과·직접 쓴 메모뿐입니다.',
     size=10.5, color=FAINT, first=True, line=1.25)
notes(s, '오프라인 시연이 곧 보안 답변: 질문·데이터가 외부로 나가지 않음을 눈앞에서 증명. '
         '부 간 안내는 온톨로지 1단계의 결과. 카드 없이는 "N부 2장" 자리표시자를 그대로 출력하던 결함(실측). '
         '기술 스택 질문 대비: 기본은 정적 웹(브라우저 저장) + 로컬 Ollama. 로그인은 선택이고(사내 이메일 도메인만 가입), '
         '켜면 Supabase 로 진도·복습·진단·협업 메모만 동기화한다. 튜터 대화는 보내지 않고, 원하면 Supabase 를 사내 서버에 직접 설치(self-host)할 수 있다.')

# ═════════════════════════════ ⑧ 숫자 한 장 ═════════════════════════════
s = new_slide()
chrome(s, 8, '숫자 한 장 · 전 항목 전수 실측', '규모 · 비용 · 실측 성능')
G4 = 0.25
W4 = (CW - 3 * G4) / 4
stats = [
    ('book-open', INDIGO, '118', '학습 챕터', '11부 완결: 선형대수→LLM 조련→스케일링·평가→에이전트'),
    ('list-checks', VIOLET, '1,600+', '자동채점 문항', '즉시 채점 + 단계별 힌트·해설'),
    ('notebook-pen', TEAL, '131', '실습 노트북', '웹 챕터 ↔ Jupyter 1:1, 전수 무에러 실행'),
    ('coins', AMBER, '₩0', '운영비', '로컬 AI 튜터 · 정적 웹 · 오프라인'),
]
for i, (ic, col, n, t, d) in enumerate(stats):
    cx = X0 + i * (W4 + G4)
    card(s, cx, 1.9, W4, 2.4)
    rect(s, cx + 0.25, 1.9, 0.6, 0.05, col)
    chip(s, ic, cx + 0.25, 2.2, 0.5, color=col)
    tf = box(s, cx + 0.25, 2.8, W4 - 0.4, 0.65)
    para(tf, n, size=38, color=col, bold=True, first=True)
    tf = box(s, cx + 0.25, 3.47, W4 - 0.4, 0.32)
    para(tf, t, size=14, color=INK, bold=True, first=True)
    tf = box(s, cx + 0.25, 3.8, W4 - 0.45, 0.5)
    para(tf, d, size=10.5, color=MUTED, first=True, line=1.25)
row2 = [
    ('route', '핵심 경로 55챕터·37시간', '진단으로 개인별 단축(실측 예시 31.9시간)'),
    ('timer', '튜터 완답 5~6초', '경량 로컬 모델, 1부에서 실측(전 부 공통 인프라)'),
    ('shield-check', '가드레일 10/10 · +0초', '주제 이탈 전부 차단, 스트리밍 보류 감지로 추가 지연 없음'),
    ('network', '개념 114 · 관계 446', '온톨로지 정본, 스모크 160/160 · 개인화 8/8 자동 검증'),
]
for i, (ic, t, d) in enumerate(row2):
    cx = X0 + i * (W4 + G4)
    card(s, cx, 4.5, W4, 1.62)
    icon(s, ic, cx + 0.25, 4.72, 0.34, INDIGO)
    tf = box(s, cx + 0.25, 5.14, W4 - 0.4, 0.32)
    para(tf, t, size=13.5, color=INK, bold=True, first=True)
    tf = box(s, cx + 0.25, 5.47, W4 - 0.45, 0.6)
    para(tf, d, size=10.5, color=MUTED, first=True, line=1.25)
icon(s, 'info', X0, 6.38, 0.22, MUTED)
tf = box(s, X0 + 0.32, 6.35, 8, 0.28, anchor=MSO_ANCHOR.MIDDLE)
para(tf, '산출 근거·측정 방법은 12_metrics.md (전 항목 재측정 가능)', size=11, color=MUTED, first=True)
notes(s, '전 항목 전수 실측(2026-07-13 기준, 온톨로지·검증 수치는 2026-09-29). 118챕터·1,600+ 문항·131 노트북은 코드에서 직접 집계, '
         '튜터 성능은 1부에서 실측(전 부 동일 인프라).')

# ═════════════════════════════ ⑨ 품질 ═════════════════════════════
s = new_slide()
chrome(s, 9, '품질', '수포자 페르소나 검수 + 자동 검증 4종')
LW = 5.6
card(s, X0, 1.9, LW, 2.25)
chip(s, 'user-search', X0 + 0.3, 2.2, 0.56)
tf = box(s, X0 + 1.06, 2.2, LW - 1.3, 0.4)
para(tf, '① 페르소나 검수', size=16, color=INK, bold=True, first=True)
tf = box(s, X0 + 1.06, 2.62, LW - 1.3, 0.8)
para(tf, '"중학 수학까지만 기억하는 성인"으로 전 챕터 통독. 이탈 위험 40여 건을 찾아 전량 수정, 전 부 "학습 적합" 판정.',
     size=12, color=BODY, first=True, line=1.3)
x = X0 + 0.3
for i, (t, f, col) in enumerate([('이탈 위험 40여 건', ROSE_SOFT, ROSE_INK), ('전량 수정', AMBER_SOFT, AMBER_INK),
                                  ('전 부 "학습 적합"', TEAL_SOFT, TEAL_INK)]):
    _, w = pill(s, t, x, 3.5, size=10.5, fill=f, color=col)
    x += w
    if i < 2:
        icon(s, 'arrow-right', x + 0.06, 3.54, 0.2, FAINT)
        x += 0.32
card(s, X0, 4.35, LW, 1.32)
chip(s, 'refresh-ccw', X0 + 0.3, 4.65, 0.56)
tf = box(s, X0 + 1.06, 4.6, LW - 1.3, 0.4)
para(tf, '③ 회귀 안전망', size=16, color=INK, bold=True, first=True)
tf = box(s, X0 + 1.06, 5.0, LW - 1.3, 0.6)
para(tf, '검증 스크립트를 저장소에 남겨, 콘텐츠를 고칠 때마다 전체를 다시 돌려 깨짐을 자동으로 잡습니다.',
     size=12, color=BODY, first=True, line=1.3)
RX = X0 + LW + 0.28
RW = SW - X0 - RX
card(s, RX, 1.9, RW, 3.77)
chip(s, 'shield-check', RX + 0.3, 2.2, 0.56)
tf = box(s, RX + 1.06, 2.2, RW - 1.3, 0.56, anchor=MSO_ANCHOR.MIDDLE)
para(tf, '② 자동 검증 4종', size=16, color=INK, bold=True, first=True)
checks = [
    ('12앱', '전 앱 타입체크 · 빌드'),
    ('131권', '노트북 무에러 실행'),
    ('160 + 16 + 8', '브라우저 E2E: 스모크 · 개인화 통합 · 온톨로지 개인화'),
    ('151 링크', '커밋 훅의 온톨로지 검사: 개념 위치 · 앵커 · 선수 순환'),
]
TW = (RW - 0.6 - 0.18) / 2
TH = 1.2
for i, (v, d) in enumerate(checks):
    r, k = divmod(i, 2)
    tx = RX + 0.3 + k * (TW + 0.18)
    ty = 3.0 + r * (TH + 0.15)
    rrect(s, tx, ty, TW, TH, fill=PANEL, radius=0.1, line=LINE, lw=0.75)
    tf = box(s, tx + 0.2, ty + 0.13, TW - 0.4, 0.42)
    para(tf, v, size=20, color=INDIGO, bold=True, first=True)
    tf = box(s, tx + 0.2, ty + 0.56, TW - 0.35, 0.6)
    para(tf, d, size=10.5, color=BODY, first=True, line=1.25)
rrect(s, X0, 5.9, CW, 0.75, fill=INDIGO_SOFT, radius=0.14)
icon(s, 'quote', X0 + 0.3, 6.08, 0.38, INDIGO_300)
tf = box(s, X0, 5.9, CW, 0.75, anchor=MSO_ANCHOR.MIDDLE)
para(tf, '"콘텐츠도 소프트웨어처럼 회귀 테스트를 돕니다."', size=15, color=INDIGO_INKY, bold=True,
     align=PP_ALIGN.CENTER, first=True)
notes(s, '품질 질문("정확도는?") 대비: 가드레일 실측 10/10 + 본문 우선 고지 + 페르소나 검수. '
         '유지보수 질문 대비: 모노레포 공용 패키지, 한 번 고치면 전 부 반영.')

# ═════════════════════════════ ⑩ 도입 ═════════════════════════════
s = new_slide()
chrome(s, 10, '도입', '오늘 바로 시작할 수 있습니다')
LW = 7.1
scen = [
    ('graduation-cap', '신입 온보딩', '진단으로 각자 출발점부터 시작해, 배경이 달라도 같은 목적지(4부 트랜스포머)에 도착.'),
    ('building-2', '전사 AI 리터러시', '핵심 경로 55챕터 ≈ 37시간, 진단으로 개인별 단축. 완주 기준이 명확한 사내 과정.'),
    ('briefcase', '실무 직결 트랙', '7부 RAG(사내 챗봇의 수학) · 9부 수치 계산(로컬 모델 선택) · 10부 평가 통계("새 모델이 2점 높대요" 도입 판단) · 11부 에이전트(일을 맡겨도 되나 도입 판단).'),
]
SH3 = 1.45
for i, (ic, t, d) in enumerate(scen):
    y = 1.9 + i * (SH3 + 0.15)
    card(s, X0, y, LW, SH3)
    chip(s, ic, X0 + 0.3, y + (SH3 - 0.6) / 2, 0.6, 'grad')
    tf = box(s, X0 + 1.16, y + 0.12, LW - 1.4, SH3 - 0.24, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, t, size=15, color=INK, bold=True, first=True)
    para(tf, d, size=11.5, color=BODY, space_before=4, line=1.3)
RX = X0 + LW + 0.3
RW = SW - X0 - RX
RH = 3 * SH3 + 2 * 0.15
c = card(s, RX, 1.9, RW, RH, radius=0.16)
grad(c, INK, NAVY2, 90)
chip(s, 'zap', RX + 0.3, 2.2, 0.56, 'glass')
tf = box(s, RX + 1.02, 2.2, RW - 1.2, 0.56, anchor=MSO_ANCHOR.MIDDLE)
para(tf, '온보딩 마찰 0', size=19, color=WHITE, bold=True, first=True)
for i, t in enumerate(['URL / QR 로 즉시 접속', '설치 없이 바로 학습 (로그인은 선택)', '진도 자동 저장 (브라우저)',
                       '사내 계정으로 로그인하면 기기 간 이어짐', '개념 지도 · 용어 대조표로 실무 용어까지']):
    yy = 3.08 + i * 0.47
    icon(s, 'circle-check', RX + 0.32, yy + 0.03, 0.25, INDIGO_300)
    tf = box(s, RX + 0.7, yy, RW - 0.9, 0.32, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, t, size=12, color=SLATE_200, first=True)
rect(s, RX + 0.3, 5.55, RW - 0.6, 0.01, WHITE, alpha=14)
if QR.exists():
    qs = 0.82
    q = rrect(s, RX + RW - 0.3 - qs, 5.68, qs, qs, fill=WHITE, radius=0.08)
    pic_fit(s, QR, RX + RW - 0.3 - qs + 0.05, 5.73, qs - 0.1, qs - 0.1)
    tf = box(s, RX + 0.32, 5.68, RW - qs - 0.8, qs, anchor=MSO_ANCHOR.MIDDLE)
else:
    tf = box(s, RX + 0.32, 5.68, RW - 0.6, 0.7, anchor=MSO_ANCHOR.MIDDLE)
para(tf, '접속 후 첫 화면이 곧 진단 입구라, 안내 비용이 없습니다.', size=11, color=INDIGO_200, first=True, line=1.3)
notes(s, '도입 시나리오 3종: 온보딩·전사 교육·실무 트랙. '
         'QR 은 사내 호스트 확정 후 docs/hackathon/assets/qr.png 로 넣고 덱을 다시 생성하면 오른쪽 카드 아래에 들어간다. '
         '접속 후 첫 화면이 곧 진단 입구라 안내 비용이 없다.')

# ═════════════════════════════ ⑪ 로드맵 + 클로징 ═════════════════════════════
s = new_slide()
chrome(s, 11, '로드맵', '다음 단계: 파일럿에서 전사로', dark=True)
road = [
    ('flag', '파일럿', '동료 5~10명, 완주율·이탈 지점·진단 체감을 측정'),
    ('target', '도입 지점 확정', '온보딩 과정 · 사내 교육 커리큘럼 편입 결정'),
    ('rocket', '전사 확장', '사내 호스트에 올려 계정으로 운영. 기기 간 동기화·도입 현황 대시보드는 이미 구현돼 있습니다.'),
]
ND = 0.66
line = rect(s, X0 + ND / 2, 2.1 + ND / 2 - 0.015, 2 * (W3 + G3), 0.03, INDIGO)
grad(line, INDIGO, VIOLET, 0, 70, 70)
for i, (ic, t, d) in enumerate(road):
    cx = X0 + i * (W3 + G3)
    n = oval(s, cx, 2.1, ND, WHITE)
    grad(n, INDIGO, VIOLET, 45)
    shadow(n, blur=20, dist=0, alpha=55, color=str(INDIGO))
    icon(s, ic, cx + ND * 0.25, 2.1 + ND * 0.25, ND * 0.5, WHITE)
    tf = box(s, cx, 2.98, W3 - 0.2, 0.3)
    para(tf, f'STEP {i + 1}', size=10.5, color=INDIGO_300, bold=True, first=True)
    tf = box(s, cx, 3.28, W3 - 0.2, 0.42)
    para(tf, t, size=18, color=WHITE, bold=True, first=True)
    tf = box(s, cx, 3.75, W3 - 0.3, 0.9)
    para(tf, d, size=12, color=SLATE_300, first=True, line=1.35)
icon(s, 'sparkles', X0, 4.82, 0.26, INDIGO_300)
tf = box(s, X0 + 0.4, 4.78, CW - 0.4, 0.35, anchor=MSO_ANCHOR.MIDDLE)
para(tf, '콘텐츠 확장: 10부 "스케일링 법칙과 평가의 통계"·11부 "에이전트와 추론의 수학" 완결·편입(2026-07-13), 다음 후보: 확산 모델의 수학(조건부)',
     size=11, color=FAINT, first=True)
c = rrect(s, X0, 5.35, CW, 1.35, radius=0.18)
grad(c, INDIGO, VIOLET, 0)
shadow(c, blur=36, dist=0, alpha=50, color=str(INDIGO))
tf = box(s, X0, 5.35, CW, 1.35, anchor=MSO_ANCHOR.MIDDLE)
para(tf, '전 직원의 AI 리터러시,', size=18, color=INDIGO_100, bold=True, align=PP_ALIGN.CENTER, first=True)
para(tf, '비용 0원으로, 오늘부터.', size=30, color=WHITE, bold=True, align=PP_ALIGN.CENTER, space_before=2)
notes(s, '클로징: "저장소를 사내 호스트에 올리는 순간 전 직원의 AI 강사가 생깁니다. 파일럿 대상 추천을 부탁드립니다."')

prs.core_properties.title = '수포자 아카데미 · AI 를 가르치는 AI 강사'
prs.core_properties.author = 'jiyupapa'
prs.save(OUT)
print('저장 →', OUT)
