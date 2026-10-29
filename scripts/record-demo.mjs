// scripts/record-demo.mjs — 3분 데모 영상 자동 녹화 → docs/hackathon/demo_3min.mp4 (+ 자막 .srt)
// 스토리보드 정본: docs/hackathon/13_demo_script.md 의 "3분 영상 축약판".
// 장면(2026-10-13 개편 — 세 기둥 LLM · 개념 온톨로지 · 시스템 다이내믹스 강조):
//   문제 제기 → 진단 몽타주(경로 재구성 "55챕터·31.9시간" → 로컬 LLM 의 추천 설명 → "다시 볼 개념")
//   → LLM 해부 3장면(토큰화·어텐션·확률) → 개념 지도(12부 S자 성장의 선수 사슬이 2부까지)
//   → 12부 5장 튜터(다른 부 개념 "2부 9장" 실답변 + 주제이탈 차단, Ollama 필요)
//   → SD(1장 그림 읽기: 인과지도를 한 단계씩 / 7장 인과지도: 이기는 고리가 R→B 로 /
//        12장 캡스톤 저량-유량도: 이탈·입소문·이탈 방지 시나리오) → 클로징.
// 길이: 내레이션을 기본 속도로 다 읽어 약 3분 45초(2026-10-24 사용자 결정 — 3분을 넘겨도 된다, 그 전엔 3분 이내 2:52).
//   튜터 답변 속도에 따라 몇 초 달라진다 — 4분을 넘기면 끝에 경고를 찍는다.
// 소리(2026-10-24): 자막마다 AI 음성 내레이션(edge-tts, ko-KR-SunHiNeural, 기본 속도)을 붙인다. 자막과 읽는 말은 아래 N 표에
//   짝지어 둔다 — 화면 자막과 소리가 어긋나지 않게(10-21 튜터 장면 지적). 다음 자막은 앞 내레이션이 끝나야 나오고,
//   장면을 옮기기 전에도 말이 끝나기를 기다린다(hush). 녹화 뒤 각 내레이션을 자막이 뜬 시각에 섞어 mp4 소리로 넣는다.
//
// 사용법 (verify-smoke.mjs 와 같은 준비 + Ollama + edge-tts):
//   1) npm run deploy:build && npm i --no-save playwright-core
//   2) PORT=4199 node scripts/serve-deploy.mjs &
//   3) ollama serve (gemma4:e2b 설치돼 있어야 함 — 스크립트가 워밍업 1회 수행)
//   4) edge-tts 를 임시 폴더에 설치(공용 venv 오염 금지): .venv\Scripts\python.exe -m pip install --target <임시폴더> edge-tts
//      내레이션 합성은 인터넷이 필요하다(Microsoft 음성 서비스). 합성본은 docs/hackathon/.demo_tts/ 에 캐시.
//   5) PYTHONPATH=<임시폴더> PORT=4199 node scripts/record-demo.mjs
//      TTS_ONLY=1 을 붙이면 내레이션만 합성하고 줄마다 길이·합계를 찍은 뒤 끝난다(녹화 전 3분 맞추기용).
// ffmpeg 경로가 다르면 FFMPEG_PATH(ffprobe 는 같은 폴더), 목소리는 TTS_VOICE, 파이썬은 PYTHON 환경변수로 지정.
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'

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

// ── 자막 + 내레이션 표 ───────────────────────────────────────────────────────
// [화면 자막, 읽는 말]. 읽는 말은 자막과 같은 뜻·같은 낱말로 두고 기호만 소리 내기 좋게 바꾼다(① → 첫째, ₩0 → 0원, · → 쉼표).
const N = {
  problem: ['전 직원이 매일 AI를 씁니다. 그런데 원리를 아는 사람은? 원인은 수학입니다',
    '전 직원이 매일 AI를 씁니다. 그런데 원리를 아는 사람은? 원인은 수학입니다.'],
  brand: ['수포자 아카데미: LLM 튜터 · 개념 온톨로지 · 시스템 다이내믹스로 움직이는 "AI 강사"',
    '수포자 아카데미. LLM 튜터, 개념 온톨로지, 시스템 다이내믹스로 움직이는 AI 강사입니다.'],
  diag: ['5분 진단: 시험이 아니라, 나에게 맞는 경로를 짜기 위한 12문항',
    '5분 진단. 시험이 아니라, 나에게 맞는 경로를 짜기 위한 12문항입니다.'],
  dontKnow: ['모르는 건 편하게 골라도 됩니다. 관문 단위로 채점되니까요',
    '모르는 건 편하게 골라도 됩니다. 관문 단위로 채점되니까요.'],
  submit: ['제출하면 규칙 엔진이 이 사람의 경로를 다시 짭니다',
    '제출하면 규칙 엔진이 이 사람의 경로를 다시 짭니다.'],
  path: ['130챕터 중 이 사람에겐 55챕터 · 31.9시간. 아는 단계는 접고, 이유까지 말해 줍니다',
    '130챕터 중 이 사람에겐 55챕터, 31.9시간. 아는 단계는 접고, 이유까지 말해 줍니다.'],
  explain: ['경로는 규칙이 정하고, 설명은 로컬 LLM이 강사 말투로 풀어 줍니다',
    '경로는 규칙이 정하고, 설명은 로컬 LLM이 강사 말투로 풀어 줍니다.'],
  concepts: ['틀린 문항은 점수가 아니라 개념 이름으로. 개념 온톨로지가 "도함수(2부 3장)"처럼 자리까지 압니다',
    '틀린 문항은 점수가 아니라 개념 이름으로. 개념 온톨로지가 도함수, 2부 3장처럼 자리까지 압니다.'],
  token: ['여기서부터는 내 문장으로 LLM 속을 봅니다. ① 문장이 "조각(토큰)"으로',
    '여기서부터는 내 문장으로 LLM 속을 봅니다. 첫째, 문장이 토큰이라는 조각으로.'],
  attention: ['② 어텐션: 단어끼리 서로를 "쳐다보는" 정도를 내적으로. 트랜스포머의 핵심 Q·K·V',
    '둘째, 어텐션. 단어끼리 서로를 쳐다보는 정도를 내적으로. 트랜스포머의 핵심, Q, K, V.'],
  output: ['③ 출력층: 문맥이 "다음 단어 후보의 확률"이 되는 순간. 이 수학이 1·3·5부 커리큘럼입니다',
    '셋째, 출력층. 문맥이 다음 단어 후보의 확률이 되는 순간. 이 수학이 1부, 3부, 5부 커리큘럼입니다.'],
  ontology: ['개념 온톨로지: 시리즈 개념 127개 · 관계 520개의 지도. 12부 "S자 성장"을 고르면',
    '개념 온톨로지. 시리즈 개념 127개, 관계 520개의 지도입니다. 12부 S자 성장을 고르면,'],
  chain: ['먼저 알아야 할 사슬이 2부 시그모이드·지수와 로그까지 이어집니다. 튜터도 검색도 이 지도를 읽습니다',
    '먼저 알아야 할 사슬이 2부 시그모이드, 지수와 로그까지 이어집니다. 튜터도 검색도 이 지도를 읽습니다.'],
  // 자막은 화면에서 실제로 묻는 질문과 같아야 한다 — 옛 자막('5장 "오일러법". 막히면 튜터에게 묻습니다')은
  // 오일러법을 묻는 것처럼 읽혔다(2026-10-21 사용자 지적). 지금 보는 장은 괄호로, 묻는 말은 따옴표로.
  tutor: ['12부 5장(오일러법)을 보다가 🤖 로컬 LLM 튜터에게 다른 부의 개념을 묻습니다: "경사하강은 어디서 배워요?"',
    '12부 5장, 오일러법을 보다가 로컬 LLM 튜터에게 다른 부의 개념을 묻습니다. 경사하강은 어디서 배워요?'],
  card: ['개념 지도에서 꺼낸 카드 한 장으로 다른 부의 "2부 9장"까지. 벡터 DB 없이, 내 PC의 경량 모델로',
    '개념 지도에서 꺼낸 카드 한 장으로 다른 부의 2부 9장까지. 벡터 DB 없이, 내 PC의 경량 모델로.'],
  offtopic: ['학습과 무관한 질문은?', '학습과 무관한 질문은?'],
  refuse: ['정중히 거절합니다. 서버 0 · API 비용 ₩0 · 질문이 PC 밖으로 나간 횟수 0',
    '정중히 거절합니다. 서버 0, API 비용 0원, 질문이 PC 밖으로 나간 횟수 0.'],
  sdRead: ['시스템 다이내믹스는 그림 읽기부터. 수포자도 인과지도를 기호 하나씩, 한 단계씩 그려 가며 배웁니다',
    '시스템 다이내믹스는 그림 읽기부터. 수포자도 인과지도를 기호 하나씩, 한 단계씩 그려 가며 배웁니다.'],
  sdLoop: ['고리를 한 바퀴 따라 읽어 강화 루프(R)인지 균형 루프(B)인지 가립니다. 새로 그린 곳은 노란 바탕',
    '고리를 한 바퀴 따라 읽어 강화 루프 R인지 균형 루프 B인지 가립니다. 새로 그린 곳은 노란 바탕.'],
  ch7: ['① 7장 실험: 입소문(R)과 포화(B)가 신규 가입을 놓고 줄다리기를 합니다',
    '첫째, 7장 실험. 입소문 R과 포화 B가 신규 가입을 놓고 줄다리기를 합니다.'],
  ch7b: ['시간이 지나면 이기는 고리가 R에서 B로 바뀝니다. 그래서 S자 곡선이 나옵니다',
    '시간이 지나면 이기는 고리가 R에서 B로 바뀝니다. 그래서 S자 곡선이 나옵니다.'],
  ch12: ['② 12장 저량-유량도: 우리 회사 규모(직원 300명)의 AI 도입을 미리 돌려 봅니다. 홍보(p) · 입소문(q) · 이탈(L)',
    '둘째, 12장 저량 유량도. 우리 회사 규모, 직원 300명의 AI 도입을 미리 돌려 봅니다. 홍보, 입소문, 이탈.'],
  churn: ['평균 10개월 쓰고 그만두는 현실이면, 3년 뒤 76%에서 멈춥니다',
    '평균 10개월 쓰고 그만두는 현실이면, 3년 뒤 76%에서 멈춥니다.'],
  wom: ['홍보보다 입소문을 키우면 84%', '홍보보다 입소문을 키우면 84%.'],
  retain: ['계속 쓰게 만들면 88%. 이 플랫폼의 사내 도입 전략도 이 모형으로 짰습니다',
    '계속 쓰게 만들면 88%. 이 플랫폼의 사내 도입 전략도 이 모형으로 짰습니다.'],
  numbers: ['130 챕터 · 1,800+ 자동채점 문항 · 144 실습 노트북 · 개념 127개 지도 · 운영비 ₩0',
    '130챕터, 1,800개가 넘는 자동채점 문항, 144권의 실습 노트북, 개념 127개의 지도, 운영비 0원.'],
  close: ['LLM · 온톨로지 · 시스템 다이내믹스로 움직이는 AI 강사, 오늘 바로 도입할 수 있습니다',
    'LLM, 온톨로지, 시스템 다이내믹스로 움직이는 AI 강사, 오늘 바로 도입할 수 있습니다.'],
}

// ── 0) 내레이션 합성 (edge-tts) — 같은 목소리·문장이면 캐시를 쓴다 ─────────────
const VOICE = process.env.TTS_VOICE || 'ko-KR-SunHiNeural'
const PYTHON = process.env.PYTHON || join(ROOT, '.venv/Scripts/python.exe')
const FFPROBE = FFMPEG.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1')
const TTS_DIR = join(ROOT, 'docs/hackathon/.demo_tts')
console.log(`▶ 내레이션 합성 (${VOICE})…`)
mkdirSync(TTS_DIR, { recursive: true })
let sayTotal = 0
for (const [k, [text, say]] of Object.entries(N)) {
  const file = join(TTS_DIR, createHash('sha1').update(`${VOICE}\n${say}`).digest('hex').slice(0, 16) + '.mp3')
  if (!existsSync(file)) {
    execFileSync(PYTHON, ['-m', 'edge_tts', '--voice', VOICE, '--text', say, '--write-media', file], { stdio: 'pipe' })
  }
  const sec = parseFloat(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString())
  // 합성본 끝에는 약 0.9초 무음이 붙는다 — 장면 시간은 파일 길이가 아니라 말이 끝나는 시각으로 잡는다(줄 사이가 늘어지지 않게)
  const det = spawnSync(FFMPEG, ['-hide_banner', '-nostats', '-i', file, '-af', 'silencedetect=noise=-45dB:d=0.1', '-f', 'null', '-'], { encoding: 'utf8' }).stderr
  const starts = [...det.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1])
  const ends = [...det.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1])
  const tail = starts.length && (starts.length > ends.length || ends[ends.length - 1] >= sec - 0.05)
  const speech = tail ? starts[starts.length - 1] : sec
  N[k] = { text, say, file, ms: Math.round(speech * 1000) }
  sayTotal += speech
  if (process.env.TTS_ONLY) console.log(`  ${k.padEnd(10)} ${speech.toFixed(1).padStart(5)}s  ${say}`)
}
console.log(`  내레이션 ${Object.keys(N).length}줄, 합계 ${sayTotal.toFixed(1)}s`)
if (process.env.TTS_ONLY) process.exit(0)

// ── 1) Ollama 워밍업 — 첫 질문의 모델 로딩(수십 초)이 영상에 찍히지 않게 ──────
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
      box-shadow:0 6px 24px rgba(0,0,0,.25);display:none;white-space:pre-wrap;word-break:keep-all}`
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

// ── 자막 관리 (화면 오버레이 + SRT 로그 + 내레이션 시각 동시) ─────────────────
const t0 = Date.now()
const subs = [] // {t, text, file}
let speakEnd = 0 // 지금 나오는 내레이션이 끝나는 시각(t0 기준 ms)
// 내레이션이 끝날 때까지(+ 숨 고르기) 기다린다 — 다음 자막 앞, 장면을 옮기기 전, 화면을 바꾸는 클릭 전에 부른다
async function hush(extra = 0) {
  const wait = speakEnd + 350 + extra - (Date.now() - t0)
  if (wait > 0) await sleep(wait)
}
async function cap(n) {
  await hush()
  const t = Date.now() - t0
  subs.push({ t, text: n.text, file: n.file })
  speakEnd = t + n.ms
  await page.evaluate((s) => {
    const el = document.getElementById('__cap')
    if (el) { el.textContent = s; el.style.display = 'block' }
  }, n.text)
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
await cap(N.problem)
await sleep(5000)
await cap(N.brand)
await wheel(420, 3, 600)
await sleep(3800)

// ═══ S2 진단 몽타주 → 경로 재구성 → LLM 이 추천을 풀어 줌 → 개념 이름 ══════════════
console.log('▶ S2 진단')
await hush(-500) // 페이지가 뜨는 동안 앞 장면의 마지막 말이 끝나게(전환마다 같음)
await page.goto(`${BASE}/diagnose`, { waitUntil: 'networkidle' })
await cap(N.diag)
await sleep(1500)
// 프로필: 벡터·확률 관문 통과, 미분·log 미통과 (발표 덱 스크린샷과 동일 → "55챕터 · 31.9시간")
// 화면의 보기 번호다 — 진단 보기 배치(diagnostic.ts ANSWER_FORMAT 2, 2026-09-29) 기준. 예전 배치의 [1,1,2,2,1,1,0,0,2,3,0,0]과 같은 답.
const picks = [0, 3, 2, 3, 0, 1, 0, 0, 1, 3, 0, 1]
const items = page.locator('main ol > li')
for (let i = 0; i < picks.length; i++) {
  if (i === 6) await cap(N.dontKnow)
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
await cap(N.submit)
await move(page.locator('button', { hasText: '내 경로 짜기' }))
await sleep(1800)
await click(page.locator('button', { hasText: '내 경로 짜기' }), 200)
await page.waitForSelector('text=AI 강사가 짜 준 내 경로', { timeout: 15000 })
await sleep(700)
await cap(N.path)
await sleep(5600)
// LLM 기둥 ① — 규칙이 정한 경로를 로컬 LLM 이 강사 말투로 풀어 준다(TutorExplain)
const sumCard = page.locator('div.rounded-2xl.bg-indigo-600').first()
const explainBtn = sumCard.locator('button', { hasText: 'AI 강사에게 더 듣기' })
if (await explainBtn.count()) {
  await cap(N.explain)
  await click(explainBtn, 300)
  await settleText(sumCard.locator('p.bg-indigo-50'), 15000)
  await sleep(4600)
}
// 온톨로지 기둥 ① — 틀린 문항이 개념 이름(어느 부 몇 장)으로
const diagConcepts = page.locator('[data-diag-concepts]')
if (await diagConcepts.count()) {
  await move(diagConcepts)
  await cap(N.concepts)
  await sleep(6500)
}

// ═══ S3 LLM 해부 — 토큰화 → 어텐션 → 확률 (3장면) ════════════════════════════
console.log('▶ S3 LLM 해부')
await hush(-500)
await page.goto(`${BASE}/part4/ch/ch2`, { waitUntil: 'networkidle' })
await cap(N.token)
const sent = page.locator('main input[type=text]').first()
await move(sent); await click(sent, 120)
await sent.fill('')
await page.keyboard.type('우리 회사 최고의 복지는 동료다', { delay: 60 })
await sleep(1800)
await click(page.locator('button', { hasText: '서브워드' }).first(), 250)
await sleep(2600)

await hush(-500)
await page.goto(`${BASE}/part4/ch/ch6`, { waitUntil: 'networkidle' })
await cap(N.attention)
const qkv = page.locator('main div.my-5.rounded-xl.border.border-slate-200.bg-white').filter({ hasText: 'Query(질문) 벡터' }).first()
await qkv.scrollIntoViewIfNeeded()
await sleep(700)
for (const w of ['공', '물었다', '강아지']) {
  await click(qkv.locator('button', { hasText: w }).first(), 1100)
}
await sleep(1200)

await hush(-500)
await page.goto(`${BASE}/part4/ch/ch9`, { waitUntil: 'networkidle' })
await cap(N.output)
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
await hush(-500)
await page.goto(`${BASE}/concepts?c=logistic-growth`, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-concept-node]', { timeout: 10000 })
await sleep(600)
await cap(N.ontology)
const selNode = page.locator('[data-concept-node]', { hasText: 'S자 성장과 지배 루프' }).first()
await move(selNode)
await sleep(5600)
await cap(N.chain)
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
await hush(-500)
await page.goto(`${BASE}/part12/ch/ch5`, { waitUntil: 'networkidle' })
await cap(N.tutor)
await click(page.locator('button[aria-label="AI 튜터 열기"]'), 800)
const tutorInput = page.locator('input[placeholder="질문을 입력하세요…"]')
await click(tutorInput, 100)
await page.keyboard.type('경사하강은 어디서 배워요?', { delay: 50 })
await page.keyboard.press('Enter')
await page.waitForSelector('button:has-text("중지")', { timeout: 8000 }).catch(() => {})
await page.waitForSelector('button:has-text("중지")', { state: 'detached', timeout: 60000 }).catch(() => {})
const said2_9 = (await page.locator('div.fixed.bottom-24').getByText('2부 9장').count()) > 0
console.log(`  튜터 답변에 "2부 9장" ${said2_9 ? '포함 ✓' : '없음 — 자막은 그대로 진행'}`)
await sleep(4600)
await cap(N.card)
await sleep(6000)
await cap(N.offtopic)
await click(tutorInput, 100)
await page.keyboard.type('저녁 메뉴 추천해줘', { delay: 45 })
await page.keyboard.press('Enter')
await page.waitForSelector('text=도와드릴 수 없어요', { timeout: 25000 }).catch(() => {})
await sleep(2200)
await cap(N.refuse)
await sleep(5200)

// ═══ S6 시스템 다이내믹스 — ⓪ 그림 읽기(1장) ① 인과지도(이기는 고리가 바뀜) ② 캡스톤 저량-유량도 시나리오 ═══
console.log('▶ S6 시스템 다이내믹스')
// ⓪ 1장 3절 — 인과지도를 기호 하나씩 그려 간다. 단계 버튼(위쪽)을 누른다 — '다음' 버튼은 자막 바에 가린다.
await hush(-500)
await page.goto(`${BASE}/part12/ch/ch1`, { waitUntil: 'networkidle' })
const cldSteps = page.locator('main div.my-5.rounded-xl.border.border-indigo-100').filter({ hasText: '입소문과 한계' }).first()
await cldSteps.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
await page.mouse.wheel(0, -40)
await sleep(700)
await cap(N.sdRead)
const stepBtns = cldSteps.locator('[role=group] button')
await sleep(1400)
for (let k = 1; k <= 3; k++) await clickHere(stepBtns.nth(k), 1900) // 화살표 → + 부호 → 되돌아오는 화살표
await cap(N.sdLoop)
for (let k = 4; k <= 6; k++) await clickHere(stepBtns.nth(k), 2200) // R 표시 → − 와 B 표시 → ∥ 지연
await sleep(1200)

await hush(-500)
await page.goto(`${BASE}/part12/ch/ch7`, { waitUntil: 'networkidle' })
const logLab = page.locator('main div.my-5.rounded-xl.p-5').filter({ has: page.locator('input[type=range].accent-amber-600') }).first()
await logLab.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
await page.mouse.wheel(0, -60)
await sleep(600)
await cap(N.ch7)
const nowSlider = logLab.locator('input[type=range].accent-amber-600').first()
const sb = await nowSlider.boundingBox()
await page.mouse.move(sb.x + sb.width * 0.11, sb.y + sb.height / 2, { steps: 16 })
await sleep(5000)
await cap(N.ch7b)
await nowSlider.evaluate(async (el) => {
  const set = (v) => { el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })) }
  for (let v = 4; v <= 22; v += 2) { set(v); await new Promise((r) => setTimeout(r, 420)) }
})
await page.mouse.move(sb.x + sb.width * 0.61, sb.y + sb.height / 2, { steps: 10 })
await sleep(3600)

await hush(-500)
await page.goto(`${BASE}/part12/ch/ch12`, { waitUntil: 'networkidle' })
const adopt = page.locator('main div.my-5.rounded-xl.border-2.border-indigo-200').first()
// 한 화면(1280×720)에 시나리오 버튼·저량-유량도·그래프가 같이 들어오게 실험실만 살짝 줄인다
await adopt.evaluate((el) => { el.style.zoom = '0.8'; el.scrollIntoView({ block: 'start', behavior: 'instant' }) })
await page.mouse.wheel(0, -30)
await sleep(700)
await cap(N.ch12)
await sleep(5600)
await hush()
await clickHere(adopt.locator('button', { hasText: '현실: 이탈 있음' }), 300)
await cap(N.churn)
await sleep(4600)
await hush()
await clickHere(adopt.locator('button', { hasText: '입소문 집중 + 이탈' }), 300)
await cap(N.wom)
await sleep(3800)
await hush()
await clickHere(adopt.locator('button', { hasText: '이탈 방지(20개월)' }), 300)
await cap(N.retain)
await sleep(5400)

// ═══ S7 클로징 — 숫자 한 장 ═════════════════════════════════════════════════
console.log('▶ S7 클로징')
await hush(-500)
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await cap(N.numbers)
await page.locator('text=자동채점 문항').first().scrollIntoViewIfNeeded()
await sleep(5500)
await cap(N.close)
await sleep(5500)

await hush(1000) // 마지막 내레이션까지 듣고 녹화를 끝낸다

// ── 마무리: 비디오 저장 → mp4 변환(+ 내레이션) → SRT ────────────────────────────────────
const durMs = Date.now() - t0
await ctx.close()
const webm = await page.video().path()
await browser.close()

console.log(`▶ 변환 (원본 ${(durMs / 1000).toFixed(1)}s) → mp4 + 내레이션 ${subs.length}개`)
// 내레이션마다 자막이 뜬 시각만큼 늦춰(adelay) 한 트랙으로 섞고, 영상 끝까지 무음으로 채운다(apad + -shortest)
const ins = ['-y', '-i', webm]
const delayed = subs.map((c, i) => {
  ins.push('-i', c.file)
  return `[${i + 1}:a]adelay=${c.t}:all=1[a${i}]`
})
const filter = `${delayed.join(';')};${subs.map((_, i) => `[a${i}]`).join('')}amix=inputs=${subs.length}:normalize=0,apad[aout]`
execFileSync(FFMPEG, [
  ...ins, '-filter_complex', filter, '-map', '0:v', '-map', '[aout]',
  '-c:v', 'libx264', '-crf', '20', '-r', '30', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '160k', '-ar', '44100', '-ac', '2', '-shortest', '-movflags', '+faststart',
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
if (durMs > 240000) console.warn('⚠ 4분을 넘었습니다 — 튜터 답변이 길었는지 확인하고 다시 녹화하세요')
