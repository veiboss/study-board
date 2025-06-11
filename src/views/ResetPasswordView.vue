<template>
  <main>
    <h1>🔐 비밀번호 재설정</h1>
    <p v-if="!ready" class="info">{{ statusMessage }}</p>
    <form v-else @submit.prevent="resetPassword">
      <input
        v-model="newPassword"
        type="password"
        placeholder="새 비밀번호"
        required
      />
      <button type="submit">비밀번호 변경</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'

const router = useRouter()
const ready = ref(false)
const statusMessage = ref('토큰을 검증 중입니다...')
const newPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')

let otpToken = ''

onMounted(() => {
  // 해시 또는 쿼리에서 'token'과 'type' 파싱
  const raw = window.location.hash.length > 1
    ? window.location.hash.substring(1)
    : window.location.search.substring(1)
  const params = new URLSearchParams(raw)
  otpToken = params.get('token')
  const type = params.get('type')

  if (type !== 'recovery' || !otpToken) {
    statusMessage.value = '유효하지 않은 링크입니다. 로그인 페이지로 이동합니다.'
    setTimeout(() => router.push('/login'), 2000)
    return
  }

  // 토큰 존재 → 폼 준비
  ready.value = true
})

async function resetPassword() {
  errorMessage.value = ''
  // OTP 토큰으로 바로 비밀번호 변경
  const { data, error } = await supabase.auth.verifyOtp({
    type: 'recovery',
    token: otpToken,
    newPassword: newPassword.value,
  })

  if (error) {
    errorMessage.value = '비밀번호 변경 실패: ' + error.message
    return
  }

  successMessage.value =
    '✅ 비밀번호가 성공적으로 변경되었습니다. 잠시 후 로그인 페이지로 이동합니다.'
  setTimeout(() => router.push('/login'), 2500)
}
</script>

<style scoped>
.info    { text-align:center; color: #555; }
.error   { text-align:center; color: red; }
.success { text-align:center; color: green; }
form {
  max-width:400px; margin:2rem auto; display:flex; flex-direction:column; gap:1rem;
}
input { padding:0.6rem; }
button { padding:0.6rem; background:#0055aa; color:white; border:none; }
</style>
