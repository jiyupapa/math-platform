// @series/tutor — 개념 그래프 접지(grounding). 설계: docs/todo_온톨로지_260906.md §7
//
// 각 부 TutorChat 은 자기 부 목차만 안다. 학습자가 다른 부에서 배우는 개념("연쇄법칙이 뭐예요"를 1부에서)을
// 물으면 규칙상 "이 과정에 없다"고 답하게 돼 있었다. 이 모듈은 빌드 산출물 concept-graph.json(시리즈 정본)에서
// 질문에 등장한 개념을 찾아 "개념 카드"(정의·별칭·처음 배우는 곳·다시 쓰는 곳·선수 개념·비유어)를 만들어
// 시스템 프롬프트 끝에 덧붙인다. 최대 3장, 300토큰 안 — 경량 로컬 모델에 부담이 없다.
//
// 결정적이다(같은 질문 → 같은 카드). 그래프를 못 읽으면 빈 문자열 — 튜터는 접지 없이 그대로 동작한다.
//
// 카드 문구는 4B 급 로컬 모델의 실제 오답에서 다듬었다(2026-09-06 gemma3:4b 실측):
//   · "6부 1장"을 "6번 장"으로 읽고 자기 부 내용으로 지어냄 → 헤더에 '부 = 시리즈의 권' 명시 + "현재 과정 밖" 표시
//   · 비유어("조련")로 물었는데 카드가 실무어("파인튜닝")로 시작해 연결을 못 함 → 비유어로 잡힌 카드는 치환 문장부터

export interface ConceptLocation {
  part: number
  slug: string
  anchor?: string
  how?: string
}

export interface ConceptMetaphor {
  term: string
  part: number
  note?: string
}

export interface Concept {
  id: string
  label: string
  aliases: string[]
  kind: 'math' | 'ai' | 'tool' | 'metric'
  note: string
  definedAt: ConceptLocation
  usedAt: ConceptLocation[]
  prereq: string[]
  related: string[]
  metaphors: ConceptMetaphor[]
}

export interface ConceptGraph {
  version: number
  parts: Record<string, string>
  chapters: Record<string, { title: string; advanced: boolean }>
  concepts: Concept[]
}

export interface GroundingOptions {
  /** 이 튜터가 속한 부 번호 — 카드에 "이 과정 안 / 다른 부" 를 표시한다. 0 이면 표시 생략 */
  currentPart?: number
  /** 카드 최대 장수 */
  max?: number
}

const cache = new Map<string, Promise<ConceptGraph | null>>()

/** 그래프를 1회만 fetch 해 캐시한다. 실패하면 null (조용히 — 접지는 선택 기능). */
export function loadConceptGraph(url: string): Promise<ConceptGraph | null> {
  let p = cache.get(url)
  if (!p) {
    p = (async () => {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
        if (!res.ok) return null
        const data = (await res.json()) as ConceptGraph
        return Array.isArray(data.concepts) ? data : null
      } catch {
        return null
      }
    })()
    cache.set(url, p)
  }
  return p
}

// 정규화: 소문자 + 공백 제거. 한국어는 조사가 붙어도("KL발산이") 부분일치로 잡힌다.
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '')

// ASCII 로만 된 짧은 별칭("lr"·"log"·"KL")은 단어 경계로만 잡는다 — "blog"·"clear" 오탐 방지.
function matches(question: string, questionNorm: string, alias: string): boolean {
  const a = alias.trim()
  if (a.length < 2) return false
  if (/^[\x20-\x7e]+$/.test(a)) {
    const escaped = a.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(question.toLowerCase())
  }
  return questionNorm.includes(norm(a))
}

/** 질문에 등장한 개념 — 더 긴(더 특정한) 이름이 잡힌 순, 동률이면 id 순. */
export function matchConcepts(graph: ConceptGraph, question: string, max = 3): Concept[] {
  const qn = norm(question)
  const hits: { c: Concept; score: number }[] = []
  for (const c of graph.concepts) {
    const names = [c.label, ...c.aliases, ...c.metaphors.map((m) => m.term)]
    let best = 0
    for (const n of names) if (matches(question, qn, n)) best = Math.max(best, norm(n).length)
    if (best > 0) hits.push({ c, score: best })
  }
  hits.sort((a, b) => b.score - a.score || a.c.id.localeCompare(b.c.id))
  return hits.slice(0, max).map((h) => h.c)
}

const where = (l: ConceptLocation) => `${l.part}부 ${l.slug === 'sample' ? '워밍업' : l.slug.replace(/^ch/, '') + '장'}`

/** 카드 본문 — 튜터가 "N부 M장" 형태로 안내할 수 있게 위치를 명시한다. */
export function conceptCards(
  graph: ConceptGraph,
  concepts: Concept[],
  question = '',
  opts: GroundingOptions = {},
): string {
  if (!concepts.length) return ''
  const byId = new Map(graph.concepts.map((c) => [c.id, c]))
  const qn = norm(question)
  const cur = opts.currentPart ?? 0
  const lines = concepts.map((c) => {
    const aliases = c.aliases.slice(0, 3).join(', ')
    const used = c.usedAt
      .slice(0, 4)
      .map((u) => `${where(u)}${u.how ? `(${u.how})` : ''}`)
      .join(', ')
    const prereq = c.prereq
      .map((id) => byId.get(id))
      .filter((p): p is Concept => !!p)
      .map((p) => `${p.label}(${where(p.definedAt)})`)
      .join(', ')
    const metaphors = c.metaphors.map((m) => `${m.term}(${m.part}부)`).join(', ')
    // 질문이 비유어로 들어왔으면 "비유어 → 실무어" 치환부터 — 모델이 비유어를 자기 부 개념으로 오해하지 않게
    const viaMetaphor = question ? c.metaphors.filter((m) => matches(question, qn, m.term)) : []
    const lead = viaMetaphor.length
      ? `'${viaMetaphor.map((m) => m.term).join("', '")}'은(는) ${viaMetaphor[0].part}부에서 쓰는 비유어이고 실무 용어는 ` +
        `${c.label}${aliases ? `(${aliases})` : ''}이다. `
      : `${c.label}${aliases ? ` (${aliases})` : ''} — `
    // 지시문을 카드 안에 넣으면 모델이 그대로 따라 읽는다(실측) — 카드엔 표식만, 지시는 헤더에
    const scope = cur ? (c.definedAt.part === cur ? ' (이 과정)' : ' (다른 부)') : ''
    return (
      `- ${lead}${c.note}.` +
      ` 배우는 곳(어디서 배우나 물으면 이것으로 답): ${where(c.definedAt)}${scope}.` +
      (prereq ? ` 먼저 알아야: ${prereq}.` : '') +
      (used ? ` 그 뒤 다시 쓰이는 곳(참고): ${used}.` : '') +
      (metaphors && !viaMetaphor.length ? ` 이 시리즈의 비유어: ${metaphors}.` : '')
    )
  })
  const here = cur
    ? ` 현재 과정은 ${cur}부 — '다른 부' 개념은 내용을 길게 지어내지 말고 배우는 곳을 안내한다.`
    : ''
  return (
    `[개념 카드 — 시리즈 정본에서 자동 첨부. 'N부'는 이 시리즈의 권(1~11부, 각각 별도 과정), 'M장'은 그 안의 장.` +
    `${here} 질문한 개념을 배우는 곳·선수 개념]\n${lines.join('\n')}`
  )
}

/** 한 줄로: 그래프 로드 → 질문 매칭 → 카드. 시스템 프롬프트 끝에 그대로 이어 붙인다('' 이면 접지 없음). */
export async function conceptGrounding(
  graphUrl: string,
  question: string,
  opts: GroundingOptions = {},
): Promise<string> {
  const graph = await loadConceptGraph(graphUrl)
  if (!graph) return ''
  const cards = conceptCards(graph, matchConcepts(graph, question, opts.max ?? 3), question, opts)
  return cards ? `\n\n${cards}` : ''
}
