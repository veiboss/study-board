<template> 
  <main>
    <div class="header-row">
      <h2>❓ 질문 목록</h2>
      <button class="create-btn" @click="goToWrite">+ 질문 작성</button>
    </div>

    <div class="filters">
      <input v-model="keyword" placeholder="제목 또는 내용 검색" />
      <select v-model="categoryFilter">
        <option value="">-- 전체 카테고리 --</option>
        <option>Vue</option>
        <option>Java</option>
        <option>Python</option>
      </select>
    </div>

    <div v-if="filteredQuestions.length > 0">
      <div
        v-for="q in filteredQuestions"
        :key="q.id"
        class="question-card"
        @click="goToDetail(q.id)"
      >
        <h3>{{ q.title }}</h3>
        <p><strong>카테고리:</strong> {{ q.category }}</p>
        <p>{{ q.content.slice(0, 50) }}...</p>
        <p class="date">작성일: {{ formatDate(q.created_at) }}</p>
      </div>
    </div>
    <p v-else>일치하는 질문이 없습니다.</p>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'

const router = useRouter()
const keyword = ref('')
const categoryFilter = ref('')
const questions = ref([])

onMounted(async () => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('질문 불러오기 실패:', error)
    return
  }
  questions.value = data || []
})

const filteredQuestions = computed(() => {
  return questions.value.filter(q => {
    const keywordMatch =
      q.title.includes(keyword.value) || q.content.includes(keyword.value)
    const categoryMatch =
      !categoryFilter.value || q.category === categoryFilter.value
    return keywordMatch && categoryMatch
  })
})

function goToDetail(id) {
  router.push(`/ask/${id}`)
}


function goToWrite() {
  router.push({ path: '/write', query: { type: 'question' } })
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filters {
  margin: 1rem 0;
  display: flex;
  gap: 1rem;
}
input,
select {
  padding: 0.5rem;
}
.create-btn {
  padding: 0.4rem 1rem;
  background-color: #0055aa;
  color: white;
  border: none;
}
.question-card {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
}
.date {
  color: #888;
  font-size: 0.85rem;
}
</style>
