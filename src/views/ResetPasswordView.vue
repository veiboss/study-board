<template>
  <main>
    <h1>🔐 비밀번호 재설정</h1>

    <!-- 세션 설정 전 안내 -->
    <p v-if="!ready && !errorMessage" class="info">{{ statusMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- 세션 설정 완료 후 폼 -->
    <form v-if="ready" @submit.prevent="resetPassword">
      <input
        v-model="newPassword"
        type="password"
        placeholder="새 비밀번호를 입력하세요"
        required
      />
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

// 1) URL에서 access_token 파싱
onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const access_token = params.get('access_token')
  const type = params.get('type')

  // recovery 타입인지 확인
  if (type !== 'recovery' || !access_token) {
    errorMessage.value = '유효하지 않은 링크입니다. 로그인 페이지로 이동합니다.'
    return setTimeout(() => router.push('/login'), 2000)
  }

  // 2) 세션으로 설정
  const { error } = await supabase.auth.setSession({ access_token })
  if (error) {
    errorMessage.value = '세션 설정 실패: ' + error.message
  } else {
    ready.value = true
  }
})

// 3) 비밀번호 변경
async function resetPassword() {
  errorMessage.value = ''
  const { error } = await supabase.auth.updateUser({
    password: newPassword.value,
  })

  if (error) {
    errorMessage.value = '비밀번호 변경 실패: ' + error.message
    return
  }

  successMessage.value =
    '✅ 비밀번호가 변경되었습니다. 잠시 후 로그인 페이지로 이동합니다.'
  setTimeout(() => router.push('/login'), 2000)
}
</script>

<style scoped>
.info    { text-align:center; color:#555; margin-top:1rem; }
.error   { text-align:center; color:red;  margin-top:1rem; }
.success { text-align:center; color:green;margin-top:1rem; }

form {
  max-width:400px;
  margin:2rem auto;
  display:flex;
  flex-direction:column;
  gap:1rem;
}
input {
  padding:0.6rem;
}
button {
  padding:0.8rem;
  background-color:#0055aa;
  color:white;
  border:none;
  cursor:pointer;
}
</style>
