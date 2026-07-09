// 로컬 Ollama 서버와 통신하는 최소 클라이언트.
// - 로컬 LLM이라 API 키·비용·인터넷이 필요 없다 (오프라인 시연 가능).
// - gemma4:e2b 같은 thinking 모델은 think:false 로 꺼야 함 (안 끄면 생각만 하다 토큰 소진).

const OLLAMA_URL = 'http://localhost:11434'

export const DEFAULT_MODEL = 'gemma4:e2b'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** 서버가 떠 있는지 확인하고 설치된 모델 이름 목록을 돌려준다. 실패 시 null. */
export async function listModels(): Promise<string[] | null> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return null
    const data = (await res.json()) as { models?: { name: string }[] }
    return (data.models ?? []).map((m) => m.name)
  } catch {
    return null
  }
}

/** 스트리밍 채팅. 토큰 조각(delta)을 순서대로 yield 한다. */
export async function* streamChat(
  model: string,
  messages: ChatMessage[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      think: false,
      keep_alive: '15m', // 대화 중 모델이 메모리에서 내려가 재로딩되는 것 방지
      options: { temperature: 0.3, num_predict: 600 },
    }),
  })
  if (!res.ok || !res.body) throw new Error(`Ollama 응답 오류 (${res.status})`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    // NDJSON: 한 줄에 JSON 하나
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.trim()) continue
      const chunk = JSON.parse(line) as { message?: { content?: string }; done?: boolean }
      const delta = chunk.message?.content
      if (delta) yield delta
      if (chunk.done) return
    }
  }
}
