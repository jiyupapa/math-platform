# scripts/build-pitch-deck.py
# 해커톤 발표 덱 생성 — docs/hackathon/11_pitch_deck.pptx (15장 + 번호 없는 영상 장, 16:9)
#   ⑮ = 부록 · 만든 도구와 AI 를 쓴 곳(2026-10-21 사용자 요청)
# 구성 정본: docs/hackathon/11_pitch_deck.md · 임베드 자산: docs/hackathon/assets/*.png
#   (스크린샷 재생성은 scripts/shoot-deck-assets.mjs, 선 아이콘(assets/icons)은 scripts/render-deck-icons.mjs)
#
# 구성(2026-10-13): 세 기둥 LLM · 개념 온톨로지 · 시스템 다이내믹스(SD)를 뼈대로 — ③에 세 기둥, ⑥ LLM 튜터, ⑦ 온톨로지,
#   ⑧ SD(인과지도·저량-유량도), ⑨ SD 로 짠 도입 전략(12부 캡스톤 모형 시나리오 막대그래프).
# 발표(2026-10-21): 온라인 회의 화면 공유 · 15분 · 슬라이드 + 시연 영상(라이브 시연 없음).
#   영상은 2026-10-24 부터 AI 음성 내레이션이 들어가 약 3분 43초 — 그만큼 ④~⑧ 대본을 줄여 15분을 맞췄다.
#   ③ 다음에 번호 없는 영상 장 — 시연 영상을 덱 안에 넣어 → 한 번에 재생(영상을 다시 만들면 이 덱도 다시 생성).
#   2026-10-29 부터 덱 안 영상은 HyperFrames 판 demo_3min_hyperframes.mp4(같은 내레이션 27문장, 3:43 — 원본 프로젝트는
#   저장소 밖 C:\STUDY\videos\demo-3min, 고치는 법은 그 안 REVIEW.md). 옛 record-demo 녹화본 demo_3min.mp4 는 그대로 둔다.
#   포스터 바탕 assets/demo_frame.png 는 자막 전 프레임: ffmpeg -ss 0.3 -i docs/hackathon/demo_3min_hyperframes.mp4 -frames:v 1 <그 경로>
#   발표자 노트 = 장마다 시간·대본·질문 대비(script()). 같은 내용을 docs/hackathon/15_발표대본.md 로도 내보낸다.
# 디자인(2026-10-12 개편): 표지·⑩ 로컬·⑭ 클로징은 어두운 그라데이션, 나머지는 밝은 바탕 + 그림자 카드.
#   카드마다 선 아이콘(Lucide — 검정 PNG 를 알파 마스크로 받아 여기서 색을 입힌다), 스크린샷은 브라우저 창 틀에 넣는다.
#   색은 제품 UI 의 인디고에 보라를 더한 그라데이션.
#   QR: docs/hackathon/assets/qr.png 가 있으면 ⑬ 오른쪽 카드에 자동으로 들어간다(사내 호스트 확정 후 넣고 재생성).
#
# 사용법:
#   1) python-pptx 설치 (공용 venv 오염 방지 — 임시 폴더에 --target 설치 권장)
#      .venv\Scripts\python.exe -m pip install --target <임시폴더> python-pptx
#   2) PYTHONPATH=<임시폴더> .venv\Scripts\python.exe scripts/build-pitch-deck.py
import os
import re
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont
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
VIDEO = ROOT / 'docs' / 'hackathon' / 'demo_3min_hyperframes.mp4'   # HyperFrames 렌더본(AI 음성 내레이션 + 화면에 박힌 자막, 3:43)
VIDEO_FRAME = ASSETS / 'demo_frame.png'
FONTS = Path(os.environ.get('WINDIR', r'C:\Windows')) / 'Fonts'
OUT = ROOT / 'docs' / 'hackathon' / '11_pitch_deck.pptx'
SCRIPT_MD = ROOT / 'docs' / 'hackathon' / '15_발표대본.md'


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


HEADS = {}   # 장 id → 대본 사본(15_발표대본.md)의 소제목
PACE = 4.8   # 대본 시간 추정: 말하기 속도(음절/초), 문장 끝마다 0.4초 쉼 — 장 전환 여유를 남겨 15분 안에 끝나게
CLOCK = [0.0]


def speech_sec(paras):
    txt = ' '.join(paras)
    return len(re.findall(r'[가-힣0-9A-Za-z]', txt)) / PACE + len(re.findall(r'[.?!]', txt)) * 0.4


def mmss(sec):
    sec = int(round(sec))
    return f'{sec // 60}:{sec % 60:02d}'


def stamp(sec, label=None):
    """대본 머리말 '[0:00–0:35 · 약 35초]' — 누적 시계를 sec 만큼 진행한다(장 순서대로 부를 것)."""
    a = CLOCK[0]
    CLOCK[0] += sec
    return f'[{mmss(a)}–{mmss(CLOCK[0])} · {label or f"약 {int(round(sec / 5) * 5)}초"}]'


def script(slide, body, qa=(), qa_title='[질문이 나오면]'):
    """발표자 노트 = 15분 온라인 발표 대본. body 는 단락 목록(그대로 읽는 말), qa 는 아래에 붙는 준비 항목.
    맨 위 시간은 대본 길이로 계산한다."""
    lines = [stamp(speech_sec(body)), '']
    for b in body:
        lines += [b, '']
    if qa:
        lines += [qa_title] + [f'· {q}' for q in qa]
    notes(slide, '\n'.join(lines).rstrip())


# ── 영상 ────────────────────────────────────────────────────────────────────
def video_poster():
    """영상 장의 포스터(재생 전 화면): 자막 전 첫 프레임을 흐리고 어둡게 깔아(글자끼리 겹쳐 읽히지 않게) 재생 단추와 제목을 얹는다."""
    W, H = 1920, 1080
    im = Image.open(VIDEO_FRAME).convert('RGB').resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(7))
    im = Image.alpha_composite(im.convert('RGBA'), Image.new('RGBA', (W, H), (11, 16, 38, 205)))
    R, k = 80, 4                                  # 단추는 4배로 그려 줄여 가장자리를 매끄럽게
    btn = Image.new('RGBA', (2 * R * k, 2 * R * k), (0, 0, 0, 0))
    d = ImageDraw.Draw(btn)
    d.ellipse((0, 0, 2 * R * k - 1, 2 * R * k - 1), fill=(255, 255, 255, 245))
    c, r = R * k, R * k * 0.42                    # 삼각형 무게중심을 원 중심에
    d.polygon([(c + r, c), (c - r / 2, c - r * 0.866), (c - r / 2, c + r * 0.866)], fill=(79, 70, 229, 255))
    im.alpha_composite(btn.resize((2 * R, 2 * R), Image.LANCZOS), (W // 2 - R, 410 - R))
    d = ImageDraw.Draw(im)
    d.text((W // 2, 575), '실제 화면으로 보는 수포자 아카데미', font=ImageFont.truetype(str(FONTS / 'malgunbd.ttf'), 62),
           fill=(255, 255, 255), anchor='mm')
    d.text((W // 2, 655), '약 4분 · 내레이션과 자막으로 설명합니다', font=ImageFont.truetype(str(FONTS / 'malgun.ttf'), 36),
           fill=(224, 231, 255), anchor='mm')
    buf = BytesIO()
    im.convert('RGB').save(buf, 'JPEG', quality=90)
    buf.seek(0)
    return buf


def video_ms(path):
    """mp4 길이(ms) — moov/mvhd 의 timescale·duration (record-demo 녹화본·HyperFrames 렌더본 모두 moov 가 앞에 있다)."""
    data = Path(path).read_bytes()
    i = data.find(b'mvhd')
    if data[i + 4] == 1:
        ts, dur = int.from_bytes(data[i + 24:i + 28], 'big'), int.from_bytes(data[i + 28:i + 36], 'big')
    else:
        ts, dur = int.from_bytes(data[i + 16:i + 20], 'big'), int.from_bytes(data[i + 20:i + 24], 'big')
    return round(dur * 1000 / ts)


def play_on_click(slide, spid, ms):
    """영상을 클릭 순서 1번으로: 이 장에서 → (또는 클릭) 한 번에 재생. python-pptx 기본값은 재생 단추만 띄운다.
    XML 은 PowerPoint 에서 '클릭할 때 재생' 효과를 넣고 저장한 모양 그대로다(도형 id·길이만 바꿈)."""
    sld = slide._element
    old = sld.find(qn('p:timing'))
    tgt = f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl>'
    new = parse_xml(
        f'<p:timing {nsdecls("p")}><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot">'
        '<p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
        '<p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>'
        '<p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
        '<p:par><p:cTn id="5" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="clickEffect">'
        '<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
        f'<p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="6" dur="{ms}" fill="hold"/>{tgt}</p:cBhvr></p:cmd>'
        '</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn>'
        '<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
        '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
        '<p:video><p:cMediaNode vol="100000"><p:cTn id="7" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/>'
        f'</p:stCondLst></p:cTn>{tgt}</p:cMediaNode></p:video></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>')
    old.addprevious(new)
    sld.remove(old)


# ── 슬라이드 틀 ──────────────────────────────────────────────────────────────
prs = Presentation()
prs.slide_width = I(SW)
prs.slide_height = I(SH)
BLANK = prs.slide_layouts[6]
TOTAL = 15


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
              ('  ·  수포자가 만든 AI·수학 공부 자료', {})], size=9.5, color=FAINT if dark else MUTED, first=True)
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
    HEADS[slide.slide_id] = f'{no:02d} {kicker} · {title}'


# ═════════════════════════════ ① 타이틀 ═════════════════════════════
s = new_slide()
dark_bg(s)
pill(s, '개인 학습 프로젝트', 0.95, 1.45, size=12, fill=WHITE, alpha=10, color=INDIGO_200,
     line=WHITE, line_alpha=20)
tf = box(s, 0.95, 1.95, 6.0, 1.0)
para(tf, '수포자 아카데미', size=54, color=WHITE, bold=True, first=True)
tf = box(s, 0.95, 3.0, 6.0, 0.6)
para(tf, [('수포자가 만든 AI·수학 공부 자료', {'grad': (INDIGO_300, LILAC)})], size=26, bold=True, first=True)
tf = box(s, 0.95, 3.85, 5.8, 0.45)
para(tf, 'AI 학습의 기반이 되는 수학을 공부하려고 만들었습니다', size=16, color=SLATE_200, first=True)
x = 0.95
for i, (ic, t) in enumerate([('brain-circuit', 'LLM 튜터'), ('network', '개념 온톨로지'), ('repeat', '시스템 다이내믹스')]):
    sp_, w = pill(s, t, x, 4.5, size=12, fill=WHITE, alpha=10, color=WHITE, h=0.42, padx=0.2,
                  line=WHITE, line_alpha=20)
    x += w
    if i < 2:
        tf = box(s, x + 0.05, 4.5, 0.3, 0.42, anchor=MSO_ANCHOR.MIDDLE)
        para(tf, '+', size=16, color=INDIGO_300, bold=True, align=PP_ALIGN.CENTER, first=True)
        x += 0.4
for i, (n, t) in enumerate([('12부', '130챕터 완결'), ('₩0', 'AI 사용료'), ('브라우저', '학습·진단은 설치 없이')]):
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
HEADS[s.slide_id] = '01 표지 · 수포자 아카데미'
script(s, [
    '학교에서 배운 수학, 얼마나 기억나시나요? 학생 때 일찌감치 포기한 분도 있고, 졸업하고 오래 지나 다 잊어버린 분도 있습니다. 어느 쪽이든 지금 처지는 거의 같습니다. 저도 그런 수포자였습니다.',
    '그런데 이제는 매일 LLM 을 사용합니다. 답이 어떻게 나오는지는 모른 채로요. 그래서 그 바탕에 있는 수학을 공부하려고 저 혼자 쓸 자료를 만들기 시작했습니다.',
    '만들다 보니 같이 보면 좋겠다는 생각이 들어 하나씩 늘렸고, 그렇게 12부, 130개 챕터가 됐습니다.',
    '제 목표는 AI 학습의 기반이 되는 수학을 공부하는 것입니다. 이름은 아카데미지만 전문적인 수학 강좌는 아니고, 수포자가 공부하면서 만든 자료입니다.',
], [
    '화면 전체가 아니라 슬라이드 쇼 창만 공유한다. 그래야 발표자 보기의 이 노트가 청중에게 보이지 않는다. '
    '다른 기기로 회의에 들어가 노트가 안 보이는지, 영상이 끊기지 않고 소리가 들리는지 미리 확인한다.',
    '영상에 내레이션(AI 음성)이 있다. 화면 공유를 시작할 때 컴퓨터 소리 공유(소리 포함)를 켜고, 동영상 최적화 옵션이 있으면 함께 켠다.',
    '영상은 ③ 다음 장(번호 없음). 그 장에서 → 를 한 번 누르면 재생되고, 끝나면 → 로 넘어간다.',
    '목표 15분. 장마다 맨 위의 시간은 대본 길이로 잰 예상치(초당 4.8음절)다. 남는 시간은 질의응답(질문 카드는 ⑮ 노트).',
], qa_title='[발표 전 점검]')

# ═════════════════════════════ ② 문제 ═════════════════════════════
s = new_slide()
chrome(s, 2, '왜 만들었나', 'AI 는 매일 쓰는데, 원리는 잘 모릅니다')
chip(s, 'users', X0, 1.95, 0.6)
tf = box(s, X0, 2.75, 5.35, 1.6)
para(tf, 'AI 는 매일 씁니다.', size=21, color=INK, bold=True, first=True, line=1.2)
para(tf, [('그런데 원리는 ', {}), ('잘 모릅니다', {'color': ROSE, 'bold': True}), ('.', {})],
     size=17.5, color=BODY, space_before=8, line=1.25)
para(tf, [('막히는 곳은 대개 ', {}), ('수학', {'color': INDIGO, 'bold': True}), ('입니다.', {})],
     size=17.5, color=BODY, space_before=2, line=1.25)
tf = box(s, X0, 4.25, 5.35, 0.6)
para(tf, '프롬프트를 잘 쓰는 것과 도구를 이해하는 것은 다릅니다. 원리를 알면 한계와 보안을 판단하기가 쉬워집니다.',
     size=12.5, color=MUTED, first=True, line=1.35)
c = card(s, X0, 5.15, 5.35, 1.5)
grad(c, INDIGO, VIOLET, 20)
icon(s, 'quote', X0 + 5.35 - 0.7, 5.15 + 1.5 - 0.62, 0.5, WHITE, alpha=0.22)
tf = box(s, X0 + 0.3, 5.32, 4.55, 1.2)
para(tf, '그래서 시작 지점을 다르게 잡았습니다', size=15.5, color=WHITE, bold=True, first=True)
para(tf, '아는 정도가 모두 다르니, 진단으로 시작 지점을 정하고 학습 순서를 짭니다.',
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
para(tf, '순서대로 듣다 보면 AI 까지 가기 전에 지치기 쉽습니다.', size=12, color=MUTED, first=True)
rect(s, IX, 4.25, IW, 0.012, LINE)
pill(s, '이 자료의 순서: 4부까지 먼저', IX, 4.45, size=11)
chevrons(s, [('1부', '전반'), ('3부', '전반'), ('4부', '트랜스포머'), ('…', '')], IX, 4.95,
         (IW + 3 * (DEPTH - GAP)) / 4,
         [(INDIGO_100, INDIGO_INKY), (INDIGO_100, INDIGO_INKY), ('grad', WHITE), (C('F1F5F9'), MUTED)])
tf = box(s, IX, 5.92, IW, 0.6)
para(tf, '선형대수와 확률은 앞부분만 먼저 배우고 트랜스포머(4부)로 갑니다. 나머지 수학은 그다음입니다.',
     size=12, color=BODY, first=True, line=1.3)
script(s, [
    'AI 를 잘 쓰는 것과 AI 를 아는 것은 다릅니다. 원리를 알면 답을 어디까지 믿을지, 어떤 자료는 넣으면 안 되는지 스스로 판단하기가 쉬워집니다.',
    '문제는 원리로 가는 길에 수학이 있다는 것입니다. 오른쪽 위처럼 선형대수, 미분, 확률을 차례로 듣다 보면 AI 까지 가기 전에 지치기 쉽습니다.',
    '그래서 순서를 바꿨습니다. 오른쪽 아래처럼 선형대수와 확률은 앞부분만 먼저 배우고, 곧바로 LLM 의 바탕인 트랜스포머로 갑니다. 나머지 수학은 그다음에 배웁니다.',
    '아는 정도가 사람마다 다르니, 시작하는 지점도 사람마다 다르게 잡았습니다.',
], [
    '"왜 4부가 먼저인가요?" → 직원이 쓰는 LLM 의 바탕이 트랜스포머(4부)다. 거기 닿기 전에 지치지 않게 1부 전반·3부 전반만 먼저 하고, '
    '미분(2부)을 비롯한 나머지 수학은 트랜스포머를 본 다음에 배운다(1→2→3→4→5 순서가 아니다).',
])

# ═════════════════════════════ ③ 해법 + 세 기둥 ═════════════════════════════
s = new_slide()
chrome(s, 3, '구성', '진단하고, 학습 순서를 짜고, 챕터에서 공부합니다')
cols = [
    ('stethoscope', '진단 (5분)', '12문항 · 관문 4개', '벡터·확률·미분·log 감각을 관문 단위로 잽니다. 시험이 아니라 시작점 확인용.'),
    ('route', '개인 경로', '결정은 규칙 엔진이', '아는 단계는 접고, 부족한 수학은 쓰이기 직전에. 근거가 화면에 나옵니다.'),
    ('graduation-cap', '챕터 + 튜터', '12부 130챕터 · 로컬 LLM', '조작하는 실험실 → 자동채점 → 막히면 지금 보는 장을 아는 AI 튜터.'),
]
W3 = 3.6
G3 = (CW - 3 * W3) / 2
TOP, TH3 = 1.85, 2.12
for i, (ic, t1, t2, body_txt) in enumerate(cols):
    cx = X0 + i * (W3 + G3)
    card(s, cx, TOP, W3, TH3)
    chip(s, ic, cx + 0.28, TOP + 0.26, 0.56, 'grad')
    tf = box(s, cx + 0.98, TOP + 0.26, W3 - 1.9, 0.56, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, t1, size=17, color=INK, bold=True, first=True)
    tf = box(s, cx + W3 - 1.0, TOP + 0.16, 0.75, 0.6)
    para(tf, f'0{i + 1}', size=30, color=INDIGO_100, bold=True, align=PP_ALIGN.RIGHT, first=True)
    pill(s, t2, cx + 0.28, TOP + 0.98, size=10.5)
    tf = box(s, cx + 0.28, TOP + 1.42, W3 - 0.56, 0.62)
    para(tf, body_txt, size=11.5, color=BODY, first=True, line=1.25)
    if i < 2:
        arrow_dot(s, cx + W3 + G3 / 2, TOP + TH3 / 2, 0.44)
PY = TOP + TH3 + 0.22
PH = 6.74 - PY
c = card(s, X0, PY, CW, PH, radius=0.18)
grad(c, INK, NAVY2, 0)
tf = box(s, X0 + 0.35, PY + 0.16, CW - 0.7, 0.42, anchor=MSO_ANCHOR.MIDDLE)
para(tf, [('이 구성을 받치는 세 기둥', {'color': WHITE, 'size': 16}),
          ('     LLM · 개념 온톨로지 · 시스템 다이내믹스', {'color': INDIGO_300, 'size': 12}),
          ('   (6~9장에서 하나씩)', {'color': FAINT, 'size': 11, 'bold': False})], bold=True, first=True)
pillars = [
    ('brain-circuit', 'LLM 튜터', '질문에 답하는 로컬 LLM', '지금 보는 장을 알고, 다른 부의 개념은 "N부 M장"으로 안내합니다. 내 PC 에서 돌아 사용료가 없습니다.'),
    ('network', '개념 온톨로지', '개념 사이의 관계 지도', '개념 127개와 관계 520개를 한 파일에. 진단·경로·튜터·검색이 모두 이 지도를 읽습니다.'),
    ('repeat', '시스템 다이내믹스', '시간에 따른 변화 모형', '12부 인과지도·저량-유량도. 이 자료가 사내에 어떻게 퍼질지도 이 모형으로 돌려 봤습니다.'),
]
PG = 0.25
PW = (CW - 0.7 - 2 * PG) / 3
PIY = PY + 0.7
PIH = PH - 0.9
for i, (ic, name, role, d) in enumerate(pillars):
    px = X0 + 0.35 + i * (PW + PG)
    rrect(s, px, PIY, PW, PIH, fill=WHITE, alpha=7, radius=0.14, line=WHITE, lw=0.75, line_alpha=16)
    chip(s, ic, px + 0.22, PIY + 0.2, 0.52, 'glass')
    tf = box(s, px + 0.88, PIY + 0.16, PW - 1.05, 0.62, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, name, size=15, color=WHITE, bold=True, first=True)
    para(tf, role, size=10.5, color=INDIGO_300, bold=True)
    tf = box(s, px + 0.22, PIY + 0.88, PW - 0.44, PIH - 0.95)
    para(tf, d, size=11, color=SLATE_200, first=True, line=1.3)
script(s, [
    '구성은 세 단계입니다. 먼저 진단을 통해 어디까지 기억하는지 확인합니다. 시험이 아니라 시작 지점을 정하기 위한 문항입니다.',
    '그 결과로 학습 순서를 짭니다. 이미 아는 단계는 접고, 모자란 수학은 쓰이기 바로 앞에 넣습니다. 왜 이렇게 짰는지도 화면에 보여 줍니다.',
    '공부는 챕터에서 합니다. 직접 조작해 보는 실험실, 바로 채점되는 문제, 막힐 때 물어볼 수 있는 AI 튜터가 있습니다.',
    '아래 띠는 이 구성을 받치는 세 기둥입니다. LLM 튜터, 개념 온톨로지, 시스템 다이내믹스입니다. 설명보다 화면이 빠르니 영상을 먼저 보시겠습니다.',
], [
    '"진단이 틀리면 경로도 틀리지 않나요?" → 진단은 출발점만 정한다. 학습 중 퀴즈 결과와 복습 표시를 포털이 읽어 다음 목적지를 다시 권하고, '
    '"다시 진단하기"로 언제든 경로를 새로 짤 수 있다.',
    '"경로는 누가 정하나요?" → 규칙 엔진(관문 4개 통과·미통과). 같은 답이면 언제나 같은 경로이고 근거가 화면에 나온다. AI 는 그 결정을 풀어 말할 뿐이다.',
])

# ═════════════════════════════ 영상 (번호 없는 장) ═════════════════════════════
# 온라인 회의에서 슬라이드 쇼 창만 공유한 채 창을 바꾸지 않고 튼다. 장 가득(16:9) — 화면 공유로 작아져도 자막이 읽히게.
# 바닥글·번호를 달지 않아 ①~⑭ 번호와 렌더 파일 이름(slideNN.png)이 그대로다(이 장은 slide03_video.png).
s = new_slide()
mv = s.shapes.add_movie(str(VIDEO), 0, 0, I(SW), I(SH), poster_frame_image=video_poster(), mime_type='video/mp4')
play_on_click(s, mv.shape_id, video_ms(VIDEO))
HEADS[s.slide_id] = '영상 (번호 없음) · 실제 화면으로 보는 수포자 아카데미'
intro = '실제 화면을 4분 정도 영상으로 보시겠습니다. 처음 들어온 사람이 만나는 순서 그대로입니다.'
outro = '보신 장면 가운데 몇 가지만 짚겠습니다.'
vs = round(video_ms(VIDEO) / 1000)
notes(s, '\n'.join([
    stamp(vs + speech_sec([intro, outro]), f'영상 {vs // 60}분 {vs % 60}초 + 앞뒤 말'),
    '',
    '[진행]',
    '· 이 장에서 → 를 한 번 누르면 재생된다. 끝나면 마지막 화면에 멈추니 → 로 다음 장. 재생 중에 → 를 누르면 영상이 끊기고 넘어간다.',
    '· AI 음성 내레이션과 자막이 함께 설명한다. 영상 중에는 말하지 않는다. 소리가 안 들린다는 반응이 오면 컴퓨터 소리 공유를 확인.',
    '',
    '[재생 전]',
    intro,
    '',
    '[재생 중 · 장면 순서(내레이션이 설명하니 말하지 않는다)]',
    '0:16 진단 · 0:41 기둥 1 LLM 튜터 · 0:49 LLM 해부 · 1:18 튜터 · 1:50 기둥 2 개념 온톨로지(개념 지도) · '
    '2:18 기둥 3 시스템 다이내믹스 · 2:53 캡스톤 · 3:23 숫자 한 장',   # demo_3min_hyperframes 장면 시작 시각(영상을 다시 만들면 고칠 것 — 원본의 tools/build-root.mjs SCENES)
    '',
    '[끝나면]',
    outro,
]))

# ═════════════════════════════ ④ 데모 1 — 진단 ═════════════════════════════
s = new_slide()
chrome(s, 4, '데모 1 · 진단', '진단 5분, 커리큘럼이 다시 그려진다')
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
para(tf, '예시(벡터·확률은 기억하고 미분·log 는 잊은 경우): 130챕터 중 55챕터, 예상 31.9시간. 틀린 문항은 개념 이름(온톨로지)으로 돌아옵니다.',
     size=11.5, color=BODY, space_before=5, line=1.3)
_, w = pill(s, '130챕터 → 55챕터 · 31.9시간', RX + 0.5, 5.98, size=10, fill=TEAL_SOFT, color=TEAL_INK, padx=0.12)
pill(s, '결정은 규칙: 근거가 화면에', RX + 0.5 + w + 0.08, 5.98, size=10, padx=0.12)
script(s, [
    '진단을 마치면 학습 지도가 그 사람에게 맞게 다시 그려집니다. 벡터와 확률은 기억하는데 미분과 로그는 잊은 경우라면, 130개 챕터 가운데 55개, 약 32시간 분량으로 줄어듭니다.',
    '틀린 문제는 점수 대신 다시 볼 위치로 안내합니다. "도함수, 2부 3장" 같은 식입니다.',
], [
    '"왜 이 경로인가요?" → 화면의 근거(관문 통과·미통과)로 답한다. 결정은 규칙이라 같은 답이면 언제나 같은 경로가 나온다(재현 가능).',
    '"LLM 이 경로를 정하나요?" → 아니다. 결정은 규칙, LLM 은 그 결정을 풀어 말하기만 한다(⑥ "결정은 규칙, 말은 LLM").',
])

# ═════════════════════════════ ⑤ 데모 2 — 라이브 투어 ═════════════════════════════
s = new_slide()
chrome(s, 5, '데모 2 · LLM 내부', '직접 쓴 문장이 LLM 안에서 처리되는 과정')
cells = [
    ('lab_ch2_tokenize.png', '토큰화: 문장이 조각·ID 로'),
    ('lab_ch3_embedding.png', '임베딩: 단어가 좌표로'),
    ('lab_ch6_attention.png', '어텐션: Q·K·V 가중치'),
    ('lab_ch9_output.png', '출력층: 다음 단어 확률'),
    ('lab_ch12_sampling.png', '샘플링: temperature·top-k'),
    ('lab_notebook.png', 'Jupyter 노트북: 같은 예제를 코드로'),   # scripts/shoot-deck-notebook.mjs 로 찍은 실물 화면(4부 6장)
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
script(s, [
    '이 화면에서는 직접 쓴 문장을 넣어 봅니다. LLM 이 문장을 토큰으로 자르고, 어텐션으로 단어끼리의 관계를 계산하고, 확률로 다음 단어를 고르는 과정을 조작하면서 확인할 수 있습니다.',
    '각 단계에 쓰이는 수학은 1부, 3부, 5부에서 배웁니다. 마지막 화면처럼, 같은 예제를 Jupyter 노트북에서 코드로 직접 돌려 볼 수도 있습니다.',
], [
    '여섯째 화면은 실제 JupyterLab 으로 연 4부 6장 노트북이다. 셋째 화면의 어텐션 실험실과 같은 예제라 점수도 1.70 · 1.70 · 0.80 으로 같다.',
    '다섯 화면은 4부의 실험실이다: 토큰화(2장) → 임베딩(3장) → 어텐션(6장) → 다음 단어 확률(9장) → 샘플링·temperature(12장). '
    '학습자는 자기 문장을 넣어 직접 움직여 본다.',
])

# ═════════════════════════════ ⑥ 기둥 1 · LLM ═════════════════════════════
s = new_slide()
chrome(s, 6, '기둥 1 · LLM', '로컬 LLM 튜터: 개념 지도를 읽고 답합니다')
LW6 = 4.25
fh = browser(s, ASSETS / 'tutor_sd.png', X0, 1.85, LW6)
tf = box(s, X0, 1.85 + fh + 0.08, LW6, 0.28)
para(tf, '실제 화면: 12부 5장(오일러법)의 튜터에게 다른 부 개념을 묻다', size=10, color=MUTED, align=PP_ALIGN.CENTER, first=True)
RX = X0 + LW6 + 0.35
RW = SW - X0 - RX
card(s, RX, 1.85, RW, 2.42)
tf = box(s, RX + 0.25, 1.98, RW - 0.5, 0.3)
para(tf, [('답이 나오는 길', {'color': INDIGO}), ('   벡터 DB 없이, 결정적으로', {'color': MUTED, 'size': 10.5, 'bold': False})],
     size=12.5, bold=True, first=True)
steps = [
    ('message-square-text', '질문', '"경사하강은 어디서 배워요?"'),
    ('network', '개념 카드', '온톨로지에서 꺼낸 카드: 2부 9장 · 먼저 그래디언트 (약 100토큰)'),
    ('cpu', '로컬 LLM', '지금 보는 장 맥락 + 카드를 내 PC 의 경량 모델에'),
    ('circle-check', '답', '"2부 9장에서 배워요. 먼저 그래디언트를…"'),
]
SG = 0.3
SW4 = (RW - 0.5 - 3 * SG) / 4
for i, (ic, t, d) in enumerate(steps):
    sx = RX + 0.25 + i * (SW4 + SG)
    sy = 2.4
    rrect(s, sx, sy, SW4, 1.7, fill=PANEL, radius=0.1, line=LINE, lw=0.75)
    chip(s, ic, sx + 0.14, sy + 0.14, 0.42)
    tf = box(s, sx + 0.62, sy + 0.14, SW4 - 0.7, 0.42, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, t, size=12, color=INK, bold=True, first=True)
    tf = box(s, sx + 0.14, sy + 0.66, SW4 - 0.24, 1.0)
    para(tf, d, size=9.5, color=BODY, first=True, line=1.22)
    if i < 3:
        arrow_dot(s, sx + SW4 + SG / 2, sy + 0.85, 0.28)
card(s, RX, 4.42, RW, 1.4)
uses = [
    ('bot', '챕터 튜터', '전 12부 · 지금 보는 장을 압니다'),
    ('route', '추천 설명', '규칙이 정한 경로를 쉬운 말로'),
    ('messages-square', '메모에서 AI에게 묻기', '메모 속 질문을 바로 튜터에게'),
    ('notebook-pen', '노트북 튜터', '주피터에서도 같은 개념 카드로'),
]
UG = 0.25
UW = (RW - 0.5 - UG) / 2
for i, (ic, t, d) in enumerate(uses):
    r, k = divmod(i, 2)
    ux = RX + 0.25 + k * (UW + UG)
    uy = 4.52 + r * 0.62
    chip(s, ic, ux, uy + 0.06, 0.42)
    tf = box(s, ux + 0.55, uy, UW - 0.6, 0.56, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, t, size=11.5, color=INK, bold=True, first=True)
    para(tf, d, size=9.5, color=MUTED, line=1.15)
c = card(s, RX, 5.97, RW, 0.77, radius=0.14)
grad(c, INK, NAVY2, 0)
tf = box(s, RX + 0.3, 5.97, RW - 0.5, 0.77, anchor=MSO_ANCHOR.MIDDLE)
para(tf, [('"결정은 규칙, 말은 LLM"', {'color': WHITE, 'size': 15}),
          ('    가드레일 10/10 · 추가 지연 0초 · 완답 5~6초 · ₩0', {'color': INDIGO_300, 'size': 11})], bold=True, first=True)
script(s, [
    '이제 이 공부를 돕는 세 기둥을 하나씩 보겠습니다. 첫째, LLM 튜터입니다.',
    '영상에서 12부를 공부하던 사람이 "경사하강은 어디서 배워요?" 하고 물었습니다. 튜터는 2부 9장이라고 답하고, 그 전에 그래디언트부터 보라고 안내했습니다.',
    '다른 부의 내용까지 답할 수 있는 것은, 답하기 전에 개념 지도에서 해당 개념의 정보를 찾아 프롬프트에 함께 넣기 때문입니다. 같은 질문을 세 번 해 봐도 같은 위치를 답했습니다.',
    '원칙도 하나 정했습니다. 무엇을 배울지는 정해진 규칙이 결정하고, LLM 은 설명만 맡습니다. LLM 이 가끔 틀려도 학습 순서는 흔들리지 않게 하려는 것입니다.',
], [
    '"어떤 모델인가요?" → 각자 PC 의 Ollama 로 도는 경량 로컬 모델(gemma4:e2b). 카드는 시스템 프롬프트에 붙인다. 카드 없이는 "N부 2장" 빈칸을 그대로 냈다(실측).',
    '"틀린 답을 하면요?" → 튜터 창에 "로컬 AI 답변이라 가끔 틀릴 수 있어요. 본문 설명이 우선!"을 늘 띄운다. 경로 결정에는 LLM 이 끼지 않는다.',
    '메모에서 AI에게 묻기: 협업 메모의 질문을 튜터에게 바로 보내고, 답은 누를 때만 메모로 저장된다.',
    '프롬프트에 넣는 정보의 실제: 개념 지도(온톨로지)에서 꺼낸 개념 카드(배우는 곳 · 먼저 알아야 할 것 · 다시 쓰이는 곳, 약 100토큰)를 질문과 함께 로컬 모델에 넘긴다. 벡터 DB 는 쓰지 않는다.',
    'LLM 이 일하는 네 곳: 챕터 튜터 · 추천 설명 · 메모에서 AI에게 묻기 · 노트북 튜터. 주제 이탈 질문 차단 10/10, 그 때문에 늦어지는 시간 0초.',
])

# ═════════════════════════════ ⑦ 기둥 2 · 개념 온톨로지 ═════════════════════════════
s = new_slide()
chrome(s, 7, '기둥 2 · 개념 온톨로지', '개념 지도: 개념 127 · 관계 520')
LW = 7.4
card(s, X0, 1.85, LW, 4.45)
pic_fit(s, ASSETS / 'concept_map.png', X0 + 0.16, 2.0, LW - 0.32, 4.15)
tf = box(s, X0, 6.4, LW, 0.4)
para(tf, '개념 지도: 12부 "S자 성장"을 누르면 먼저 알아야 할 사슬이 2부 시그모이드·지수와 로그까지 이어집니다',
     size=10.5, color=MUTED, align=PP_ALIGN.CENTER, first=True, line=1.25)
RX = X0 + LW + 0.28
RW = SW - X0 - RX
facts = [
    ('network', '개념 127 · 관계 520', '정본 파일 하나에 "먼저 알아야 · 다시 쓰인다 · 비유"를 부·장·섹션 앵커까지. 12부 SD 개념 13개도 같은 지도에.'),
    ('book-open', '읽는 곳 9', '검색 · 튜터(웹·노트북) · 챕터 띠 · 개념 지도 · 용어 대조표 · 복습 경로 · 진단 · 질문 집계'),
    ('shield-check', '커밋마다 검사', '위치·앵커 실재, 선수 순환, 본문 링크 185개를 검사기가 확인합니다.'),
]
FH = 1.12
for i, (ic, t, d) in enumerate(facts):
    y = 1.85 + i * (FH + 0.1)
    card(s, RX, y, RW, FH)
    chip(s, ic, RX + 0.2, y + (FH - 0.5) / 2, 0.5)
    tf = box(s, RX + 0.86, y + 0.06, RW - 1.02, FH - 0.12, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, t, size=13.5, color=INDIGO, bold=True, first=True)
    para(tf, d, size=10.5, color=BODY, space_before=2, line=1.25)
y = 1.85 + 3 * (FH + 0.1) + 0.06
card(s, RX, y, RW, 6.74 - y)
tf = box(s, RX + 0.22, y + 0.1, RW - 0.4, 0.26)
para(tf, 'LLM 이 이 지도를 읽으면 (튜터 실측)', size=10.5, color=INDIGO, bold=True, first=True)
for j, (ic, col, label, quote) in enumerate([
        ('circle-x', ROSE, '카드 없이', '"N부 2장"(자리표시자)'),
        ('circle-check', TEAL, '카드 붙이면', '"2부 6장, 먼저 도함수 2부 3장"')]):
    ry = y + 0.38 + j * 0.32
    icon(s, ic, RX + 0.22, ry + 0.02, 0.24, col)
    tf = box(s, RX + 0.56, ry, RW - 0.7, 0.3, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, [(label + '  ', {'color': MUTED}), (quote, {'color': INK, 'bold': True})], size=10.5, first=True)
script(s, [
    '둘째, 개념 온톨로지입니다. 이름은 어렵지만 개념 사이의 관계를 적어 둔 지도라고 보시면 됩니다. 무엇을 먼저 알아야 하는지, 나중에 어디서 다시 쓰이는지를 개념 127개, 관계 520개로 정리했습니다.',
    '공부하다 막히는 이유 중 하나는 지금 배우는 것이 어디에 쓰이는지 모른다는 것입니다. 이 지도에서는 12부의 S자 성장이 2부의 시그모이드와 이어져 있는 것을 바로 볼 수 있습니다.',
    '검색, 튜터, 복습 안내가 모두 이 파일 하나를 읽습니다. 그래서 한 번 고치면 아홉 곳에 함께 반영됩니다.',
    '효과는 오른쪽 아래에 있습니다. 이 정보를 넣기 전에는 튜터가 "N부 2장"처럼 빈칸을 그대로 답했지만, 넣은 뒤에는 정확한 위치를 답했습니다.',
], [
    '"그냥 JSON 아닌가요?" → 관계에 종류(먼저 알아야 · 다시 쓰인다 · 비유)가 있고, 검사기가 규칙을 지키며, 아홉 곳이 같은 파일을 읽어 같은 답을 한다. '
    '형식이 아니라 이 약속이 온톨로지다.',
    '"왜 벡터 DB·RAG 로 안 했나요?" → 140여 개 장 규모에서는 손으로 다듬은 그래프가 더 정확하고, 같은 질문에 같은 카드를 내며, 인터넷 없이 돈다. '
    '7부 8장이 바로 이 기법(GraphRAG)을 가르친다.',
    '아홉 곳: 검색 · 튜터(웹·노트북) · 챕터 위 개념 띠 · 개념 지도 · 용어 대조표 · 복습 경로 · 진단 · 질문 집계. 고칠 때마다 검사기가 위치 · 앵커 · 선수 순환 · 본문 링크 185개를 확인한다.',
])

# ═════════════════════════════ ⑧ 기둥 3 · 시스템 다이내믹스 ═════════════════════════════
s = new_slide()
chrome(s, 8, '기둥 3 · 시스템 다이내믹스', '시간에 따른 변화를 모형으로: 인과지도와 저량-유량도')
HG = 0.3
HW = (CW - HG) / 2
HY, HH = 1.85, 3.0
for i, (fn, tag, title, cap) in enumerate([
        ('sd_cld.png', 'CLD', '인과지도', '원인 → 결과를 +/− 로 잇고 강화 루프(R)·균형 루프(B)를 찾습니다'),
        ('sd_sfd.png', 'SFD', '저량-유량도', '쌓이는 것(저량)과 흐르는 것(유량)으로 바꿔 직접 시뮬레이션합니다')]):
    hx = X0 + i * (HW + HG)
    card(s, hx, HY, HW, HH)
    _, w = pill(s, tag, hx + 0.24, HY + 0.2, size=10.5)
    tf = box(s, hx + 0.36 + w, HY + 0.17, HW - w - 0.6, 0.38, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, title, size=14, color=INK, bold=True, first=True)
    pic_fit(s, ASSETS / fn, hx + 0.2, HY + 0.62, HW - 0.4, HH - 1.08)
    tf = box(s, hx + 0.24, HY + HH - 0.4, HW - 0.48, 0.3, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, cap, size=10.5, color=MUTED, align=PP_ALIGN.CENTER, first=True)
BG3 = 0.25
BW3 = (CW - 2 * BG3) / 3
BY = HY + HH + 0.2
BH = 6.74 - BY
bottom = [
    ('sliders-horizontal', '같은 수학, 다른 이름', ['오일러법 ≈ 경사하강 (학습률 = 시간 간격)', '1차 지연 = EMA (모멘텀·Adam)', 'S자 성장 = 시그모이드']),
    ('brain-circuit', 'AI 가 만드는 고리', '모델 붕괴 · 보상 해킹 · 데이터 플라이휠을 루프로 읽고, 어디를 끊을지 봅니다'),
    ('chart-spline', '12부 13챕터', '실험실 13개 · 노트북 13권. 도착점은 사내 AI 도입을 모형으로 미리 돌려 보는 캡스톤'),
]
for i, (ic, t, d) in enumerate(bottom):
    bx = X0 + i * (BW3 + BG3)
    card(s, bx, BY, BW3, BH)
    chip(s, ic, bx + 0.24, BY + 0.22, 0.46, color=TEAL if i == 0 else INDIGO)
    tf = box(s, bx + 0.84, BY + 0.22, BW3 - 1.0, 0.46, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, t, size=13.5, color=INK, bold=True, first=True)
    tf = box(s, bx + 0.24, BY + 0.78, BW3 - 0.45, BH - 0.85)
    for k, line_txt in enumerate(d if isinstance(d, list) else [d]):
        para(tf, line_txt, size=10.5, color=BODY, first=(k == 0), line=1.28)
script(s, [
    '셋째, 시스템 다이내믹스입니다. 시간이 지나면서 일이 어떻게 전개되는지 모형으로 살펴보는 방법입니다.',
    '왼쪽 그림은 원인과 결과를 화살표로 이은 것입니다. 입소문처럼 스스로 커지는 고리가 있고, 사용자가 다 차면 멈추는 고리가 있습니다. 오른쪽처럼 숫자를 넣으면 몇 달 뒤, 몇 년 뒤까지 계산해 볼 수 있습니다.',
    '여기에도 AI 와 같은 수학이 나옵니다. 모형을 한 단계씩 계산하는 오일러법은 AI 가 학습하는 경사하강과 식의 꼴이 같습니다.',
], [
    '같은 수학 더: 1차 지연 = EMA(모멘텀·Adam), S자 성장 = 시그모이드. AI 가 만드는 고리(모델 붕괴·보상 해킹·데이터 플라이휠)도 루프로 읽는다.',
    '12부 13챕터: 실험실 13개 · 노트북 13권. 도착점은 사내 AI 도입 모형(Bass 확산 + 이탈)인 캡스톤, 다음 장에서 보여 준다.',
    '"같은 수학"의 실제: 오일러법(다음 값 = 지금 값 + 변화율 × 시간 간격)과 경사하강(다음 가중치 = 지금 가중치 − 학습률 × 기울기)은 같은 꼴이고, 학습률이 시간 간격 자리에 온다.',
    '그림 용어: 스스로 커지는 고리 = 강화 루프 R, 다 차면 멈추는 고리 = 균형 루프 B, 오른쪽 그림 = 저량(쌓이는 양) · 유량(흐르는 양)으로 바꾼 저량-유량도.',
])

# ═════════════════════════════ ⑨ SD 로 짠 도입 전략 ═════════════════════════════
s = new_slide()
chrome(s, 9, 'SD 활용 · 사내 확산', '이 플랫폼의 사내 확산도 같은 모형으로 돌려 봤습니다')
LW9 = 6.6
card(s, X0, 1.85, LW9, 4.89)
tf = box(s, X0 + 0.3, 2.02, LW9 - 0.6, 0.62)
para(tf, '3년 뒤에도 쓰는 사람 비율', size=15, color=INK, bold=True, first=True)
para(tf, '우리 회사 규모(직원 300명), 평균 10개월 쓰면 그만둔다고 가정한 12부 캡스톤 모형', size=10.5, color=MUTED, space_before=2)
bars = [
    ('그대로: 홍보 p 0.01 · 입소문 q 0.4', 75.8, False),
    ('홍보 3배 (p 0.03)', 77.2, False),
    ('입소문 1.5배 (q 0.6)', 83.7, True),
    ('이탈 방지 (평균 20개월 사용)', 87.8, True),
]
BX0 = X0 + 0.3
BMAX = LW9 - 0.6 - 0.95          # 100% 일 때 막대 길이 — 값 라벨 자리를 남긴다
BT = 0.24                        # 막대 두께
RAD = 0.045                      # 값 쪽 끝만 둥글게(바닥 쪽은 각지게)
rect(s, BX0, 2.8, 0.012, 4 * 0.66 - 0.12, SLATE_300)   # 기준선(0%)
for i, (label, v, hi) in enumerate(bars):
    by = 2.8 + i * 0.66
    tf = box(s, BX0 + 0.08, by, BMAX, 0.26, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, label, size=10.5, color=INK if hi else BODY, bold=hi, first=True)
    L = BMAX * v / 100
    col = INDIGO if hi else C('94A3B8')
    rect(s, BX0, by + 0.29, L - RAD, BT, col)
    rrect(s, BX0 + L - 2 * RAD, by + 0.29, 2 * RAD, BT, fill=col, radius=RAD)
    tf = box(s, BX0 + L + 0.1, by + 0.27, 0.9, 0.28, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, f'{v:.1f}%', size=12.5, color=INK, bold=True, first=True)
tf = box(s, X0 + 0.3, 5.48, LW9 - 0.6, 0.3, anchor=MSO_ANCHOR.MIDDLE)
para(tf, [('절반 도달(이탈이 없을 때)  ', {'color': MUTED}), ('그대로 9.1개월 · 홍보 3배 6.4개월 · 입소문 1.5배 6.8개월', {'color': BODY, 'bold': True})],
     size=10.5, first=True)
rrect(s, X0 + 0.3, 5.92, LW9 - 0.6, 0.62, fill=INDIGO_SOFT, radius=0.12)
tf = box(s, X0 + 0.5, 5.92, LW9 - 1.0, 0.62, anchor=MSO_ANCHOR.MIDDLE)
para(tf, '속도는 홍보가 당기고, 남는 사람 수는 입소문과 이탈 방지가 정합니다.', size=12, color=INDIGO_INKY, bold=True, first=True)
RX = X0 + LW9 + 0.28
RW = SW - X0 - RX
levers = [
    ('megaphone', AMBER, '홍보·교육 (p)', '첫 사용자를 만듭니다. 빨리 퍼지게 하지만 이탈이 있으면 최종 도달은 거의 그대로입니다.'),
    ('heart-handshake', INDIGO, '입소문 (q)', '쓰는 동료가 옆 동료에게 권합니다. 먼저 써 보는 사람들이 이 고리의 시작점입니다.'),
    ('user-minus', TEAL, '이탈 방지 (L)', '계속 쓰게 만드는 장치. 기기 간 진도 동기화·복습 표시·협업 메모가 여기에 해당합니다.'),
]
LH = 1.12
for i, (ic, col, t, d) in enumerate(levers):
    ly = 1.85 + i * (LH + 0.1)
    card(s, RX, ly, RW, LH)
    chip(s, ic, RX + 0.2, ly + (LH - 0.5) / 2, 0.5, color=col)
    tf = box(s, RX + 0.86, ly + 0.06, RW - 1.02, LH - 0.12, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, t, size=13.5, color=INK, bold=True, first=True)
    para(tf, d, size=10.5, color=BODY, space_before=2, line=1.25)
ny = 1.85 + 3 * (LH + 0.1) + 0.04
rrect(s, RX, ny, RW, 6.74 - ny, fill=PANEL, radius=0.12, line=LINE, lw=0.75)
icon(s, 'info', RX + 0.2, ny + 0.16, 0.24, MUTED)
tf = box(s, RX + 0.54, ny + 0.12, RW - 0.72, 6.74 - ny - 0.2)
para(tf, '가정한 계수로 돌린 모형 시나리오입니다. 예측이 아니라 어떤 손잡이가 무엇을 바꾸는지 비교하는 용도이고, 파일럿 실측으로 계수를 바꿉니다.',
     size=10, color=MUTED, first=True, line=1.25)
para(tf, '12부 12장 실험실·노트북으로 누구나 다시 돌려 볼 수 있습니다.', size=10, color=MUTED, space_before=3, line=1.25)
script(s, [
    '이 방법으로, 이 플랫폼이 회사에 어떻게 퍼질지도 돌려 봤습니다. 직원 300명에, 평균 10개월 쓰면 그만둔다고 가정했습니다.',
    '그대로 두면 3년 뒤에도 쓰는 사람은 76% 정도입니다. 홍보를 세 배로 늘려도 77% 로 거의 같습니다.',
    '반면 쓰는 동료가 옆 동료에게 권하는 입소문을 키우면 84%, 더 오래 쓰게 만들면 88% 까지 올라갑니다.',
    '홍보는 퍼지는 속도를 당길 뿐이고, 남는 사람 수는 입소문과 사용 기간이 정한다는 뜻입니다. 그래서 크게 알리기보다 몇 명이 먼저 써 보고 주변에 권하는 쪽이 맞다고 봅니다. 진도 이어 보기, 복습 표시, 함께 쓰는 메모도 오래 쓰게 하는 기능입니다.',
    '물론 가정을 넣어 돌린 시나리오이고, 예측은 아닙니다. 실제로 써 본 숫자가 나오면 다시 돌려 보겠습니다.',
], [
    '"예측인가요?" → 아니다. 어떤 손잡이가 무엇을 바꾸는지 비교하는 모형 시나리오다. 파일럿에서 완주율·이탈 지점을 재서 입소문 q·사용 기간 L 을 실측값으로 바꾼다.',
    '모형: Bass 확산 + 이탈. 도입 = (홍보 p + 입소문 q × 사용자/전체) × 잠재 사용자, 이탈 = 사용자 ÷ 평균 사용 기간 L. '
    '강화 루프(입소문) · 균형 루프(포화) · 균형 루프(이탈).',
    '정확한 값: 그대로 75.8% · 홍보 3배 77.2% · 입소문 1.5배 83.7% · 이탈 방지(20개월) 87.8%. 절반 도달(이탈 없음) 9.1 · 6.4 · 6.8개월. '
    '12부 12장 실험실·노트북으로 누구나 다시 돌려 볼 수 있다.',
])

# ═════════════════════════════ ⑩ 완전 로컬 ═════════════════════════════
s = new_slide()
chrome(s, 10, '인프라', '기본은 로컬: 백엔드 서버·AI 사용료·외부 전송 없음', dark=True)
trio = [
    ('server-off', '백엔드 서버 0', '정적 웹', '웹 페이지를 올려 둘 곳만 있으면 됩니다. 학습·진단·튜터 모두 로그인 없이 쓸 수 있습니다.'),
    ('coins', '₩0', '로컬 LLM 튜터', 'AI 튜터가 각자 PC 의 Ollama 로 동작해 사용료가 없습니다. 튜터를 쓰려면 Ollama 설치가 필요합니다.'),
    ('lock', '외부 전송 0', '튜터 대화는 밖으로 안 나감', '튜터 대화는 PC 를 떠나지 않습니다. 로그인하지 않으면 학습 기록도 이 브라우저에만 남습니다.'),
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
# 발표는 온라인 회의 화면 공유 + 영상이라 라이브 시연이 없다. Wi-Fi 를 끄는 시연도 할 수 없다(끄면 회의가 끊긴다) — 띠는 예시로
chip(s, 'cpu', X0 + 0.32, 4.95 + (1.38 - 0.74) / 2, 0.74, 'glass')
tf = box(s, X0 + 1.32, 5.0, CW - 1.6, 1.28, anchor=MSO_ANCHOR.MIDDLE)
para(tf, [('예시  ', {'color': INDIGO_200, 'size': 13}),
          ('튜터에게 다른 부의 개념을 물으면, 답은 내 PC 안에서 만들어집니다.', {'color': WHITE, 'size': 18})], bold=True, first=True)
para(tf, '"경사하강은 어디서 배워요?" → "2부 9장, 먼저 그래디언트". 경량 로컬 모델이 개념 지도의 카드 한 장(약 100토큰)을 읽고 답합니다. '
         '벡터 DB 도, 인터넷도 필요 없습니다.',
     size=12, color=INDIGO_100, space_before=6, line=1.25)
para(tf, '참고: 9부(수치 계산)가 이 인프라 자체를 가르칩니다. "7B 모델이 왜 4GB 로 내 PC 에서 도는가".',
     size=11, color=INDIGO_200, space_before=4)
pill(s, '선택 로그인', X0, 6.48, size=10.5, fill=WHITE, alpha=10, color=INDIGO_200, line=WHITE, line_alpha=20)
tf = box(s, X0 + 1.25, 6.44, CW - 1.25, 0.45)
para(tf, '사내 이메일 계정으로 로그인하면 기기 간 진도 동기화와 협업 메모를 씁니다. 서버로 가는 건 완료한 챕터·복습 표시·진단 결과·직접 쓴 메모뿐입니다.',
     size=10.5, color=FAINT, first=True, line=1.25)
script(s, [
    '보안과 비용도 궁금하실 겁니다. 기본 구성은 각자의 PC 안에서 돌아갑니다.',
    '별도 백엔드 서버 없이 웹 페이지를 올려 둘 곳만 있으면 됩니다. AI 튜터를 쓰려면 PC 에 Ollama 를 설치해야 하지만, 그다음에는 질문을 많이 해도 사용료가 없고, 질문 내용이 회사 밖으로 나가지 않으며, 인터넷이 끊겨도 답합니다.',
    '로그인은 원하는 사람만 합니다. 로그인하면 다른 기기에서도 진도가 이어지는데, 이때 저장되는 것은 끝낸 챕터와 복습 표시, 진단 결과, 직접 쓴 메모뿐입니다.',
], [
    '"직원 PC 마다 무엇을 설치하나요?" → 학습·진단은 브라우저만으로 된다. 튜터만 Ollama 와 모델이 필요하다. 각자 설치하거나, '
    '사내 서버 한 대에 올리고 빌드 설정(VITE_OLLAMA_URL) 하나로 주소만 바꾼다(코드 수정 없음). 그러면 대화는 그 사내 서버로 가고 회사 밖으로는 나가지 않는다.',
    '"정말 인터넷 없이 되나요?" → 튜터 질문은 이 PC 의 Ollama(localhost:11434)로만 간다. 보여 달라고 하면 공유 화면을 브라우저로 바꿔 '
    'F12 → 네트워크 탭을 연 채 질문하고, 새로 생긴 chat 요청의 주소가 localhost:11434(이 PC 자신)임을 짚는다. Wi-Fi 는 끄지 않는다(회의가 끊긴다).',
    '기술 스택 → 기본은 정적 웹(브라우저 저장) + 로컬 Ollama. 로그인은 선택(사내 이메일 도메인만 가입)이고, 켜면 Supabase 로 진도·복습·진단·협업 메모만 '
    '동기화한다. 튜터 대화는 보내지 않는다. Supabase 는 사내 서버에 직접 설치(self-host)할 수도 있다.',
])

# ═════════════════════════════ ⑪ 숫자 한 장 ═════════════════════════════
s = new_slide()
chrome(s, 11, '숫자 한 장', '규모 · 비용 · 실측 성능')
G4 = 0.25
W4 = (CW - 3 * G4) / 4
stats = [
    ('book-open', INDIGO, '130', '학습 챕터', '12부 완결: 선형대수 → LLM → 에이전트 → 시스템 다이내믹스'),
    ('list-checks', VIOLET, '1,800+', '자동채점 문항', '즉시 채점 + 단계별 힌트·해설'),
    ('notebook-pen', TEAL, '144', '실습 노트북', '웹 챕터 ↔ Jupyter 1:1, 전수 무에러 실행'),
    ('coins', AMBER, '₩0', 'AI 사용료', '로컬 AI 튜터 · 정적 웹 · 오프라인'),
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
    ('route', '핵심 경로 55챕터', '예상 약 37시간, 진단으로 개인별 단축(예시 31.9시간)'),
    ('timer', '튜터 완답 5~6초', '경량 로컬 모델, 1부에서 실측(전 부 공통 인프라)'),
    ('shield-check', '가드레일 10/10 · +0초', '주제 이탈 전부 차단, 스트리밍 보류 감지로 추가 지연 없음'),
    ('network', '개념 127 · 관계 520', '온톨로지 정본, 전체 화면 점검 175/175 · 개인화 8/8 자동 검증'),
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
para(tf, '산출 근거·측정 방법은 12_metrics.md', size=11, color=MUTED, first=True)
script(s, [
    '숫자로 한 번만 정리하겠습니다. 130개 챕터, 바로 채점되는 문제 1,800개 이상, 실습 노트북 144권입니다. 별도 AI 사용료는 들지 않습니다.',
    '핵심 경로만 보면 예상 약 37시간이고, 진단 결과에 따라 더 줄어듭니다.',
], [
    '규모 수치는 2026-10-13(12부 완결) 기준 전수 실측: 130챕터 · 1,800+ 문항(전수 1,820) · 144 노트북은 코드에서 직접 센 값. '
    '튜터 성능은 1부에서 잰 값(전 부가 같은 인프라). 핵심 경로는 선택 부를 빼고 센 값이라 12부가 들어와도 그대로다. 근거는 12_metrics.md.',
    '실측 성능: 튜터 완답 5~6초(1부 실측, 전 부 같은 인프라), 주제 이탈 차단 10/10 · 추가 지연 0초, 개념 127 · 관계 520.',
])

# ═════════════════════════════ ⑫ 품질 ═════════════════════════════
s = new_slide()
chrome(s, 12, '품질', '수포자 페르소나 검수 + 자동 검증 4종')
LW = 5.6
card(s, X0, 1.9, LW, 2.25)
chip(s, 'user-search', X0 + 0.3, 2.2, 0.56)
tf = box(s, X0 + 1.06, 2.2, LW - 1.3, 0.4)
para(tf, '① 페르소나 검수', size=16, color=INK, bold=True, first=True)
tf = box(s, X0 + 1.06, 2.62, LW - 1.3, 0.8)
para(tf, '"중학 수학까지만 기억하는 성인"을 가정해 1부 12챕터 통독. 이탈 위험 40여 건을 찾아 수정, 재검수 "학습 적합". 다른 부도 같은 기준으로 작성.',
     size=12, color=BODY, first=True, line=1.3)
x = X0 + 0.3
for i, (t, f, col) in enumerate([('이탈 위험 40여 건', ROSE_SOFT, ROSE_INK), ('전량 수정', AMBER_SOFT, AMBER_INK),
                                  ('1부 "학습 적합"', TEAL_SOFT, TEAL_INK)]):
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
para(tf, '검증 스크립트를 저장소에 남겨, 고칠 때마다 전체를 다시 돌립니다. 협업 메모는 실제 백엔드로 e2e 65건.',
     size=12, color=BODY, first=True, line=1.3)
RX = X0 + LW + 0.28
RW = SW - X0 - RX
card(s, RX, 1.9, RW, 3.77)
chip(s, 'shield-check', RX + 0.3, 2.2, 0.56)
tf = box(s, RX + 1.06, 2.2, RW - 1.3, 0.56, anchor=MSO_ANCHOR.MIDDLE)
para(tf, '② 자동 검증 4종', size=16, color=INK, bold=True, first=True)
checks = [
    ('13앱', '전 앱 타입체크 · 빌드'),
    ('144권', '노트북 무에러 실행'),
    ('175 + 17 + 8', '전체 화면 점검 · 개인화 통합 · 온톨로지 개인화'),
    ('185 링크', '커밋 훅의 온톨로지 검사: 개념 위치 · 앵커 · 선수 순환'),
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
para(tf, '그래도 틀린 곳이 있을 수 있으니, 발견하면 알려 주세요.', size=15, color=INDIGO_INKY, bold=True,
     align=PP_ALIGN.CENTER, first=True)
script(s, [
    '자료가 틀리면 같이 보기 어려우니 두 가지로 확인했습니다.',
    '하나는 읽어 보는 검수입니다. 중학교 수학까지만 기억하는 어른을 가정해 1부 전체를 읽고, 막힐 만한 곳 40여 군데를 고쳤습니다. 다른 부도 같은 기준으로 만들었습니다.',
    '다른 하나는 자동 검사입니다. 내용을 고칠 때마다 자동으로 다시 검사합니다.',
    '그래도 틀린 곳은 있을 수 있으니, 보시다가 발견하면 알려 주세요.',
], [
    '"정확도는?" → 주제 이탈 차단 실측 10/10, 튜터 창의 "본문 설명이 우선!" 안내, 수포자 관점 통독 검수.',
    '"유지보수는?" → 공용 부품을 한 곳(모노레포 공용 패키지)에 둬서 한 번 고치면 전 부에 반영된다. 개념 정본도 한 파일이라 고치면 아홉 곳이 따라온다.',
    '12부도 같은 검증(전체 화면 점검 175 · 2층 17 · 개인화 8 · 휴대폰 · 다크 모드)을 통과하고 들어왔다. 협업 메모는 실제 백엔드로 e2e 65건.',
    '자동 검증 4종: 13개 앱 타입체크 · 빌드 / 노트북 144권 무에러 실행 / 브라우저 자동 검사(전체 화면 점검 175, 개발 용어로 스모크 테스트 · 개인화 통합 17 · 온톨로지 개인화 8) / 커밋마다 온톨로지 검사(본문 링크 185).',
])

# ═════════════════════════════ ⑬ 도입 ═════════════════════════════
s = new_slide()
chrome(s, 13, '써 보기', '주소를 열면 바로 시작할 수 있습니다')
LW = 7.1
scen = [
    ('graduation-cap', '혼자 공부', '진단으로 각자 시작 지점을 정하고, 4부 트랜스포머까지 갑니다.'),
    ('building-2', '같이 공부', '핵심 경로 55챕터, 예상 약 37시간. 신입·사내 교육에 쓸 만한지는 같이 써 본 뒤에 판단합니다.'),
    ('briefcase', '실무와 가까운 내용', '7부 RAG(사내 챗봇) · 9부 로컬 모델 선택 · 10부 평가 통계(새 모델 도입 판단) · 11부 에이전트(일을 맡겨도 되나) · 12부 SD(도입 효과를 미리 돌려 보기).'),
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
para(tf, '시작하는 방법', size=19, color=WHITE, bold=True, first=True)
for i, t in enumerate(['URL / QR 로 접속', '학습은 설치 없이 (로그인은 선택)', '진도 자동 저장 (브라우저)',
                       '사내 계정으로 로그인하면 기기 간 이어짐', '튜터는 Ollama 설치 후 사용']):
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
para(tf, '첫 화면이 진단이라 따로 안내할 것이 많지 않습니다.', size=11, color=INDIGO_200, first=True, line=1.3)
script(s, [
    '주소를 열면 바로 시작할 수 있습니다. 첫 화면이 진단이라 따로 안내할 것이 많지 않습니다.',
    '실무와 가까운 내용도 있습니다. 사내 챗봇이 회사 문서를 어떻게 찾아 답하는지, 새 모델은 무엇을 보고 고르는지, AI 에게 일을 어디까지 맡겨도 되는지를 다룹니다.',
    '신입 교육이나 사내 교육에 쓸 만한지는 같이 써 본 뒤에 판단하면 좋겠습니다.',
], [
    'QR 은 사내 호스트가 정해지면 docs/hackathon/assets/qr.png 로 넣고 덱을 다시 생성한다(오른쪽 카드 아래에 들어간다).',
    '실무 트랙의 부: 사내 챗봇(RAG) 7부 · 로컬 모델 고르기 9부 · 모델 평가 통계 10부 · 에이전트 11부 · 도입 효과 시뮬레이션 12부.',
])

# ═════════════════════════════ ⑭ 로드맵 + 클로징 ═════════════════════════════
s = new_slide()
chrome(s, 14, '다음 단계', '작게 시작합니다: 동료와 먼저 써 보기', dark=True)
road = [
    ('flag', '파일럿', '동료 5~10명이 같이 써 보며 완주율·이탈 지점을 재고, 모형의 입소문(q)·사용 기간(L)을 실제 값으로 바꿉니다.'),
    ('target', '사내 교육 검토', '결과가 괜찮으면 신입·사내 교육에 넣을지 논의합니다. 모형도 실제 값으로 다시 돌려 봅니다.'),
    ('rocket', '회사 서버에 올리기', '사내 호스트에 올려 계정으로 운영합니다. 기기 간 동기화·복습·협업 메모·도입 현황 대시보드는 이미 구현돼 있습니다.'),
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
    tf = box(s, cx, 3.75, W3 - 0.3, 0.95)
    para(tf, d, size=12, color=SLATE_300, first=True, line=1.35)
icon(s, 'sparkles', X0, 4.88, 0.26, INDIGO_300)
tf = box(s, X0 + 0.4, 4.84, CW - 0.4, 0.35, anchor=MSO_ANCHOR.MIDDLE)
para(tf, '콘텐츠 확장: 12부 "시스템 다이내믹스" 완결·편입(2026-10-13), 다음 후보: 확산 모델의 수학(조건부)',
     size=11, color=FAINT, first=True)
c = rrect(s, X0, 5.35, CW, 1.35, radius=0.18)
grad(c, INDIGO, VIOLET, 0)
shadow(c, blur=36, dist=0, alpha=50, color=str(INDIGO))
tf = box(s, X0, 5.35, CW, 1.35, anchor=MSO_ANCHOR.MIDDLE)
para(tf, '다시 공부해 보고 싶은 분,', size=18, color=INDIGO_100, bold=True, align=PP_ALIGN.CENTER, first=True)
para(tf, '같이 보면 좋겠습니다.', size=30, color=WHITE, bold=True, align=PP_ALIGN.CENTER, space_before=2)
script(s, [
    '다음 단계는 작게 시작하는 것입니다. 먼저 동료 5명에서 10명이 같이 써 보면서 어디까지 따라오고 어디서 막히는지 보겠습니다. 그 결과로 모형을 다시 돌려 보고, 괜찮으면 회사 서버에 올려 사내 교육에 넣을지 논의하면 됩니다.',
    '처음에 드린 질문으로 돌아가겠습니다. 저는 AI 학습의 기반이 되는 수학을 공부하려고 이 자료를 만들었습니다. 수학을 포기했든 오래되어 잊어버렸든, 저처럼 다시 공부해 보고 싶은 분이 있다면 같이 보고 싶습니다.',
    '같이 써 보실 분은 연락 주시거나, 주변에 권해 주시면 감사하겠습니다.',
])

# ═════════════════════════════ ⑮ 부록 · 만든 도구와 AI 를 쓴 곳 ═════════════════════════════
# 무엇으로 만들었고 AI 를 어디에 썼는지 한 장(카드 8: 도구 6 + AI 2). 버전은 package-lock·.venv·CI 에서 확인한 값,
# 숫자는 덱 다른 장과 같은 실측(13앱 · 노트북 144 · 개념 127 · e2e 65 · 스모크 175). 99% = Claude 공동 작성 커밋(git log, 2026-11-01 기준 180개 중 179개).
s = new_slide()
chrome(s, 15, '부록 · 만든 도구', '공개된 도구로, Claude 와 함께 혼자 만들었습니다')
tf = box(s, X0, 1.62, CW, 0.5)
para(tf, '제품은 공개 오픈소스와 내 PC 의 로컬 모델로만 돌아, 사내망에서도 같은 구성으로 돕니다.', size=12, color=MUTED, first=True, line=1.3)
para(tf, [('AI 는 두 곳에 썼습니다: ', {'color': INK}),
          ('제품 안의 로컬 LLM(G), 만드는 과정의 Claude Code(H).', {'color': INDIGO})], size=12, bold=True, line=1.3)
tools = [   # (아이콘, 구역, 이름, 설명 두 줄, 숫자, 단위, 강조)
    ('monitor-smartphone', 'A · 화면', 'Vue 3.5 · Vite 6', 'TypeScript 5.7 · Tailwind CSS 4', '차트 Chart.js 4 · 수식 KaTeX',
     '13', '웹 앱', None),
    ('notebook-pen', 'B · 실습', 'Python 3.13 · Jupyter', 'NumPy · Matplotlib · SciPy', '웹 챕터와 1:1, 전수 무에러 실행',
     '144', '노트북', None),
    ('network', 'C · 개념 지도', '개념 온톨로지', 'JSON 정본 하나 + 직접 만든 검사기', '검색 Fuse.js 7 · 커밋마다 검사',
     '127', '개념', None),
    ('layers', 'D · 선택 백엔드', 'Supabase', 'Postgres · 로그인 · 행 단위 보안', '켜면 진도 동기화 · 사내 설치 가능',
     '65', 'e2e 검증', None),
    ('shield-check', 'E · 검증 자동화', 'Playwright 1.61', '브라우저 E2E · 스크린샷 · 영상 녹화', 'GitHub Actions(Node 24) · 커밋 훅',
     '175', '전체 화면 점검', None),
    ('presentation', 'F · 발표 산출물', 'python-pptx · FFmpeg', '이 덱과 시연 영상을 코드로 생성', '아이콘 Lucide · 렌더 PowerPoint',
     '3', '종', None),
    ('bot', 'G · 제품 속 AI', 'Ollama · gemma4:e2b', '각자 PC 에서 도는 로컬 LLM', '튜터 · 추천 설명 · 메모 질문 · 노트북',
     '4', '곳', 'dark'),
    ('sparkles', 'H · 만드는 AI', 'Claude Code', 'Anthropic Claude 와 페어 개발', '콘텐츠 · 코드 · 검수 · 발표 산출물',
     '99', '% 커밋', 'grad'),
]
TG = 0.22
TW = (CW - 3 * TG) / 4
TY = 2.25
TH = (6.74 - TY - TG) / 2
for i, (ic, kick, name, d1, d2, n, unit, hi) in enumerate(tools):
    r, k = divmod(i, 4)
    x = X0 + k * (TW + TG)
    y = TY + r * (TH + TG)
    c = card(s, x, y, TW, TH)
    if hi == 'dark':
        grad(c, INK, NAVY2, 45)
    elif hi == 'grad':
        grad(c, INDIGO, VIOLET, 45)
    sub = {None: BODY, 'dark': SLATE_300, 'grad': INDIGO_100}[hi]
    chip(s, ic, x + TW - 0.7, y + 0.2, 0.46, 'glass' if hi else 'soft')
    tf = box(s, x + 0.25, y + 0.24, TW - 1.0, 0.28)
    para(tf, kick, size=9.5, color={None: INDIGO, 'dark': INDIGO_300, 'grad': INDIGO_100}[hi], bold=True, first=True)
    tf = box(s, x + 0.25, y + 0.56, TW - 0.4, 0.42, anchor=MSO_ANCHOR.MIDDLE)
    para(tf, name, size=19 if hi == 'grad' else 14, color=WHITE if hi else INK, bold=True, first=True)
    tf = box(s, x + 0.25, y + 1.02, TW - 0.4, 0.6)
    para(tf, d1, size=9.5, color=sub, first=True, line=1.25)
    para(tf, d2, size=9.5, color=sub, line=1.25)
    tf = box(s, x + 0.25, y + TH - 0.74, TW - 0.5, 0.6, anchor=MSO_ANCHOR.BOTTOM)
    para(tf, [(n, {'size': 30, 'color': WHITE if hi else INDIGO}),
              ('  ' + unit, {'size': 10.5, 'color': {None: MUTED, 'dark': FAINT, 'grad': INDIGO_100}[hi], 'bold': False})],
         bold=True, align=PP_ALIGN.RIGHT, first=True)
script(s, [
    '끝으로, 무엇으로 만들었는지 한 장에 담았습니다. 제품은 공개된 도구만으로 돌아가서 회사 안에서도 그대로 돌릴 수 있습니다.',
    'AI 는 두 곳에 썼습니다. 제품 안에서는 각자 PC 의 LLM 이 학습을 돕고, 만드는 과정에서는 Claude 와 함께 작업했습니다. 작업 기록 대부분을 Claude 와 함께 썼습니다.',
    '혼자서 여기까지 만들 수 있었던 것도 그 덕분입니다. 들어 주셔서 감사합니다.',
], [
    '질문을 받으면 그 장으로 돌아가 화면을 보며 답한다. 발표자 보기의 "모든 슬라이드 보기"로 골라 들어간다. '
    '번호 + Enter 로 가면 영상 장 때문에 ④부터 하나씩 밀린다(⑩ 은 11 Enter).',
    '"정확도는?" "유지보수는?" → ⑫ 노트 · "직원 PC 마다 설치?" "인터넷 없이?" "기술 스택?" → ⑩ 노트 · "온톨로지가 뭔가요? 그냥 JSON?" → ⑦ 노트 · '
    '"도입 숫자는 예측인가요?" → ⑨ 노트',
    '"AI 가 쓴 콘텐츠를 믿을 수 있나요?" → AI 와 함께 쓴 것도 같은 관문을 통과해야 들어간다: 수포자 페르소나 통독 검수(이탈 위험 40여 곳 수정), '
    '자동 검증 4종, 커밋 훅(글자 대비 · 온톨로지 검사). 방향과 판단은 사람이, 작성은 AI 와 함께.',
    '"Claude 로 사내 데이터가 가나요?" → 아니다. Claude Code 는 만드는 도구일 뿐, 제품은 실행 중에 Claude 를 부르지 않는다(제품 코드에 호출 0). '
    '학습자의 질문은 각자 PC 의 로컬 모델로만 간다(로그인을 켜면 진도·메모만 Supabase 로).',
    '"확장은?" → 백엔드 없이 시작해도 되고, 사내 계정 로그인 · 기기 간 진도 · 도입 현황 대시보드는 이미 구현돼 켜기만 하면 된다.',
    '도구(카드 순): 화면 Vue 3.5 · Vite 6 / 실습 Python 3.13 · Jupyter / 개념 지도 JSON 정본 + 검사기 / 선택 백엔드 Supabase / 검증 Playwright 1.61 / 발표 산출물 python-pptx · FFmpeg / 제품 속 AI Ollama · gemma4:e2b / 만드는 AI Claude Code(작업 기록 = git 커밋 180개 중 179개 공동 작성, 2026-11-01 기준).',
], qa_title='[질의응답]')

prs.core_properties.title = '수포자 아카데미 · 수포자가 만든 AI·수학 공부 자료'
prs.core_properties.author = 'jiyupapa'
prs.save(OUT)
print('저장 →', OUT)


# ── 대본 사본: 발표자 노트를 그대로 md 로(리허설·인쇄용, 손으로 고치지 않는다) ─────────────
def md_block(text):
    out, prev = [], False
    for ln in text.split('\n'):
        bullet = ln.startswith('· ')
        if bullet:
            out += ([] if prev else ['']) + ['- ' + ln[2:]]
        elif ln.startswith('[') and ln.endswith(']'):
            out += ['', f'**{ln[1:-1]}**']
        elif ln:
            out += ['', ln]
        prev = bullet
    return '\n'.join(out).strip()


md = ['# 15분 발표 대본 — 수포자 아카데미', '',
      '> 자동 생성 — `scripts/build-pitch-deck.py` 가 덱(`11_pitch_deck.pptx`)의 발표자 노트를 그대로 옮긴 사본이다.',
      '> 고치려면 그 스크립트의 `script()` 호출을 고치고 다시 실행한다(이 파일을 직접 고치면 다음 생성 때 사라진다).',
      '> 형식: 온라인 회의 화면 공유(슬라이드 쇼 창만 공유) · 목표 15분 · ③ 다음 시연 영상(약 3분 43초, AI 음성 내레이션 — 덱 안에 들어 있다) · 남는 시간은 질의응답.',
      '> 5분 라이브 시연 대본은 [`13_demo_script.md`](13_demo_script.md).', '']
for sl in prs.slides:
    md += [f'## {HEADS[sl.slide_id]}', '', md_block(sl.notes_slide.notes_text_frame.text), '']
SCRIPT_MD.write_text('\n'.join(md), encoding='utf-8')
print('저장 →', SCRIPT_MD, f'(대본 예상 {mmss(CLOCK[0])}, 초당 {PACE}음절 기준)')
