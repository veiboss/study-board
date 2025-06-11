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
let otpToken = ''

onMounted(() => {
  // 1) rawQuery를 가져와서
  const rawQuery = window.location.search || window.location.hash.substring(1)
  console.log('🔍 rawQuery:', rawQuery)

  const params = new URLSearchParams(
   window.location.search.substring(1) || window.location.hash.substring(1)
  )
  const tokenParam = params.get('token')
  const accessParam = params.get('access_token')
  const type = params.get('type')

  console.log('🔍 parsed token:', tokenParam)
  console.log('🔍 parsed access_token:', accessParam)
  console.log('🔍 parsed type:', type)

  otpToken = tokenParam ?? accessParam
  console.log('🔍 using otpToken:', otpToken)

  if (type === 'recovery' && otpToken) {
    ready.value = true
  } else {
    statusMessage.value = '유효하지 않은 링크입니다. 로그인 페이지로 이동합니다.'
    setTimeout(() => router.push('/login'), 2000)
  }
})

async function resetPassword() {
  const { error } = await supabase.auth.verifyOtp({
    type: 'recovery',
    token: otpToken,
    newPassword: newPassword.value,
  })

  if (error) {
    errorMessage.value = '비밀번호 변경 실패: ' + error.message
    return
  }

  successMessage.value = '✅ 비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.'
  setTimeout(() => router.push('/login'), 2000)
}
</script>
