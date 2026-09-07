<script setup lang="ts">
// 진도 크로스기기 저장용 로그인 위젯 (경로 B: 이메일+비밀번호). 백엔드 미설정 시 아무것도 안 그림.
// 자체 완결 스타일(scoped) — Tailwind @source 의존 없음.
import { ref } from 'vue'
import { currentUser, signIn, signUp, signOut, isAllowedEmail } from './auth'
import { isBackendEnabled } from './supabase'

// 팝오버 정렬: 기본 좌측(사이드바) · 헤더 우측 배치는 align="right"
const props = withDefaults(defineProps<{ align?: 'left' | 'right' }>(), { align: 'left' })
const enabled = isBackendEnabled()
const open = ref(false)
const mode = ref<'login' | 'signup'>('login')
const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function submit() {
  error.value = ''
  if (!isAllowedEmail(email.value)) {
    error.value = '@solideos.com 계정만 사용할 수 있어요'
    return
  }
  if (password.value.length < 6) {
    error.value = '비밀번호는 6자 이상이어야 해요'
    return
  }
  busy.value = true
  try {
    const { error: e } =
      mode.value === 'signup'
        ? await signUp(email.value, password.value)
        : await signIn(email.value, password.value)
    if (e) {
      error.value = e.message
      return
    }
    open.value = false
    email.value = ''
    password.value = ''
  } catch (ex) {
    error.value = ex instanceof Error ? ex.message : String(ex)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div v-if="enabled" class="ap">
    <template v-if="currentUser">
      <span class="ap-who" :title="currentUser.email">{{ currentUser.email }}</span>
      <button class="ap-link" type="button" @click="signOut()">로그아웃</button>
    </template>
    <template v-else>
      <!-- 라벨은 행동('로그인') — 이점('진도 지키기')은 팝오버 안내문이 말한다. 찾는 사람은 '로그인'을 찾는다. -->
      <button class="ap-link" type="button" :aria-expanded="open" @click="open = !open">로그인</button>
      <div v-if="open" class="ap-pop" :class="{ 'ap-pop-right': props.align === 'right' }">
        <div class="ap-tabs">
          <button type="button" :class="{ on: mode === 'login' }" @click="mode = 'login'">로그인</button>
          <button type="button" :class="{ on: mode === 'signup' }" @click="mode = 'signup'">가입</button>
        </div>
        <input v-model="email" type="email" placeholder="이메일 (@solideos.com)" autocomplete="email" />
        <input
          v-model="password"
          type="password"
          placeholder="비밀번호 (6자 이상)"
          autocomplete="current-password"
          @keyup.enter="submit"
        />
        <p v-if="error" class="ap-err">{{ error }}</p>
        <button class="ap-go" type="button" :disabled="busy" @click="submit">
          {{ busy ? '처리 중…' : mode === 'signup' ? '가입하기' : '로그인' }}
        </button>
        <p class="ap-note">로그인하면 다른 기기·브라우저에서도 진도가 이어져요.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ap {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ap-who {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--c-slate-600);
}
/* 세로 패딩은 터치 타깃 확보용 — 글자만 두면 높이가 21px 라 WCAG 2.5.8(최소 24x24) 미달이었다.
   여기 하나 고치면 전 11부 사이드바 + 포털 헤더에 함께 반영된다. */
.ap-link {
  font-size: 14px;
  font-weight: 500;
  color: var(--c-indigo-600);
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 4px;
}
.ap-link:hover {
  text-decoration: underline;
}
.ap-pop {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 60;
  width: 260px;
  padding: 12px;
  background: var(--c-white);
  border: 1px solid var(--c-slate-200);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ap-pop-right {
  left: auto;
  right: 0;
}
.ap-tabs {
  display: flex;
  gap: 4px;
}
.ap-tabs button {
  flex: 1;
  padding: 6px;
  font-size: 13px;
  border: 1px solid var(--c-slate-200);
  border-radius: 8px;
  background: var(--c-slate-50);
  color: var(--c-slate-500);
  cursor: pointer;
}
.ap-tabs button.on {
  background: var(--c-indigo-50);
  border-color: var(--c-indigo-200);
  color: var(--c-indigo-600);
  font-weight: 600;
}
.ap-pop input {
  padding: 8px 10px;
  font-size: 13px;
  border: 1px solid var(--c-slate-200);
  border-radius: 8px;
  outline: none;
}
.ap-pop input:focus {
  border-color: var(--c-indigo-300);
}
.ap-err {
  margin: 0;
  font-size: 12px;
  color: var(--c-red-600);
}
.ap-go {
  padding: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-white);
  background: var(--c-indigo-600);
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.ap-go:disabled {
  opacity: 0.6;
  cursor: default;
}
.ap-note {
  margin: 0;
  font-size: 11px;
  color: var(--c-slate-500);
  text-align: center;
}
</style>
