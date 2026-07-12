// scripts/verify-smoke.mjs
// 전 부 스모크 E2E — 포털(홈·진단·구조도) + 9개 부의 모든 공개 챕터 라우트가 렌더되고 콘솔 에러가 없는지.
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

// 포털
await visit('/', '포털 홈')
await visit('/diagnose', '포털 진단')
await visit('/map', '포털 학습 구조도')

// 각 부 — 홈 + 전 공개 챕터
let totalChapters = 0
for (let p = 1; p <= 9; p++) {
  const slugs = slugsOf(p)
  totalChapters += slugs.length
  await visit(`/part${p}/`, `part${p} 홈 (${slugs.length}챕터)`)
  for (const s of slugs) await visit(`/part${p}/ch/${s}`, `part${p}/${s}`)
  process.stdout.write(`  part${p} ✓ (${slugs.length})\n`)
}

await browser.close()
console.log(`\n결과: ${pass} 통과 / ${fails.length} 실패 — 페이지 ${pass + fails.length}개 (챕터 ${totalChapters} + 홈 10 + 포털 진단·구조도 2)`)
process.exit(fails.length === 0 ? 0 : 1)
