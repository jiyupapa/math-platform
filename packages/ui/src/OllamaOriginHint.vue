<script setup lang="ts">
// 튜터 '연결할 수 없어요' 안내 보강 — 사내 호스트처럼 localhost 가 아닌 주소에서 열었을 때만 보인다.
// Ollama 는 기본적으로 localhost 출처의 요청만 받는다(다른 출처는 403). 켜져 있어도 브라우저에선 CORS 로 막혀
// '꺼짐'과 똑같이 fetch 가 실패하고, 브라우저는 둘을 구분할 수 없다 → 두 가능성을 함께 안내한다.
// 설정 방법 정본: docs/실행_가이드.html '사내 호스트에 올릴 때'. (2026-09-28 점검 #2)
const origin = typeof location !== 'undefined' ? location.origin : ''
const host = typeof location !== 'undefined' ? location.hostname : ''
const LOCAL = ['localhost', '127.0.0.1', '[::1]', '::1']
const show = origin.startsWith('http') && !LOCAL.includes(host) && !host.endsWith('.localhost')
</script>

<template>
  <div
    v-if="show"
    data-ollama-origin-hint
    class="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900"
  >
    <p class="font-semibold">Ollama 를 켰는데도 이 안내가 보이나요?</p>
    <p class="mt-1">
      Ollama 는 기본적으로 내 PC 에서 연 페이지만 받아 줘요. 이 사이트 주소를 허용 목록(<code>OLLAMA_ORIGINS</code>)에
      넣은 뒤, Ollama 를 완전히 종료했다가 다시 켜세요.
    </p>
    <p class="mt-2 font-medium">Windows (명령 프롬프트)</p>
    <code class="mt-0.5 block break-all rounded bg-white px-2 py-1 text-slate-800">setx OLLAMA_ORIGINS "{{ origin }}"</code>
    <p class="mt-2 font-medium">macOS (터미널)</p>
    <code class="mt-0.5 block break-all rounded bg-white px-2 py-1 text-slate-800">launchctl setenv OLLAMA_ORIGINS "{{ origin }}"</code>
  </div>
</template>
