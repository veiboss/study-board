<template>
  <main>
    <h1>📝 회원가입</h1>
    <form @submit.prevent="signup">
      <input v-model="email" type="email" placeholder="이메일" required />
      <input v-model="password" type="password" placeholder="비밀번호" required />
      <button type="submit">가입하기</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
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

async function signup() {
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  })

  if (error) {
    errorMessage.value = error.message
    return
  }

  alert('✅ 회원가입 성공! 이메일을 확인해주세요.')
  router.push('/login')
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
  font-size: 1rem;
}
button {
  padding: 0.6rem;
  background-color: #0055aa;
  color: white;
  border: none;
  cursor: pointer;
}
.error {
  color: red;
  margin-top: 1rem;
  text-align: center;
}
</style>
