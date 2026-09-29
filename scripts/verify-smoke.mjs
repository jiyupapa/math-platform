// scripts/verify-smoke.mjs
// 전 부 스모크 E2E — 포털(홈·진단·구조도) + 11개 부의 모든 공개 챕터 라우트가 렌더되고 콘솔 에러가 없는지,
// 그리고 부마다 협업 주석 → AI 튜터 연동이 살아 있는지(백엔드·Ollama 불필요).
// 콘텐츠 정정 후 회귀 안전망 (각 부 chapters.ts 에서 슬러그를 동적으로 읽는다).
//
// 사용법:
//   1) npm run deploy:build                          — 전 앱을 단일 origin 으로 조립
//   2) npm i --no-save playwright-core               — 브라우저 구동 라이브러리(저장 안 함)
//   3) PORT=4199 node scripts/serve-deploy.mjs &     — 조립본 서빙
//   4) PORT=4199 node scripts/verify-smoke.mjs       — 전 페이지 스모크 (전부 ✓ 면 성공)
// 브라우저는 시스템 Edge — 경로가 다르면 EDGE_PATH 환경변수로 지정.
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(ROOT, 'package.json'))
const { chromium } = require('playwright-core')

const BASE = `http://localhost:${process.env.PORT || 4199}`
const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'

// 각 부의 공개 챕터 슬러그를 chapters.ts 에서 읽는다 (comingSoon 은 제외)
function slugsOf(part) {
  const src = readFileSync(join(ROOT, `apps/part${part}/web/src/data/chapters.ts`), 'utf-8')
  const out = []
  for (const m of src.matchAll(/\{[^{}]*slug:\s*'([^']+)'[^{}]*\}/gs)) {
    if (!m[0].includes('comingSoon: true')) out.push(m[1])
  }
  return out
}

let pass = 0
const fails = []
function check(name, ok, extra = '') {
  if (ok) pass++
  else {
    fails.push(`${name} ${extra}`)
    console.log(`  ✗ ${name} ${extra}`)
  }
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await (await browser.newContext()).newPage()
let consoleErrors = []
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
page.on('pageerror', (e) => consoleErrors.push(String(e)))

async function visit(url, name) {
  consoleErrors = []
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle', timeout: 20000 })
  const main = await page.locator('main').first().innerText().catch(() => '')
  const errs = consoleErrors.filter((e) => !/favicon/i.test(e))
  check(name, main.trim().length > 30 && errs.length === 0, errs.length ? `콘솔 에러 ${errs.length}: ${errs[0]?.slice(0, 120)}` : main.trim().length <= 30 ? '본문 비어 있음' : '')
}

// 협업 주석 → AI 튜터 연동 (부당 1건). NotePanel 의 '🤖 AI에게 묻기'는 window 이벤트('note-ask-ai')로 그 부의
// TutorChat 창을 연다(packages/ui/src/noteAsk.ts). 로그인·백엔드 없이 이 계약만 본다 — Ollama 조회를 503 으로 막아
// 질문은 보내지 않고, 창이 열려 '연결할 수 없어요' 안내가 뜨는지 확인한다.
// (받는 쪽이 1부에만 있어 2~11부에서 무반응이던 결함을 2026-09-28 공용화로 고쳤다 — 부마다 다시 새지 않게)
async function checkNoteAsk(p) {
  await page.route('**/api/tags', (route) =>
    route.fulfill({ status: 503, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' }),
  )
  await page.evaluate(() =>
    window.dispatchEvent(
      new CustomEvent('note-ask-ai', {
        detail: { annotationId: 'smoke', question: '스모크 질문', context: '스모크', mine: false },
      }),
    ),
  )
  const opened = await page
    .getByText('로컬 AI(Ollama)에 연결할 수 없어요')
    .waitFor({ timeout: 5000 })
    .then(() => true, () => false)
  await page.unroute('**/api/tags')
  check(`part${p} 주석→튜터 연동`, opened, opened ? '' : "'note-ask-ai' 이벤트에 튜터 창이 반응하지 않음")
}

// 포털
await visit('/', '포털 홈')
await visit('/diagnose', '포털 진단')
await visit('/map', '포털 학습 구조도')
await visit('/concepts', '포털 개념 지도')
await visit('/glossary', '포털 용어 대조표')

// 온톨로지 2단계 — 개념 지도의 노드가 실제로 그려졌는가(그래프 fetch 포함), 챕터 상단 개념 띠가 렌더되는가 (각 1건)
// 온톨로지 4단계 — 용어 대조표의 행(정본 metaphors)이 채워졌는가 (1건)
{
  await page.goto(`${BASE}/concepts`, { waitUntil: 'networkidle', timeout: 20000 })
  const nodes = await page.locator('[data-concept-node]').count()
  check('개념 지도 노드', nodes >= 100, nodes < 100 ? `노드 ${nodes}개 (concept-graph.json 누락?)` : '')
  // 맨 윗줄(1부) 노드를 골랐을 때 같은 줄을 잇는 호가 보드 위 경계에 잘리지 않는가 — 호 꼭대기 y ≥ 0 (1건)
  await page.goto(`${BASE}/concepts?c=vector`, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForSelector('main svg[aria-hidden] path[d^="M"]', { timeout: 5000 }).catch(() => {})
  const arcTop = await page.evaluate(() => {
    const ys = [...document.querySelectorAll('main svg[aria-hidden] path[d^="M"]')].map((p) => p.getBBox().y)
    return ys.length ? Math.min(...ys) : NaN
  })
  check('개념 지도 연결선 (1부 노드)', arcTop >= 0, Number.isNaN(arcTop) ? '연결선 없음' : `호 꼭대기 y=${arcTop.toFixed(1)} — 보드 위로 넘침`)
  await page.goto(`${BASE}/glossary`, { waitUntil: 'networkidle', timeout: 20000 })
  const rows = await page.locator('[data-glossary-row]').count()
  check('용어 대조표 행', rows >= 60, rows < 60 ? `행 ${rows}개` : '')
  await page.goto(`${BASE}/part5/ch/ch5`, { waitUntil: 'networkidle', timeout: 20000 })
  const strip = await page.locator('[data-concept-strip]').first().innerText().catch(() => '')
  check('개념 띠 (part5/ch5)', /KL 발산/.test(strip), strip ? `내용: ${strip.slice(0, 80)}` : '띠 없음')
}

// 각 부 — 홈 + 전 공개 챕터 (comingSoon 챕터는 자동 제외 — 제작 중인 부는 홈+공개분만 검사)
let totalChapters = 0
for (let p = 1; p <= 11; p++) {
  const slugs = slugsOf(p)
  totalChapters += slugs.length
  await visit(`/part${p}/`, `part${p} 홈 (${slugs.length}챕터)`)
  await checkNoteAsk(p)
  for (const s of slugs) await visit(`/part${p}/ch/${s}`, `part${p}/${s}`)
  process.stdout.write(`  part${p} ✓ (${slugs.length})\n`)
}

await browser.close()
console.log(`\n결과: ${pass} 통과 / ${fails.length} 실패 — 검사 ${pass + fails.length}건 (챕터 ${totalChapters} + 홈 12 + 포털 진단·구조도·개념 지도·용어 대조표 4 + 온톨로지 렌더 4 + 주석→튜터 연동 11)`)
process.exit(fails.length === 0 ? 0 : 1)
