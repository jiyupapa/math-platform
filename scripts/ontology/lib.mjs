// scripts/ontology/lib.mjs — 개념 온톨로지 공용 로더.
//   check-ontology.mjs(검사) · build-search-index.mjs(검색 인덱스) · build-concept-graph.mjs(개념 그래프)가
//   같은 원천을 같은 방식으로 읽도록 한 곳에 둔다. 설계: docs/todo_온톨로지_260906.md §3·§4·§6.
//
//   정본:  scripts/ontology/concepts.json
//   참조:  apps/partN/web/src/data/chapters.ts(장 실재) · apps/partN/web/src/chapters/*.vue(섹션 앵커 실재)
//   Date/랜덤 미사용 — 같은 입력이면 같은 출력(결정적).
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, basename } from 'node:path'
import { readFileSync, readdirSync } from 'node:fs'

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

// 부 번호 → 표시 제목. 순서·번호는 README 정본과 일치.
export const PARTS = [
  { n: 1, title: '선형대수학' },
  { n: 2, title: '미분' },
  { n: 3, title: '확률과 통계' },
  { n: 4, title: '트랜스포머' },
  { n: 5, title: '정보이론' },
  { n: 6, title: 'LLM 조련' },
  { n: 7, title: '임베딩 기하학' },
  { n: 8, title: '최적화' },
  { n: 9, title: '수치 계산' },
  { n: 10, title: '스케일링과 평가' },
  { n: 11, title: '에이전트와 추론' },
  { n: 12, title: '시스템 다이내믹스' },
]

export const partTitle = (n) => PARTS.find((p) => p.n === n)?.title ?? `${n}부`

export const CONCEPTS_FILE = join(root, 'scripts', 'ontology', 'concepts.json')

export function chLabel(slug) {
  if (slug === 'sample') return '워밍업'
  const m = /^ch(\d+)$/.exec(slug)
  return m ? `${m[1]}장` : slug
}

export const locKey = (part, slug) => `${part}:${slug}`

// chapters.ts 에서 챕터 객체를 추출한다. 챕터 객체엔 중첩 중괄호가 없으므로 { ... } 단위로 끊는다.
export function parseChapters(text) {
  const start = text.indexOf('export const chapters')
  const arrStart = text.indexOf('[', start)
  const arrEnd = text.indexOf('\n]', arrStart) // 배열은 자체 줄의 ] 로 닫힌다
  const body = text.slice(arrStart, arrEnd)
  const objs = body.match(/\{[^{}]*\}/g) || []
  const field = (s, key) => {
    const m = new RegExp(key + String.raw`:\s*'((?:\\.|[^'\\])*)'`).exec(s)
    return m ? m[1].replace(/\\'/g, "'") : undefined
  }
  return objs
    .map((s) => ({
      slug: field(s, 'slug'),
      title: field(s, 'title'),
      summary: field(s, 'summary') ?? '',
      advanced: /advanced:\s*true/.test(s),
      comingSoon: /comingSoon:\s*true/.test(s),
    }))
    .filter((c) => c.slug && c.title && !c.comingSoon)
}

/** 부 번호 → (slug → 챕터 메타) */
export function loadChapters() {
  const byPart = new Map()
  for (const p of PARTS) {
    const file = join(root, 'apps', `part${p.n}`, 'web', 'src', 'data', 'chapters.ts')
    const map = new Map()
    for (const c of parseChapters(readFileSync(file, 'utf8'))) map.set(c.slug, c)
    byPart.set(p.n, map)
  }
  return byPart
}

/** 정본 JSON 을 그대로 읽는다(형태 검증은 check-ontology 가 한다). */
export function loadConcepts() {
  return JSON.parse(readFileSync(CONCEPTS_FILE, 'utf8'))
}

/** 챕터 .vue 파일명 → slug (Chapter6.vue → ch6, SampleChapter.vue → sample) */
export function slugOfChapterFile(file) {
  const name = basename(file, '.vue')
  if (name === 'SampleChapter') return 'sample'
  const m = /^Chapter(\d+)$/.exec(name)
  return m ? `ch${m[1]}` : null
}

/** 부 → 챕터 .vue 파일 목록 [{part, slug, file, text}] */
export function loadChapterFiles() {
  const out = []
  for (const p of PARTS) {
    const dir = join(root, 'apps', `part${p.n}`, 'web', 'src', 'chapters')
    for (const name of readdirSync(dir).sort()) {
      if (!name.endsWith('.vue')) continue
      const slug = slugOfChapterFile(name)
      if (!slug) continue
      out.push({ part: p.n, slug, file: join(dir, name), text: readFileSync(join(dir, name), 'utf8') })
    }
  }
  return out
}

/** "part:slug" → Set(앵커 id). ReviewFlag id + ConceptCard 등의 anchorId/anchor-id 를 모두 센다. */
export function collectAnchors(chapterFiles = loadChapterFiles()) {
  const anchors = new Map()
  for (const { part, slug, text } of chapterFiles) {
    const set = new Set()
    for (const m of text.matchAll(/<ReviewFlag\b[^>]*\bid="([^"]+)"/g)) set.add(m[1])
    for (const m of text.matchAll(/\b(?:anchorId|anchor-id)="([^"]+)"/g)) set.add(m[1])
    anchors.set(locKey(part, slug), set)
  }
  return anchors
}

/** 본문의 PartLink 참조 [{fromPart, fromSlug, toPart, toSlug|null, file, line}] */
export function collectPartLinks(chapterFiles = loadChapterFiles()) {
  const links = []
  for (const { part, slug, file, text } of chapterFiles) {
    const lines = text.split('\n')
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/<PartLink\b([^>]*)>/g)) {
        const attrs = m[1]
        const p = /:part="(\d+)"|\bpart="(\d+)"/.exec(attrs)
        const c = /\bch="([^"]+)"/.exec(attrs)
        if (!p) continue
        links.push({
          fromPart: part,
          fromSlug: slug,
          toPart: Number(p[1] ?? p[2]),
          toSlug: c ? c[1] : null,
          file,
          line: i + 1,
        })
      }
    })
  }
  return links
}

// README 「부 간 주요 연결 지점」 표 — 각 행의 출발/도착 위치 집합을 뽑는다.
//   "3부 5·7장 기댓값" → {part:3, slugs:['ch5','ch7']} · "5부 1~2장" → ch1,ch2 · "11부 0·2장" → sample,ch2
//   "1부 행렬 연산" (장 없음) → {part:1, slugs:null} (그 부의 아무 장)
function parseLocSpec(cell) {
  const out = []
  const re = /(\d+)부(?:\s*((?:\d+(?:\s*[·~,]\s*\d+)*)\s*장))?/g
  for (const m of cell.matchAll(re)) {
    const part = Number(m[1])
    if (!m[2]) {
      out.push({ part, slugs: null })
      continue
    }
    const spec = m[2].replace(/\s*장$/, '')
    const nums = []
    for (const piece of spec.split(/\s*[·,]\s*/)) {
      const r = /^(\d+)\s*~\s*(\d+)$/.exec(piece)
      if (r) for (let k = Number(r[1]); k <= Number(r[2]); k++) nums.push(k)
      else nums.push(Number(piece))
    }
    out.push({ part, slugs: nums.map((n) => (n === 0 ? 'sample' : `ch${n}`)) })
  }
  return out
}

export function loadReadmeLinks() {
  const text = readFileSync(join(root, 'README.md'), 'utf8')
  const start = text.indexOf('## 부 간 주요 연결 지점')
  if (start < 0) return []
  const end = text.indexOf('\n## ', start + 1)
  const section = text.slice(start, end < 0 ? undefined : end)
  const rows = []
  for (const line of section.split('\n')) {
    if (!/^\|\s*\d+부/.test(line)) continue
    const cells = line.split('|').map((s) => s.trim())
    if (cells.length < 4) continue
    rows.push({ from: parseLocSpec(cells[1]), to: parseLocSpec(cells[2]), text: cells[3], raw: line })
  }
  return rows
}

/** 개념의 모든 위치 [{part, slug, anchor?, how?, role:'defined'|'used'}] */
export function conceptLocations(c) {
  return [
    { ...c.definedAt, role: 'defined' },
    ...(c.usedAt ?? []).map((u) => ({ ...u, role: 'used' })),
  ]
}

// ── 정본 포맷터 — 손으로 쓴 형식(위치 한 줄에 하나, 부가 바뀌면 빈 줄)을 유지하며 다시 쓴다.
//    스크립트로 정본을 고칠 때 JSON.stringify 가 형식을 흐트러뜨리지 않게. 필드 순서도 고정한다.
export function formatConcepts(concepts) {
  const j = (v) => (Array.isArray(v) ? `[${v.map((x) => JSON.stringify(x)).join(', ')}]` : JSON.stringify(v))
  const loc = (l) => {
    const parts = [`"part": ${l.part}`, `"slug": ${j(l.slug)}`]
    if (l.anchor) parts.push(`"anchor": ${j(l.anchor)}`)
    if (l.how) parts.push(`"how": ${j(l.how)}`)
    return `{ ${parts.join(', ')} }`
  }
  const met = (m) => {
    const parts = [`"term": ${j(m.term)}`, `"part": ${m.part}`]
    if (m.note) parts.push(`"note": ${j(m.note)}`)
    return `{ ${parts.join(', ')} }`
  }
  const list = (arr, one, indent) =>
    arr.length === 0
      ? '[]'
      : arr.length === 1
        ? `[${one(arr[0])}]`
        : `[\n${arr.map((x) => `${indent}  ${one(x)}`).join(',\n')}\n${indent}]`
  const out = []
  let lastPart = null
  concepts.forEach((c, i) => {
    const sep = i === 0 ? '' : c.definedAt.part !== lastPart ? ',\n\n' : ',\n'
    lastPart = c.definedAt.part
    out.push(
      sep +
        '  {\n' +
        `    "id": ${j(c.id)},\n` +
        `    "label": ${j(c.label)},\n` +
        `    "aliases": ${j(c.aliases ?? [])},\n` +
        `    "kind": ${j(c.kind)},\n` +
        `    "note": ${j(c.note)},\n` +
        `    "definedAt": ${loc(c.definedAt)},\n` +
        `    "usedAt": ${list(c.usedAt ?? [], loc, '    ')},\n` +
        `    "prereq": ${j(c.prereq ?? [])},\n` +
        `    "related": ${j(c.related ?? [])},\n` +
        `    "metaphors": ${list(c.metaphors ?? [], met, '    ')}\n` +
        '  }',
    )
  })
  return `[\n${out.join('')}\n]\n`
}
