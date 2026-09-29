// scripts/build-search-index.mjs
// 통합검색 인덱스 생성기.
//   입력: 전 부 apps/partN/web/src/data/chapters.ts (챕터 메타) + scripts/ontology/concepts.json (개념 온톨로지 정본)
//   출력: 각 앱 web/public/search-index.json (포털 + part1..11)
//
// 왜 각 앱 public 마다 심는가: 팔레트는 인덱스를 BASE_URL 기준(=자기 앱 public)에서 fetch 한다.
//   그래야 dev 단독 서버·per-app 빌드·조립 배포본(deploy/partN/) 모두에서 동일하게 로드된다.
//   (Date/랜덤 미사용 → 같은 입력이면 같은 출력, 결정적.)
//
// 2026-09-06: 개념 사전(search-concepts.json)이 온톨로지 정본(scripts/ontology/concepts.json)으로 승격됐다.
//   출력 형식은 그대로 — 개념 엔트리는 개념의 위치(definedAt + usedAt)마다 하나. 회수처 엔트리는 summary 에
//   "다시 쓰는 곳 — how" 를 담는다. 비유어(metaphors)는 별칭과 함께 keywords 로 들어가 "조련"→6부가 여전히 검색된다.
//
// 실행: node scripts/build-search-index.mjs   (또는 npm run search:index)
//   build-deploy.mjs 가 배포 조립 직전에 자동 호출한다. 온톨로지 검사(check-ontology)는 앞단에서 따로 돈다.
import { join } from 'node:path'
import { writeFileSync, mkdirSync } from 'node:fs'
import { root, PARTS, partTitle, chLabel, loadChapters, loadConcepts, conceptLocations, locKey } from './ontology/lib.mjs'

// 인덱스를 심을 앱 public/ 목록 (포털 포함)
const APP_DIRS = ['portal', ...PARTS.map((p) => `part${p.n}`)]

// --- 1) 챕터 엔트리 ---
const chaptersByPart = loadChapters()
const chapterEntries = []
for (const p of PARTS) {
  for (const c of chaptersByPart.get(p.n).values()) {
    chapterEntries.push({
      id: `p${p.n}-${c.slug}`,
      type: 'chapter',
      part: p.n,
      partTitle: p.title,
      slug: c.slug,
      title: c.title,
      summary: c.summary,
      keywords: '',
      advanced: c.advanced,
      label: `${p.n}부 ${chLabel(c.slug)} · ${p.title}`,
    })
  }
}

// --- 2) 개념 엔트리 (위치 하나당 엔트리 하나 — 팔레트에서 바로 그 장으로 점프) ---
const concepts = loadConcepts()
const conceptById = new Map(concepts.map((c) => [c.id, c]))
const where = (l) => `${l.part}부 ${chLabel(l.slug)}`
// 팔레트의 "이웃 한 줄" — 먼저 볼 것 · 다시 만나는 곳 · 밖에서는 (온톨로지 2단계)
function neighborFields(c) {
  const pre = (c.prereq ?? []).map((id) => conceptById.get(id)).filter(Boolean)
  const prereq = pre.length
    ? pre
        .slice(0, 3)
        .map((p) => `${p.label}(${where(p.definedAt)})`)
        .join(' · ') + (pre.length > 3 ? ` 외 ${pre.length - 3}` : '')
    : ''
  const uses = c.usedAt ?? []
  const reuse = uses.length
    ? uses
        .slice(0, 4)
        .map((u) => where(u))
        .join(' · ') + (uses.length > 4 ? ` 외 ${uses.length - 4}` : '')
    : ''
  const parts = []
  if ((c.metaphors ?? []).length) {
    parts.push(`이 과정에서는 ${c.metaphors.map((m) => `'${m.term}'(${m.part}부)`).join(' · ')}`)
  }
  // 라벨이 한글이면 첫 영문 별칭을 "밖에서는" 으로 — 문서·논문 검색 열쇠말
  if (!/[A-Za-z]/.test(c.label)) {
    const en = (c.aliases ?? []).find((a) => /^[A-Za-z][A-Za-z0-9 .@\-/']*$/.test(a))
    if (en) parts.push(`밖에서는 ${en}`)
  }
  const terms = parts.join(' · ')
  return { prereq, reuse, terms }
}
const conceptEntries = []
let dropped = 0
for (const c of concepts) {
  const seen = new Set()
  const keywords = [...(c.aliases ?? []), ...(c.metaphors ?? []).map((m) => m.term)].join(' ')
  const neighbors = neighborFields(c)
  for (const l of conceptLocations(c)) {
    const meta = chaptersByPart.get(l.part)?.get(l.slug)
    if (!meta) {
      console.warn(`⚠ 개념 "${c.label}" 의 위치 ${l.part}부 ${l.slug} 가 chapters.ts 에 없어 건너뜀`)
      dropped++
      continue
    }
    if (seen.has(locKey(l.part, l.slug))) continue // 같은 장에 정의처와 회수처가 겹치면 하나만
    seen.add(locKey(l.part, l.slug))
    const defined = `${c.definedAt.part}부 ${chLabel(c.definedAt.slug)}`
    conceptEntries.push({
      id: `c-${c.id}-${l.part}-${l.slug}`,
      type: 'concept',
      part: l.part,
      partTitle: partTitle(l.part),
      slug: l.slug,
      title: c.label,
      summary: l.role === 'defined' ? c.note : `${l.how ?? c.note} (다시 쓰는 곳 · 처음은 ${defined})`,
      keywords,
      advanced: meta.advanced,
      label: `${l.part}부 ${chLabel(l.slug)} · ${meta.title}`,
      role: l.role, // 'defined' | 'used' — 팔레트가 같은 개념의 정의처를 회수처보다 앞에 세운다
      ...neighbors,
    })
  }
}

// --- 3) 결정적 정렬 후 각 앱 public/ 에 기록 ---
const entries = [...chapterEntries, ...conceptEntries].sort((a, b) =>
  a.type !== b.type
    ? a.type.localeCompare(b.type)
    : a.part !== b.part
      ? a.part - b.part
      : a.slug !== b.slug
        ? a.slug.localeCompare(b.slug)
        : a.title.localeCompare(b.title),
)

const payload = JSON.stringify({ version: 1, count: entries.length, entries })
for (const dir of APP_DIRS) {
  const pub = join(root, 'apps', dir, 'web', 'public')
  mkdirSync(pub, { recursive: true })
  writeFileSync(join(pub, 'search-index.json'), payload)
}

console.log(
  `✅ 통합검색 인덱스: 챕터 ${chapterEntries.length} + 개념 ${conceptEntries.length} = ${entries.length} 항목` +
    ` → ${APP_DIRS.length}개 앱 public/ 에 기록` +
    (dropped ? ` (개념 위치 ${dropped}건 누락 건너뜀)` : ''),
)
