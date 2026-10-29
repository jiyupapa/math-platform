// 12부 그림 부품(TimePlot·CldDiagram·SfdDiagram)이 공유하는 타입과 눈금 계산.
// 그림 부품은 "그리기만" 한다 — 값은 각 실험실이 sim.ts 로 계산해 넘긴다.

/** 시간 그래프의 선 하나. 색은 반드시 토큰(var(--c-*)) — 다크 모드에서 같이 뒤집힌다. */
export interface PlotSeries {
  label: string
  color: string
  /** 등간격 값: x = x0 + i·dx */
  values?: number[]
  x0?: number
  dx?: number
  /** 임의 점 (values 대신) */
  points?: [number, number][]
  dashed?: boolean
  width?: number
  /** 계단으로 그리기 — 월별 유량처럼 칸마다 일정한 값 */
  step?: boolean
  /** 0(또는 yMin)까지 면적 칠하기 */
  area?: boolean
  /** 점 찍기 */
  dots?: boolean
}

export interface PlotMarker {
  x: number
  label?: string
  color?: string
}

export interface PlotHLine {
  y: number
  label?: string
  color?: string
}

/** 인과지도의 변수 */
export interface CldNode {
  id: string
  label: string
  x: number
  y: number
  /** 저량이면 상자로 그린다 */
  stock?: boolean
  /** 그림 읽기 단계에서 '이번에 새로 그린 것' — 호박색으로 둘러 표시 */
  mark?: boolean
}

/** 인과지도의 화살표. sign 은 '+' 또는 '−'(정해지지 않았으면 '?') */
export interface CldLink {
  from: string
  to: string
  sign: '+' | '−' | '?'
  /** 휘는 정도(두 점 거리의 비율, 양수면 진행 방향 왼쪽으로 휜다) */
  bend?: number
  /** 지연 표시(∥) */
  delay?: boolean
  /** 강조 */
  hi?: boolean
  /** 그림 읽기 단계에서 '이번에 새로 그린 것' */
  mark?: boolean
}

/** 인과지도의 루프 표시 — R(강화) 또는 B(균형) */
export interface CldLoop {
  x: number
  y: number
  type: 'R' | 'B'
  label?: string
  /** 그림 읽기 단계에서 '이번에 새로 그린 것' */
  mark?: boolean
}

/** 저량-유량도의 저량(상자) */
export interface SfdStock {
  id: string
  label: string
  x: number
  y: number
  w?: number
  h?: number
  /** 상자 안에 쓸 값 */
  value?: string
  /** 0~1 — 물 높이처럼 아래부터 칠한다 */
  level?: number
  /** 그림 읽기 단계에서 '이번에 새로 그린 것' */
  mark?: boolean
}

/** 저량-유량도의 유량(파이프). path 는 꺾은선 좌표, 화살표는 끝점 방향 */
export interface SfdFlow {
  id: string
  label: string
  path: [number, number][]
  /** 밸브(나비 모양) 위치 — 생략하면 경로 가운데 */
  valve?: [number, number]
  /** 시작점에 구름(시스템 밖) */
  fromCloud?: boolean
  /** 끝점에 구름(시스템 밖) */
  toCloud?: boolean
  /** 밸브 아래 둘째 줄(현재 값 등) */
  rate?: string
  /** 라벨을 밸브 위에 쓸지 */
  labelAbove?: boolean
  /** 그림 읽기 단계에서 '이번에 새로 그린 것' — true 면 파이프, 'valve' 면 밸브, 'cloud' 면 구름만 */
  mark?: boolean | 'valve' | 'cloud'
}

/** 저량-유량도의 보조변수·상수(작은 원) */
export interface SfdAux {
  id: string
  label: string
  x: number
  y: number
  value?: string
  /** 그림 읽기 단계에서 '이번에 새로 그린 것' */
  mark?: boolean
}

/** 저량-유량도의 정보 화살표(가는 선) */
export interface SfdLink {
  from: [number, number]
  to: [number, number]
  bend?: number
  sign?: '+' | '−'
  /** 그림 읽기 단계에서 '이번에 새로 그린 것' */
  mark?: boolean
}

/** 그림 읽기(DiagramSteps)의 한 단계 — 인과지도 */
export interface CldStep {
  /** 단계 버튼에 쓸 짧은 이름 */
  title: string
  nodes: CldNode[]
  links: CldLink[]
  loops?: CldLoop[]
}

/** 그림 읽기(DiagramSteps)의 한 단계 — 저량-유량도 */
export interface SfdStep {
  title: string
  stocks: SfdStock[]
  flows?: SfdFlow[]
  aux?: SfdAux[]
  links?: SfdLink[]
}

/** 보기 좋은 눈금 — 1·2·5 × 10^n 간격 */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!isFinite(min) || !isFinite(max) || max <= min) return [min]
  const raw = (max - min) / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag
  const start = Math.ceil(min / step - 1e-9) * step
  const out: number[] = []
  for (let v = start; v <= max + step * 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v)
  return out
}

/** 눈금 글자 — 천 단위 쉼표, 소수는 필요한 만큼만 */
export function fmtTick(v: number): string {
  const a = Math.abs(v)
  if (a >= 1000) return Math.round(v).toLocaleString('ko-KR')
  if (a >= 10 || v === 0) return String(Math.round(v * 10) / 10)
  return String(Math.round(v * 1000) / 1000)
}

/** 천 단위 쉼표 + 지정 자릿수 */
export function fmt(v: number, digits = 0): string {
  return v.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
