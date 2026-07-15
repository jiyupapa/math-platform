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
  type ReviewApi,
  type NotebookResolver,
} from './injection'
