// NotePanel(공용) → TutorChat(각 앱, THEMED) 로 "이 질문을 AI에게" 를 넘기는 이벤트 계약.
// 'open-search'(SearchPalette) 와 같은 window CustomEvent 패턴 — 공용 패키지가 앱의 튜터
// 컴포넌트를 직접 알지 않아도 되게 한다.
export const NOTE_ASK_EVENT = 'note-ask-ai'

export interface NoteAskDetail {
  /** 답변을 되돌려 저장할 주석 id */
  annotationId: string
  /** 사용자가 쓴 질문 본문 */
  question: string
  /** 항목 맥락(섹션 이름) — 튜터 프롬프트에 얹는다 */
  context: string
}

export function dispatchNoteAsk(detail: NoteAskDetail): void {
  window.dispatchEvent(new CustomEvent<NoteAskDetail>(NOTE_ASK_EVENT, { detail }))
}
