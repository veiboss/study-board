<template>
  <main>
    <h1>🔐 비밀번호 재설정</h1>
    <!-- 토큰 처리 중이라면 안내 메시지로 대체 -->
    <p v-if="!ready">{{ statusMessage }}</p>

    <!-- 토큰 검증이 끝나면 실제 폼 보여주기 -->
    <form v-else @submit.prevent="resetPassword">
      <input
        v-model="newPassword"
        type="password"
        placeholder="새 비밀번호"
        required
      />
      <button type="submit">비밀번호 변경</button>
    </form>

    <p v-if="message" class="success">{{ message }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'

// 상태 변수
const ready = ref(false)            // 토큰 처리 완료 여부
const statusMessage = ref('토큰을 검증 중입니다...')
const newPassword = ref('')
const message = ref('')
const errorMessage = ref('')
const router = useRouter()

onMounted(async () => {
  // URL 해시에서 토큰을 파싱
  // const hash = window.location.hash.substring(1)  // leading '#' 제거
  // const params = new URLSearchParams(hash)
  // const access_token = params.get('access_token')
  // const refresh_token = params.get('refresh_token')
  // const type = params.get('type')

    // 1) 해시(hash)에서 먼저 파싱
  let params = new URLSearchParams(window.location.hash.substring(1))
  let access_token = params.get('access_token')
  let refresh_token = params.get('refresh_token')
  let type = params.get('type')

  // 2) 해시에 없으면 query string에서 다시 파싱 (Supabase verify redirect를 쿼리로 썼을 때)
  if (!access_token) {
    params = new URLSearchParams(window.location.search)
    access_token = params.get('access_token')
    refresh_token = params.get('refresh_token')
    type = params.get('type')
  }

  if (type === 'recovery' && access_token && refresh_token) {
    // Supabase 세션 설정
    const { error: sessErr } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })
    if (sessErr) {
      statusMessage.value = '❌ 세션 설정에 실패했습니다: ' + sessErr.message
      return
    }
    // 토큰 검증 성공, 폼 표시
    ready.value = true
    return
  }

  // recovery 토큰 없으면 로그인으로 redirect
  statusMessage.value = '유효하지 않은 링크입니다. 로그인 페이지로 이동합니다.'
  setTimeout(() => router.push('/login'), 2000)
})

async function resetPassword() {
  // 실제 비밀번호 변경
  const { error } = await supabase.auth.updateUser({
    password: newPassword.value,
  })

  if (error) {
    errorMessage.value = '비밀번호 변경 실패: ' + error.message
    return
  }

  message.value =
    '✅ 비밀번호가 성공적으로 변경되었습니다. 잠시 후 로그인 페이지로 이동합니다.'
  setTimeout(() => {
    router.push('/login')
  }, 2500)
}
</script>

<style scoped>
form {
  max-width: 400px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
input {
  padding: 0.6rem;
}
button {
  padding: 0.6rem;
  background-color: #0055aa;
  color: white;
  border: none;
}
.success {
  color: green;
  text-align: center;
}
.error {
  color: red;
  text-align: center;
}
</style>
