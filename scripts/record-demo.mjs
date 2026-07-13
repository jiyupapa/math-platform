// scripts/record-demo.mjs — 3분 데모 영상 자동 녹화 → docs/hackathon/demo_3min.mp4 (+ 자막 .srt)
// 스토리보드 정본: docs/hackathon/13_demo_script.md 의 "3분 영상 축약판".
// 장면: 문제 제기 → 진단 몽타주(경로 재구성 "55챕터·31.9시간") → 4부 라이브 투어 3장면
//       → AI 튜터(실답변 + 주제이탈 차단, Ollama 필요) → 숫자 한 장 클로징.
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

// ═══ S1 (0:00~) 문제 제기 — 포털 홈 + 지도 스크롤 ═══════════════════════════
console.log('▶ 녹화 시작 — S1 문제 제기')
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await cap('전 직원이 매일 AI를 씁니다 — 그런데 원리를 아는 사람은? 원인은 수학입니다')
await sleep(6000)
await cap('수포자 사관학교 — 진단하고, 경로를 짜고, 옆에서 가르치는 "AI 강사"')
await wheel(420, 3, 600)
await sleep(2200)

// ═══ S2 진단 몽타주 → 경로 재구성 ═══════════════════════════════════════════
console.log('▶ S2 진단')
await page.goto(`${BASE}/diagnose`, { waitUntil: 'networkidle' })
await cap('5분 진단 — 시험이 아니라, 나에게 맞는 경로를 짜기 위한 12문항')
// 프로필: 벡터·확률 관문 통과, 미분·log 미통과 (발표 덱 스크린샷과 동일 → "55챕터 · 31.9시간")
const picks = [1, 1, 2, 2, 1, 1, 0, 0, 2, 3, 0, 0]
const items = page.locator('main ol > li')
for (let i = 0; i < picks.length; i++) {
  if (i === 6) await cap('모르는 건 편하게 찍어도 됩니다 — 관문 단위로 채점되니까요')
  await click(items.nth(i).locator('button').nth(picks[i]), 130)
}
// 누락 방어 — 선택 표시(border-indigo-500)가 없는 문항은 다시 클릭
for (let i = 0; i < picks.length; i++) {
  if ((await items.nth(i).locator('button.border-indigo-500').count()) === 0) {
    await click(items.nth(i).locator('button').nth(picks[i]), 130)
  }
}
await page.waitForSelector('text=답변 12 / 12', { timeout: 5000 })
const confCards = page.locator('main section .space-y-4 > div')
await click(confCards.nth(0).locator('button').nth(2), 130) // 자신감 3
await click(confCards.nth(1).locator('button').nth(1), 130) // 기호 2
await cap('제출하면 — 규칙 엔진이 이 사람의 경로를 다시 짭니다')
await click(page.locator('button', { hasText: '결과 보기' }), 200)
await page.waitForSelector('text=AI 강사가 당신에게 맞춘 경로', { timeout: 15000 })
await sleep(800)
await cap('106챕터 중 이 사람에겐 55챕터 · 31.9시간 — 아는 단계는 접고, 이유까지 말해 줍니다')
await sleep(8000)
await wheel(430, 3, 550)
await cap('결정은 전부 규칙 기반 — 같은 답이면 언제나 같은 경로, 근거가 화면에 있습니다')
await wheel(430, 2, 550)
await sleep(3500)

// ═══ S3 라이브 투어 — 토큰화 → 어텐션 → 확률 (3장면) ════════════════════════
console.log('▶ S3 라이브 투어')
// ① ch2 토큰화
await page.goto(`${BASE}/part4/ch/ch2`, { waitUntil: 'networkidle' })
await cap('여기서부터는 당신의 문장입니다 — ① 문장이 "조각(토큰)"으로')
const sent = page.locator('main input[type=text]').first()
await move(sent); await click(sent, 120)
await sent.fill('')
await page.keyboard.type('우리 회사 최고의 복지는 동료다', { delay: 70 })
await sleep(2600)
await cap('진짜 LLM 방식(서브워드)로 바꾸면 — 아는 말은 통째로, 모르는 말은 조각으로')
await click(page.locator('button', { hasText: '서브워드' }).first(), 250)
await sleep(3800)

// ② ch6 어텐션
await page.goto(`${BASE}/part4/ch/ch6`, { waitUntil: 'networkidle' })
await cap('② 어텐션 — 단어끼리 서로를 "쳐다보는" 정도를 내적으로 계산합니다')
const qkv = page.locator('main div.my-5.rounded-xl.border.border-slate-200.bg-white').filter({ hasText: 'Query(질문) 벡터' }).first()
await qkv.scrollIntoViewIfNeeded()
await sleep(900)
for (const w of ['공', '물었다', '강아지']) {
  await click(qkv.locator('button', { hasText: w }).first(), 1400)
}
await cap('그 유명한 트랜스포머의 심장 — Q·K·V 가 이 표 한 장입니다')
await sleep(4200)

// ③ ch9 다음 단어 확률
await page.goto(`${BASE}/part4/ch/ch9`, { waitUntil: 'networkidle' })
await cap('③ 출력층 — 문맥이 "다음 단어 후보의 확률"이 되는 순간')
const outLab = page.locator('main div.my-5.rounded-xl.border.border-slate-200.bg-white').filter({ hasText: '마지막 문맥 벡터' }).first()
await outLab.scrollIntoViewIfNeeded()
await sleep(900)
// 문맥 벡터 슬라이더를 서서히 움직여 확률 막대가 실시간으로 재분배되는 걸 보여준다
const sliders = outLab.locator('input[type=range]')
await move(sliders.nth(0))
await page.evaluate(async () => {
  const lab = [...document.querySelectorAll('main input[type=range]')]
  const set = (el, v) => { el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })) }
  const s0 = lab[0], s1 = lab[1]
  const steps = [[1.0, 0.2], [0.6, -0.4], [0.0, -1.0], [-0.8, -0.6], [-1.0, 0.8], [0.4, 1.0]]
  for (const [a, b] of steps) {
    if (s0) set(s0, a)
    if (s1) set(s1, b)
    await new Promise((r) => setTimeout(r, 1500))
  }
})
await cap('LLM = 다음 단어를 확률로 고르는 기계 — 방금 그 수학이 1·3·5부 커리큘럼입니다')
await sleep(4800)

// ═══ S4 AI 튜터 — 실답변 + 주제이탈 차단 (로컬 Ollama) ══════════════════════
console.log('▶ S4 튜터')
await cap('막히면 🤖 AI 튜터 — 지금 보는 챕터를 알고 답합니다')
await click(page.locator('button[aria-label="AI 튜터 열기"]'), 900)
const tutorInput = page.locator('input[placeholder="질문을 입력하세요…"]')
await click(tutorInput, 100)
await page.keyboard.type('어텐션이 정확히 뭘 계산하는 거예요?', { delay: 45 })
await page.keyboard.press('Enter')
await page.waitForSelector('button:has-text("중지")', { timeout: 8000 }).catch(() => {})
await page.waitForSelector('button:has-text("중지")', { state: 'detached', timeout: 40000 }).catch(() => {})
await sleep(4500) // 답변 읽을 시간
await cap('학습과 무관한 질문은 어떻게 될까요?')
await click(tutorInput, 100)
await page.keyboard.type('저녁 메뉴 추천해줘', { delay: 45 })
await page.keyboard.press('Enter')
await page.waitForSelector('text=도와드릴 수 없어요', { timeout: 25000 }).catch(() => {})
await sleep(3500)
await cap('정중히 거절 — 그리고 이 모든 답변은 완전 로컬(내 PC의 Ollama)입니다')
await sleep(4200)
await cap('서버 0 · API 비용 ₩0 · 질문이 PC 밖으로 나간 횟수 0 — 시연장에선 Wi-Fi를 끄고 반복합니다')
await sleep(5200)

// ═══ S5 클로징 — 숫자 한 장 ═════════════════════════════════════════════════
console.log('▶ S5 클로징')
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await cap('106 챕터 · 1,400+ 자동채점 문항 · 118 실습 노트북 — 운영비 ₩0')
await page.locator('text=자동채점 문항').first().scrollIntoViewIfNeeded()
await sleep(5500)
await cap('신입 온보딩부터 전사 AI 리터러시까지 — 오늘 바로 도입할 수 있습니다')
await sleep(5000)

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
