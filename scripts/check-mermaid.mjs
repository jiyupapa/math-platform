// scripts/check-mermaid.mjs
// 마크다운의 mermaid 다이어그램을 **실제 mermaid 파서**로 검증한다.
//   입력: git 이 추적하는 모든 *.md 의 ```mermaid 블록
//   출력: 콘솔 리포트. 파싱·렌더 실패가 있으면 exit 1.
//
// 왜 필요한가: mermaid 라벨은 평문처럼 보여도 파서 토큰이 섞이면 조용히 깨진다.
//   실제로 겪은 것들 — HTML 엔터티(&ge;)·라벨 중간의 괄호·중괄호·파이프·콜론 두 번,
//   그리고 stateDiagram-v2 전이 라벨의 <br/>. 눈으로는 멀쩡해 보이고, 깨진 건
//   GitHub 이나 뷰어에서 렌더할 때야 드러난다. 그래서 파서에 직접 물어본다.
//
// 어떻게: mermaid 는 브라우저 API(DOM·측정)를 쓰므로 Node 단독으로는 렌더가 안 된다.
//   설치된 Edge/Chrome 을 playwright-core 로 띄워 그 안에서 parse + render 를 돌린다.
//   브라우저 탐색은 e2e/lib.mjs 의 browserPath() 를 그대로 재사용한다(중복 방지).
//
// 실행:
//   node scripts/check-mermaid.mjs          # 전체
//   node scripts/check-mermaid.mjs docs/PROCESS.md   # 특정 파일만
//   npm run check:mermaid
//
// 커밋 훅에는 넣지 않았다 — 브라우저를 띄우느라 몇 초가 걸려서, 0.2초인 대비 검사와 달리
//   매 커밋에 물리면 거슬린다. 다이어그램을 고쳤을 때 손으로 돌리는 용도다.
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, relative } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { browserPath } from '../e2e/lib.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))

const MERMAID_BUNDLE = join(root, 'node_modules/mermaid/dist/mermaid.min.js')
if (!existsSync(MERMAID_BUNDLE)) {
  console.error('\n✗ mermaid 가 설치돼 있지 않습니다 — 저장소 루트에서 `npm install` 을 실행하세요.\n')
  process.exit(2)
}

let chromium
try {
  ;({ chromium } = require('playwright-core'))
} catch {
  console.error('\n✗ playwright-core 가 없습니다 — 저장소 루트에서 `npm install` 을 실행하세요.\n')
  process.exit(2)
}

// ── 대상 수집 ────────────────────────────────────────────
const argFiles = process.argv.slice(2).filter((a) => !a.startsWith('-'))
// --others --exclude-standard 를 함께 준다 — 아직 커밋 안 한 **새 문서**도 대상이다.
// (추적분만 보면 새로 쓴 문서의 깨진 다이어그램을 그대로 통과시킨다)
// -z 필수 — git 은 기본적으로 비ASCII 경로를 따옴표 + 8진 이스케이프로 내보낸다.
// 그대로 쓰면 한글 이름 문서가 전부 "파일 없음"이 되어 검사에서 빠진다(실제로 11개가 빠져 있었다).
const files = argFiles.length
  ? argFiles
  : execSync('git ls-files -z --cached --others --exclude-standard -- "*.md"', { encoding: 'utf8', cwd: root })
      .split('\0')
      .filter(Boolean)

const blocks = []
const missing = []
for (const rel of files) {
  // resolve 를 쓴다 — 인자로 절대 경로가 올 수 있고, join 은 그걸 망가뜨린다.
  const p = resolve(root, rel)
  if (!existsSync(p)) {
    missing.push(rel) // 조용히 건너뛰면 "검사했다"는 착각이 생긴다
    continue
  }
  const md = readFileSync(p, 'utf8')
  const re = /```mermaid\r?\n([\s\S]*?)```/g
  let m
  while ((m = re.exec(md))) {
    blocks.push({ file: relative(root, p).replace(/\\/g, '/'), line: md.slice(0, m.index).split('\n').length, code: m[1] })
  }
}

if (missing.length) {
  console.error(`✗ 파일을 찾지 못했습니다 (${missing.length}개):`)
  for (const f of missing) console.error(`    ${f}`)
  process.exit(2)
}

if (!blocks.length) {
  console.log(`✓ mermaid 블록 없음 — 검사할 것이 없습니다 (.md ${files.length}개 확인)`)
  process.exit(0)
}

const byFile = new Set(blocks.map((b) => b.file))
console.log(`mermaid 블록 ${blocks.length}개 / 파일 ${byFile.size}개 — 실제 파서로 검증합니다\n`)

// ── 검증 ────────────────────────────────────────────────
const browser = await chromium.launch({ executablePath: browserPath(), headless: true })
let fail = 0
try {
  const page = await browser.newPage()
  await page.goto('about:blank')
  await page.addScriptTag({ path: MERMAID_BUNDLE })
  // startOnLoad:false — 우리가 블록마다 직접 parse/render 를 호출한다
  await page.evaluate(() => window.mermaid.initialize({ startOnLoad: false }))

  for (const [i, b] of blocks.entries()) {
    const res = await page.evaluate(
      async ({ code, id }) => {
        try {
          await window.mermaid.parse(code)
          const out = await window.mermaid.render('chk' + id, code)
          return { ok: true, bytes: out.svg.length }
        } catch (e) {
          return { ok: false, msg: String(e && e.message ? e.message : e) }
        }
      },
      { code: b.code, id: i },
    )

    const kind = b.code.trim().split('\n')[0].slice(0, 24)
    const where = `${b.file}:${b.line}`
    if (res.ok) {
      console.log(`  ✓ ${where.padEnd(34)} ${kind}`)
    } else {
      fail++
      console.log(`  ✗ ${where.padEnd(34)} ${kind}`)
      for (const l of res.msg.split('\n').slice(0, 6)) console.log(`      ${l}`)
    }
  }
} finally {
  await browser.close()
}

if (fail) {
  console.log(`\n✗ 실패 ${fail}건`)
  console.log('  자주 걸리는 것 — 라벨에서 빼야 하는 문자:')
  console.log('    HTML 엔터티(&ge; &gt; &nbsp;) → 유니코드나 ASCII 로')
  console.log('    라벨 중간의 괄호 · 중괄호 · 파이프 · 콜론 두 번 이상 → 평문으로 치환')
  console.log('    <br/> 은 flowchart 의 따옴표 라벨 안에서만. stateDiagram-v2 전이 라벨에는 금지')
  process.exit(1)
}
console.log(`\n✓ 전 블록 파싱·렌더 통과`)
