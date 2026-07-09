// 교육용 2D 단어 임베딩 — "뜻이 비슷한 단어는 좌표가 가깝다"를 보여주기 위한 목업.
// 진짜 임베딩은 수백~수천 차원이지만, 눈으로 보려고 2차원으로 손수 배치했다.
// (노트북 ch03 과 같은 좌표·같은 결과)

export interface WordVec {
  word: string
  vec: [number, number]
  group: string
}

// 네 무리를 사분면에 나눠 배치 → 같은 무리는 가깝고 다른 무리는 멀다.
export const EMBEDDINGS: WordVec[] = [
  // 동물 (좌상)
  { word: '고양이', vec: [-3.0, 2.6], group: '동물' },
  { word: '강아지', vec: [-3.3, 2.2], group: '동물' },
  { word: '호랑이', vec: [-2.4, 3.0], group: '동물' },
  // 과일 (우상)
  { word: '사과', vec: [3.0, 2.6], group: '과일' },
  { word: '바나나', vec: [3.4, 2.0], group: '과일' },
  { word: '포도', vec: [2.6, 3.0], group: '과일' },
  // 탈것 (좌하)
  { word: '자동차', vec: [-3.0, -2.6], group: '탈것' },
  { word: '버스', vec: [-3.4, -2.0], group: '탈것' },
  { word: '기차', vec: [-2.5, -3.0], group: '탈것' },
  // 색 (우하)
  { word: '빨강', vec: [3.0, -2.6], group: '색' },
  { word: '파랑', vec: [3.4, -2.0], group: '색' },
  { word: '노랑', vec: [2.5, -3.0], group: '색' },
]

export const GROUPS = ['동물', '과일', '탈것', '색'] as const
export const GROUP_COLOR: Record<string, string> = {
  동물: '#6366f1',
  과일: '#10b981',
  탈것: '#f59e0b',
  색: '#ec4899',
}

export function lookup(word: string): WordVec | undefined {
  return EMBEDDINGS.find((w) => w.word === word)
}

/** 두 좌표 사이의 유클리드 거리(= 피타고라스). 작을수록 뜻이 비슷하다는 뜻. */
export function distance(a: [number, number], b: [number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1])
}
