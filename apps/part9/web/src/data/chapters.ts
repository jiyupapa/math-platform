// 챕터 메타데이터 — 사이드바 목차와 라우터가 공유하는 단일 소스(single source of truth).
// 새 챕터를 추가하려면 여기서 comingSoon 을 제거하고 src/chapters/ 에 대응하는 .vue 를 만든 뒤
// router/index.ts 의 동적 import 에 연결한다. (구성안: 루트 README "9부 챕터 구성" 표)

export interface ChapterMeta {
  /** URL 슬러그 (라우트 path 에 사용) */
  slug: string
  /** Phase 번호 (0 = 기반/샘플) */
  phase: number
  /** 사이드바에 표시될 제목 */
  title: string
  /** 한 줄 소개 */
  summary: string
  /** 아직 콘텐츠가 없는 예정 챕터면 true */
  comingSoon?: boolean
  /** 예상 학습 소요시간 (분) — 목차에 배지로 표시, 포털 경로 요약 합산에 사용 */
  minutes?: number
  /** 대응하는 노트북 파일명 (notebooks/) — 없으면 생략 */
  notebook?: string
}

// 🎯 궁극 목표: "AI를 이해했다"(1~6부)에서 "AI를 내 PC에서 돌린다"(로컬 Ollama)로 건너가는
//    마지막 수학 — 컴퓨터가 실수를 담고 계산하는 법(비트·부동소수점·오차·fp16/bf16·양자화·GGUF)을
//    직접 조작하며 이해한다. ch11(캡스톤: 7B는 왜 4GB인가 — 내 PC에 맞는 모델 고르기)에서 도달.
//    실용 확장 트랙 2탄(7부에 이어) — 시리즈의 로컬 Ollama 튜터가 바로 이 수학 위에서 돌고 있다.
//    핵심 한 줄: "숫자를 담는 자에는 눈금이 있다 — 눈금의 촘촘함이 품질과 몸무게를 정한다."
//    분량 방침: 줄이지 않는다 — 자세한 설명을 위한 확장 환영.
export const chapters: ChapterMeta[] = [
  {
    slug: 'sample',
    phase: 0,
    title: '워밍업 — 0.1 + 0.2는 0.3이 아니다',
    summary: '학교 산수와 다른 컴퓨터 산수, 유한한 칸에 무한한 실수를 담는 문제',
    minutes: 10,
    notebook: 'ch00_sample.ipynb',
  },
  { slug: 'ch1', phase: 1, title: '큰 그림 — 숫자의 몸무게', summary: '모델 = 수십억 개의 실수, 파일 크기 = 개수 × 숫자 하나의 크기. 저장·계산·압축 지도', minutes: 35, notebook: 'ch01_weight.ipynb' },
  { slug: 'ch2', phase: 2, title: '컴퓨터의 손가락 — 비트와 이진법', summary: '스위치 n개로 2ⁿ 가지, 자리값·바이트와 음수의 약속(2의 보수·int8)', minutes: 40, notebook: 'ch02_binary.ipynb' },
  { slug: 'ch3', phase: 3, title: '고무줄 자 — 부동소수점 (핵심)', summary: '부호·지수·가수로 fp32 해부하기, 0.1이 안 담기는 이유와 눈금이 벌어지는 구조', minutes: 45, notebook: 'ch03_float32.ipynb' },
  { slug: 'ch4', phase: 4, title: '눈금 사이의 오차 — 반올림과 누적', summary: '머신 엡실론, 더하는 순서로 달라지는 합, 흡수와 뺄셈 재앙으로 푸는 GPU 재현성의 비밀', minutes: 40, notebook: 'ch04_rounding.ipynb' },
  { slug: 'ch5', phase: 5, title: '자의 끝 — 오버플로·언더플로·NaN', summary: 'inf·NaN·0 붕괴와 exp의 폭발, loss: nan 사건의 전말', minutes: 40, notebook: 'ch05_edges.ipynb' },
  { slug: 'ch6', phase: 6, title: '안전한 확률 계산 — log-sum-exp', summary: 'softmax를 그대로 계산하면 터진다, max 빼기 트릭과 log 확률로 일하기', minutes: 40, notebook: 'ch06_logsumexp.ipynb' },
  { slug: 'ch7', phase: 7, title: '반쪽 자 — fp16·bf16과 혼합 정밀도 (핵심)', summary: '메모리 절반의 유혹, 촘촘·짧은 자(fp16) vs 성긴·긴 자(bf16)와 loss scaling', minutes: 45, notebook: 'ch07_half.ipynb' },
  { slug: 'ch8', phase: 8, title: '눈금 갈아타기 — 양자화 (핵심)', summary: '실수 자를 정수 자로 바꾸는 축척(scale)·영점(zero-point)과 int8, 추론이 반올림을 버티는 이유', minutes: 45, notebook: 'ch08_quantize.ipynb' },
  { slug: 'ch9', phase: 9, title: '4비트까지 — 블록 양자화와 GGUF', summary: '아웃라이어 문제와 블록별 축척, int4, 그리고 Q4_K_M 파일명이 뜻하는 것', minutes: 40, notebook: 'ch09_gguf.ipynb' },
  { slug: 'ch10', phase: 10, title: '품질 성적표 — 양자화는 얼마나 잃나', summary: '퍼플렉시티로 열화 재기, 무릎 곡선(열화 = KL ≥ 0)과 내 RAM에 맞는 최선 고르기', minutes: 40, notebook: 'ch10_quality.ipynb' },
  { slug: 'ch11', phase: 11, title: '🎯 캡스톤 — 7B는 왜 4GB인가', summary: '모델 영수증 읽기와 KV 캐시 정산, Ollama 태그를 읽고 내 PC에 맞는 모델 고르기로 마무리', minutes: 50, notebook: 'ch11_capstone.ipynb' },
]

export const availableChapters = chapters.filter((c) => !c.comingSoon)

// 학습 진도 산정 대상 — 데모용 샘플(phase 0)은 제외한 실제 학습 챕터만
export const progressChapters = availableChapters.filter((c) => c.phase >= 1)
