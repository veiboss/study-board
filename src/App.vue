<template> 
  <div>
    <header class="header">
      <h1 @click="goHome" class="logo">📘 Study Board</h1>
      <nav class="nav">
        <router-link to="/notes">정리글</router-link>
        <router-link to="/ask">질문</router-link>

        <template v-if="isLoggedIn">
          <router-link to="/my-posts">내 글 목록</router-link>
          <button class="logout-btn" @click="logout">로그아웃</button>
        </template>
        <template v-else>
          <router-link to="/login">로그인</router-link>
          <router-link to="/signup">회원가입</router-link>
        </template>

        <router-link :to="{ path: '/write', query: { type: 'note' } }">✏️ 글쓰기</router-link>
      </nav>
    </header>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

onMounted(async () => {
  const hash = window.location.hash
  const params = new URLSearchParams(hash.slice(1))

  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  const type = params.get('type')

  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (error) {
      console.error('세션 설정 실패:', error)
      return
    }

    // 로그인 성공 시 localStorage에 사용자 정보 저장
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (!userError && userData.user) {
      localStorage.setItem('currentUser', JSON.stringify(userData.user))
    }

    // 링크 종류에 따라 라우팅
    if (type === 'signup') {
      router.push('/confirm')
    } else if (type === 'recovery') {
      router.push('/reset-password')
    }
  }
})

const router = useRouter()

function goHome() {
  router.push('/')
}

// 로그인 여부 확인
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('currentUser')
})

// 로그아웃 처리
function logout() {
  localStorage.removeItem('currentUser')
  router.push('/')
  location.reload() // 상태 반영을 위해 새로고침
}
</script>

<style scoped>
.header {
  background-color: #0055aa;
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  cursor: pointer;
  font-size: 1.4rem;
  margin: 0;
}
.nav {
  display: flex;
  gap: 1.2rem;
}
.nav a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}
.nav a.router-link-exact-active {
  text-decoration: underline;
}
.logout-btn {
  background: none;
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
.content {
  max-width: 960px;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>
