<template>
  <main>
    <h1>🔐 비밀번호 재설정</h1>

    <!-- 1) 세션 설정 전 안내 -->
    <p v-if="!ready && !errorMessage" class="info">{{ statusMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- 2) 세션 설정 완료 시 폼 노출 -->
    <form v-else @submit.prevent="resetPassword">
      <input
        v-model="newPassword"
        type="password"
        placeholder="새 비밀번호를 입력하세요"
        required
      />
      <button type="submit">비밀번호 변경</button>
    </form>

    <!-- 3) 변경 완료 후 메시지 -->
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
let sessionToken = ''

onMounted(async () => {
  // URL 쿼리스트링에서 access_token과 type 파싱
  const params = new URLSearchParams(window.location.search.substring(1))
  sessionToken = params.get('access_token')
  const type = params.get('type')

  if (type === 'recovery' && sessionToken) {
    // Supabase 세션 설정
    const { error: sessErr } = await supabase.auth.setSession({
      access_token: sessionToken,
    })
    if (sessErr) {
      errorMessage.value = '세션 설정 실패: ' + sessErr.message
    } else {
      ready.value = true
    }
  } else {
    statusMessage.value = '유효하지 않은 링크입니다. 로그인 페이지로 이동합니다.'
    setTimeout(() => router.push('/login'), 2000)
  }
})

async function resetPassword() {
  // 비밀번호 변경 호출
  const { error } = await supabase.auth.updateUser({
    password: newPassword.value,
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
.info {
  text-align: center;
  color: #555;
  margin-top: 1rem;
}
.error {
  text-align: center;
  color: red;
  margin-top: 1rem;
}
.success {
  text-align: center;
  color: green;
  margin-top: 1rem;
}
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
  padding: 0.8rem;
  background-color: #0055aa;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
