// 임의 항목 앵커(P0) 공용 헬퍼 — 협업 주석용 anchorId 를 다루는 규칙의 단일 위치.
// ID 네이밍 정본: {chapter}-{type}-{slug}  (예: ch6-concept-qkv, ch2-quiz-cosine, sample-s1)
//   · chapter = 첫 세그먼트(ch1..chN | sample) — 여기서 파생하므로 규칙을 지켜야 한다.
//   · **자동 인덱스 ID 금지**(N번째 카드 식) — 콘텐츠 편집 시 메모가 엉뚱한 항목에 붙는다.
//   · 한 번 배포된 anchorId 변경 금지 — 붙어 있는 메모·질문이 고아가 된다.
// 설계: docs/todo_협업주석_260716.md §6

/** anchorId 의 챕터 세그먼트 (예: 'ch6-concept-qkv' → 'ch6', 'sample-s1' → 'sample') */
export function anchorChapter(anchorId: string): string {
  return anchorId.split('-')[0] ?? anchorId
}

/** 패널 제목용 라벨 축약 — 퀴즈 문항처럼 긴 문자열을 그대로 쓰지 않게 */
export function anchorLabelOf(raw: string, max = 48): string {
  const s = raw.trim()
  return s.length > max ? s.slice(0, max) + '…' : s
}
