// @series/ui — 시리즈 공용 컴포넌트 (골든 카피 이관분)
// 앱은 named import 로 가져다 쓴다: import { MathBlock, Quiz, QuizSet } from '@series/ui'

// 프레젠테이션
export { default as MathBlock } from './MathBlock.vue'
export { default as ConceptCard } from './ConceptCard.vue'
export { default as DetailsCard } from './DetailsCard.vue'
export { default as ChartView } from './ChartView.vue'
export { default as NotebookCard } from './NotebookCard.vue'
export { default as ReviewFlag } from './ReviewFlag.vue'
export { default as PartLink } from './PartLink.vue'
export { default as SearchPalette } from './SearchPalette.vue'

// 테마(라이트/다크) — 색은 dark.css 가 처리하고, 여기선 선택 상태만 다룬다.
// 각 앱 main.ts 에서 initTheme() 를 부르고, 헤더/사이드바에 ThemeToggle 을 둔다.
export { default as ThemeToggle } from './ThemeToggle.vue'
export { initTheme, setTheme, isDark, cssVar, themeMode, themeVersion, type ThemeMode } from './theme'

// 협업 주석 — ReviewFlag 가 섹션마다 NoteMarker 를 얹으므로 앱이 직접 쓸 일은 아직 없다.
// (임의 항목으로 넓힐 때 콘텐츠가 NoteMarker 를 직접 배치한다.)
export { default as NoteMarker } from './NoteMarker.vue'
export { default as NotePanel } from './NotePanel.vue'
export { NOTE_ASK_EVENT, dispatchNoteAsk, type NoteAskDetail } from './noteAsk'

// 문제(자동채점) 패밀리
export { default as Quiz } from './Quiz.vue'
export { default as StepQuiz } from './StepQuiz.vue'
export { default as QuizSet } from './QuizSet.vue'
export { quizGroupKey, type QuizGroup } from './quizGroup'

// 앱별 주입 계약 — 각 앱 main.ts 에서 app.provide 로 구현을 주입한다.
export {
  storagePrefixKey,
  reviewApiKey,
  notebookResolverKey,
  searchIndexKey,
  partNumberKey,
  type ReviewApi,
  type NotebookResolver,
} from './injection'
