// 전 스위트 순차 실행 — 하나라도 실패하면 비-0 종료(CI·수동 회귀 겸용).
// 건너뜀(Ollama 미실행·관리자 미설정)은 실패로 치지 않는다.
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const SUITES = [
  'annotations-p1-share.mjs',
  'annotations-p0-anchor.mjs',
  'annotations-expand.mjs',
  'annotations-p2-ai.mjs',
  'annotations-p3-admin.mjs',
]

const results = []
for (const s of SUITES) {
  const t0 = Date.now()
  const res = spawnSync(process.execPath, [join(HERE, s)], { stdio: 'inherit' })
  results.push({ suite: s, code: res.status ?? 1, sec: Math.round((Date.now() - t0) / 1000) })
}

console.log('\n══════════ 요약 ══════════')
for (const { suite, code, sec } of results) {
  console.log(`  ${code === 0 ? '✓' : '✗'} ${suite.padEnd(28)} ${String(sec).padStart(3)}s`)
}
const failed = results.filter((x) => x.code !== 0)
console.log(failed.length ? `\n✗ 실패 ${failed.length}건` : '\n✓ 전 스위트 통과')
process.exit(failed.length ? 1 : 0)
