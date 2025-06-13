<template>
  <main>
    <h1>🔐 비밀번호 재설정</h1>

    <!-- 1) 세션 셋업 전 -->
    <p v-if="!ready && !errorMessage" class="info">{{ statusMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- 2) 세션 셋업 완료 시 폼 노출 -->
    <form v-if="ready" @submit.prevent="resetPassword">
      <input
        v-model="newPassword"
        type="password"
        placeholder="새 비밀번호를 입력하세요"
        required
      />
      <button type="submit">비밀번호 변경</button>
    </form>

    <!-- 3) 변경 완료 후 -->
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'

const router = useRouter()
const ready = ref(false)
const statusMessage = ref('이메일 확인 중입니다...')
const newPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')

onMounted(async () => {
  // 1) 해시(fragment) 파싱
  const hash = window.location.hash.substring(1)          // leading "#" 제거
  const params = new URLSearchParams(hash)
  const access_token  = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  const type          = params.get('type')

  // 2) recovery + 토큰 둘 다 있어야 진행
  if (type === 'recovery' && access_token && refresh_token) {
    const { error: sessErr } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })
    if (sessErr) {
      errorMessage.value = '❌ 세션 설정 실패: ' + sessErr.message
    } else {
      ready.value = true
    }
  } else {
    statusMessage.value =
      '유효하지 않은 링크입니다. 로그인 페이지로 이동합니다.'
    setTimeout(() => router.push('/login'), 2000)
  }
})

async function resetPassword() {
  // 3) 세션 기반 비밀번호 변경
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
.info    { text-align:center; color:#555;   margin-top:1rem; }
.error   { text-align:center; color:red;    margin-top:1rem; }
.success { text-align:center; color:green;  margin-top:1rem; }
form {
  max-width:400px;
  margin:2rem auto;
  display:flex;
  flex-direction:column;
  gap:1rem;
}
input  { padding:0.6rem; }
button { padding:0.8rem; background:#0055aa; color:white; border:none; }
</style>
