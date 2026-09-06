// scripts/build-deploy.mjs
// 11개 부 + 포털을 "하나의 origin 하위 경로"로 조립한다.
//   포털 = 루트(/) · 각 부 = /partN/   → 결과: deploy/ (정적 폴더 하나)
//
// 왜 필요한가: localStorage 는 origin(주소+포트) 단위로 격리된다(경로 무관).
//   진도는 la-*, tf-* 등으로 브라우저에 저장되므로, 11개 부 + 포털을 같은 origin 의
//   하위 경로로 묶어야 포털이 각 부의 진도를 직접 읽는 "개인화 2층"이 성립한다.
//   (npm run dev 는 부마다 포트가 달라 서로 다른 origin → 2층 검증 불가. 이 조립본만이 검증 수단.)
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { rmSync, mkdirSync, cpSync, writeFileSync, existsSync, readFileSync } from 'node:fs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const deployDir = join(root, 'deploy')

// name = 워크스페이스 폴더(apps/<name>/web) · base = 배포 base · dest = deploy 하위 목적지('' = 루트)
const APPS = [
  { name: 'portal', base: '/',       dest: ''      },
  { name: 'part1',  base: '/part1/', dest: 'part1' },
  { name: 'part2',  base: '/part2/', dest: 'part2' },
  { name: 'part3',  base: '/part3/', dest: 'part3' },
  { name: 'part4',  base: '/part4/', dest: 'part4' },
  { name: 'part5',  base: '/part5/', dest: 'part5' },
  { name: 'part6',  base: '/part6/', dest: 'part6' },
  { name: 'part7',  base: '/part7/', dest: 'part7' },
  { name: 'part8',  base: '/part8/', dest: 'part8' },
  { name: 'part9',  base: '/part9/', dest: 'part9' },
  { name: 'part10', base: '/part10/', dest: 'part10' },
  { name: 'part11', base: '/part11/', dest: 'part11' },
]

console.log('▶ 개념 온톨로지 검사 (scripts/ontology/concepts.json — 위치·앵커·순환·PartLink)')
execSync('node scripts/check-ontology.mjs', { cwd: root, stdio: 'inherit' })

console.log('\n▶ 통합검색 인덱스 + 개념 그래프 생성 (각 앱 public/search-index.json · concept-graph.json)')
execSync('node scripts/build-search-index.mjs', { cwd: root, stdio: 'inherit' })
execSync('node scripts/build-concept-graph.mjs', { cwd: root, stdio: 'inherit' })

console.log('\n▶ deploy/ 초기화')
rmSync(deployDir, { recursive: true, force: true })
mkdirSync(deployDir, { recursive: true })

for (const app of APPS) {
  const ws = `apps/${app.name}/web`
  console.log(`\n▶ 빌드: ${ws}  (base=${app.base})`)
  // -- 뒤 인자는 build 스크립트의 마지막 명령(vite build)으로 전달된다.
  execSync(`npm run build -w ${ws} -- --base=${app.base}`, { cwd: root, stdio: 'inherit' })

  const srcDist = join(root, 'apps', app.name, 'web', 'dist')
  if (!existsSync(srcDist)) {
    console.error(`\n✗ dist 없음: ${srcDist} — 빌드 실패로 중단.`)
    process.exit(1)
  }
  const destDir = join(deployDir, app.dest)
  mkdirSync(destDir, { recursive: true })
  cpSync(srcDist, destDir, { recursive: true })
  console.log(`  → deploy/${app.dest || '(root)'} 에 복사 완료`)
}

// 정적 호스트(Netlify/Cloudflare Pages)용 SPA 폴백. 구체 경로 먼저, 루트 catch-all 마지막.
const redirects =
  APPS.filter((a) => a.dest)
    .map((a) => `/${a.dest}/*  /${a.dest}/index.html  200`)
    .concat('/*  /index.html  200')
    .join('\n') + '\n'
writeFileSync(join(deployDir, '_redirects'), redirects)
console.log('\n▶ deploy/_redirects 작성 (정적 호스트용 SPA 폴백)')

// 보안 헤더(_headers — Cloudflare Pages·Netlify 형식). XSS 싱크가 없어도 심층 방어로 CSP 를 깐다.
//   - style 'unsafe-inline': KaTeX 렌더 출력이 인라인 style 속성을 쓴다(빼면 수식 레이아웃 깨짐).
//   - connect-src: Supabase(https+wss) + Ollama 만 허용. 값은 앱 빌드와 같은 루트 .env 에서 읽는다
//     (앱 vite.config 이 envDir=루트 — 같은 원천). OS 환경변수가 있으면 그것이 우선(Vite 와 동일).
//   - nginx 배포 시 _headers 는 무시된다 → 같은 값을 add_header 로 옮길 것(docs/배포_가이드.md).
function readRootEnv(name) {
  if (process.env[name]) return process.env[name].trim()
  try {
    const m = readFileSync(join(root, '.env'), 'utf8').match(
      new RegExp(`^\\s*${name}\\s*=\\s*(.+)$`, 'm'),
    )
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : ''
  } catch {
    return ''
  }
}
const originOf = (url) => {
  try {
    return url ? new URL(url).origin : ''
  } catch {
    return ''
  }
}
const supabaseOrigin = originOf(readRootEnv('VITE_SUPABASE_URL'))
const ollamaOrigin = originOf(readRootEnv('VITE_OLLAMA_URL')) || 'http://localhost:11434'
const connectSrc = ["'self'"]
if (supabaseOrigin) connectSrc.push(supabaseOrigin, supabaseOrigin.replace(/^https:/, 'wss:'))
else connectSrc.push('https://*.supabase.co', 'wss://*.supabase.co') // env 미설정 조립본도 안전한 기본값
if (!connectSrc.includes(ollamaOrigin)) connectSrc.push(ollamaOrigin)

// script-src 는 'self'(외부 .js)만으로는 각 index.html 의 인라인 테마 스크립트를 막는다
//   (다크 사용자의 첫 프레임 흰 화면 방지 + 매 로드 콘솔 CSP 에러). 그 스크립트를 sha256 해시로 허용한다.
//   해시는 **실제 산출물에서 계산** — 스크립트를 고치면 자동으로 맞고, 하드코딩처럼 조용히 어긋나지 않는다.
//   (part1 은 LF·나머지는 CRLF 라 해시가 갈리므로 distinct 전부 넣는다. 브라우저는 태그 사이 원문 바이트로 해시한다.)
const scriptHashes = new Set()
for (const app of APPS) {
  const html = readFileSync(join(deployDir, app.dest, 'index.html'), 'utf8')
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    if (!m[1].trim()) continue // src 있는 모듈 스크립트·빈 스크립트 제외
    scriptHashes.add(`'sha256-${createHash('sha256').update(m[1], 'utf8').digest('base64')}'`)
  }
}
const scriptSrc = ["'self'", ...scriptHashes].join(' ')
const csp = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  `connect-src ${connectSrc.join(' ')}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')
const headers = `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`
writeFileSync(join(deployDir, '_headers'), headers)
console.log(
  `▶ deploy/_headers 작성 (보안 헤더 — 인라인 스크립트 해시 ${scriptHashes.size}개, connect-src: ${connectSrc.join(' ')})`,
)

console.log(`
✅ 조립 완료 → deploy/
   로컬 확인:  npm run deploy:serve
   → http://localhost:4173 에서 포털(/) + 각 부(/part1 … /part11)가 한 origin 으로 뜬다.
     이 상태에서만 "포털이 다른 부 진도를 읽는" 개인화 2층을 실검증할 수 있다.

   실제 배포: deploy/ 폴더를 그대로 정적 호스트에 올리면 된다(_redirects·_headers 포함).
     nginx 라면 각 /partN/ 에 대해  try_files $uri $uri/ /partN/index.html;  , 루트는 /index.html,
     보안 헤더는 _headers 내용을 add_header 로 옮길 것.
`)
