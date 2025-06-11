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
import { computed } from 'vue'
import { useRouter } from 'vue-router'

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
