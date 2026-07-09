// 아주 작은 목업 토크나이저 — 토큰화의 원리를 보여주기 위한 교육용.
// 세 가지 방식을 지원한다:
//   - 'word'    : 띄어쓰기로 나눈 '단어' 단위. 사전에 없으면 [UNK](모르는 단어).
//   - 'char'    : '글자' 단위. UNK 는 거의 없지만 토큰 수가 많아진다.
//   - 'subword' : '조각(서브워드)' 단위. 아는 단어는 통째로, 모르는 단어는 조각으로 → 절충안.
// 진짜 LLM 은 이 subword 방식(BPE 등)을 쓴다. (노트북 ch02 와 같은 사전·같은 결과)

export type TokenizeMode = 'word' | 'char' | 'subword'

// 통째 단어(자주 쓰는 말은 사전에 통으로 등록됨)
const WHOLE_WORDS = ['나는', '밥을', '먹었다', '오늘', '날씨가', '좋다']
// 서브워드 조각(자주 나오는 부분 조각)
const SUBWORD_PIECES = ['토큰', '화', '는', '재미', '있다']
// 낱글자(마지막 안전망 — 무엇이든 글자로는 쪼갤 수 있게)
const CHARS = ['나', '밥', '을', '먹', '었', '다', '오', '늘', '날', '씨', '가', '좋', '토', '큰', '재', '미', '있']

// 사전(vocabulary): 등장 순서대로 고유 ID 부여. 0 은 [UNK] 전용으로 비워 둔다.
// 실제 LLM 의 ID 는 수만 단위라, 흉내만 내려고 1000부터 매긴다.
const ID_BASE = 1000
const VOCAB: string[] = dedup([...WHOLE_WORDS, ...SUBWORD_PIECES, ...CHARS])
const ID_MAP = new Map<string, number>(VOCAB.map((t, i) => [t, ID_BASE + i]))
const WHOLE_SET = new Set(WHOLE_WORDS)
const MAX_LEN = Math.max(...VOCAB.map((t) => t.length))

export const UNK_ID = 0
export const VOCAB_SIZE = VOCAB.length

export interface TokenPiece {
  tok: string
  /** 사전 ID. 모르는 토큰이면 UNK_ID(0) */
  id: number
  /** 사전에 없는 토큰(=UNK)이면 true */
  unknown: boolean
}

function dedup(arr: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const x of arr) if (!seen.has(x)) { seen.add(x); out.push(x) }
  return out
}

function piece(tok: string, known: boolean): TokenPiece {
  return known ? { tok, id: ID_MAP.get(tok)!, unknown: false } : { tok, id: UNK_ID, unknown: true }
}

/** 한 단어를 '가장 긴 조각부터' 사전과 맞춰 서브워드로 쪼갠다(그리디 최장일치). */
function subwordSplit(word: string): TokenPiece[] {
  const out: TokenPiece[] = []
  let i = 0
  while (i < word.length) {
    let matched = ''
    for (let len = Math.min(MAX_LEN, word.length - i); len >= 1; len--) {
      const cand = word.slice(i, i + len)
      if (ID_MAP.has(cand)) { matched = cand; break }
    }
    if (matched) { out.push(piece(matched, true)); i += matched.length }
    else { out.push(piece(word[i], false)); i += 1 } // 사전에 낱글자도 없으면 UNK
  }
  return out
}

export function tokenize(text: string, mode: TokenizeMode): TokenPiece[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const out: TokenPiece[] = []
  for (const w of words) {
    if (mode === 'word') {
      out.push(piece(w, WHOLE_SET.has(w)))
    } else if (mode === 'char') {
      for (const ch of [...w]) out.push(piece(ch, ID_MAP.has(ch)))
    } else {
      out.push(...subwordSplit(w))
    }
  }
  return out
}
