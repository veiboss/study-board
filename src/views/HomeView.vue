<template>
  <main>
    <h2>📌 최신 정리글</h2>
    <NoteCard
      v-for="note in latestNotes"
      :key="note.id"
      :note="note"
      @click="goToNote(note.id)"
    />

    <h2>❓ 인기 질문</h2>
    <div
      v-for="q in latestQuestions"
      :key="q.id"
      class="question-card"
      @click="goToQuestion(q.id)"
    >
      <h3>{{ q.title }}</h3>
      <p><strong>카테고리:</strong> {{ q.category }}</p>
      <p>{{ q.content.slice(0, 40) }}...</p>
      <p><strong>댓글 수:</strong> {{ q.comment_count }}개</p>
      <p class="date">작성일: {{ formatDate(q.created_at) }}</p>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'
import NoteCard from '@/components/NoteCard.vue'

const router = useRouter()
const latestNotes = ref([])
const latestQuestions = ref([])

onMounted(async () => {
  // 1️⃣ 최신 정리글 2개 가져오기
  const { data: notes, error: noteError } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(2)

  if (!noteError) {
    latestNotes.value = notes
  } else {
    console.error('정리글 불러오기 실패:', noteError)
  }

const { data: questions, error: qError } = await supabase
  .from('questions')
  .select('id, title, content, category, created_at')

if (qError) {
  console.error('질문 불러오기 실패:', qError)
  return
}

// 각 질문별 댓글 수 가져오기
const { data: comments, error: cError } = await supabase
  .from('comments')
  .select('question_id')

if (cError) {
  console.error('댓글 불러오기 실패:', cError)
  return
}

// 댓글 수 계산
const commentCountMap = {}
comments.forEach(c => {
  commentCountMap[c.question_id] = (commentCountMap[c.question_id] || 0) + 1
})

// 댓글 수를 질문 객체에 추가하고 정렬
latestQuestions.value = questions
  .map(q => ({
    ...q,
    comment_count: commentCountMap[q.id] || 0,
  }))
  .sort((a, b) => b.comment_count - a.comment_count)
  .slice(0, 2)
})

function goToNote(id) {
  router.push(`/notes/${id}`)
}
function goToQuestion(id) {
  router.push(`/ask/${id}`)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
</script>

<style scoped>
main {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}
h2 {
  margin-top: 2rem;
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
