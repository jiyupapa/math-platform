// scripts/build-search-index.mjs
// 통합검색 인덱스 생성기.
//   입력: 전 부 apps/partN/web/src/data/chapters.ts (챕터 메타) + scripts/search-concepts.json (개념·동의어 사전)
//   출력: 각 앱 web/public/search-index.json (포털 + part1..11)
//
// 왜 각 앱 public 마다 심는가: 팔레트는 인덱스를 BASE_URL 기준(=자기 앱 public)에서 fetch 한다.
//   그래야 dev 단독 서버·per-app 빌드·조립 배포본(deploy/partN/) 모두에서 동일하게 로드된다.
//   (Date/랜덤 미사용 → 같은 입력이면 같은 출력, 결정적.)
//
// 실행: node scripts/build-search-index.mjs   (또는 npm run search:index)
//   build-deploy.mjs 가 배포 조립 직전에 자동 호출한다.
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// 부 번호 → 표시 제목. 순서·번호는 README 정본과 일치.
const PARTS = [
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
]

// 인덱스를 심을 앱 public/ 목록 (포털 포함)
const APP_DIRS = ['portal', ...PARTS.map((p) => `part${p.n}`)]

function chLabel(slug) {
  if (slug === 'sample') return '워밍업'
  const m = /^ch(\d+)$/.exec(slug)
  return m ? `${m[1]}장` : slug
}

// chapters.ts 에서 챕터 객체를 추출한다. 챕터 객체엔 중첩 중괄호가 없으므로 { ... } 단위로 끊는다.
function parseChapters(text) {
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

// --- 1) 챕터 엔트리 + 부별 slug→meta 조회표 ---
const chaptersByPart = new Map()
const chapterEntries = []
for (const p of PARTS) {
  const file = join(root, 'apps', `part${p.n}`, 'web', 'src', 'data', 'chapters.ts')
  const chs = parseChapters(readFileSync(file, 'utf8'))
  const map = new Map()
  for (const c of chs) {
    map.set(c.slug, c)
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
  chaptersByPart.set(p.n, map)
}

// --- 2) 개념 엔트리 (위치 하나당 엔트리 하나 — 팔레트에서 바로 그 장으로 점프) ---
const conceptsRaw = JSON.parse(readFileSync(join(root, 'scripts', 'search-concepts.json'), 'utf8'))
const slugify = (s) => s.replace(/\s+/g, '').replace(/[^\p{L}\p{N}]/gu, '')
const conceptEntries = []
let dropped = 0
for (const c of conceptsRaw) {
  for (const loc of c.locations) {
    const meta = chaptersByPart.get(loc.part)?.get(loc.slug)
    if (!meta) {
      console.warn(`⚠ 개념 "${c.term}" 의 위치 ${loc.part}부 ${loc.slug} 가 chapters.ts 에 없어 건너뜀`)
      dropped++
      continue
    }
    conceptEntries.push({
      id: `c-${slugify(c.term)}-${loc.part}-${loc.slug}`,
      type: 'concept',
      part: loc.part,
      partTitle: PARTS.find((p) => p.n === loc.part).title,
      slug: loc.slug,
      title: c.term,
      summary: c.note ?? '',
      keywords: (c.aliases ?? []).join(' '),
      advanced: meta.advanced,
      label: `${loc.part}부 ${chLabel(loc.slug)} · ${meta.title}`,
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
