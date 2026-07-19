// E2E 공용 유틸 — 실 Supabase + 실 브라우저(조립본)로 검증한다. 모킹 없음.
// 설계 배경·주의사항은 e2e/README.md 참조.
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'

export const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const require = createRequire(join(ROOT, 'package.json'))

// ── 설정 ────────────────────────────────────────────────
// 루트 .env 하나를 앱 빌드와 같은 원천으로 읽는다(앱 vite.config 의 envDir 와 동일).
function loadDotEnv() {
  const out = {}
  const p = join(ROOT, '.env')
  if (!existsSync(p)) return out
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line)
    if (m && !line.trimStart().startsWith('#')) out[m[1]] = m[2].trim()
  }
  return out
}
const dotenv = loadDotEnv()
const env = (k, fallback) => process.env[k] ?? dotenv[k] ?? fallback

export const CONFIG = {
  /** 조립본 주소 — `npm run deploy:serve` 가 띄우는 곳(포털+각 부가 한 origin) */
  base: env('E2E_BASE', 'http://localhost:4291'),
  supabaseUrl: env('VITE_SUPABASE_URL'),
  supabaseAnonKey: env('VITE_SUPABASE_ANON_KEY'),
  /** 테스트 계정 — @solideos.com 도메인 트리거를 통과해야 한다 */
  userA: env('E2E_USER_A', 'anna@solideos.com'),
  userB: env('E2E_USER_B', 'annb@solideos.com'),
  password: env('E2E_PASSWORD'),
  /** 관리자 시나리오(P3)용 — 없으면 해당 스위트는 건너뛴다 */
  adminEmail: env('E2E_ADMIN_EMAIL'),
  adminPassword: env('E2E_ADMIN_PASSWORD'),
  ollamaUrl: env('VITE_OLLAMA_URL', 'http://localhost:11434'),
}

// 크로미움 계열 실행 파일 — playwright-core 는 브라우저를 내려받지 않으므로 설치된 걸 쓴다.
const BROWSER_CANDIDATES = [
  env('E2E_BROWSER'),
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].filter(Boolean)

export function browserPath() {
  const found = BROWSER_CANDIDATES.find((p) => existsSync(p))
  if (!found) {
    fail(
      '브라우저 실행 파일을 찾지 못했습니다.\n' +
        '  E2E_BROWSER 로 경로를 지정하세요 (Edge 또는 Chrome).\n' +
        '  후보: ' + BROWSER_CANDIDATES.join(' · '),
    )
  }
  return found
}

export function fail(msg) {
  console.error('\n✗ ' + msg + '\n')
  process.exit(2)
}

/** 필수 설정 확인 — 없으면 무엇을 어떻게 채우는지 알려주고 멈춘다(조용한 실패 방지). */
export function requireConfig({ browser = true } = {}) {
  if (!CONFIG.supabaseUrl || !CONFIG.supabaseAnonKey) {
    fail('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 없습니다 — 루트 .env 를 확인하세요.')
  }
  if (!CONFIG.password) {
    fail(
      'E2E_PASSWORD 가 없습니다.\n' +
        '  루트 .env 에 테스트 계정 비밀번호를 넣으세요(.env 는 gitignore).\n' +
        '  예:  E2E_PASSWORD=...   (계정: ' + CONFIG.userA + ' · ' + CONFIG.userB + ')',
    )
  }
  if (browser) browserPath()
}

// ── 결과 집계 ────────────────────────────────────────────
export function reporter(title) {
  let pass = 0
  let fails = 0
  console.log(`\n########## ${title} ##########`)
  return {
    section: (s) => console.log(`\n[${s}]`),
    check(name, ok, extra = '') {
      if (ok) {
        pass++
        console.log('  ✓', name, extra)
      } else {
        fails++
        console.log('  ✗ FAIL', name, extra)
      }
      return ok
    },
    skip(reason) {
      console.log(`\n⊘ 건너뜀 — ${reason}`)
      process.exit(0)
    },
    done() {
      console.log(`\n=== ${title}: ${pass} PASS / ${fails} FAIL ===`)
      process.exit(fails ? 1 : 0)
    },
  }
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ── Supabase ────────────────────────────────────────────
export function createClient(opts = {}) {
  const { createClient: cc } = require('@supabase/supabase-js')
  return cc(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
    auth: { persistSession: false, ...opts },
  })
}

/** 로그인해 { sb, user } 반환. 실패 시 즉시 종료(원인을 숨기지 않는다). */
export async function signIn(email, password = CONFIG.password) {
  const sb = createClient()
  const { data, error } = await sb.auth.signInWithPassword({ email, password })
  if (error) fail(`로그인 실패 ${email} — ${error.message}\n  계정이 없으면 포털에서 가입하거나 E2E_* 설정을 확인하세요.`)
  return { sb, user: data.user }
}

/** 관리자 계정이 설정돼 있고 실제로 관리자인지 — 아니면 null(스위트가 건너뛰도록). */
export async function signInAdmin() {
  if (!CONFIG.adminEmail || !CONFIG.adminPassword) return null
  const { sb, user } = await signIn(CONFIG.adminEmail, CONFIG.adminPassword)
  const { data } = await sb.rpc('is_admin')
  return data === true ? { sb, user } : null
}

// ── 실사용 데이터 보호 ───────────────────────────────────
// ⚠️ 한 번 사고가 났던 자리다: 테스트 청소가 사용자의 실제 메모를 지웠다(복구함).
//    스위트는 반드시 safeDelete 를 쓰고, 아래 앵커는 절대 건드리지 않는다.
export const PROTECTED_ANCHORS = [
  { part: 1, item_id: 'ch1-s1' }, // 실사용 메모·질문이 쌓여 있는 자리
]

function isProtected(part, itemId) {
  return PROTECTED_ANCHORS.some((p) => p.part === part && p.item_id === itemId)
}

/** 테스트 주석 청소 — 보호 앵커면 삭제하지 않고 즉시 멈춘다(조용히 넘어가지 않는다). */
export async function safeDeleteAnnotations(sb, { part, itemId }) {
  if (isProtected(part, itemId)) {
    fail(
      `보호된 앵커를 지우려 했습니다: part${part} / ${itemId}\n` +
        '  여기엔 사용자의 실사용 메모가 있습니다. 테스트는 빈 앵커를 쓰세요.\n' +
        '  (보호 목록: e2e/lib.mjs 의 PROTECTED_ANCHORS)',
    )
  }
  return sb.from('annotations').delete().eq('part', part).eq('item_id', itemId)
}

/** 복습 토글 청소 — reviews 는 서버 동기화라 정리하지 않으면 실행마다 ON↔OFF 가 뒤집힌다(비멱등). */
export async function clearReview(sb, { part, itemId }) {
  return sb.from('reviews').delete().eq('part', part).eq('item_id', itemId)
}

// ── 브라우저 ────────────────────────────────────────────
export async function launchBrowser() {
  let chromium
  try {
    ;({ chromium } = require('playwright-core'))
  } catch {
    fail("playwright-core 가 없습니다 — 저장소 루트에서 `npm install` 을 실행하세요.")
  }
  return chromium.launch({ executablePath: browserPath(), headless: process.env.E2E_HEADED !== '1' })
}

/** 조립본 접근성 확인 — 서버가 없으면 무엇을 띄워야 하는지 알려준다. */
export async function requireServer() {
  try {
    const res = await fetch(`${CONFIG.base}/part1/ch/ch1`)
    if (!res.ok) throw new Error(String(res.status))
  } catch {
    fail(
      `조립본에 접근할 수 없습니다: ${CONFIG.base}\n` +
        '  먼저 띄우세요:  npm run deploy:build && PORT=4291 npm run deploy:serve\n' +
        '  (포털+각 부가 한 origin 이어야 세션이 공유된다 — npm run dev 로는 검증 불가)',
    )
  }
}

/** 포털에서 로그인한 새 페이지 — 세션은 같은 origin 의 각 부와 공유된다. */
export async function loginPage(context, email, password = CONFIG.password) {
  const page = await context.newPage()
  page.on('pageerror', (e) => console.log('    [pageerror]', e.message))
  await page.goto(`${CONFIG.base}/`, { waitUntil: 'domcontentloaded' })
  await sleep(700)
  await page.click('text=진도 지키기')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('.ap-go')
  await page.waitForSelector(`text=${email}`, { timeout: 9000 }).catch(() => {})
  return page
}

/** Ollama 가 떠 있는지 — AI 시나리오는 없으면 건너뛴다. */
export async function ollamaUp() {
  try {
    const res = await fetch(`${CONFIG.ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}
