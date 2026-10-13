// scripts/record-demo.mjs — 3분 데모 영상 자동 녹화 → docs/hackathon/demo_3min.mp4 (+ 자막 .srt)
// 스토리보드 정본: docs/hackathon/13_demo_script.md 의 "3분 영상 축약판".
// 장면(2026-10-13 개편 — 세 기둥 LLM · 개념 온톨로지 · 시스템 다이내믹스 강조):
//   문제 제기 → 진단 몽타주(경로 재구성 "55챕터·31.9시간" → 로컬 LLM 의 추천 설명 → "다시 볼 개념")
//   → LLM 해부 3장면(토큰화·어텐션·확률) → 개념 지도(12부 S자 성장의 선수 사슬이 2부까지)
//   → 12부 5장 튜터(다른 부 개념 "2부 9장" 실답변 + 주제이탈 차단, Ollama 필요)
//   → SD(7장 인과지도: 이기는 고리가 R→B 로 / 12장 캡스톤 저량-유량도: 이탈·입소문·이탈 방지 시나리오) → 클로징.
//
// 사용법 (verify-smoke.mjs 와 같은 준비 + Ollama):
//   1) npm run deploy:build && npm i --no-save playwright-core
//   2) PORT=4199 node scripts/serve-deploy.mjs &
//   3) ollama serve (gemma4:e2b 설치돼 있어야 함 — 스크립트가 워밍업 1회 수행)
//   4) PORT=4199 node scripts/record-demo.mjs
// ffmpeg 경로가 다르면 FFMPEG_PATH 환경변수로 지정.
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(ROOT, 'package.json'))
const { chromium } = require('playwright-core')

const BASE = `http://localhost:${process.env.PORT || 4199}`
const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const FFMPEG = process.env.FFMPEG_PATH || 'C:/LAB/OLLAMA/ffmpeg/bin/ffmpeg.exe'
const OLLAMA = 'http://localhost:11434'
const MODEL = 'gemma4:e2b'
const OUT_MP4 = join(ROOT, 'docs/hackathon/demo_3min.mp4')
const OUT_SRT = join(ROOT, 'docs/hackathon/demo_3min_데모용.srt')
const TMP = join(ROOT, 'docs/hackathon/.demo_tmp')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ── 0) Ollama 워밍업 — 첫 질문의 모델 로딩(수십 초)이 영상에 찍히지 않게 ──────
console.log('▶ Ollama 워밍업 (모델 로딩)…')
{
  const res = await fetch(`${OLLAMA}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL, stream: false, think: false, keep_alive: '15m',
      messages: [{ role: 'user', content: '안녕' }],
      options: { num_predict: 8 },
    }),
    signal: AbortSignal.timeout(180000),
  })
  if (!res.ok) throw new Error(`Ollama 워밍업 실패 (${res.status}) — ollama serve 확인`)
  console.log('  워밍업 완료')
}

// ── 녹화 준비 ────────────────────────────────────────────────────────────────
rmSync(TMP, { recursive: true, force: true }) // 이전 실패분 정리
mkdirSync(TMP, { recursive: true })
const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: TMP, size: { width: 1280, height: 720 } },
})
const page = await ctx.newPage()

// 가짜 커서 + 자막 바 + 스크롤바 숨김 (모든 내비게이션에서 유지)
await page.addInitScript(() => {
  const style = document.createElement('style')
  style.textContent = `
    ::-webkit-scrollbar{display:none} html{scrollbar-width:none}
    #__cur{position:fixed;z-index:2147483647;width:22px;height:22px;border-radius:50%;
      background:rgba(79,70,229,.35);border:2.5px solid #4f46e5;pointer-events:none;
      transform:translate(-50%,-50%);transition:width .12s,height .12s;left:-50px;top:-50px}
    #__cap{position:fixed;z-index:2147483646;left:50%;bottom:26px;transform:translateX(-50%);pointer-events:none;
      max-width:86%;padding:12px 22px;border-radius:14px;background:rgba(15,23,42,.88);
      color:#fff;font:600 21px/1.45 "Malgun Gothic",sans-serif;text-align:center;
      box-shadow:0 6px 24px rgba(0,0,0,.25);display:none;white-space:pre-wrap}`
  document.addEventListener('DOMContentLoaded', () => {
    document.head.appendChild(style)
    const cur = document.createElement('div'); cur.id = '__cur'
    const cap = document.createElement('div'); cap.id = '__cap'
    document.body.append(cur, cap)
    addEventListener('mousemove', (e) => { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px' })
    addEventListener('mousedown', () => { cur.style.width = '30px'; cur.style.height = '30px' })
    addEventListener('mouseup', () => { cur.style.width = '22px'; cur.style.height = '22px' })
  })
})

// ── 자막 관리 (화면 오버레이 + SRT 로그 동시) ────────────────────────────────
const t0 = Date.now()
const subs = [] // {t, text}
async function cap(text) {
  subs.push({ t: Date.now() - t0, text })
  await page.evaluate((t) => {
    const el = document.getElementById('__cap')
    if (el) { el.textContent = t; el.style.display = 'block' }
  }, text)
}

// ── 조작 헬퍼 (커서를 실제로 움직여 클릭) ────────────────────────────────────
async function move(loc) {
  // block:center — sticky 헤더가 클릭 지점을 덮지 않게 항상 화면 중앙으로
  await loc.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  const b = await loc.boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 18 })
}
async function click(loc, pause = 350) {
  await move(loc)
  await sleep(160)
  await page.mouse.down(); await sleep(90); await page.mouse.up()
  await sleep(pause)
}
async function wheel(dy, times = 1, pause = 420) {
  for (let i = 0; i < times; i++) { await page.mouse.wheel(0, dy); await sleep(pause) }
}

// 스크롤 없이 지금 보이는 자리에서 클릭(장면을 고정해 둔 실험실용)
async function clickHere(loc, pause = 350) {
  const b = await loc.boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 16 })
  await sleep(160)
  await page.mouse.down(); await sleep(90); await page.mouse.up()
  await sleep(pause)
}
// 스트리밍이 멈출 때까지(1.2초 동안 글자 수 그대로) 기다린다
async function settleText(loc, maxMs = 20000) {
  let last = -1
  let still = 0
  for (let t = 0; t < maxMs; t += 400) {
    const n = (await loc.innerText().catch(() => '')).length
    still = n > 20 && n === last ? still + 400 : 0
    if (still >= 1200) return true
    last = n
    await sleep(400)
  }
  return false
}

// ═══ S1 (0:00~) 문제 제기 — 포털 홈 + 지도 스크롤 ═══════════════════════════
console.log('▶ 녹화 시작 — S1 문제 제기')
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await cap('전 직원이 매일 AI를 씁니다. 그런데 원리를 아는 사람은? 원인은 수학입니다')
await sleep(5000)
await cap('수포자 아카데미: LLM 튜터 · 개념 온톨로지 · 시스템 다이내믹스로 움직이는 "AI 강사"')
await wheel(420, 3, 600)
await sleep(2000)

// ═══ S2 진단 몽타주 → 경로 재구성 → LLM 이 추천을 풀어 줌 → 개념 이름 ══════════════
console.log('▶ S2 진단')
await page.goto(`${BASE}/diagnose`, { waitUntil: 'networkidle' })
await cap('5분 진단: 시험이 아니라, 나에게 맞는 경로를 짜기 위한 12문항')
// 프로필: 벡터·확률 관문 통과, 미분·log 미통과 (발표 덱 스크린샷과 동일 → "55챕터 · 31.9시간")
// 화면의 보기 번호다 — 진단 보기 배치(diagnostic.ts ANSWER_FORMAT 2, 2026-09-29) 기준. 예전 배치의 [1,1,2,2,1,1,0,0,2,3,0,0]과 같은 답.
const picks = [0, 3, 2, 3, 0, 1, 0, 0, 1, 3, 0, 1]
const items = page.locator('main ol > li')
for (let i = 0; i < picks.length; i++) {
  if (i === 6) await cap('모르는 건 편하게 골라도 됩니다. 관문 단위로 채점되니까요')
  await click(items.nth(i).locator('button').nth(picks[i]), 120)
}
// 누락 방어 — 선택 표시(border-indigo-500)가 없는 문항은 다시 클릭
for (let i = 0; i < picks.length; i++) {
  if ((await items.nth(i).locator('button.border-indigo-500').count()) === 0) {
    await click(items.nth(i).locator('button').nth(picks[i]), 120)
  }
}
await page.waitForSelector('text=답변 12 / 12', { timeout: 5000 })
const confCards = page.locator('main section .space-y-4 > div')
await click(confCards.nth(0).locator('button').nth(2), 120) // 자신감 3
await click(confCards.nth(1).locator('button').nth(1), 120) // 기호 2
await cap('제출하면 규칙 엔진이 이 사람의 경로를 다시 짭니다')
await click(page.locator('button', { hasText: '내 경로 짜기' }), 200)
await page.waitForSelector('text=AI 강사가 짜 준 내 경로', { timeout: 15000 })
await sleep(700)
await cap('130챕터 중 이 사람에겐 55챕터 · 31.9시간. 아는 단계는 접고, 이유까지 말해 줍니다')
await sleep(5600)
// LLM 기둥 ① — 규칙이 정한 경로를 로컬 LLM 이 강사 말투로 풀어 준다(TutorExplain)
const sumCard = page.locator('div.rounded-2xl.bg-indigo-600').first()
const explainBtn = sumCard.locator('button', { hasText: 'AI 강사에게 더 듣기' })
if (await explainBtn.count()) {
  await cap('경로는 규칙이 정하고, 설명은 로컬 LLM이 강사 말투로 풀어 줍니다')
  await click(explainBtn, 300)
  await settleText(sumCard.locator('p.bg-indigo-50'), 15000)
  await sleep(3600)
}
// 온톨로지 기둥 ① — 틀린 문항이 개념 이름(어느 부 몇 장)으로
const diagConcepts = page.locator('[data-diag-concepts]')
if (await diagConcepts.count()) {
  await move(diagConcepts)
  await cap('틀린 문항은 점수가 아니라 개념 이름으로. 개념 온톨로지가 "도함수(2부 3장)"처럼 자리까지 압니다')
  await sleep(5000)
}

// ═══ S3 LLM 해부 — 토큰화 → 어텐션 → 확률 (3장면) ════════════════════════════
console.log('▶ S3 LLM 해부')
await page.goto(`${BASE}/part4/ch/ch2`, { waitUntil: 'networkidle' })
await cap('여기서부터는 내 문장으로 LLM 속을 봅니다. ① 문장이 "조각(토큰)"으로')
const sent = page.locator('main input[type=text]').first()
await move(sent); await click(sent, 120)
await sent.fill('')
await page.keyboard.type('우리 회사 최고의 복지는 동료다', { delay: 60 })
await sleep(1800)
await click(page.locator('button', { hasText: '서브워드' }).first(), 250)
await sleep(2600)

await page.goto(`${BASE}/part4/ch/ch6`, { waitUntil: 'networkidle' })
await cap('② 어텐션: 단어끼리 서로를 "쳐다보는" 정도를 내적으로. 트랜스포머의 핵심 Q·K·V')
const qkv = page.locator('main div.my-5.rounded-xl.border.border-slate-200.bg-white').filter({ hasText: 'Query(질문) 벡터' }).first()
await qkv.scrollIntoViewIfNeeded()
await sleep(700)
for (const w of ['공', '물었다', '강아지']) {
  await click(qkv.locator('button', { hasText: w }).first(), 1100)
}
await sleep(1200)

await page.goto(`${BASE}/part4/ch/ch9`, { waitUntil: 'networkidle' })
await cap('③ 출력층: 문맥이 "다음 단어 후보의 확률"이 되는 순간. 이 수학이 1·3·5부 커리큘럼입니다')
const outLab = page.locator('main div.my-5.rounded-xl.border.border-slate-200.bg-white').filter({ hasText: '마지막 문맥 벡터' }).first()
await outLab.scrollIntoViewIfNeeded()
await sleep(700)
const sliders = outLab.locator('input[type=range]')
await move(sliders.nth(0))
await page.evaluate(async () => {
  const lab = [...document.querySelectorAll('main input[type=range]')]
  const set = (el, v) => { el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })) }
  const s0 = lab[0], s1 = lab[1]
  const steps = [[1.0, 0.2], [0.0, -1.0], [-1.0, 0.8], [0.4, 1.0]]
  for (const [a, b] of steps) {
    if (s0) set(s0, a)
    if (s1) set(s1, b)
    await new Promise((r) => setTimeout(r, 1200))
  }
})
await sleep(800)

// ═══ S4 개념 지도 — 12부 S자 성장의 선수 사슬이 2부까지 (온톨로지) ═══════════════
console.log('▶ S4 개념 지도')
await page.goto(`${BASE}/concepts?c=logistic-growth`, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-concept-node]', { timeout: 10000 })
await sleep(600)
await cap('개념 온톨로지: 시리즈 개념 127개 · 관계 517개의 지도. 12부 "S자 성장"을 고르면')
const selNode = page.locator('[data-concept-node]', { hasText: 'S자 성장과 지배 루프' }).first()
await move(selNode)
await sleep(4600)
await cap('먼저 알아야 할 사슬이 2부 시그모이드·지수와 로그까지 이어집니다. 튜터도 검색도 이 지도를 읽습니다')
// 선택한 12부 노드에서 위로 올라가며 2부 줄의 선수 개념까지 보여 준다
await wheel(-260, 3, 650)
const sig = page.locator('[data-concept-node]', { hasText: '시그모이드' }).first()
const sigBox = (await sig.count()) ? await sig.boundingBox() : null
if (sigBox && sigBox.y > 60 && sigBox.y < 600) {
  await page.mouse.move(sigBox.x + sigBox.width / 2, sigBox.y + sigBox.height / 2, { steps: 18 })
}
await sleep(4200)

// ═══ S5 LLM 튜터 — 12부 5장에서 다른 부 개념을 묻는다 + 주제이탈 차단 (로컬 Ollama) ═══
console.log('▶ S5 튜터')
await page.goto(`${BASE}/part12/ch/ch5`, { waitUntil: 'networkidle' })
await cap('12부(시스템 다이내믹스) 5장 "오일러법". 막히면 🤖 로컬 LLM 튜터에게 묻습니다')
await click(page.locator('button[aria-label="AI 튜터 열기"]'), 800)
const tutorInput = page.locator('input[placeholder="질문을 입력하세요…"]')
await click(tutorInput, 100)
await page.keyboard.type('경사하강은 어디서 배워요?', { delay: 50 })
await page.keyboard.press('Enter')
await page.waitForSelector('button:has-text("중지")', { timeout: 8000 }).catch(() => {})
await page.waitForSelector('button:has-text("중지")', { state: 'detached', timeout: 60000 }).catch(() => {})
const said2_9 = (await page.locator('div.fixed.bottom-24').getByText('2부 9장').count()) > 0
console.log(`  튜터 답변에 "2부 9장" ${said2_9 ? '포함 ✓' : '없음 — 자막은 그대로 진행'}`)
await sleep(3600)
await cap('개념 지도에서 꺼낸 카드 한 장으로 다른 부의 "2부 9장"까지. 벡터 DB 없이, 내 PC의 경량 모델로')
await sleep(4800)
await cap('학습과 무관한 질문은?')
await click(tutorInput, 100)
await page.keyboard.type('저녁 메뉴 추천해줘', { delay: 45 })
await page.keyboard.press('Enter')
await page.waitForSelector('text=도와드릴 수 없어요', { timeout: 25000 }).catch(() => {})
await sleep(2200)
await cap('정중히 거절합니다. 서버 0 · API 비용 ₩0 · 질문이 PC 밖으로 나간 횟수 0')
await sleep(4200)

// ═══ S6 시스템 다이내믹스 — ① 인과지도(이기는 고리가 바뀜) ② 캡스톤 저량-유량도 시나리오 ═══
console.log('▶ S6 시스템 다이내믹스')
await page.goto(`${BASE}/part12/ch/ch7`, { waitUntil: 'networkidle' })
const logLab = page.locator('main div.my-5.rounded-xl.p-5').filter({ has: page.locator('input[type=range].accent-amber-600') }).first()
await logLab.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
await page.mouse.wheel(0, -60)
await sleep(600)
await cap('시스템 다이내믹스 ① 인과지도: 입소문은 강화 루프(R), 포화는 균형 루프(B)')
const nowSlider = logLab.locator('input[type=range].accent-amber-600').first()
const sb = await nowSlider.boundingBox()
await page.mouse.move(sb.x + sb.width * 0.11, sb.y + sb.height / 2, { steps: 16 })
await sleep(4200)
await cap('시간이 지나면 이기는 고리가 R에서 B로 바뀝니다. 그래서 S자 곡선이 나옵니다')
await nowSlider.evaluate(async (el) => {
  const set = (v) => { el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })) }
  for (let v = 4; v <= 22; v += 2) { set(v); await new Promise((r) => setTimeout(r, 420)) }
})
await page.mouse.move(sb.x + sb.width * 0.61, sb.y + sb.height / 2, { steps: 10 })
await sleep(3600)

await page.goto(`${BASE}/part12/ch/ch12`, { waitUntil: 'networkidle' })
const adopt = page.locator('main div.my-5.rounded-xl.border-2.border-indigo-200').first()
// 한 화면(1280×720)에 시나리오 버튼·저량-유량도·그래프가 같이 들어오게 실험실만 살짝 줄인다
await adopt.evaluate((el) => { el.style.zoom = '0.8'; el.scrollIntoView({ block: 'start', behavior: 'instant' }) })
await page.mouse.wheel(0, -30)
await sleep(700)
await cap('② 저량-유량도: 사내 AI 도입을 미리 돌려 봅니다. 홍보(p) · 입소문(q) · 이탈(L)')
await sleep(4200)
await clickHere(adopt.locator('button', { hasText: '현실: 이탈 있음' }), 300)
await cap('평균 10개월 쓰고 그만두는 현실이면, 3년 뒤 76%에서 멈춥니다')
await sleep(4600)
await clickHere(adopt.locator('button', { hasText: '입소문 집중 + 이탈' }), 300)
await cap('홍보보다 입소문을 키우면 84%')
await sleep(3800)
await clickHere(adopt.locator('button', { hasText: '이탈 방지(20개월)' }), 300)
await cap('계속 쓰게 만들면 88%. 이 플랫폼의 사내 도입 전략도 이 모형으로 짰습니다')
await sleep(5400)

// ═══ S7 클로징 — 숫자 한 장 ═════════════════════════════════════════════════
console.log('▶ S7 클로징')
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await cap('130 챕터 · 1,800+ 자동채점 문항 · 144 실습 노트북 · 개념 127개 지도 · 운영비 ₩0')
await page.locator('text=자동채점 문항').first().scrollIntoViewIfNeeded()
await sleep(4600)
await cap('LLM · 온톨로지 · 시스템 다이내믹스로 움직이는 AI 강사, 오늘 바로 도입할 수 있습니다')
await sleep(4400)

// ── 마무리: 비디오 저장 → mp4 변환 → SRT ────────────────────────────────────
const durMs = Date.now() - t0
await ctx.close()
const webm = await page.video().path()
await browser.close()

console.log(`▶ 변환 (원본 ${(durMs / 1000).toFixed(1)}s) → mp4`)
execFileSync(FFMPEG, [
  '-y', '-i', webm,
  '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
  '-c:v', 'libx264', '-crf', '20', '-r', '30', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-shortest', '-movflags', '+faststart',
  OUT_MP4,
], { stdio: 'pipe' })

// SRT — 각 자막은 다음 자막 직전(또는 영상 끝)까지
const fmtT = (ms) => {
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0')
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0')
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')
  const x = String(Math.floor(ms % 1000)).padStart(3, '0')
  return `${h}:${m}:${s},${x}`
}
const srt = subs.map((c, i) => {
  const end = (i + 1 < subs.length ? subs[i + 1].t : durMs) - 150
  return `${i + 1}\n${fmtT(c.t)} --> ${fmtT(Math.max(end, c.t + 800))}\n${c.text}\n`
}).join('\n')
writeFileSync(OUT_SRT, srt, 'utf-8')
rmSync(TMP, { recursive: true, force: true })

console.log(`완료 — ${OUT_MP4} (${(durMs / 1000).toFixed(1)}s, 자막 ${subs.length}개 → ${OUT_SRT})`)
