// 부 확대 — 전 12부에 💬 가 켜졌는가 + **부 격리**.
// 핵심 리스크: 여러 부가 같은 챕터 슬러그(ch1)·같은 앵커 id(ch1-s1)를 쓰고 part 컬럼만이 구분자다.
// 부 번호를 잘못 주입하면 남의 부 메모가 조용히 섞인다 → 양방향으로 확인한다.
import {
  CONFIG, requireConfig, requireServer, reporter, sleep,
  signIn, safeDeleteAnnotations, launchBrowser, loginPage,
} from './lib.mjs'

requireConfig()
await requireServer()
const r = reporter('부 확대·격리')

const ITEM = 'ch1-s1' // 전 부 공통 앵커 — 격리 검증에 최적(part1 은 보호 대상이라 안 건드린다)
const TEST_PARTS = [2, 3, 5, 9, 11]

const { sb } = await signIn(CONFIG.userA)
for (const p of TEST_PARTS) await safeDeleteAnnotations(sb, { part: p, itemId: ITEM })

const browser = await launchBrowser()
const ctx = await browser.newContext()
const page = await loginPage(ctx, CONFIG.userA)
r.check('로그인', (await page.locator(`text=${CONFIG.userA}`).count()) > 0)

r.section('확대 — 전 12부에서 마커가 뜨는가')
const counts = {}
for (const p of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
  await page.goto(`${CONFIG.base}/part${p}/ch/ch1`, { waitUntil: 'domcontentloaded' })
  await sleep(1800)
  counts[p] = await page.locator('.nm-btn').count()
}
const zero = Object.entries(counts).filter(([, n]) => n === 0).map(([p]) => `part${p}`)
r.check('전 12부에 💬 마커 렌더', zero.length === 0, `→ ${JSON.stringify(counts)}`)

r.section('격리 — 같은 앵커라도 부가 다르면 안 섞인다')
await page.goto(`${CONFIG.base}/part2/ch/ch1`, { waitUntil: 'domcontentloaded' })
await sleep(2000)
await page.locator(`#${ITEM} .nm-btn`).first().click()
await sleep(600)
await page.locator('.np-ta').last().fill('2부 전용 메모 — 미분')
await page.locator('.np-go').last().click()
await sleep(1800)
r.check('part2 에 메모 작성', (await page.locator('.np').first().innerText()).includes('2부 전용 메모'))

await page.goto(`${CONFIG.base}/part3/ch/ch1`, { waitUntil: 'domcontentloaded' })
await sleep(2000)
r.check('part3 같은 앵커에 배지 없음', (await page.locator(`#${ITEM} .nm-badge`).count()) === 0)
await page.locator(`#${ITEM} .nm-btn`).first().click()
await sleep(700)
const p3 = await page.locator('.np').first().innerText().catch(() => '')
r.check('part3 패널에 2부 메모 안 보임', !p3.includes('2부 전용 메모'))

await page.locator('.np-ta').last().fill('3부 전용 메모 — 통계')
await page.locator('.np-go').last().click()
await sleep(1800)
const p3after = await page.locator('.np').first().innerText().catch(() => '')
r.check('part3 작성 후에도 2부 것 안 섞임', p3after.includes('3부 전용 메모') && !p3after.includes('2부 전용 메모'))

r.section('DB — part 값이 정확한가')
const rows = await sb.from('annotations').select('part, body').eq('item_id', ITEM).in('part', TEST_PARTS).order('part')
const byPart = Object.fromEntries((rows.data ?? []).map((x) => [x.part, x.body]))
r.check('part=2 행 = 2부 메모', byPart[2] === '2부 전용 메모 — 미분', `→ ${JSON.stringify(byPart)}`)
r.check('part=3 행 = 3부 메모', byPart[3] === '3부 전용 메모 — 통계')
r.check('작성한 두 부 외엔 행 없음', (rows.data ?? []).length === 2, `→ ${rows.data?.length}행`)
// part1 의 실사용 메모가 다른 부 조회에 안 섞이는지 — 가장 실제적인 격리 증거(개수는 늘 수 있으니 하한)
const p1 = await sb.from('annotations').select('part').eq('item_id', ITEM).eq('part', 1)
r.check('part1 실사용 메모 보존(테스트가 안 건드림)', (p1.data ?? []).length >= 4, `→ ${p1.data?.length}행`)

r.section('회귀 — 되돌아가도 자기 것만')
await page.goto(`${CONFIG.base}/part2/ch/ch1`, { waitUntil: 'domcontentloaded' })
await sleep(2000)
await page.locator(`#${ITEM} .nm-btn`).first().click()
await sleep(700)
const back = await page.locator('.np').first().innerText().catch(() => '')
r.check('part2 재방문: 자기 메모 보임', back.includes('2부 전용 메모'))
r.check('part2 재방문: 3부 메모 안 보임', !back.includes('3부 전용 메모'))

r.section('비로그인 — 확대 후에도 첫 체험은 그대로')
const anon = await browser.newContext()
const ap = await anon.newPage()
await ap.goto(`${CONFIG.base}/part9/ch/ch1`, { waitUntil: 'networkidle' })
await sleep(1000)
r.check('비로그인 part9: 마커 0개', (await ap.locator('.nm-btn').count()) === 0)
r.check('비로그인 part9: 본문 정상', (await ap.locator('h1').count()) > 0)

await browser.close()
for (const p of TEST_PARTS) await safeDeleteAnnotations(sb, { part: p, itemId: ITEM })
r.done()
