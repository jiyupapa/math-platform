// scripts/build-deploy.mjs
// 5개 부 + 포털을 "하나의 origin 하위 경로"로 조립한다.
//   포털 = 루트(/) · 각 부 = /partN/   → 결과: deploy/ (정적 폴더 하나)
//
// 왜 필요한가: localStorage 는 origin(주소+포트) 단위로 격리된다(경로 무관).
//   진도는 la-*, tf-* 등으로 브라우저에 저장되므로, 5개 부 + 포털을 같은 origin 의
//   하위 경로로 묶어야 포털이 각 부의 진도를 직접 읽는 "개인화 2층"이 성립한다.
//   (npm run dev 는 부마다 포트가 달라 서로 다른 origin → 2층 검증 불가. 이 조립본만이 검증 수단.)
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { rmSync, mkdirSync, cpSync, writeFileSync, existsSync } from 'node:fs'

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
]

console.log('▶ deploy/ 초기화')
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

console.log(`
✅ 조립 완료 → deploy/
   로컬 확인:  npm run deploy:serve
   → http://localhost:4173 에서 포털(/) + 각 부(/part1 … /part10)가 한 origin 으로 뜬다.
     이 상태에서만 "포털이 다른 부 진도를 읽는" 개인화 2층을 실검증할 수 있다.

   실제 배포: deploy/ 폴더를 그대로 정적 호스트에 올리면 된다(_redirects 포함).
     nginx 라면 각 /partN/ 에 대해  try_files $uri $uri/ /partN/index.html;  , 루트는 /index.html.
`)
