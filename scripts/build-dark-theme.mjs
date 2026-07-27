// scripts/build-dark-theme.mjs
// 다크 테마 생성기 → packages/ui/src/dark.css
//   입력: node_modules/tailwindcss/theme.css (팔레트 정본) + packages/ui/src/tokens.css (데모 색 토큰 목록)
//   출력: packages/ui/src/dark.css
//
// 왜 생성인가: 다크 모드는 **마크업을 하나도 고치지 않는다**. Tailwind v4 가 유틸리티를
//   `.bg-white{background-color:var(--color-white)}` 처럼 변수 참조로 내보내므로, 팔레트 변수 값만
//   다시 정의하면 12개 앱이 한 번에 뒤집힌다(`dark:` 클래스 0개). 그 변수 목록이 크고 규칙적이라
//   손으로 적지 않고 팔레트 정본에서 읽어 만든다. (색 값을 손으로 옮기다 틀리는 걸 막는 목적)
//
// 실행: node scripts/build-dark-theme.mjs   (또는 npm run theme:dark)
//   tokens.css 에 토큰을 추가/삭제했으면 반드시 다시 돌릴 것 — 안 돌리면 그 토큰만 다크에서 안 뒤집힌다.
//   돌린 뒤에는 npm run check:contrast 로 대비를 확인한다.
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const themePath = join(root, 'node_modules/tailwindcss/theme.css')
const tokensPath = join(root, 'packages/ui/src/tokens.css')
const outPath = join(root, 'packages/ui/src/dark.css')

const theme = readFileSync(themePath, 'utf8')

// --color-<fam>-<step> -> 값 (oklch 문자열 그대로 옮긴다)
const P = new Map()
for (const m of theme.matchAll(/--color-([a-z]+)-(\d+):\s*([^;]+);/g)) P.set(`${m[1]}-${m[2]}`, m[3].trim())
const v = (fam, step) => {
  const val = P.get(`${fam}-${step}`)
  if (!val) throw new Error(`팔레트에 없음: ${fam}-${step} (Tailwind 버전이 바뀌었는지 확인)`)
  return val
}

// 이 저장소가 쓰는 색 계열
const ACCENTS = ['amber', 'blue', 'cyan', 'emerald', 'fuchsia', 'green', 'indigo', 'orange',
                 'pink', 'purple', 'red', 'rose', 'sky', 'teal', 'violet']
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

// 강조색 반전: 옅은 배경 ↔ 짙은 배경, 진한 글씨 ↔ 밝은 글씨. 500 은 고정(고체 채움은 양쪽에서 통한다).
const ACCENT_MAP = { 50: 950, 100: 900, 200: 800, 300: 700, 400: 600, 500: 500, 600: 400, 700: 300, 800: 200, 900: 100, 950: 50 }

// 중립(slate)은 공식이 아니라 **역할**로 짠다. 라이트의 밝기 사다리와 대비를 맞추는 게 목적이라
// 400 은 500 으로만 내린다(양쪽 다 '장식용'):
//   라이트 slate-400/white ≈ 3.0:1   /  다크 slate-500/slate-900 ≈ 3.4:1
//   라이트 slate-500/white ≈ 4.8:1   /  다크 slate-400/slate-900 ≈ 6.4:1
//   라이트 slate-700(본문) ≈ 10.8:1  /  다크 slate-200/slate-900 ≈ 13:1
const NEUTRAL_MAP = { 50: 950, 100: 800, 200: 700, 300: 600, 400: 500, 500: 400, 600: 300, 700: 200, 800: 100, 900: 50, 950: 50 }

const lines = []
const push = (s) => lines.push(s)

push(`  color-scheme: dark;`)
push(``)
push(`  /* 표면 — 라이트에선 페이지 slate-50 / 카드 white 였다. 둘이 붙지 않게 950 / 900 으로 벌린다. */`)
push(`  --color-white: ${v('slate', 900)};`)
push(`  /* --color-black 은 그대로 둔다 — 모바일 사이드바 오버레이 bg-black/30 은 다크에서도 어두워야 한다. */`)
push(``)
push(`  /* 중립 */`)
for (const s of STEPS) push(`  --color-slate-${s}: ${v('slate', NEUTRAL_MAP[s])};`)
push(``)
push(`  /* 강조 */`)
for (const fam of ACCENTS) push(STEPS.map((s) => `  --color-${fam}-${s}: ${v(fam, ACCENT_MAP[s])};`).join('\n'))

push(``)
push(`  /* 데모 색 토큰 — UI 와 같은 사다리를 타야 데모와 화면이 어긋나지 않는다. */`)
const tokens = readFileSync(tokensPath, 'utf8')
const NEUTRALS = new Set(['slate', 'gray', 'zinc', 'neutral', 'stone'])
for (const m of tokens.matchAll(/--c-([a-z]+)-(\d+):/g)) {
  const fam = m[1], step = +m[2]
  const map = NEUTRALS.has(fam) ? NEUTRAL_MAP : ACCENT_MAP
  push(`  --c-${fam}-${step}: ${v(fam, map[step])};`)
}
push(`  --c-white: ${v('slate', 900)};   /* SVG 손잡이·점 속을 뚫는 색 = 카드 표면 */`)
push(`  --c-grid: ${v('slate', 800)};    /* 격자선 */`)
push(`  /* --c-on-light / --c-on-dark 는 뒤집지 않는다 — tokens.css 주석 참조. */`)

const body = lines.join('\n')

const css = `/* ─────────────────────────────────────────────────────────────────────────
   자동 생성 파일 — 직접 고치지 말 것.
   생성기: scripts/build-dark-theme.mjs  (npm run theme:dark)
   반전 규칙을 바꾸려면 그 스크립트의 ACCENT_MAP / NEUTRAL_MAP 을 고친 뒤 다시 생성한다.

   다크 모드 — **마크업을 하나도 건드리지 않는다.**
   Tailwind v4 는 유틸리티를 \`.bg-white{background-color:var(--color-white)}\` 처럼
   변수 참조로 내보낸다. 그래서 여기서 변수 값만 다시 정의하면 12개 앱의
   모든 화면이 한 번에 따라온다 — \`dark:\` 클래스 0개로.
   (레이어 밖이라 Tailwind 의 @layer theme 정의를 이긴다.)

   데모 SVG 도 같이 따라온다 — hex 를 --c-* 토큰으로 바꿔뒀기 때문이다(tokens.css).

   따라오지 못하는 것(런타임에 색을 조립하는 곳, 의도된 예외):
     - 1부 ch3 히트맵 \`rgb(c,c,c)\` · 8부 손실지형 \`hsl(...)\` — 데이터 색이라 그대로 둔다.
       그 위의 글자는 테마와 무관한 --c-on-light / --c-on-dark 를 쓴다.

   전환 방식: OS 설정을 따르되, data-theme 으로 사용자가 덮어쓸 수 있다(packages/ui/src/theme.ts).
   ───────────────────────────────────────────────────────────────────────── */

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${body}
  }
}

:root[data-theme='dark'] {
${body}
}
`

writeFileSync(outPath, css)
const count = body.split('\n').filter((l) => l.trim().startsWith('--')).length
console.log(`dark.css 생성 — 변수 ${count}개`)
console.log('다음: npm run check:contrast')
