// @series/tutor — 시리즈 공용 AI 튜터 클라이언트 (로컬/원격 Ollama).
// TutorChat.vue(각 앱, 주제별)와 노트북 tutor.py 가 이 전송 계층을 쓴다.
export { DEFAULT_MODEL, listModels, streamChat, type ChatMessage } from './ollama'
// 개념 그래프 접지 — 질문에 나온 개념의 카드(위치·선수·비유어)를 시스템 프롬프트에 덧붙인다.
export {
  conceptGrounding,
  loadConceptGraph,
  matchConcepts,
  conceptCards,
  type Concept,
  type ConceptGraph,
  type ConceptLocation,
} from './concepts'
