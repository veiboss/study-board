<template>
  <main>
    <h1>🔐 비밀번호 재설정</h1>
    <p v-if="!ready && !errorMessage">{{ statusMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <form v-else @submit.prevent="resetPassword">
      <input v-model="newPassword" type="password" placeholder="새 비밀번호" required />
      <button type="submit">비밀번호 변경</button>
    </form>

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
  const params = new URLSearchParams(window.location.search)
  otpToken = params.get('token')
  const type = params.get('type')

  if (type === 'recovery' && otpToken) {
    ready.value = true
  } else {
    statusMessage.value = '유효하지 않은 링크입니다. 로그인 페이지로 이동합니다.'
    setTimeout(() => router.push('/login'), 2000)
  }
})

async function resetPassword() {
  const { error } = await supabase.auth.verifyOtp({
    type: 'recovery',
    token: otpToken,
    newPassword: newPassword.value,
  })
  if (error) {
    errorMessage.value = '비밀번호 변경 실패: ' + error.message
    return
  }
  successMessage.value = '✅ 비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.'
  setTimeout(() => router.push('/login'), 2000)
}
</script>
