// 2층 — 포털이 각 부의 학습 진도를 읽는다.
// 각 부는 완료 챕터 슬러그를 `{prefix}-progress-v1` (JSON 문자열 배열)로 저장한다.
// ⚠️ localStorage 는 origin 단위라, 이 읽기는 5개 부 + 포털이 "같은 origin 하위 경로"로
//    배포됐을 때만 실제로 동작한다(npm run deploy:build → deploy:serve). dev 단독 실행 시엔 0 으로 보인다.

interface PartMeta {
  part: number
  prefix: string
  /** 샘플 제외 챕터 수 */
  total: number
}

const PART_META: PartMeta[] = [
  { part: 1, prefix: 'la', total: 12 },
  { part: 2, prefix: 'diff', total: 10 },
  { part: 3, prefix: 'stat', total: 10 },
  { part: 4, prefix: 'tf', total: 12 },
  { part: 5, prefix: 'it', total: 10 },
]

export interface PartProgress {
  part: number
  completed: number
  total: number
  percent: number
}

function readCompleted(prefix: string): number {
  try {
    const raw = localStorage.getItem(`${prefix}-progress-v1`)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return 0
    // 샘플 챕터는 진도에서 제외 (각 부 스토어와 동일 기준)
    return parsed.filter((s): s is string => typeof s === 'string' && s !== 'sample').length
  } catch {
    return 0
  }
}

/** part 번호 → 진도. */
export function readAllProgress(): Record<number, PartProgress> {
  const out: Record<number, PartProgress> = {}
  for (const m of PART_META) {
    const completed = Math.min(readCompleted(m.prefix), m.total)
    out[m.part] = {
      part: m.part,
      completed,
      total: m.total,
      percent: m.total === 0 ? 0 : Math.round((completed / m.total) * 100),
    }
  }
  return out
}
