// scripts/build-concept-graph.mjs — 개념 그래프 산출물 생성기. 설계: docs/todo_온톨로지_260906.md §4·§7
//   입력: scripts/ontology/concepts.json (정본) + 각 부 chapters.ts (장 제목 조회표)
//   출력: 각 앱 web/public/concept-graph.json (포털 + part1..11)
//
//   소비처: TutorChat(각 부) 이 질문에 나온 개념의 카드를 시스템 프롬프트에 덧붙일 때 fetch 한다(1단계).
//           2단계의 ConceptStrip·SearchPalette 확장·포털 개념 지도도 같은 파일을 읽는다.
//   검색 인덱스와 같은 이유로 각 앱 public 마다 심는다(BASE_URL 기준 fetch). Date/랜덤 미사용 — 결정적.
//
//   실행: node scripts/build-concept-graph.mjs   (또는 npm run ontology:graph)
import { join } from 'node:path'
import { writeFileSync, mkdirSync } from 'node:fs'
import { root, PARTS, loadChapters, loadConcepts } from './ontology/lib.mjs'

const APP_DIRS = ['portal', ...PARTS.map((p) => `part${p.n}`)]

const chaptersByPart = loadChapters()
const chapters = {}
for (const p of PARTS) {
  for (const c of chaptersByPart.get(p.n).values()) {
    chapters[`p${p.n}-${c.slug}`] = { title: c.title, advanced: c.advanced }
  }
}

// 정본의 필드 순서·내용을 그대로 싣되, 누락 필드는 빈 값으로 정규화해 소비처가 optional 처리를 덜 하게 한다.
const concepts = loadConcepts().map((c) => ({
  id: c.id,
  label: c.label,
  aliases: c.aliases ?? [],
  kind: c.kind,
  note: c.note,
  definedAt: c.definedAt,
  usedAt: c.usedAt ?? [],
  prereq: c.prereq ?? [],
  related: c.related ?? [],
  metaphors: c.metaphors ?? [],
}))

const payload = JSON.stringify({
  version: 1,
  source: 'scripts/ontology/concepts.json',
  parts: Object.fromEntries(PARTS.map((p) => [p.n, p.title])),
  chapters,
  concepts,
})
for (const dir of APP_DIRS) {
  const pub = join(root, 'apps', dir, 'web', 'public')
  mkdirSync(pub, { recursive: true })
  writeFileSync(join(pub, 'concept-graph.json'), payload)
}
console.log(
  `✅ 개념 그래프: 개념 ${concepts.length} · 장 ${Object.keys(chapters).length} → ${APP_DIRS.length}개 앱 public/concept-graph.json (${(payload.length / 1024).toFixed(0)}KB)`,
)
