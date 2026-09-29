// P3 — 사람(강사) Q&A + 관리자 (설계: docs/todo_협업주석_260716.md §7·§9)
//
// ⚠️ 관리자 권한이 필요한 경로다. 관리자는 실제 강사 계정 한 명으로 한정하고 **테스트 계정에는
//    권한을 주지 않는다**(사용자 결정) → E2E_ADMIN_* 이 없으면 "차단 경로"만 검증하고 끝낸다.
//    전체 시나리오(답변·큐·해결)를 돌리려면 관리자 자격증명을 E2E_ADMIN_* 로 넘겨야 한다.
import {
  CONFIG, requireConfig, requireServer, reporter, sleep,
  signIn, signInAdmin, safeDeleteAnnotations, launchBrowser, loginPage,
} from './lib.mjs'

requireConfig()
await requireServer()
const r = reporter('P3 강사 Q&A·관리자')

const ITEM = { part: 1, chapter: 'ch1', item_id: 'ch1-s2' } // 보호 앵커 회피
const KEY = { part: ITEM.part, itemId: ITEM.item_id }

const user = await signIn(CONFIG.userB) // 일반 학습자
await safeDeleteAnnotations(user.sb, KEY)

r.section('질문 작성')
const q = await user.sb
  .from('annotations')
  .insert({ user_id: user.user.id, ...ITEM, kind: 'question', body: '점의 좌표를 읽는 순서가 헷갈려요 — x 먼저인가요?' })
  .select('id, resolved')
  .single()
r.check('일반 유저 질문 작성', !q.error && q.data?.resolved === false)
const qid = q.data.id

r.section('차단 경로 — 일반 유저는 답변·해결·모더레이션 불가')
const badAnswer = await user.sb
  .from('annotation_answers')
  .insert({ annotation_id: qid, user_id: user.user.id, body: '내가 강사인 척' })
  .select('id')
r.check('일반 유저 답변 작성 → 차단(write_admin)', !!badAnswer.error, badAnswer.error ? `(${badAnswer.error.code})` : '(통과됨!)')
await user.sb.rpc('set_resolved', { aid: qid, val: true })
const stillOpen = await user.sb.from('annotations').select('resolved').eq('id', qid).single()
r.check('일반 유저 set_resolved → 무효(is_admin 검사)', stillOpen.data?.resolved === false)

const admin = await signInAdmin()
if (!admin) {
  r.section('관리자 시나리오')
  console.log('  ⊘ E2E_ADMIN_EMAIL/PASSWORD 미설정(또는 관리자 아님) — 답변·큐·해결은 사람이 확인합니다.')
  console.log('     확인법: 관리자 계정으로 포털 로그인 → 헤더 "🎓 답변 대기 질문" → 챕터에서 답변하기.')
  await safeDeleteAnnotations(user.sb, KEY)
  r.done()
}

r.section('관리자 — 큐·답변·해결')
const queue = await admin.sb.from('annotations').select('id').eq('kind', 'question').eq('resolved', false)
r.check('미해결 큐에 질문 존재', (queue.data ?? []).some((x) => x.id === qid), `→ 큐 ${queue.data?.length}건`)

const ans = await admin.sb
  .from('annotation_answers')
  .insert({ annotation_id: qid, user_id: admin.user.id, body: '네, 가로(x) 먼저예요 — (x, y) 순서쌍의 약속입니다.' })
  .select('id, body')
  .single()
r.check('관리자 답변 작성(write_admin 통과)', !ans.error && !!ans.data, ans.error?.message ?? '')

const userSees = await user.sb.from('annotation_answers').select('body').eq('annotation_id', qid)
r.check('질문자가 답변을 봄(read_all_a)', (userSees.data ?? []).some((x) => x.body.includes('순서쌍')))
r.check('답변에도 이름 없음(익명)', userSees.data?.[0] && !('author_name' in userSees.data[0]))

await admin.sb.rpc('set_resolved', { aid: qid, val: true })
const resolved = await user.sb.from('annotations').select('resolved').eq('id', qid).single()
r.check('관리자 set_resolved → resolved=true', resolved.data?.resolved === true)
const queue2 = await admin.sb.from('annotations').select('id').eq('kind', 'question').eq('resolved', false)
r.check('해결 후 큐에서 사라짐', !(queue2.data ?? []).some((x) => x.id === qid))

r.section('모더레이션 — 관리자는 남의 글을 지울 수 있다')
const spam = await user.sb
  .from('annotations')
  .insert({ user_id: user.user.id, ...ITEM, kind: 'note', body: '스팸 같은 메모' })
  .select('id')
  .single()
const del = await admin.sb.from('annotations').delete().eq('id', spam.data.id).select('id')
r.check('관리자가 남의 메모 삭제(del_admin)', (del.data ?? []).length === 1)

r.section('브라우저 — 큐 → 챕터 → 답변 → 해결')
await admin.sb.rpc('set_resolved', { aid: qid, val: false })
await admin.sb.from('annotation_answers').delete().eq('annotation_id', qid)

const browser = await launchBrowser()
const uctx = await browser.newContext()
const upage = await loginPage(uctx, CONFIG.userB)
r.check('일반 유저: 포털에 답변 대기 질문 메뉴 없음', (await upage.locator('text=답변 대기 질문').count()) === 0)

const actx = await browser.newContext()
const apage = await loginPage(actx, CONFIG.adminEmail, CONFIG.adminPassword)
r.check('관리자: 🎓 답변 대기 질문 메뉴 노출', (await apage.locator('text=답변 대기 질문').count()) > 0)
await apage.goto(`${CONFIG.base}/qna`, { waitUntil: 'domcontentloaded' })
await sleep(1500)
const qna = await apage.locator('section').first().innerText().catch(() => '')
r.check('큐에 질문 표시(익명 — 본문·위치만)', qna.includes('점의 좌표를 읽는 순서') && qna.includes(ITEM.item_id))

await apage.locator('a:has-text("챕터에서 답변하기")').first().click()
await apage.waitForURL(/part1\/ch\/ch1/, { timeout: 9000 }).catch(() => {})
await sleep(2200)
await apage.locator(`#${ITEM.item_id} .nm-btn`).first().click()
await sleep(700)
await apage.locator('button:has-text("답변 달기")').first().click()
await apage.locator('.np-ha-form .np-ta').fill('네, 가로(x) 먼저예요 — (x, y) 순서쌍의 약속!')
await apage.locator('button:has-text("답변 저장")').first().click()
await sleep(1800)
const apanel = await apage.locator('.np').first().innerText().catch(() => '')
r.check('답변 저장 → 🎓 강사 답변 표시', apanel.includes('강사 답변') && apanel.includes('순서쌍의 약속'))
await apage.locator('button:has-text("해결됨 표시")').first().click()
await sleep(1500)
r.check('해결됨 배지 표시', (await apage.locator('.np').first().innerText()).includes('해결됨'))

await upage.reload({ waitUntil: 'domcontentloaded' })
await upage.goto(`${CONFIG.base}/part1/ch/ch1`, { waitUntil: 'domcontentloaded' })
await sleep(2200)
await upage.locator(`#${ITEM.item_id} .nm-btn`).first().click()
await sleep(700)
const uafter = await upage.locator('.np').first().innerText().catch(() => '')
r.check('질문자 화면에 강사 답변 표시', uafter.includes('강사 답변') && uafter.includes('순서쌍의 약속'))
r.check('질문자 화면에 해결됨 표시', uafter.includes('해결됨'))
r.check('질문자 화면에 이름 노출 없음', !uafter.includes('solideos'))

await browser.close()
await safeDeleteAnnotations(user.sb, KEY)
r.done()
