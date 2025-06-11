<template>
  <main>
    <h1>🔐 비밀번호 재설정</h1>

    <!-- 토큰 처리 완료 전 -->
    <p v-if="!ready">{{ statusMessage }}</p>

    <!-- 검증 완료 후 폼 -->
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
const statusMessage = ref('링크를 확인 중입니다…')
const newPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')

let otpToken = ''

onMounted(() => {
  // 1) 해시 또는 쿼리스트링 양쪽에서 토큰과 type 파싱
  const raw =
    window.location.hash.length > 1
      ? window.location.hash.substring(1)
      : window.location.search.substring(1)
  const params = new URLSearchParams(raw)
  otpToken = params.get('token') ?? params.get('access_token')
  const type = params.get('type')

  if (type !== 'recovery' || !otpToken) {
    statusMessage.value = '❌ 유효하지 않은 링크입니다. 로그인 페이지로 이동합니다.'
    setTimeout(() => router.push('/login'), 2000)
    return
  }

  // 2) recovery OTP 토큰만 검증
  ready.value = true
})

async function resetPassword() {
  errorMessage.value = ''
  const { error } = await supabase.auth.verifyOtp({
    type: 'recovery',
    token: otpToken,
    newPassword: newPassword.value,
  })

  if (error) {
    errorMessage.value = '비밀번호 변경 실패: ' + error.message
    return
  }

  successMessage.value =
    '✅ 비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.'
  setTimeout(() => router.push('/login'), 2000)
}
</script>

<style scoped>
.error   { text-align:center; color:red;   margin-top:1rem; }
.success { text-align:center; color:green; margin-top:1rem; }
form {
  max-width:400px; margin:2rem auto; display:flex; flex-direction:column; gap:1rem;
}
input  { padding:0.6rem; }
button { padding:0.6rem; background:#0055aa; color:white; border:none; }
</style>
