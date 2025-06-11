<!-- src/views/ResetPasswordView.vue -->
<template>
  <main>
    <h1>🔐 비밀번호 재설정</h1>
    <form @submit.prevent="resetPassword">
      <input v-model="newPassword" type="password" placeholder="새 비밀번호" required />
      <button type="submit">비밀번호 변경</button>
    </form>
    <p v-if="message" class="info">{{ message }}</p>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'

const route = useRoute()
const router = useRouter()
const newPassword = ref('')
const message = ref('')

onMounted(async () => {
  const hash = window.location.hash
  const params = new URLSearchParams(hash.substring(1))
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  const type = params.get('type')

  // 로그인 세션 설정 (중요)
  if (type === 'recovery' && access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })
    if (error) {
      message.value = '❌ 세션 설정 실패: ' + error.message
    } else {
      message.value = '✅ 세션 연결 완료. 새 비밀번호를 입력하세요.'
    }
  }
})

async function resetPassword() {
  const { error } = await supabase.auth.updateUser({
    password: newPassword.value,
  })

  if (error) {
    message.value = '❌ 비밀번호 변경 실패: ' + error.message
  } else {
    message.value = '✅ 비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.'
    setTimeout(() => router.push('/login'), 2000)
  }
}
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 2rem auto;
}
input {
  padding: 0.6rem;
}
button {
  background-color: #0055aa;
  color: white;
  padding: 0.6rem;
  border: none;
  cursor: pointer;
}
.info {
  text-align: center;
  color: green;
}
</style>
