<template>
  <main>
    <h1>🔐 비밀번호 재설정</h1>

    <!-- 1) 세션 확인 전 -->
    <p v-if="!ready && !errorMessage" class="info">{{ statusMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- 2) 세션이 있으면 폼 표시 -->
    <form v-if="ready" @submit.prevent="resetPassword">
      <input
        v-model="newPassword"
        type="password"
        placeholder="새 비밀번호를 입력하세요"
        required
      />
      <button type="submit">비밀번호 변경</button>
    </form>

    <!-- 3) 비밀번호 변경 후 메시지 -->
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'

const router = useRouter()
const ready = ref(false)
const statusMessage = ref('링크를 확인하고 있습니다…')
const newPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')

onMounted(async () => {
  // 1) 세션 가져오기 (Magic Link가 쿠키에 세팅됨)
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    errorMessage.value = '세션을 가져오는 데 실패했습니다: ' + error.message
    return
  }
  if (!data.session) {
    statusMessage.value = '유효하지 않은 링크입니다. 로그인 페이지로 이동합니다.'
    return setTimeout(() => router.push('/login'), 2000)
  }
  // 2) 세션이 존재하면 폼 표시
  ready.value = true
})

async function resetPassword() {
  errorMessage.value = ''
  const { error } = await supabase.auth.updateUser({
    password: newPassword.value,
  })
  if (error) {
    errorMessage.value = '비밀번호 변경 실패: ' + error.message
    return
  }
  successMessage.value = '✅ 비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.'
  setTimeout(() => router.push('/login'), 2000)
}
</script>

<style scoped>
.info    { text-align:center; color:#555;  margin-top:1rem; }
.error   { text-align:center; color:red;  margin-top:1rem; }
.success { text-align:center; color:green; margin-top:1rem; }
form {
  max-width:400px; margin:2rem auto;
  display:flex; flex-direction:column; gap:1rem;
}
input  { padding:0.6rem; }
button { padding:0.8rem; background:#0055aa; color:white; border:none; }
</style>
