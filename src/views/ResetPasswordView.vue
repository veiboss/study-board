<template>
  <main>
    <h1>🔐 비밀번호 재설정</h1>
    <form @submit.prevent="resetPassword">
      <input v-model="newPassword" type="password" placeholder="새 비밀번호" required />
      <button type="submit">비밀번호 변경</button>
    </form>
    <p v-if="message" class="success">{{ message }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'

const newPassword = ref('')
const message = ref('')
const errorMessage = ref('')
const router = useRouter()

async function resetPassword() {
  const { error } = await supabase.auth.updateUser({
    password: newPassword.value
  })

  if (error) {
    errorMessage.value = '비밀번호 변경 실패: ' + error.message
    return
  }

  message.value = '✅ 비밀번호가 성공적으로 변경되었습니다. 잠시 후 로그인 페이지로 이동합니다.'
  
  // 로그인을 유지할 경우: 그냥 홈으로 이동
  setTimeout(() => {
    router.push('/login')  // 또는 / 로 보내도 됨
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
