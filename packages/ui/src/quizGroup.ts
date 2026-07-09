import type { InjectionKey } from 'vue'

// QuizSet(부모) 가 provide 하고 Quiz(자식) 가 inject 하는 집계 인터페이스.
// 각 Quiz 는 마운트 시 register 를 호출하고, 반환값이 true 면 (지난 방문에 이미
// 맞힌 문제 — localStorage 복원) 스스로를 정답 상태로 표시한다. 정답 시 report.
export interface QuizGroup {
  register: (id: string) => boolean
  report: (id: string) => void
}

export const quizGroupKey: InjectionKey<QuizGroup> = Symbol('quizGroup')
