// P0 — 임의 항목 앵커(anchorId) + 6~11부 섹션 앵커 백필 (설계: docs/todo_협업주석_260716.md §6)
// 개념카드·퀴즈에 붙인 명시적 앵커로 메모가 저장되는가 · 백필된 앵커로 복습이 도는가.
import {
  CONFIG, requireConfig, requireServer, reporter, sleep,
  signIn, safeDeleteAnnotations, clearReview, launchBrowser, loginPage,
} from './lib.mjs'

requireConfig()
await requireServer()
const r = reporter('P0 임의 항목 앵커·백필')

const ANCHOR = { part: 1, itemId: 'ch1-concept-axes' } // 개념카드 앵커(part1 ch1)
const REVIEW = { part: 6, itemId: 'ch1-s1' } // 백필된 섹션 앵커(part6)

const { sb } = await signIn(CONFIG.userA)
await safeDeleteAnnotations(sb, ANCHOR)
// 복습 토글은 서버 동기화라 정리하지 않으면 실행마다 ON↔OFF 가 뒤집힌다(비멱등).
await clearReview(sb, REVIEW)

const browser = await launchBrowser()
const ctx = await browser.newContext()
const page = await loginPage(ctx, CONFIG.userA)
r.check('로그인', (await page.locator(`text=${CONFIG.userA}`).count()) > 0)

r.section('임의 항목 앵커 — 개념카드·퀴즈')
await page.goto(`${CONFIG.base}/part1/ch/ch1`, { waitUntil: 'domcontentloaded' })
await sleep(2200)
const cardMarker = page.locator('h3:has-text("축과 원점") .nm-btn')
r.check('개념카드에 💬 마커(anchorId)', (await cardMarker.count()) === 1)
r.check('섹션+카드+퀴즈 마커 다수', (await page.locator('.nm-btn').count()) >= 6, `→ ${await page.locator('.nm-btn').count()}개`)

await cardMarker.first().click()
await sleep(600)
await page.locator('.np-ta').last().fill('임의 항목 앵커 검증 메모')
await page.locator('.np-go').last().click()
await sleep(1800)
const row = await sb.from('annotations').select('item_id, chapter, body').eq('item_id', ANCHOR.itemId).maybeSingle()
r.check(
  `메모가 item_id=${ANCHOR.itemId} 로 저장`,
  row.data?.body === '임의 항목 앵커 검증 메모' && row.data?.chapter === 'ch1',
  `→ ${JSON.stringify(row.data)}`,
)

r.section('백필 앵커 — 6부 복습 동작')
await page.goto(`${CONFIG.base}/part${REVIEW.part}/ch/ch1`, { waitUntil: 'domcontentloaded' })
await sleep(2200)
const flags = await page.locator('button:has-text("복습에 추가")').count()
r.check('6부 ch1 복습 플래그 렌더(백필)', flags >= 4, `→ ${flags}개`)
await page.locator(`#${REVIEW.itemId} button`).first().click()
// 고정 sleep 대신 상태 변화를 기다린다(동기화 왕복이 있어 시간이 들쭉날쭉)
const toggled = await page
  .waitForSelector('text=★ 복습에 추가됨', { timeout: 8000 })
  .then(() => true)
  .catch(() => false)
r.check('토글 → 추가됨 상태', toggled)
await sleep(1200)
await page.goto(`${CONFIG.base}/part${REVIEW.part}/review`, { waitUntil: 'domcontentloaded' })
await sleep(1200)
r.check('/review 에 등재', (await page.locator('body').innerText()).includes('복습 목록'))

r.section('부 확대 반영')
await page.goto(`${CONFIG.base}/part${REVIEW.part}/ch/ch1`, { waitUntil: 'domcontentloaded' })
await sleep(1500)
const p6 = await page.locator('.nm-btn').count()
r.check('6부에도 💬 마커(전 부 확대 완료)', p6 > 0, `→ ${p6}개`)

await browser.close()
await safeDeleteAnnotations(sb, ANCHOR)
await clearReview(sb, REVIEW)
r.done()
