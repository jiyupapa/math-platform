// NotePanel(공용) → TutorChat(각 앱, THEMED) 로 "이 질문을 AI에게" 를 넘기는 이벤트 계약 + 받는 쪽 공용 로직.
// 'open-search'(SearchPalette) 와 같은 window CustomEvent 패턴 — 공용 패키지가 앱의 튜터
// 컴포넌트를 직접 알지 않아도 되게 한다.
//
// 받는 쪽(useNoteAsk)도 여기 둔다. 예전엔 이 로직이 1부 TutorChat 에만 있어서 2~11부에선
// 'AI에게 묻기'를 눌러도 아무 반응이 없었다(2026-09-28 공용화로 수정). 각 부 TutorChat 은
// 창 열기·전송만 빌려 주고, 질문 포장·저장 규칙은 이 파일 한 곳에서 정한다.
import { onMounted, onUnmounted, ref } from 'vue'
import { saveAiAnswer } from '@series/store'

export const NOTE_ASK_EVENT = 'note-ask-ai'

export interface NoteAskDetail {
  /** 답변을 되돌려 저장할 주석 id */
  annotationId: string
  /** 사용자가 쓴 질문 본문 */
  question: string
  /** 항목 맥락(섹션 이름) — 튜터 프롬프트에 얹는다 */
  context: string
  /** 내가 쓴 질문인가 — 답변 저장(ai_answer)은 작성자만 된다(RLS edit_own). 남의 질문엔 답만 보여 준다. */
  mine: boolean
}

export function dispatchNoteAsk(detail: NoteAskDetail): void {
  window.dispatchEvent(new CustomEvent<NoteAskDetail>(NOTE_ASK_EVENT, { detail }))
}

/** 각 부 TutorChat 이 useNoteAsk 에 빌려 주는 튜터 창의 상태·동작 */
export interface NoteAskHost {
  /** 답변 생성 중인가 — 생성 중에 온 요청은 건너뛴다 */
  busy: () => boolean
  /** 튜터 창을 열고 서버를 확인한다. 답할 수 있으면 true (아니면 창에 Ollama 미실행 안내가 이미 보인다) */
  ready: () => Promise<boolean>
  /** 질문을 보내고, 답이 끝나면 화면에 보인 답변 텍스트를 돌려준다(없으면 '') */
  ask: (prompt: string) => Promise<string>
}

/** "이 답변을 메모에 남길까요?" 제안 — NoteAskSave 가 그린다 */
export interface NoteAskOffer {
  annotationId: string
  answer: string
  saved: boolean
}

/**
 * NotePanel 의 '🤖 AI에게 묻기'를 받아 항목 맥락과 함께 튜터에게 묻고, 답이 나오면 저장 제안을 띄운다.
 * 저장은 사용자가 누를 때만 — 로컬 모델 답은 틀릴 수 있는데 공유 층이라 동료에게도 보인다.
 * 호스트는 새 질문을 보낼 때·대화를 지울 때 dismiss() 로 제안을 거둔다(마지막 답변이 바뀌므로).
 */
export function useNoteAsk(host: NoteAskHost) {
  const offer = ref<NoteAskOffer | null>(null)

  async function onAsk(e: Event) {
    const d = (e as CustomEvent<NoteAskDetail>).detail
    if (!d || host.busy()) return
    if (!(await host.ready())) return
    const answer = await host.ask(`「${d.context}」 부분에서 질문이 있어요: ${d.question}`)
    if (d.mine && answer.trim()) offer.value = { annotationId: d.annotationId, answer, saved: false }
  }

  async function save(): Promise<void> {
    const o = offer.value
    if (!o || o.saved || host.busy()) return
    const ok = await saveAiAnswer(o.annotationId, o.answer)
    // 저장하는 사이 새 질문으로 제안이 거둬졌으면 되살리지 않는다
    if (ok && offer.value === o) offer.value = { ...o, saved: true }
  }

  function dismiss(): void {
    offer.value = null
  }

  onMounted(() => window.addEventListener(NOTE_ASK_EVENT, onAsk))
  onUnmounted(() => window.removeEventListener(NOTE_ASK_EVENT, onAsk))

  return { offer, save, dismiss }
}
