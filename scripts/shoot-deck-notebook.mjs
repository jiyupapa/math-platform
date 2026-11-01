// scripts/shoot-deck-notebook.mjs
// 발표 덱 ⑤ 에 넣는 노트북 실물 화면 → docs/hackathon/assets/lab_notebook.png
// 4부 6장 노트북을 임시 폴더에 복사·실행해 JupyterLab 으로 열고 찍는다. 저장소의 노트북은 건드리지 않는다.
// 웹 실험실(lab_ch6_attention)과 같은 예제("강아지 · 공 · 물었다")가 보이는 셀을 찍는다.
//
// 사용법: 1) npm i --no-save playwright-core  2) node scripts/shoot-deck-notebook.mjs [출력 경로]
// 브라우저는 시스템 Edge(EDGE_PATH), 파이썬은 루트 .venv(PYTHON) — 커널 math-platform 이 등록돼 있어야 한다.
import { spawn, execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const { chromium } = createRequire(join(ROOT, 'package.json'))('playwright-core')
const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const PYTHON = process.env.PYTHON || join(ROOT, '.venv/Scripts/python.exe')
const OUT = process.argv[2] || join(ROOT, 'docs/hackathon/assets/lab_notebook.png')
const PORT = process.env.JUPYTER_PORT || '8899'
const NAME = 'ch06_qkv_attention.ipynb'

const dir = mkdtempSync(join(tmpdir(), 'deck-notebook-'))
// 튜터 셀은 tutor.py 와 개념 그래프가 있어야 돌고 찍을 자리에 보이지 않으므로 사본에서 뺀다.
const nb = JSON.parse(readFileSync(join(ROOT, 'apps/part4/notebooks', NAME), 'utf8'))
nb.cells = nb.cells.filter((c) => !c.source.join('').includes('tutor') && !c.source.join('').includes('AI 튜터'))
writeFileSync(join(dir, NAME), JSON.stringify(nb))
execFileSync(PYTHON, ['-m', 'jupyter', 'nbconvert', '--to', 'notebook', '--execute', '--inplace',
  '--ExecutePreprocessor.kernel_name=math-platform', join(dir, NAME)], { stdio: 'ignore' })

const server = spawn(PYTHON, ['-m', 'jupyter', 'lab', '--no-browser', `--port=${PORT}`, '--ServerApp.port_retries=0',
  '--ServerApp.token=', '--ServerApp.password=', '--ServerApp.disable_check_xsrf=True',
  `--ServerApp.root_dir=${dir}`, `--LabApp.workspaces_dir=${dir}`], { stdio: 'ignore' })
const BASE = `http://localhost:${PORT}`
let browser
try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(`${BASE}/api/status`)).ok) break } catch { /* 아직 안 떴다 */ }
    if (i > 60) throw new Error('JupyterLab 이 뜨지 않았습니다')
    await new Promise((r) => setTimeout(r, 500))
  }
  browser = await chromium.launch({ executablePath: EDGE, headless: true })
  // 덱 칸이 작아(가로 약 3.5인치) 창을 좁게 열어 글자를 키운다.
  const page = await (await browser.newContext({ viewport: { width: 760, height: 620 }, deviceScaleFactor: 3 })).newPage()
  await page.goto(`${BASE}/doc/tree/${NAME}`)
  // 찍을 셀: '물었다'의 Query 와 각 단어 Key 의 내적 — 웹 실험실 표와 같은 숫자가 나온다.
  const cell = page.locator('.jp-Cell.jp-CodeCell').filter({ hasText: 'scores = KEY @ q' })
  await cell.waitFor({ timeout: 60000 })
  await page.waitForTimeout(3000)            // 커널 연결·글꼴이 자리 잡게
  // 첫 실행 알림("Jupyter news")을 닫는다.
  const no = page.getByRole('button', { name: 'No', exact: true })
  if (await no.count()) await no.first().click()
  await cell.scrollIntoViewIfNeeded()
  await cell.locator('.jp-InputPrompt').first().click()   // 이 셀을 고른 상태로 — 도구 막대에 Code 가 보이게
  // 도구 막대 바로 아래에 이 셀이 오도록 올린다.
  await page.evaluate(() => {
    const c = [...document.querySelectorAll('.jp-Cell.jp-CodeCell')].find((e) => e.textContent.includes('scores = KEY @ q'))
    const s = c.closest('.jp-WindowedPanel-outer')
    s.scrollTop += c.getBoundingClientRect().top - s.getBoundingClientRect().top - 2
  })
  await page.mouse.move(2, 2)
  await page.waitForTimeout(1000)
  const box = await cell.boundingBox()
  await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 760, height: Math.ceil(box.y + box.height + 2) } })
  console.log('저장 →', OUT)
} finally {
  await browser?.close()
  await fetch(`${BASE}/api/shutdown`, { method: 'POST' }).catch(() => {})
  server.kill()
  await new Promise((r) => setTimeout(r, 1500))
  rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 })
}
