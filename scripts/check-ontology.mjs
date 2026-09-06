// scripts/check-ontology.mjs — 개념 온톨로지 검사기. 설계: docs/todo_온톨로지_260906.md §6 (규칙 9개)
//
//   실패(exit 1):  1 id 유일·ASCII kebab-case          2 위치(part/slug)가 chapters.ts 에 실재
//                  3 anchor 가 그 장의 ReviewFlag/anchorId 에 실재   4 prereq/related 대상 실재 + prereq 무순환
//                  5 definedAt 정확히 1 · metaphors[].part 필수 · 같은 부 안에서 비유어 유일
//                  6 본문 <PartLink> 대상 실재 (온톨로지 무관 — 지금까지 아무도 안 잡던 드리프트)
//   경고(통과):    7 PartLink 쌍이 그래프 간선에 없음 → 누락 간선 후보 (--suggest 로 목록)
//                  8 README 「부 간 주요 연결 지점」 행이 그래프에 없음
//                  9 커버리지 — 정의/회수 개념이 0인 장 (--coverage 로 목록)
//
//   실행: npm run check:ontology [-- --suggest --coverage]
//   pre-commit(githooks/pre-commit) 과 deploy:build 앞단에서 자동으로 돈다. 순수 파일 검사라 0.5초 안.
import {
  loadConcepts,
  loadChapters,
  loadChapterFiles,
  collectAnchors,
  collectPartLinks,
  loadReadmeLinks,
  conceptLocations,
  locKey,
  chLabel,
  PARTS,
} from './ontology/lib.mjs'

const args = new Set(process.argv.slice(2))
const SUGGEST = args.has('--suggest')
const COVERAGE = args.has('--coverage')

const errors = []
const warnings = []
const fail = (rule, msg) => errors.push(`[${rule}] ${msg}`)
const warn = (rule, msg) => warnings.push(`[${rule}] ${msg}`)

const concepts = loadConcepts()
const chapters = loadChapters()
const chapterFiles = loadChapterFiles()
const anchors = collectAnchors(chapterFiles)
const byId = new Map()
const loc = (l) => `${l.part}부 ${chLabel(l.slug)}${l.anchor ? '#' + l.anchor : ''}`

// ── 1. id ────────────────────────────────────────────────────────────────
for (const c of concepts) {
  if (typeof c.id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.id)) fail(1, `id 형식 위반: ${JSON.stringify(c.id)}`)
  if (byId.has(c.id)) fail(1, `id 중복: ${c.id}`)
  byId.set(c.id, c)
  for (const key of ['label', 'note']) if (typeof c[key] !== 'string' || !c[key].trim()) fail(1, `${c.id}: ${key} 누락`)
  if (!Array.isArray(c.aliases)) fail(1, `${c.id}: aliases 배열 누락`)
  if (!['math', 'ai', 'tool', 'metric'].includes(c.kind)) fail(1, `${c.id}: kind 가 math|ai|tool|metric 이 아님 (${c.kind})`)
}

// ── 2·3·5. 위치·앵커·definedAt·비유어 ──────────────────────────────────
const chapterExists = (part, slug) => chapters.get(part)?.has(slug) ?? false
for (const c of concepts) {
  if (!c.definedAt || typeof c.definedAt !== 'object') {
    fail(5, `${c.id}: definedAt 누락 (정확히 1곳이어야 한다)`)
  }
  for (const l of conceptLocations(c)) {
    if (!l.part || !l.slug) {
      fail(2, `${c.id}: 위치에 part/slug 누락 (${JSON.stringify(l)})`)
      continue
    }
    if (!chapterExists(l.part, l.slug)) {
      fail(2, `${c.id}: ${l.part}부 ${l.slug} 가 chapters.ts 에 없음`)
      continue
    }
    if (l.anchor) {
      const set = anchors.get(locKey(l.part, l.slug))
      if (!set || !set.has(l.anchor)) fail(3, `${c.id}: 앵커 ${loc(l)} 가 그 장의 ReviewFlag/anchorId 에 없음`)
      else if (!l.anchor.startsWith(l.slug + '-')) fail(3, `${c.id}: 앵커 ${l.anchor} 의 첫 세그먼트가 장 ${l.slug} 와 다름`)
    }
    if (l.role === 'used' && typeof l.how !== 'string') warn(2, `${c.id}: 회수처 ${loc(l)} 에 how 가 없음`)
  }
  for (const m of c.metaphors ?? []) {
    if (!m.term || typeof m.part !== 'number') fail(5, `${c.id}: metaphors 항목에 term/part 필요 (${JSON.stringify(m)})`)
  }
}
// 같은 부 안에서 비유어 유일
const metaphorSeen = new Map()
for (const c of concepts) {
  for (const m of c.metaphors ?? []) {
    const key = `${m.part}:${m.term}`
    if (metaphorSeen.has(key) && metaphorSeen.get(key) !== c.id) fail(5, `비유어 "${m.term}"(${m.part}부)가 두 개념에 붙음: ${metaphorSeen.get(key)}, ${c.id}`)
    metaphorSeen.set(key, c.id)
  }
}

// ── 4. 관계 대상 실재 + prereq 무순환 ───────────────────────────────────
for (const c of concepts) {
  for (const key of ['prereq', 'related']) {
    for (const id of c[key] ?? []) {
      if (!byId.has(id)) fail(4, `${c.id}.${key} 가 없는 개념을 가리킴: ${id}`)
      if (id === c.id) fail(4, `${c.id}.${key} 가 자기 자신을 가리킴`)
    }
  }
}
{
  const state = new Map() // 0 미방문 · 1 진행 · 2 완료
  const stack = []
  const visit = (id) => {
    const s = state.get(id) ?? 0
    if (s === 1) {
      const cycle = stack.slice(stack.indexOf(id)).concat(id)
      fail(4, `prereq 순환: ${cycle.join(' → ')}`)
      return
    }
    if (s === 2) return
    state.set(id, 1)
    stack.push(id)
    for (const p of byId.get(id)?.prereq ?? []) if (byId.has(p)) visit(p)
    stack.pop()
    state.set(id, 2)
  }
  for (const c of concepts) visit(c.id)
}

// ── 6·7. PartLink ────────────────────────────────────────────────────────
// 그래프가 "이 장 ↔ 저 장"을 잇는가: 어떤 개념이 두 장 모두에 위치를 갖는가.
const conceptsAt = new Map() // "part:slug" → Set(id)
for (const c of concepts) {
  for (const l of conceptLocations(c)) {
    const k = locKey(l.part, l.slug)
    if (!conceptsAt.has(k)) conceptsAt.set(k, new Set())
    conceptsAt.get(k).add(c.id)
  }
}
const graphConnects = (aPart, aSlug, bPart, bSlug) => {
  const A = conceptsAt.get(locKey(aPart, aSlug))
  const B = conceptsAt.get(locKey(bPart, bSlug))
  if (!A || !B) return false
  for (const id of A) if (B.has(id)) return true
  return false
}
const links = collectPartLinks(chapterFiles)
const suggestions = new Map() // "from → to" → 횟수
for (const l of links) {
  if (!chapters.has(l.toPart)) {
    fail(6, `PartLink 대상 부가 없음: ${l.toPart}부 (${rel(l.file)}:${l.line})`)
    continue
  }
  if (l.toSlug && !chapterExists(l.toPart, l.toSlug)) {
    fail(6, `PartLink 대상 장이 없음: ${l.toPart}부 ${l.toSlug} (${rel(l.file)}:${l.line})`)
    continue
  }
  if (!l.toSlug) continue // 부 홈 링크는 간선 대상 아님
  if (l.fromPart === l.toPart && l.fromSlug === l.toSlug) continue
  if (!graphConnects(l.fromPart, l.fromSlug, l.toPart, l.toSlug)) {
    const key = `${l.fromPart}부 ${chLabel(l.fromSlug)} → ${l.toPart}부 ${chLabel(l.toSlug)}`
    suggestions.set(key, (suggestions.get(key) ?? 0) + 1)
  }
}
if (suggestions.size) {
  warn(7, `그래프 간선이 없는 PartLink 쌍 ${suggestions.size}종 (누락 간선 후보${SUGGEST ? '' : ' — --suggest 로 목록'})`)
  if (SUGGEST) for (const [k, n] of [...suggestions].sort()) warnings.push(`      · ${k} (${n}회)`)
}

// ── 8. README 연결표 대조 ────────────────────────────────────────────────
const readmeRows = loadReadmeLinks()
{
  const expand = (specs) => {
    const out = []
    for (const s of specs) {
      if (s.slugs) for (const slug of s.slugs) out.push({ part: s.part, slug })
      else for (const slug of chapters.get(s.part)?.keys() ?? []) out.push({ part: s.part, slug })
    }
    return out
  }
  let missing = 0
  for (const row of readmeRows) {
    const from = expand(row.from)
    const to = expand(row.to)
    let ok = false
    for (const a of from) for (const b of to) if (graphConnects(a.part, a.slug, b.part, b.slug)) ok = true
    if (!ok) {
      missing++
      warn(8, `README 연결표 행이 그래프에 없음: ${row.raw.split('|').slice(1, 3).map((s) => s.trim()).join(' → ')}`)
    }
  }
  if (readmeRows.length === 0) warn(8, 'README 「부 간 주요 연결 지점」 표를 찾지 못함')
  else if (missing === 0) console.log(`  README 연결표 ${readmeRows.length}행 전부 그래프 간선에 있음`)
}

// ── 9. 커버리지 ──────────────────────────────────────────────────────────
{
  const empty = []
  let total = 0
  for (const p of PARTS) {
    for (const slug of chapters.get(p.n).keys()) {
      total++
      if (!conceptsAt.has(locKey(p.n, slug))) empty.push(`${p.n}부 ${chLabel(slug)}`)
    }
  }
  const defined = concepts.length
  const used = concepts.reduce((n, c) => n + (c.usedAt?.length ?? 0), 0)
  const anchored = concepts.filter((c) => c.definedAt?.anchor).length
  console.log(
    `  개념 ${defined} · 회수 간선 ${used} · 선수 간선 ${concepts.reduce((n, c) => n + (c.prereq?.length ?? 0), 0)}` +
      ` · 비유어 ${concepts.reduce((n, c) => n + (c.metaphors?.length ?? 0), 0)} · definedAt 앵커 ${anchored}/${defined}` +
      ` · 장 커버리지 ${total - empty.length}/${total}`,
  )
  if (empty.length) {
    warn(9, `개념이 하나도 안 붙은 장 ${empty.length}개${COVERAGE ? '' : ' (--coverage 로 목록)'}`)
    if (COVERAGE) warnings.push(`      · ${empty.join(', ')}`)
  }
}

function rel(file) {
  return file.replace(/\\/g, '/').replace(/^.*?(apps\/)/, '$1')
}

// ── 결과 ─────────────────────────────────────────────────────────────────
for (const w of warnings) console.log(`  ⚠ ${w}`)
if (errors.length) {
  console.error(`\n✗ 온톨로지 검사 실패 — ${errors.length}건`)
  for (const e of errors) console.error(`  ✗ ${e}`)
  console.error(`\n  정본: scripts/ontology/concepts.json · 규칙: docs/todo_온톨로지_260906.md §6`)
  process.exit(1)
}
console.log(`✅ 온톨로지 검사 통과 — 개념 ${concepts.length}, PartLink ${links.length}개 대상 실재${warnings.length ? `, 경고 ${warnings.length}건` : ''}`)
