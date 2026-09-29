// scripts/verify-personalization.mjs
// 온톨로지 3단계(개인화) 검증 — 조립본에 localStorage(복습 북마크 · 진도 · 진단)를 심고 포털이 그걸 개념으로 읽는지.
//   ① 홈 복습 경로: 북마크 → 개념 → 선수 개념까지, 먼 것부터(선수가 앞에) · 완료한 장은 ✓ · 표시한 개념은 ★
//   ② 홈 진단 개념 칩: 틀린 문항의 개념이 "다시 볼 개념"에, 설명 문장에도 등장
//   ③ 개념 지도: 헷갈린 개념에 amber ring · 상세 배지 · 완료한 장의 개념에 ✓
//   결정적 입력 → 결정적 화면. 백엔드·로그인 불필요(전부 localStorage).
//
// 사용법 (verify-smoke.mjs 와 같은 준비):
//   npm run deploy:build && PORT=4199 node scripts/serve-deploy.mjs &   — 조립본 서빙
//   PORT=4199 node scripts/verify-personalization.mjs                   — 8건 전부 ✓ 면 성공
// 브라우저는 e2e/lib.mjs 의 browserPath()(설치된 Edge/Chrome).
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(ROOT, 'package.json'))
const { chromium } = require('playwright-core')
const { browserPath } = await import(new URL('../e2e/lib.mjs', import.meta.url).href)

const BASE = `http://localhost:${process.env.PORT || 4199}`

// 시드 — 진단은 v1·p2·c3·l1 을 틀림 → 헷갈린 개념 = 벡터의 길이·조건부 확률·연쇄법칙·지수와 로그(4개)
//        북마크 = 5부 KL 발산(정의처) · 6부 RLHF 의 KL 페널티(회수처 → kl-divergence) · 1부 내적
//        진도 = 3부 ch5·ch7 완료 → 확률분포·기댓값·큰 수의 법칙 ✓
const seed = {
  'it-review-v1': [{ id: 'ch5-s1', chapter: 'ch5', label: '1. KL = 초과 비트 정의' }],
  'tame-review-v1': [{ id: 'ch6-s2', chapter: 'ch6', label: '2. 목줄 — KL 발산의 귀환' }],
  'la-review-v1': [{ id: 'ch2-s4', chapter: 'ch2', label: '4. 내적' }],
  'stat-progress-v1': ['ch5', 'ch7'],
  'hub-diagnosis-v1': {
    answers: { v1: 0, v2: 1, v3: 2, p1: 2, p2: 0, p3: 1, c1: 1, c2: 1, c3: 0, l1: 0, l2: 1, l3: 1 },
    confidence: { overall: 3, symbols: 3 },
    savedAt: 1757100000000,
  },
}

let pass = 0
const fails = []
const check = (name, ok, extra = '') => {
  if (ok) pass++
  else {
    fails.push(`${name} ${extra}`)
    console.log(`  ✗ ${name} ${extra}`)
  }
}

const browser = await chromium.launch({ executablePath: browserPath(), headless: true })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
await ctx.addInitScript((s) => {
  for (const [k, v] of Object.entries(s)) localStorage.setItem(k, JSON.stringify(v))
}, seed)
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

// ① ② 포털 홈
await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 20000 })
await page.waitForSelector('[data-review-path]', { timeout: 10000 }).catch(() => {})
const toggle = page.locator('[data-review-toggle]')
if (await toggle.count()) await toggle.click()
const rp = await page.locator('[data-review-path]').innerText().catch(() => '')
check('복습 경로 카드 (표시한 개념 3개 전부)', /★ 내적/.test(rp) && /★ 코사인 유사도/.test(rp) && /★ KL 발산/.test(rp), rp ? '' : '카드 없음')
check('복습 경로 — 선수(엔트로피)가 KL 발산보다 앞에', rp.indexOf('엔트로피') !== -1 && rp.indexOf('엔트로피') < rp.indexOf('KL 발산'))
check('복습 경로 — 완료한 장의 개념 ✓', /✓ 확률분포/.test(rp))
const dc = await page.locator('[data-diag-concepts]').innerText().catch(() => '')
check('진단 개념 칩 — 다시 볼 개념 4', /벡터의 길이/.test(dc) && /조건부 확률/.test(dc) && /연쇄법칙/.test(dc) && /지수와 로그/.test(dc), dc ? '' : '칩 없음')
check('진단 개념 칩 — 아는 개념', /아는 개념/.test(dc) && /내적/.test(dc))
check('설명 문장에 헷갈린 개념', /진단에서 헷갈린 개념:/.test(await page.locator('main').innerText()))

// ③ 개념 지도
await page.goto(`${BASE}/concepts?c=chain-rule`, { waitUntil: 'networkidle', timeout: 20000 })
await page.waitForSelector('[data-concept-node]', { timeout: 10000 })
const amber = await page.locator('[data-concept-node].ring-amber-600').count()
check('지도 — 헷갈린 개념 ring 4개', amber === 4, `실제 ${amber}`)
const mapText = await page.locator('main').innerText()
check('지도 — 상세 배지 + 아는 개념 ✓', /진단에서 헷갈린 개념 · 다시 볼 것/.test(mapText) && /✓ 확률분포/.test(mapText))

await browser.close()
const errs = errors.filter((e) => !/favicon/i.test(e))
if (errs.length) console.log(`  콘솔 에러 ${errs.length}: ${errs[0].slice(0, 160)}`)
console.log(`\n결과: ${pass} 통과 / ${fails.length} 실패 — 개인화 검사 ${pass + fails.length}건${errs.length ? ` (콘솔 에러 ${errs.length})` : ''}`)
process.exit(fails.length === 0 && errs.length === 0 ? 0 : 1)
