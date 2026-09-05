// scripts/check-contrast.mjs
// 글자 대비(WCAG AA 4.5:1) 정적 검사기 — **라이트·다크 양쪽을 동시에** 본다.
//   입력: 모든 *.vue (git 추적분) + node_modules/tailwindcss/theme.css(라이트 팔레트)
//         + packages/ui/src/dark.css(다크 팔레트) + packages/ui/src/tokens.css(데모 토큰)
//   출력: 콘솔 리포트. 미달이 있으면 exit 1.
//
// 왜 이 도구가 필요한가 (직접 눈으로 보면 못 잡는 것들):
//   ① 배경이 **부모**에 있다 — `bg-indigo-100` 카드 안의 자식 글자. class 문자열만 봐선 안 보인다.
//   ② 배경이 **`:class` 동적 바인딩** 안에 있다 — `:class="s.goal ? 'bg-indigo-50' : 'bg-slate-50'"`.
//   ③ 계열마다 밝기가 달라 "600이면 안전"이 성립하지 않는다 — emerald-600 은 3.49:1(미달),
//      indigo-600 은 6.18:1(통과). 사람이 외울 수 있는 규칙이 아니다.
//   ④ 라이트에서 통과해도 다크에서 미달일 수 있다 — `bg-X-100 text-X-600` 이 대표 사례.
//   그래서 태그 스택으로 조상 배경을 추적하고, 두 테마의 실제 색값으로 계산한다.
//
// 다크 팔레트를 dark.css 에서 **읽는다** — 반전 규칙을 여기 복사해두면 build-dark-theme.mjs 와
//   어긋난다. 생성물을 정본으로 삼아 자동 동기화한다.
//
// 실행:
//   node scripts/check-contrast.mjs          # 검사만 (CI/커밋 전)
//   node scripts/check-contrast.mjs --fix    # 통과하는 가장 가까운 단계로 자동 수정
//   npm run check:contrast  /  npm run check:contrast -- --fix
//
// 한계(알고 쓸 것):
//   - 정적 마크업 기준이다. 런타임에 조립되는 색(1부 ch3 `rgb(c,c,c)`, 8부 `hsl(...)`)은 대상 밖 —
//     그 위 글자는 뒤집히지 않는 --c-on-light / --c-on-dark 를 쓰기로 약속돼 있다.
//   - 배경이 컴포넌트 경계를 넘어오는 경우(ConceptCard 슬롯 안 내용)는 못 본다.
//     그래서 릴리스 전에는 브라우저 실측도 함께 한다 — 절차는 docs/TESTING.md 5-2절.
//   - 큰 글씨 예외(3:1)는 적용하지 않는다. 보수적으로 전부 4.5:1 을 요구한다.
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FIX = process.argv.includes('--fix')
const MIN_RATIO = 4.5

// ── 색 유틸 ────────────────────────────────────────────────────────────
function oklchToRgb(L, C, H) {
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3
  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  const g = (v) => {
    v = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055
    return Math.round(Math.min(1, Math.max(0, v)) * 255)
  }
  return [g(lr), g(lg), g(lb)]
}
function parseColor(str) {
  const s = str.trim()
  const ok = s.match(/^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)/)
  if (ok) return oklchToRgb(+ok[1] / 100, +ok[2], +ok[3])
  const hex = s.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].split('').map((c) => c + c).join('') : hex[1]
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  }
  return null
}
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const lum = (a) => 0.2126 * lin(a[0]) + 0.7152 * lin(a[1]) + 0.0722 * lin(a[2])
const ratio = (a, b) => { const s = [lum(a), lum(b)].sort((p, q) => q - p); return (s[0] + 0.05) / (s[1] + 0.05) }

// ── 팔레트 로드 ────────────────────────────────────────────────────────
function loadVars(text, prefix) {
  const out = new Map()
  const re = new RegExp(`${prefix}([a-z]+)-(\\d+):\\s*([^;]+);`, 'g')
  for (const m of text.matchAll(re)) {
    const rgb = parseColor(m[3])
    if (rgb) out.set(`${m[1]}-${m[2]}`, rgb)
  }
  return out
}
const themeCss = readFileSync(join(root, 'node_modules/tailwindcss/theme.css'), 'utf8')
const darkCss = readFileSync(join(root, 'packages/ui/src/dark.css'), 'utf8')
const tokensCss = readFileSync(join(root, 'packages/ui/src/tokens.css'), 'utf8')

const LIGHT = loadVars(themeCss, '--color-')
const DARK = loadVars(darkCss, '--color-')
const TOK_LIGHT = loadVars(tokensCss, '--c-')
const TOK_DARK = loadVars(darkCss, '--c-')

// dark.css 최신성 검사 — tokens.css 에 토큰을 추가하고 `npm run theme:dark` 를 안 돌리면
// 아래 tokenColor() 가 라이트 값으로 폴백해 **조용히 통과**한다. 그러면 그 토큰만 다크에서
// 안 뒤집히는데 검사기는 0건이라고 말한다. 그 사각지대를 여기서 막는다.
{
  const inTokens = new Set([...tokensCss.matchAll(/--c-([a-z]+-\d+):/g)].map((m) => m[1]))
  const inDark = new Set([...darkCss.matchAll(/--c-([a-z]+-\d+):/g)].map((m) => m[1]))
  const missing = [...inTokens].filter((k) => !inDark.has(k)).sort()
  if (missing.length) {
    console.error(`✗ dark.css 가 낡았습니다 — 다크 값이 없는 토큰 ${missing.length}개:`)
    console.error(`  ${missing.map((k) => '--c-' + k).join(', ')}`)
    console.error(`\n  npm run theme:dark  을 먼저 돌리세요 (그 토큰은 지금 다크에서 안 뒤집힙니다).`)
    process.exit(1)
  }
}

// 표면색 — 라이트는 흰색, 다크는 dark.css 의 --color-white 값(= 카드 표면)
const WHITE_LIGHT = [255, 255, 255]
const WHITE_DARK = parseColor((darkCss.match(/--color-white:\s*([^;]+);/) ?? [])[1] ?? '#0f172a') ?? [15, 23, 42]

function paletteColor(fam, step, dark) {
  if (fam === 'white') return dark ? WHITE_DARK : WHITE_LIGHT
  if (fam === 'black') return [0, 0, 0]
  const map = dark ? DARK : LIGHT
  return map.get(`${fam}-${step}`) ?? (dark ? LIGHT.get(`${fam}-${step}`) : null) ?? null
}
function tokenColor(name, dark) {
  const m = name.match(/^--c-([a-z]+)-(\d+)$/)
  if (!m) {
    if (name === '--c-white') return dark ? WHITE_DARK : WHITE_LIGHT
    return null // --c-on-light / --c-on-dark / --c-grid 등은 의도적으로 고정
  }
  const key = `${m[1]}-${m[2]}`
  return (dark ? TOK_DARK : TOK_LIGHT).get(key) ?? TOK_LIGHT.get(key) ?? null
}

// ── 템플릿 파서 (태그 스택) ─────────────────────────────────────────────
const TAG = /<\/?([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g
const CLASS_ATTR = /(?:^|\s)class="([^"]*)"/
const DYN_CLASS_ATTR = /(?::class|v-bind:class)="([^"]*)"/
const STYLE_COLOR = /style="[^"]*color:\s*var\((--c-[a-z0-9-]+)\)/
// 닫는 태그가 없는 요소들(HTML void + 이 저장소가 쓰는 SVG 도형)
const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'area', 'col',
                      'path', 'circle', 'line', 'rect', 'ellipse', 'polygon', 'polyline', 'use', 'stop'])

// 배경은 static class 와 :class 삼항 문자열 양쪽에 있을 수 있다.
// **후보를 전부** 돌려준다 — 삼항이면 배경이 여러 개일 수 있고, 어느 분기에서 이 글자가
// 렌더되는지는 정적으로 알 수 없다. 그래서 판정은 "모든 후보에서 미달일 때만 미달"로 한다.
//   예: TutorChat 의 말풍선은 `user ? 'bg-indigo-600 text-white' : 'bg-slate-100 ...'` 인데
//       링크(text-indigo-600)는 assistant 분기에서만 나온다. 최악 배경만 보면 오탐이 된다.
function bgCandidates(classes) {
  const cands = []
  for (const m of classes.matchAll(/\bbg-(white|black|[a-z]+-\d+)(?:\/\d+)?\b/g)) {
    if (m[1] === 'white') cands.push(['white', 0])
    else if (m[1] === 'black') cands.push(['black', 0])
    else { const [fam, step] = m[1].split('-'); cands.push([fam, +step]) }
  }
  return cands.length ? cands : null
}

const files = execSync('git ls-files -- "*.vue"', { encoding: 'utf8', cwd: root }).trim().split('\n').filter(Boolean)
const findings = []

for (const rel of files) {
  const src = readFileSync(join(root, rel), 'utf8')
  const tplStart = src.indexOf('<template>')
  if (tplStart < 0) continue
  const lineAt = (idx) => src.slice(0, tplStart + idx).split('\n').length
  const tpl = src.slice(tplStart)
  const stack = []
  TAG.lastIndex = 0
  let m
  while ((m = TAG.exec(tpl))) {
    const [full, tag, attrs, selfClose] = m
    if (full.startsWith('</')) {
      // 스택이 어긋나면(파서 한계) 같은 태그를 찾아 되감는다
      const i = stack.map((s) => s.tag).lastIndexOf(tag)
      if (i >= 0) stack.length = i
      continue
    }
    const cls = attrs.match(CLASS_ATTR)?.[1] ?? ''
    const bgCls = cls + ' ' + (attrs.match(DYN_CLASS_ATTR)?.[1] ?? '')

    const nearestBg = () => {
      const own = bgCandidates(bgCls)
      if (own) return own
      for (let i = stack.length - 1; i >= 0; i--) { const b = bgCandidates(stack[i].bgCls); if (b) return b }
      return null
    }
    // 후보 배경 전부에서 미달이어야 '미달'. 색이 하나면 그냥 그 색 기준.
    const failsAll = (colorOf, bgs) =>
      [false, true].filter((dark) =>
        bgs.every((bg) => {
          const f = colorOf(dark), b = paletteColor(bg[0], bg[1], dark)
          return f && b && ratio(f, b) < MIN_RATIO
        }),
      )
    // 후보 배경 전부에서 통과해야 대안으로 인정
    const passesAll = (colorOf, bgs) =>
      [false, true].every((dark) =>
        bgs.every((bg) => {
          const f = colorOf(dark), b = paletteColor(bg[0], bg[1], dark)
          return f && b && ratio(f, b) >= MIN_RATIO
        }),
      )
    const worstOf = (colorOf, bgs) =>
      Math.min(...[false, true].flatMap((dark) => bgs.map((bg) => {
        const f = colorOf(dark), b = paletteColor(bg[0], bg[1], dark)
        return f && b ? ratio(f, b) : 99
      })))
    const bgLabel = (bgs) => bgs.map(([f, s]) => `bg-${f}${s ? '-' + s : ''}`).join(' 또는 ')

    // (1) text-{fam}-{step} 유틸리티
    const tm = cls.match(/\btext-([a-z]+)-(\d+)\b/)
    if (tm) {
      const fam = tm[1], step = +tm[2]
      const bgs = nearestBg()
      if (bgs && paletteColor(fam, step, false)) {
        const colorOf = (dark) => paletteColor(fam, step, dark)
        const fails = failsAll(colorOf, bgs)
        if (fails.length) {
          const cands = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
            .filter((s) => passesAll((dark) => paletteColor(fam, s, dark), bgs))
            .sort((a, b2) => Math.abs(a - step) - Math.abs(b2 - step))
          findings.push({
            file: rel, line: lineAt(m.index), kind: 'class',
            from: `text-${fam}-${step}`, to: cands.length ? `text-${fam}-${cands[0]}` : null,
            bg: bgLabel(bgs),
            themes: fails.map((d) => (d ? '다크' : '라이트')).join('·'),
            ratio: +worstOf(colorOf, bgs).toFixed(2), cls,
          })
        }
      }
    }

    // (2) 인라인 style 의 데모 토큰 (본문 강조색을 데모 색과 맞추는 패턴)
    const sm = attrs.match(STYLE_COLOR)
    if (sm) {
      const name = sm[1]
      const bgs = nearestBg()
      const tk = name.match(/^--c-([a-z]+)-(\d+)$/)
      if (bgs && tk && tokenColor(name, false)) {
        const fam = tk[1], step = +tk[2]
        const colorOf = (dark) => tokenColor(name, dark)
        const fails = failsAll(colorOf, bgs)
        if (fails.length) {
          const cands = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
            .filter((s) => TOK_LIGHT.has(`${fam}-${s}`))
            .filter((s) => passesAll((dark) => tokenColor(`--c-${fam}-${s}`, dark), bgs))
            .sort((a, b2) => Math.abs(a - step) - Math.abs(b2 - step))
          findings.push({
            file: rel, line: lineAt(m.index), kind: 'style',
            from: name, to: cands.length ? `--c-${fam}-${cands[0]}` : null,
            bg: bgLabel(bgs),
            themes: fails.map((d) => (d ? '다크' : '라이트')).join('·'),
            ratio: +worstOf(colorOf, bgs).toFixed(2), cls: null,
          })
        }
      }
    }

    if (!selfClose && !VOID.has(tag)) stack.push({ tag, cls, bgCls })
  }
}

// ── <style> 블록 스캔 (스코프드 CSS 의 color) ──────────────────────────────
// 위 파서는 class·인라인 style 만 본다 — 컴포넌트 <style> 안의 color 는 못 봤다(사각지대).
//   실제로 NotePanel·AuthPanel·NoteMarker 의 muted 텍스트(slate-400·indigo-500)가 여기로 새
//   AA 미달이 돼 있었다. 배경을 정적으로 알 수 없으므로 **가장 유리한 배경(흰색)** 으로 본다:
//   흰색에서도 미달이면 더 어두운 어떤 표면에서도 미달이다(거짓양성 없음). 한계 — 흰색은
//   통과하나 bg-slate-100 위에선 미달인 경우는 못 잡는다. 그건 브라우저 실측(docs/TESTING.md 5-2)이 맡는다.
//   라이트 모드 한정: 다크 값은 dark.css 가 역할대로 remap 한다.
// 밝은 틴트(밝은 색 = 어두운 버튼 위 글자, 예: white text)는 흰 배경 가정이 무의미하므로
//   luminance 게이트로 제외한다 — "어두운 글자색인데 흰색에서도 모자란" 것만 잡는다.
const STYLE_BLOCK_COLOR = /(?<![-a-z])color:\s*var\((--c-[a-z]+-\d+)\)/g
for (const rel of files) {
  const src = readFileSync(join(root, rel), 'utf8')
  for (const sb of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    const base = sb.index + sb[0].indexOf(sb[1])
    for (const cm of sb[1].matchAll(STYLE_BLOCK_COLOR)) {
      const name = cm[1]
      const light = tokenColor(name, false)
      if (!light) continue
      if (lum(light) > 0.55) continue // 밝은 틴트 = 어두운 배경용 → 배경 없이는 판단 불가, 제외
      if (ratio(light, WHITE_LIGHT) >= MIN_RATIO) continue
      const tk = name.match(/^--c-([a-z]+)-(\d+)$/)
      const fam = tk[1], step = +tk[2]
      const cands = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
        .filter((s) => TOK_LIGHT.has(`${fam}-${s}`))
        .filter((s) => { const c = tokenColor(`--c-${fam}-${s}`, false); return c && ratio(c, WHITE_LIGHT) >= MIN_RATIO })
        .sort((a, b2) => Math.abs(a - step) - Math.abs(b2 - step))
      findings.push({
        file: rel, line: src.slice(0, base + cm.index).split('\n').length, kind: 'style',
        from: name, to: cands.length ? `--c-${fam}-${cands[0]}` : null,
        bg: 'bg-white (<style> 최선 가정)', themes: '라이트',
        ratio: +ratio(light, WHITE_LIGHT).toFixed(2), cls: null,
      })
    }
  }
}

// ── 리포트 ─────────────────────────────────────────────────────────────
if (!findings.length) {
  console.log(`✓ 글자 대비 미달 없음 — .vue ${files.length}개, 라이트·다크 양쪽 검사 (기준 ${MIN_RATIO}:1)`)
  process.exit(0)
}

const agg = new Map()
for (const f of findings) {
  const k = `${f.from}|${f.bg}|${f.to}|${f.themes}`
  if (!agg.has(k)) agg.set(k, { ...f, n: 0, worst: 99, where: [] })
  const a = agg.get(k)
  a.n++
  a.worst = Math.min(a.worst, f.ratio)
  if (a.where.length < 3) a.where.push(`${f.file}:${f.line}`)
}
console.log(`글자 대비 미달 ${findings.length}건 (기준 ${MIN_RATIO}:1, 라이트·다크 양쪽)\n`)
for (const a of [...agg.values()].sort((x, y) => y.n - x.n)) {
  console.log(`  ${String(a.n).padStart(4)}건  ${a.worst}:1  [${a.themes}]  ${a.from} on ${a.bg}`)
  console.log(`        → ${a.to ?? '자동 후보 없음 — 배경이나 글자색을 직접 조정할 것'}`)
  console.log(`        ${a.where.join(', ')}${a.n > a.where.length ? ` 외 ${a.n - a.where.length}곳` : ''}`)
}

if (!FIX) {
  console.log(`\n--fix 를 붙이면 통과하는 가장 가까운 단계로 자동 수정한다.`)
  process.exit(1)
}

// ── 자동 수정 ──────────────────────────────────────────────────────────
const byFile = new Map()
for (const f of findings) { if (!f.to) continue; if (!byFile.has(f.file)) byFile.set(f.file, []); byFile.get(f.file).push(f) }
let changed = 0, applied = 0
for (const [file, fs2] of byFile) {
  const path = join(root, file)
  let s = readFileSync(path, 'utf8')
  const before = s
  for (const f of fs2) {
    if (f.kind === 'class') {
      const fixed = f.cls.replace(new RegExp(`\\b${f.from}\\b`, 'g'), f.to)
      if (fixed !== f.cls && s.includes(`class="${f.cls}"`)) { s = s.split(`class="${f.cls}"`).join(`class="${fixed}"`); applied++ }
    } else {
      const a = `var(${f.from})`, b = `var(${f.to})`
      if (s.includes(a)) { s = s.split(a).join(b); applied++ }
    }
  }
  if (s !== before) { writeFileSync(path, s); changed++ }
}
console.log(`\n수정: ${applied}건 / 파일 ${changed}개`)
console.log('다시 실행해 0건인지 확인할 것 (같은 class 문자열이 여러 배경에서 쓰이면 한 번에 안 끝난다).')
