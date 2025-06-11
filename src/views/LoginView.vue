<template>
  <main class="login-container">
    <h1>🔐 로그인</h1>
    <input v-model="email" type="email" placeholder="이메일 입력" />
    <input v-model="password" type="password" placeholder="비밀번호 입력" />
    <button @click="login">로그인</button>
    <p class="error" v-if="errorMessage">{{ errorMessage }}</p>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()

async function login() {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = '이메일과 비밀번호를 입력하세요.'
    return
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (error) {
    errorMessage.value = '로그인 실패: ' + error.message
    return
  }

  // 로그인 성공
  localStorage.setItem('currentUser', JSON.stringify(data.user))

  // 상태 반영 위해 setTimeout으로 router 이동 → 새로고침은 불필요
  await router.push('/')
  location.reload()
}

</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 3rem auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
input {
  padding: 0.8rem;
  font-size: 1rem;
}
button {
  background-color: #0055aa;
  color: white;
  padding: 0.8rem;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}
.error {
  color: red;
  font-size: 0.9rem;
}
</style>
