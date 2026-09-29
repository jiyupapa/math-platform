// scripts/quiz-aliases.mjs — 문항 문구·문제 세트 제목을 바꿔도 학습자의 풀이 기록이 끊기지 않게 하는 이관 표 생성기.
//
// 왜: QuizSet 은 풀이 현황을 localStorage `{접두사}-quizset-v1:{세트 제목}` 에, 맞힌 문제를
//     문항 문구(question — Quiz·StepQuiz 의 uid) 그대로 저장한다. 문구를 고치면 이미 푼 문제가
//     "안 푼 상태"로 돌아가고, 세트 제목을 고치면 세트 기록 전체가 끊긴다(장 완료 표시는 별도 저장이라 무사).
//     그래서 바뀐 문구를 옛 → 새 로 packages/ui/src/quizAliases.ts 에 모아 두고, QuizSet 이 읽을 때 이어 준다.
//
// 사용법 (루트에서):
//   node scripts/quiz-aliases.mjs            HEAD 대비 바뀐 문구를 찾아 quizAliases.ts 에 더한다
//   node scripts/quiz-aliases.mjs --check    표에 빠진 변경이 있으면 exit 1 (커밋 훅이 돌린다)
//   node scripts/quiz-aliases.mjs --base=<rev>   비교 기준을 바꾼다(기본 HEAD)
//
// 짝짓기: 파일마다 옛/새 문항 목록을 순서대로 맞춘다. 같은 문구는 그대로 두고, 그 사이 구간의
//   개수가 같으면 차례로 짝짓는다. 개수가 다르면(문제를 넣거나 뺐으면) 짝짓지 않고 알린다 — 사람이 표에 직접 적는다.
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'packages/ui/src/quizAliases.ts')
const args = process.argv.slice(2)
const CHECK = args.includes('--check')
const BASE = (args.find((a) => a.startsWith('--base=')) ?? '--base=HEAD').slice(7)
const git = (cmd) => execSync(`git -c core.quotepath=false -c core.safecrlf=false ${cmd}`, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] })

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
const norm = (t) => t.replace(/\r\n/g, '\n')
const questions = (t) => [...norm(t).matchAll(/\squestion="([^"]*)"/g)].map((m) => decode(m[1]))
const titles = (t) => [...norm(t).matchAll(/<QuizSet\b[^>]*?\stitle="([^"]*)"/g)].map((m) => decode(m[1]))

// 순서를 지키며 옛/새 목록을 맞춰 바뀐 쌍만 돌려준다(LCS 기준점 사이 구간의 길이가 같을 때만).
function pairs(a, b) {
  const n = a.length, m = b.length
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const out = [], unpaired = []
  let i = 0, j = 0, gi = 0, gj = 0
  const flush = (ei, ej) => {
    if (ei - gi === ej - gj) for (let k = 0; k < ei - gi; k++) out.push([a[gi + k], b[gj + k]])
    else if (ei > gi || ej > gj) unpaired.push(`옛 ${ei - gi}개 ↔ 새 ${ej - gj}개`)
  }
  while (i < n && j < m) {
    if (a[i] === b[j]) { flush(i, j); i++; j++; gi = i; gj = j }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++
    else j++
  }
  flush(n, m)
  return { out, unpaired }
}

// 현재 표 읽기
function readTable() {
  try {
    const src = readFileSync(OUT, 'utf8')
    const grab = (name) => JSON.parse(src.match(new RegExp(`export const ${name}: Record<string, string> = (\\{[\\s\\S]*?\\n\\})`))[1])
    return { uid: grab('QUIZ_UID_ALIASES'), title: grab('QUIZSET_TITLE_ALIASES') }
  } catch {
    return { uid: {}, title: {} }
  }
}

const table = readTable()
const found = { uid: {}, title: {} }
const warns = []
const changed = git(`diff --name-only ${BASE} -- "apps/*/web/src/*.vue"`).trim().split('\n').filter(Boolean)
for (const f of changed) {
  let before = ''
  try { before = git(`show ${BASE}:"${f}"`) } catch { continue } // 새 파일
  let after = ''
  try { after = readFileSync(join(ROOT, f), 'utf8') } catch { continue } // 지운 파일
  for (const [kind, get] of [['uid', questions], ['title', titles]]) {
    const { out, unpaired } = pairs(get(before), get(after))
    for (const [o, n] of out) found[kind][o] = n
    for (const u of unpaired) warns.push(`${f}: ${kind === 'uid' ? '문항' : '세트 제목'} ${u} — 넣거나 뺀 문제가 있어 자동으로 짝짓지 않음`)
  }
}

const missing = []
for (const kind of ['uid', 'title']) for (const [o, n] of Object.entries(found[kind])) if (table[kind][o] !== n) missing.push([kind, o, n])

for (const w of warns) console.log(`  ⚠ ${w}`)
if (CHECK) {
  if (missing.length) {
    console.log(`✗ 풀이 기록 이관 표에 빠진 변경 ${missing.length}건 — node scripts/quiz-aliases.mjs 를 실행해 packages/ui/src/quizAliases.ts 를 갱신하세요`)
    for (const [kind, o, n] of missing.slice(0, 5)) console.log(`    ${kind === 'uid' ? '문항' : '세트'}: ${o.slice(0, 50)} → ${n.slice(0, 50)}`)
    process.exit(1)
  }
  console.log(`✓ 풀이 기록 이관 표 — 빠진 변경 없음 (문항 ${Object.keys(table.uid).length} · 세트 제목 ${Object.keys(table.title).length})`)
  process.exit(0)
}

for (const [kind, o, n] of missing) table[kind][o] = n
const body = (obj) => JSON.stringify(Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b, 'ko'))), null, 2)
writeFileSync(OUT, `// 자동 생성 — node scripts/quiz-aliases.mjs (문항 문구·세트 제목을 바꾼 뒤 커밋 전에 실행. 커밋 훅이 --check 로 확인한다)
//
// QuizSet 은 풀이 현황을 \`{접두사}-quizset-v1:{세트 제목}\` 에, 맞힌 문제를 문항 문구(uid) 그대로 저장한다.
// 문구를 고치면 이미 푼 기록이 끊기므로, 옛 문구 → 새 문구를 여기 모아 두고 QuizSet 이 읽을 때 이어 준다.
// 한 번 넣은 항목은 지우지 않는다(오래전 기록을 가진 학습자가 있을 수 있다). 연쇄 변경(A→B→C)도 따라간다.

/** 옛 문항 문구 → 새 문항 문구 */
export const QUIZ_UID_ALIASES: Record<string, string> = ${body(table.uid)}

/** 옛 세트 제목 → 새 세트 제목 */
export const QUIZSET_TITLE_ALIASES: Record<string, string> = ${body(table.title)}
`)
console.log(`✓ quizAliases.ts 갱신 — 새로 더한 것 ${missing.length}건 (문항 ${Object.keys(table.uid).length} · 세트 제목 ${Object.keys(table.title).length})`)
