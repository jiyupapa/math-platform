// scripts/shoot-deck-assets.mjs
// 발표 덱(docs/hackathon/11_pitch_deck.pptx) 임베드용 실물 스크린샷 생성 → docs/hackathon/assets/*.png
// 덱 자체는 scripts/build-pitch-deck.py 가 이 자산을 읽어 생성한다.
// 2026-10-13: 세 기둥(LLM · 온톨로지 · SD) 강조 — 개념 지도는 12부 'S자 성장' 선택, LLM 장(추천 설명·12부 튜터)·
//   SD 장(7장 인과지도·12장 캡스톤 저량-유량도·이탈 시나리오) 자산 추가. 튜터·추천 설명은 로컬 Ollama 가 있어야 찍힌다.
//
// 사용법 (verify-smoke.mjs 와 동일한 준비):
//   1) npm run deploy:build                          — 전 앱을 단일 origin 으로 조립
//   2) npm i --no-save playwright-core               — 브라우저 구동 라이브러리(저장 안 함)
//   3) PORT=4199 node scripts/serve-deploy.mjs &     — 조립본 서빙
//   4) PORT=4199 node scripts/shoot-deck-assets.mjs
// 브라우저는 시스템 Edge — 경로가 다르면 EDGE_PATH 환경변수로 지정.
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync } from 'node:fs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(ROOT, 'package.json'))
const { chromium } = require('playwright-core')

const BASE = `http://localhost:${process.env.PORT || 4199}`
const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const OUT = join(ROOT, 'docs/hackathon/assets')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: EDGE, headless: true })

async function fresh() {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  return { ctx, page: await ctx.newPage() }
}
const settle = (page, ms = 400) => page.waitForTimeout(ms)
const mapSection = (page) =>
  page.locator('section', { has: page.locator('h2', { hasText: '학습 경로 지도' }) }).first()

// ── ① 진단 전 — 포털 지도(11단계 전체) + 진단 화면 ───────────────────────────
{
  const { ctx, page } = await fresh()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await settle(page)
  await mapSection(page).screenshot({ path: join(OUT, 'map_fresh.png') })
  console.log('✓ map_fresh')
  await page.goto(`${BASE}/diagnose`, { waitUntil: 'networkidle' })
  await settle(page)
  await page.screenshot({ path: join(OUT, 'diagnose.png') })
  console.log('✓ diagnose')
  await ctx.close()
}

// ── ② 진단 후 — 벡터·확률 관문 통과(해당 단계 면제), 미분·log 미통과 프로필 ──
const DIAG = JSON.stringify({
  answers: { v1: 1, v2: 1, v3: 2, p1: 2, p2: 1, p3: 1, c1: 0, c2: 0, c3: 2, l1: 3, l2: 0, l3: 0 },
  confidence: { overall: 3, symbols: 2 },
  savedAt: Date.now(),
})
{
  const { ctx, page } = await fresh()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.evaluate((d) => {
    localStorage.setItem('hub-diagnosis-v1', d)
    localStorage.setItem('hub-baseline-v1', d)
  }, DIAG)
  await page.reload({ waitUntil: 'networkidle' })
  await settle(page)
  await mapSection(page).screenshot({ path: join(OUT, 'map_diagnosed.png') })
  await page.locator('main').screenshot({ path: join(OUT, 'home_diagnosed_full.png') })
  // 보라색 개인 요약 카드 단독 컷 (슬라이드 "데모 1" 용)
  await page.locator('div.rounded-2xl.bg-indigo-600').first().screenshot({ path: join(OUT, 'summary_card.png') })
  console.log('✓ map_diagnosed + home_diagnosed_full + summary_card')
  await ctx.close()
}

// ── ③ 타이틀 배경 — 진단+진도+복습 시드(살아 있는 홈 상단) ───────────────────
{
  const { ctx, page } = await fresh()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.evaluate((d) => {
    localStorage.setItem('hub-diagnosis-v1', d)
    localStorage.setItem('hub-baseline-v1', d)
    localStorage.setItem('la-progress-v1', JSON.stringify(['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6']))
    localStorage.setItem('tf-progress-v1', JSON.stringify(['ch1', 'ch2', 'ch11']))
    localStorage.setItem('num-progress-v1', JSON.stringify(['ch1', 'ch2']))
    localStorage.setItem('stat-review-v1', JSON.stringify([
      { id: 'ch4-s2', chapter: 'ch4', label: '2. 조건부 확률의 정의' },
      { id: 'ch5-s1', chapter: 'ch5', label: '1. 확률변수: 결과에 숫자 붙이기' },
    ]))
  }, DIAG)
  await page.reload({ waitUntil: 'networkidle' })
  await settle(page)
  await page.screenshot({ path: join(OUT, 'home_hero.png') })
  console.log('✓ home_hero')
  await ctx.close()
}

// ── ④ 4부 라이브 투어 5컷 — 랩 카드 요소 샷 ─────────────────────────────────
// 랩 루트는 공통 래퍼 `my-5 rounded-xl border border-slate-200 bg-white` (ConceptCard 는 유색 배경이라 제외됨)
const LABS = [
  { ch: 'ch2', name: 'lab_ch2_tokenize', anchor: '문장: 직접 고치거나' },
  { ch: 'ch3', name: 'lab_ch3_embedding', anchor: '단어 지도' },
  { ch: 'ch6', name: 'lab_ch6_attention', anchor: 'Query(질문) 벡터' },
  { ch: 'ch9', name: 'lab_ch9_output', anchor: '마지막 문맥 벡터' },
  { ch: 'ch12', name: 'lab_ch12_sampling', anchor: null },
]
{
  const { ctx, page } = await fresh()
  for (const { ch, name, anchor } of LABS) {
    await page.goto(`${BASE}/part4/ch/${ch}`, { waitUntil: 'networkidle' })
    await settle(page, 600)
    const all = page.locator('main div.my-5.rounded-xl.border.border-slate-200.bg-white')
    let card = anchor ? all.filter({ hasText: anchor }) : all
    if ((await card.count()) === 0) card = all // 앵커 불일치 시 첫 카드로 폴백
    const el = card.first()
    await el.scrollIntoViewIfNeeded()
    await settle(page, 300)
    await el.screenshot({ path: join(OUT, `${name}.png`) })
    console.log(`✓ ${name} (카드 ${await all.count()}개 중)`)
  }
  await ctx.close()
}

// ── ⑤ 개념 온톨로지 — 개념 지도(선택 상태) · 용어 대조표 · 챕터 띠 ───────────────────
{
  const { ctx, page } = await fresh()
  await page.goto(`${BASE}/concepts?c=logistic-growth`, { waitUntil: 'networkidle' })
  await settle(page, 800)
  await page.locator('div.overflow-x-auto.rounded-2xl').first().screenshot({ path: join(OUT, 'concept_map.png') })
  console.log('✓ concept_map (12부 S자 성장 선택 — 선수 사슬이 2부 시그모이드·지수와 로그까지)')
  await page.goto(`${BASE}/glossary`, { waitUntil: 'networkidle' })
  await settle(page, 800)
  await page.screenshot({ path: join(OUT, 'glossary.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } })
  console.log('✓ glossary')
  await page.goto(`${BASE}/part5/ch/ch5`, { waitUntil: 'networkidle' })
  await settle(page, 800)
  await page.locator('[data-concept-strip]').screenshot({ path: join(OUT, 'strip_p5ch5.png') })
  console.log('✓ strip_p5ch5')
  await ctx.close()
}

// ── ⑥ 홈 개인화 — 진단 개념 칩 + 복습 경로 (③과 같은 시드) ────────────────────────
{
  const { ctx, page } = await fresh()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.evaluate((d) => {
    localStorage.setItem('hub-diagnosis-v1', d)
    localStorage.setItem('hub-baseline-v1', d)
    localStorage.setItem('la-progress-v1', JSON.stringify(['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6']))
    localStorage.setItem('stat-review-v1', JSON.stringify([
      { id: 'ch4-s2', chapter: 'ch4', label: '2. 조건부 확률의 정의' },
      { id: 'ch5-s1', chapter: 'ch5', label: '1. 확률변수: 결과에 숫자 붙이기' },
    ]))
    localStorage.setItem('it-review-v1', JSON.stringify([{ id: 'ch5-s1', chapter: 'ch5', label: '1. KL = 초과 비트 정의' }]))
  }, DIAG)
  await page.reload({ waitUntil: 'networkidle' })
  await settle(page, 1000)
  await page.locator('[data-diag-concepts]').screenshot({ path: join(OUT, 'home_diag_concepts.png') })
  const toggle = page.locator('[data-review-toggle]')
  if (await toggle.count()) await toggle.click()
  await settle(page, 300)
  await page.locator('[data-review-path]').screenshot({ path: join(OUT, 'review_path.png') })
  console.log('✓ home_diag_concepts + review_path')
  await ctx.close()
}

// ── ⑦ 튜터 부 간 안내 — 1부 튜터에게 5부 개념을 묻는다 (로컬 Ollama 필요 — 없으면 건너뜀) ──
{
  const { ctx, page } = await fresh()
  await page.goto(`${BASE}/part1/ch/ch2`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'AI 튜터 열기' }).click()
  await settle(page, 2000) // 서버·모델 확인
  const input = page.locator('input[placeholder="질문을 입력하세요…"]')
  const ready = await input.isEnabled().catch(() => false)
  if (ready) {
    await input.fill('KL 발산은 어디서 배워요?')
    await input.press('Enter')
    await settle(page, 300)
    if ((await input.inputValue()) !== '') await page.locator('button:has-text("전송")').first().click().catch(() => {})
    try {
      await page.locator('div.fixed.bottom-24').getByText('5부 5장').first().waitFor({ timeout: 90000 })
      await settle(page, 2500) // 스트리밍 마무리
      await page.locator('div.fixed.bottom-24').screenshot({ path: join(OUT, 'tutor_crosspart.png') })
      console.log('✓ tutor_crosspart ("5부 5장" 안내)')
    } catch {
      console.log('· tutor_crosspart 건너뜀 — 90초 안에 "5부 5장" 이 안 나옴 (기존 자산 유지)')
    }
  } else {
    console.log('· tutor_crosspart 건너뜀 — Ollama 미연결 (기존 자산 유지)')
  }
  await ctx.close()
}

// ── ⑧ LLM — 포털 추천 설명(규칙이 정한 경로를 LLM 이 풀어 줌) · 12부 튜터의 부 간 안내 (Ollama 필요) ──
async function settleText(loc, maxMs = 60000) {
  // 스트리밍이 멈출 때까지(1.5초 동안 글자 수 변화 없음) 기다린다
  let last = -1
  let still = 0
  for (let t = 0; t < maxMs; t += 500) {
    const n = (await loc.innerText().catch(() => '')).length
    if (n > 30 && n === last) still += 500
    else still = 0
    if (still >= 1500) return true
    last = n
    await new Promise((r) => setTimeout(r, 500))
  }
  return false
}
{
  const { ctx, page } = await fresh()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.evaluate((d) => {
    localStorage.setItem('hub-diagnosis-v1', d)
    localStorage.setItem('hub-baseline-v1', d)
  }, DIAG)
  await page.reload({ waitUntil: 'networkidle' })
  await settle(page)
  const cardEl = page.locator('div.rounded-2xl.bg-indigo-600').first()
  await cardEl.locator('button', { hasText: 'AI 강사에게 더 듣기' }).click()
  const out = cardEl.locator('p.bg-indigo-50')
  if (await out.waitFor({ timeout: 20000 }).then(() => true).catch(() => false)) {
    await settleText(out)
    await cardEl.screenshot({ path: join(OUT, 'summary_explained.png') })
    console.log('✓ summary_explained (규칙 경로 + LLM 설명)')
  } else {
    console.log('· summary_explained 건너뜀 — Ollama 미연결 (기존 자산 유지)')
  }
  await ctx.close()
}
{
  const { ctx, page } = await fresh()
  await page.goto(`${BASE}/part12/ch/ch5`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'AI 튜터 열기' }).click()
  await settle(page, 2000)
  const input = page.locator('input[placeholder="질문을 입력하세요…"]')
  if (await input.isEnabled().catch(() => false)) {
    await input.fill('경사하강은 어디서 배워요?')
    await input.press('Enter')
    try {
      await page.locator('div.fixed.bottom-24').getByText('2부 9장').first().waitFor({ timeout: 90000 })
      await page.waitForSelector('button:has-text("중지")', { state: 'detached', timeout: 60000 }).catch(() => {})
      await settle(page, 1200)
      await page.locator('div.fixed.bottom-24').screenshot({ path: join(OUT, 'tutor_sd.png') })
      console.log('✓ tutor_sd (12부 5장 튜터 → "2부 9장" 안내)')
    } catch {
      console.log('· tutor_sd 건너뜀 — 90초 안에 "2부 9장" 이 안 나옴 (기존 자산 유지)')
    }
  } else {
    console.log('· tutor_sd 건너뜀 — Ollama 미연결 (기존 자산 유지)')
  }
  await ctx.close()
}

// ── ⑨ SD — 7장 인과지도(입소문 R · 포화 B) · 12장 캡스톤 저량-유량도 · 이탈 시나리오 ──────────
{
  const { ctx, page } = await fresh()
  await page.goto(`${BASE}/part12/ch/ch7`, { waitUntil: 'networkidle' })
  await settle(page, 600)
  const cld = page.locator('main div.min-w-0.rounded-lg.bg-slate-50.p-2').filter({ has: page.locator('svg') }).first()
  await cld.scrollIntoViewIfNeeded()
  await settle(page, 300)
  await cld.screenshot({ path: join(OUT, 'sd_cld.png') })
  console.log('✓ sd_cld (7장 S자 성장: 입소문 R · 포화 B)')

  await page.goto(`${BASE}/part12/ch/ch12`, { waitUntil: 'networkidle' })
  await settle(page, 600)
  const lab = page.locator('main div.my-5.rounded-xl.border-2.border-indigo-200').first()
  await lab.scrollIntoViewIfNeeded()
  await settle(page, 300)
  await lab.locator('div.mt-3.rounded-lg.bg-slate-50.p-2').first().screenshot({ path: join(OUT, 'sd_sfd.png') })
  await lab.screenshot({ path: join(OUT, 'sd_capstone.png') })
  await lab.locator('button', { hasText: '현실: 이탈 있음' }).click()
  await settle(page, 500)
  await lab.screenshot({ path: join(OUT, 'sd_capstone_churn.png') })
  console.log('✓ sd_sfd + sd_capstone + sd_capstone_churn (12장 캡스톤)')
  await ctx.close()
}

await browser.close()
console.log('완료 →', OUT)
