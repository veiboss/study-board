<!-- src/views/ForgotPasswordView.vue -->
<template>
  <main>
    <h1>🔑 비밀번호 재설정 요청</h1>
    <form @submit.prevent="sendRecovery">
      <input v-model="email" type="email" placeholder="이메일" required />
      <button :disabled="cooldown">
        {{ cooldown ? '잠시만 기다려주세요…' : '재설정 메일 받기' }}
      </button>
    </form>
    <p v-if="statusMessage">{{ statusMessage }}</p>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/supabase.js'

const email = ref('')
const statusMessage = ref('')
const cooldown = ref(false)

async function sendRecovery() {
  cooldown.value = true
  statusMessage.value = ''

  const { error } = await supabase.auth.resetPasswordForEmail(
    email.value,
    {
      // 여기서만 redirectTo를 딱 한 번 지정합니다.
      redirectTo: 'https://study-board-three.vercel.app/reset-password'
    }
  )
  if (error) {
    statusMessage.value = error.message.includes('15 seconds')
      ? '⏳ 15초 후에 다시 시도해주세요.'
      : `❌ 요청 실패: ${error.message}`
  } else {
    statusMessage.value = '✅ 메일을 보냈습니다. 이메일함을 확인해주세요.'
  }

  setTimeout(() => (cooldown.value = false), 15000)
}
</script>
