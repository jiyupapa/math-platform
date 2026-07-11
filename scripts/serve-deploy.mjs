// scripts/serve-deploy.mjs
// deploy/ 를 "하나의 origin"으로 서빙한다 (로컬 검증 전용, 외부 의존성 0).
// 멀티앱 SPA 폴백: 없는 파일이 /partN/... 이면 partN/index.html, 그 외는 루트 index.html.
// 이렇게 해야 /part1/ch/ch3 같은 깊은 링크·새로고침이 해당 부 앱으로 정확히 떨어진다.
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, extname, normalize, sep } from 'node:path'
import { readFileSync, existsSync, statSync } from 'node:fs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const deployDir = join(root, 'deploy')
const PORT = Number(process.env.PORT) || 4173

if (!existsSync(deployDir)) {
  console.error('✗ deploy/ 가 없습니다. 먼저:  npm run deploy:build')
  process.exit(1)
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
}

// deploy/ 밖으로 새는 경로(../) 차단
function safeJoin(base, urlPath) {
  const p = normalize(join(base, urlPath))
  return p === base || p.startsWith(base + sep) ? p : null
}

function fallbackFor(pathname) {
  const m = pathname.match(/^\/(part[1-7])(\/|$)/)
  return m ? join(deployDir, m[1], 'index.html') : join(deployDir, 'index.html')
}

createServer((req, res) => {
  let pathname
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  } catch {
    pathname = '/'
  }

  let filePath = safeJoin(deployDir, pathname)
  if (filePath && existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html')
  }
  if (!filePath || !existsSync(filePath)) {
    filePath = fallbackFor(pathname) // SPA 폴백
  }

  try {
    const body = readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': TYPES[extname(filePath)] || 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
}).listen(PORT, () => {
  console.log(
    `\n  deploy/ 서빙 중 →  http://localhost:${PORT}\n` +
      `  포털(/) · 1부(/part1) … 5부(/part5) 가 한 origin.  Ctrl+C 로 종료.\n`,
  )
})
