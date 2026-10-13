// scripts/verify-layer2.mjs
// 개인화 2층 실검증 E2E — "포털이 각 부의 localStorage 학습 데이터를 읽는다" (2026-07-12 검증 통과)
// 시나리오: 깨끗한 포털(대조군) 확인 → /part1/ 페이지에서 각 부 키 기록(같은 origin)
//           → 포털(/)에서 진도 배지·다음 목적지·복습 먼저·심화 과정 열림 카드 확인.
//
// 사용법 (포털·useProgress 를 고친 뒤 회귀 확인용):
//   1) npm run deploy:build                          — 전 앱을 단일 origin 으로 조립
//   2) npm i --no-save playwright-core               — 브라우저 구동 라이브러리(저장 안 함)
//   3) PORT=4199 node scripts/serve-deploy.mjs &     — 조립본 서빙
//   4) PORT=4199 node scripts/verify-layer2.mjs      — 17항목 검증 (전부 ✓ 면 성공)
// 브라우저는 시스템 Edge 를 쓴다 — 경로가 다르면 EDGE_PATH 환경변수로 지정.
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const require = createRequire(join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'))
const { chromium } = require('playwright-core')

const BASE = `http://localhost:${process.env.PORT || 4199}`
const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'

let pass = 0
let fail = 0
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; console.log(`  ✗ ${name} ${extra}`) }
}
const body = async (page) => await page.locator('body').innerText()

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const ctx = await browser.newContext()
const page = await ctx.newPage()
const consoleErrors = []
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
page.on('pageerror', (e) => consoleErrors.push(String(e)))

console.log('▶ 대조군 — 학습 기록이 없는 깨끗한 포털')
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
let t = await body(page)
check('진도 배지 없음', !t.includes('진도 '))
check('복습/심화 카드 없음', !t.includes('복습 먼저') && !t.includes('심화 과정 열림'))
check('다음 목적지 = 여기서 시작 · 1부 전반', t.includes('여기서 시작') && t.includes('1부 전반: 벡터·행렬'))

console.log('▶ 학습 기록 만들기 — /part1/ 페이지에서 각 부 키 기록 (같은 origin 공유가 핵심)')
await page.goto(`${BASE}/part1/`, { waitUntil: 'networkidle' })
await page.evaluate(() => {
  // 1부: 필수 트랙(ch1~6) 완주 → 단계1 완료 + 심화 과정 열림 조건
  localStorage.setItem('la-progress-v1', JSON.stringify(['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6']))
  // 4부: 추론편 2챕터 + 학습편(ch11) 완료 → 쪼갠 단계(3단계 vs 5단계) 정확 계산 검증
  localStorage.setItem('tf-progress-v1', JSON.stringify(['ch1', 'ch2', 'ch11']))
  // 9부: 2챕터 — 이번에 신설된 부의 2층 편입 확인
  localStorage.setItem('num-progress-v1', JSON.stringify(['ch1', 'ch2']))
  // 12부: 2챕터 — 나중에 들어온 부(접두사 sd)도 같은 길로 읽히는지
  localStorage.setItem('sd-progress-v1', JSON.stringify(['ch1', 'ch2']))
  // 3부: 복습 북마크 2건 → "복습 먼저" 카드
  localStorage.setItem('stat-review-v1', JSON.stringify([
    { id: 'ch4-s2', chapter: 'ch4', label: '조건부 확률 — 베이즈 직관' },
    { id: 'ch5-s1', chapter: 'ch5', label: '확률분포 읽기' },
  ]))
})
check('키 기록 완료 (la·tf·num·sd·stat)', true)

console.log('▶ 포털(/) — 2층 읽기 검증')
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
t = await body(page)

// ① 지도 카드 진도 배지
const step1 = await page.locator('li', { hasText: '1부 전반: 벡터·행렬' }).first().innerText()
check('단계1 (1부 전반) — 진도 6/6', step1.includes('진도 6/6'))
const step3 = await page.locator('li', { hasText: '4부 추론편' }).first().innerText()
check('단계3 (4부 추론편 ch1~10,12) — 진도 2/11 (ch11 제외 계산)', step3.includes('진도 2/11'))
const step5 = await page.locator('li', { hasText: '4부 학습편' }).first().innerText()
check('단계5 (4부 학습편 ch11) — 진도 1/1 (쪼갠 단계 정확)', step5.includes('진도 1/1'))
const step11 = await page.locator('li', { hasText: '9부: 수치 계산' }).first().innerText()
check('단계11 (9부) — 진도 2/11 (신설 부 편입)', step11.includes('진도 2/11'))
const step14 = await page.locator('li', { hasText: '12부: 시스템 다이내믹스' }).first().innerText()
check('단계14 (12부) — 진도 2/12 (12부 편입)', step14.includes('진도 2/12'))
const step8 = await page.locator('li', { hasText: '후반 심화' }).first().innerText()
check('단계8 (후반 심화 ch7~12·ch8~10) — 진도 배지 없음 (필수만 완료했으므로)', !step8.includes('진도 '))

// ② 다음 목적지 — 단계1이 100%라 단계2(3부 전반)로
check('다음 목적지 = 이어서 학습 · 3부 전반', t.includes('이어서 학습') && t.includes('3부 전반: 확률의 언어'))

// ③ 복습 먼저 카드 (stat-review-v1)
check('복습 먼저 카드 — 3부 확률통계 · 2개', t.includes('복습 먼저') && t.includes('3부 확률통계에 복습 표시 2개'))
check('복습 미리보기 라벨 노출', t.includes('조건부 확률 — 베이즈 직관') && t.includes('확률분포 읽기'))
check('복습 카드 링크 → /part3/review', (await page.locator('a[href="/part3/review"]').count()) > 0)

// ④ 심화 과정 열림 카드 (1부 필수 완주)
check('심화 과정 열림 카드 — 1부 선형대수 · 6챕터', t.includes('심화 과정 열림') && t.includes('1부 선형대수 필수 트랙 완주! 심화 6챕터가 열렸어요'))

console.log('▶ 반대 방향 — 부 앱도 같은 키를 읽는다 (양방향 공유)')
await page.goto(`${BASE}/part1/`, { waitUntil: 'networkidle' })
t = await body(page)
check('1부 앱 — 자기 진도 6 반영 (사이드바 6/N)', /6\s*\/\s*\d+/.test(t.replace(/\s/g, '')) || t.includes('6/18') || t.includes('6/12'))

console.log('▶ 콘솔 에러')
const realErrors = consoleErrors.filter((e) => !/favicon/i.test(e))
check(`콘솔 에러 0 (실제 ${realErrors.length})`, realErrors.length === 0, realErrors.slice(0, 3).join(' | '))

await browser.close()
console.log(`\n결과: ${pass} 통과 / ${fail} 실패`)
process.exit(fail === 0 ? 0 : 1)
