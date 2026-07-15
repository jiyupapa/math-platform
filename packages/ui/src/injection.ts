import type { InjectionKey } from 'vue'

// 앱별 주입 계약 — 각 앱(main.ts)이 app.provide 로 자기 구현을 주입하고,
// 공용 컴포넌트는 inject 로 받는다. 이로써 컴포넌트가 특정 앱의 스토어·데이터에
// 직접 의존하지 않고 패키지로 분리될 수 있다.

// 앱별 localStorage 접두사 (la/diff/stat/tf/it). QuizSet 이 저장 키 앞에 붙인다.
export const storagePrefixKey: InjectionKey<string> = Symbol('storagePrefix')

// 복습 북마크 API — 앱이 자기 review 스토어로 구현해 주입. ReviewFlag 가 사용.
export interface ReviewApi {
  isFlagged: (id: string) => boolean
  toggle: (item: { id: string; chapter: string; label: string }) => void
}
export const reviewApiKey: InjectionKey<ReviewApi> = Symbol('reviewApi')

// 현재 챕터 slug → 노트북 파일명 해석기. 앱이 chapters 데이터로 구현해 주입. NotebookCard 가 사용.
export type NotebookResolver = (slug: string | null) => string | null
export const notebookResolverKey: InjectionKey<NotebookResolver> = Symbol('notebookResolver')

// 통합검색 인덱스(search-index.json) URL. 각 앱이 자기 BASE_URL 기준 경로로 주입. SearchPalette 가 사용.
// 미주입 시 컴포넌트가 BASE_URL 기준 기본값('<base>search-index.json')으로 폴백한다.
export const searchIndexKey: InjectionKey<string> = Symbol('searchIndexUrl')
