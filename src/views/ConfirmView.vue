<template>
  <main>
    <h1>🔐 이메일 인증 처리 중...</h1>
    <p v-if="message">{{ message }}</p>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'

const message = ref('인증 정보를 확인하고 있습니다...')
const router = useRouter()

onMounted(async () => {
  const hash = window.location.hash

  if (hash.includes('type=recovery')) {
    // 비밀번호 재설정 → reset-password 경로로 redirect
    router.replace('/reset-password')
    return
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    message.value = '세션 정보를 가져오는 데 실패했습니다.'
    return
  }

  if (data.session) {
    message.value = '✅ 인증 및 자동 로그인 완료! 메인 페이지로 이동합니다.'
    setTimeout(() => router.push('/'), 2000)
  } else {
    message.value = '✅ 인증은 완료되었지만, 로그인되지 않았습니다. 수동 로그인 해주세요.'
    setTimeout(() => router.push('/login'), 3000)
  }
})

</script>

<style scoped>
main {
  max-width: 600px;
  margin: 3rem auto;
  padding: 2rem;
  text-align: center;
}
</style>
