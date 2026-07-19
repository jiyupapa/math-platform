// P2 — 질문 → AI(로컬 Ollama) 답변 → "메모에 저장" (설계: docs/todo_협업주석_260716.md §9)
// AI 답변은 자동 저장하지 않는다: 로컬 모델이 틀릴 수 있는데 공유 층이라 동료에게도 보이기 때문.
// Ollama 가 없으면 건너뛴다(학습 자체는 Ollama 없이도 되므로 실패가 아니다).
import {
  CONFIG, requireConfig, requireServer, reporter, sleep,
  signIn, safeDeleteAnnotations, launchBrowser, loginPage, ollamaUp,
} from './lib.mjs'

requireConfig()
await requireServer()
const r = reporter('P2 AI 답변')

if (!(await ollamaUp())) r.skip(`Ollama 미실행 (${CONFIG.ollamaUrl}) — 'ollama serve' 후 다시 실행하세요.`)

const ITEM = { part: 1, chapter: 'ch1', item_id: 'ch1-s4' } // 보호 앵커(ch1-s1) 회피
const KEY = { part: ITEM.part, itemId: ITEM.item_id }

const a = await signIn(CONFIG.userA)
const b = await signIn(CONFIG.userB)
await safeDeleteAnnotations(a.sb, KEY)

const browser = await launchBrowser()
const ctx = await browser.newContext()
const page = await loginPage(ctx, CONFIG.userA)
r.check('로그인', (await page.locator(`text=${CONFIG.userA}`).count()) > 0)

r.section('질문 작성 → 튜터로 전달')
await page.goto(`${CONFIG.base}/part1/ch/ch1`, { waitUntil: 'domcontentloaded' })
await sleep(2200)
await page.locator(`#${ITEM.item_id} .nm-btn`).first().click()
await sleep(600)
await page.locator('.np-tabs button:has-text("질문")').first().click()
await page.locator('.np-ta').last().fill('사분면에서 x가 음수면 왜 2사분면인가요?')
await page.locator('.np-go').last().click()
console.log('  … 로컬 모델 스트리밍 대기(최대 2분)')

await page.waitForSelector('text=🤖 AI 튜터', { timeout: 15000 }).catch(() => {})
r.check('질문 작성 → TutorChat 자동 오픈', (await page.locator('text=🤖 AI 튜터').count()) > 0)

// 주의: 플로팅 🤖 버튼도 bg-indigo-600 이라 .ml-auto(사용자 말풍선)로 좁혀야 한다.
const userMsg = await page.locator('.ml-auto.bg-indigo-600').last().innerText().catch(() => '')
// 제목의 특정 단어를 찾으면 앵커를 옮길 때마다 깨진다 → "「섹션명」 부분에서 질문이 있어요" 포장 형식으로 본다.
r.check(
  '항목 맥락이 질문에 실려 전송됨',
  /「.+」\s*부분에서 질문이 있어요/.test(userMsg) && userMsg.includes('사분면'),
  `→ "${userMsg.slice(0, 46)}…"`,
)

await page.waitForSelector('text=메모에 저장', { timeout: 120000 }).catch(() => {})
r.check('AI 답변 완료 → "메모에 저장" 제안', (await page.locator('text=메모에 저장').count()) > 0)
const answer = await page.locator('.bg-slate-100.text-slate-800').last().innerText().catch(() => '')
r.check('AI 답변 생성됨', answer.trim().length > 10, `→ "${answer.slice(0, 44).replace(/\n/g, ' ')}…"`)

r.section('저장은 사용자가 누를 때만')
const before = await a.sb.from('annotations').select('ai_answer').eq('item_id', ITEM.item_id).eq('kind', 'question').maybeSingle()
r.check('누르기 전엔 ai_answer 비어 있음(자동저장 안 함)', before.data?.ai_answer === null)

await page.locator('button:has-text("메모에 저장")').first().click()
await sleep(2000)
r.check('저장 후 안내 문구로 바뀜', (await page.locator('text=메모에 저장했어요').count()) > 0)
const after = await a.sb.from('annotations').select('id, ai_answer').eq('item_id', ITEM.item_id).eq('kind', 'question').maybeSingle()
r.check('DB 에 ai_answer 저장', !!after.data?.ai_answer)

await page.locator(`#${ITEM.item_id} .nm-btn`).first().click()
await sleep(900)
r.check('패널에 🤖 AI 답변 표시(새로고침 없이)', (await page.locator('.np').first().innerText()).includes('🤖 AI 답변'))

const bSees = await b.sb.from('annotations').select('ai_answer').eq('id', after.data.id).maybeSingle()
r.check('동료도 그 답변을 봄(공유)', bSees.data?.ai_answer === after.data.ai_answer)

await browser.close()
await safeDeleteAnnotations(a.sb, KEY)
r.done()
