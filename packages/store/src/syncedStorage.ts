// 로컬 우선(local-first) 저장 헬퍼.
// P1(지금): localStorage 와 100% 동일하게 동작 — 원격 호출 없음(동작 불변).
// P2: 로그인 시 pull(원격 → 로컬 병합)·push(로컬 → 원격, debounce)를 채운다.
//
// 각 부 progress/review 스토어의 load()/persist() 를 이 클래스로 갈아끼우면(P2),
// 비로그인은 지금 그대로, 로그인은 크로스기기 동기화가 된다.

export interface SyncedStorageOptions<T> {
  /** localStorage 키 (예: 'la-progress-v1'). */
  key: string
  /** 손상값 방어 — 기존 스토어 load() 검증 로직을 그대로 이관한다. null 이면 기본값을 돌려준다. */
  validate: (parsed: unknown) => T
}

export class SyncedStorage<T> {
  constructor(private opts: SyncedStorageOptions<T>) {}

  /** 로컬에서 읽기(+검증). */
  read(): T {
    try {
      const raw = localStorage.getItem(this.opts.key)
      return this.opts.validate(raw ? JSON.parse(raw) : null)
    } catch {
      return this.opts.validate(null)
    }
  }

  /** 로컬에 쓰기. (P2: 로그인 상태면 원격에도 debounce push) */
  write(value: T): void {
    try {
      localStorage.setItem(this.opts.key, JSON.stringify(value))
    } catch {
      /* localStorage 불가 환경 무시 */
    }
  }
}
