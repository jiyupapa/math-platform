// P1 — 협업 주석 공유·RLS·익명 (설계: docs/todo_협업주석_260716.md §9)
// A 가 메모 → B 가 같은 항목에서 봄(공유) · 남의 글은 못 고치고 못 지움 · 이름은 어디로도 안 샘.
import {
  CONFIG, requireConfig, requireServer, reporter, sleep,
  signIn, safeDeleteAnnotations, launchBrowser, loginPage,
} from './lib.mjs'

requireConfig()
await requireServer()
const r = reporter('P1 공유·RLS·익명')

// ⚠️ part1/ch1-s1 은 실사용 메모가 있어 보호된다(lib.mjs PROTECTED_ANCHORS) — 빈 앵커를 쓴다.
const ITEM = { part: 1, chapter: 'ch1', item_id: 'ch1-s4' }
const KEY = { part: ITEM.part, itemId: ITEM.item_id }

r.section('setup')
const a = await signIn(CONFIG.userA)
const b = await signIn(CONFIG.userB)
r.check('A·B 로그인', !!a.user && !!b.user, `A=${a.user.id.slice(0, 8)} B=${b.user.id.slice(0, 8)}`)
await safeDeleteAnnotations(a.sb, KEY)
await safeDeleteAnnotations(b.sb, KEY)

r.section('공유 — A 가 쓰고 B 가 본다')
const ins = await a.sb
  .from('annotations')
  .insert({ user_id: a.user.id, ...ITEM, kind: 'note', body: 'A 의 메모 — 좌표평면이 헷갈려요' })
  .select('id, body, user_id')
  .single()
r.check('A 메모 작성', !ins.error && !!ins.data, ins.error?.message ?? '')
const noteId = ins.data?.id

const seen = await b.sb.from('annotations').select('id, user_id').eq('part', ITEM.part).eq('item_id', ITEM.item_id)
r.check('B 가 A 의 메모를 봄(read_all)', (seen.data ?? []).some((x) => x.id === noteId))

r.section('익명 — 화면뿐 아니라 API 로도 이름을 못 얻는다')
const leak = await b.sb.from('annotations').select('author_name').eq('item_id', ITEM.item_id)
r.check('author_name 조회 → 실패(컬럼 부재)', !!leak.error, leak.error ? `(${leak.error.code})` : '(이름이 샘!)')
const idOnly = await b.sb.from('annotations').select('user_id').eq('item_id', ITEM.item_id).limit(1)
r.check('user_id 는 불투명 UUID', /^[0-9a-f-]{36}$/.test(idOnly.data?.[0]?.user_id ?? ''))

r.section('RLS — 남의 글은 못 고치고 못 지운다')
const bEdit = await b.sb.from('annotations').update({ body: '변조' }).eq('id', noteId).select('id')
r.check('B 가 A 메모 수정 → 0행', !bEdit.error && (bEdit.data ?? []).length === 0)
const bDel = await b.sb.from('annotations').delete().eq('id', noteId).select('id')
r.check('B 가 A 메모 삭제 → 0행', !bDel.error && (bDel.data ?? []).length === 0)
const intact = await a.sb.from('annotations').select('body').eq('id', noteId).maybeSingle()
r.check('A 메모 원문 그대로', intact.data?.body === 'A 의 메모 — 좌표평면이 헷갈려요')
const spoof = await b.sb
  .from('annotations')
  .insert({ user_id: a.user.id, ...ITEM, kind: 'note', body: 'B 가 A 인 척' })
  .select('id')
r.check('B 가 A 의 user_id 로 작성 → 차단', !!spoof.error, spoof.error ? `(${spoof.error.code})` : '(통과됨!)')

r.section('서버측 제약')
const badKind = await a.sb.from('annotations').insert({ user_id: a.user.id, ...ITEM, kind: 'spam', body: 'x' }).select('id')
r.check('kind=spam → 거부', !!badKind.error, badKind.error ? `(${badKind.error.code})` : '(통과됨!)')
const empty = await a.sb.from('annotations').insert({ user_id: a.user.id, ...ITEM, kind: 'note', body: '' }).select('id')
r.check('빈 본문 → 거부', !!empty.error, empty.error ? `(${empty.error.code})` : '(통과됨!)')
// 위치·작성자 불변 가드(schema.sql §7)
const moveTry = await a.sb.from('annotations').update({ item_id: 'ch1-s5' }).eq('id', noteId).select('id')
r.check('위치(item_id) 변경 → 차단(트리거)', !!moveTry.error, moveTry.error ? `(${moveTry.error.code})` : '(통과됨!)')

r.section('본인 — 수정·질문·AI 답변')
const aEdit = await a.sb.from('annotations').update({ body: 'A 의 메모(수정)' }).eq('id', noteId).select('body').single()
r.check('A 가 본인 메모 수정', aEdit.data?.body === 'A 의 메모(수정)')
const q = await a.sb
  .from('annotations')
  .insert({ user_id: a.user.id, ...ITEM, kind: 'question', body: '사분면 부호가 왜 그런가요?' })
  .select('id, resolved, ai_answer')
  .single()
r.check('질문 작성(kind=question)', q.data?.resolved === false && q.data?.ai_answer === null)
const ai = await a.sb
  .from('annotations')
  .update({ ai_answer: 'x축 오른쪽이 +, y축 위쪽이 + 라서 그렇습니다.' })
  .eq('id', q.data.id)
  .select('ai_answer')
  .single()
r.check('AI 답변 저장', !!ai.data?.ai_answer)
const bSees = await b.sb.from('annotations').select('ai_answer').eq('id', q.data.id).maybeSingle()
r.check('B 도 AI 답변을 봄', bSees.data?.ai_answer === ai.data.ai_answer)

r.section('브라우저 — 마커·배지·패널')
const browser = await launchBrowser()
const anon = await browser.newContext()
const ap = await anon.newPage()
await ap.goto(`${CONFIG.base}/part1/ch/ch1`, { waitUntil: 'networkidle' })
await sleep(800)
r.check('비로그인: 💬 숨김(옵트인 소셜 층)', (await ap.locator('.nm-btn').count()) === 0)

const ctx = await browser.newContext()
const page = await loginPage(ctx, CONFIG.userB)
r.check('브라우저 B 로그인', (await page.locator(`text=${CONFIG.userB}`).count()) > 0)
await page.goto(`${CONFIG.base}/part1/ch/ch1`, { waitUntil: 'domcontentloaded' })
await sleep(2500)
r.check('로그인: 마커 렌더', (await page.locator('.nm-btn').count()) > 0)
const badge = await page.locator(`#${ITEM.item_id} .nm-badge`).first().textContent().catch(() => null)
r.check('배지에 개수 표시', badge?.trim() === '2', `→ ${badge}`)

await page.locator(`#${ITEM.item_id} .nm-btn`).first().click()
await sleep(700)
const panel = await page.locator('.np').first().innerText().catch(() => '')
r.check('패널에 A 의 메모(동료 가시)', panel.includes('A 의 메모(수정)'))
r.check('패널에 AI 답변', panel.includes('x축 오른쪽이'))
r.check('남의 글엔 수정/삭제 없음', !panel.includes('삭제'))
r.check('작성자 이름 없음(익명)', !panel.includes('anna') && !panel.includes('solideos'))
r.check('남의 글엔 "내 글" 배지 없음', !panel.includes('내 글'))

await page.locator('.np-ta').last().fill('B 의 메모 — 저도 여기가 어려웠어요')
await page.locator('.np-go').last().click()
await sleep(1800)
const after = await page.locator('.np').first().innerText().catch(() => '')
r.check('B 작성 즉시 반영', after.includes('B 의 메모'))
r.check('본인 글엔 수정/삭제 있음', after.includes('삭제'))
r.check('본인 글엔 "내 글" 배지', after.includes('내 글'))
r.check('작성 후에도 이름 노출 없음', !after.includes('anna') && !after.includes('annb'))

await browser.close()

r.section('cleanup')
await safeDeleteAnnotations(a.sb, KEY)
await safeDeleteAnnotations(b.sb, KEY)
const left = await a.sb.from('annotations').select('id').eq('part', ITEM.part).eq('item_id', ITEM.item_id)
r.check('정리 완료', (left.data ?? []).length === 0)

r.done()
