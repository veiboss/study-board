<template>
  <main>
    <!-- ✅ 고정된 정리글 -->
    <section v-if="pinnedNote" class="pinned-note">
      <h2>📌 고정된 정리글</h2>
      <div class="note-card" @click="goToNote(pinnedNote.id)">
        <h3>{{ pinnedNote.title }}</h3>
        <p>{{ pinnedNote.category }}</p>
        <p class="date">작성일: {{ formatDate(pinnedNote.created_at) }}</p>
      </div>
    </section>

    <!-- 🆕 최신 정리글 -->
    <h2>🆕 최신 정리글</h2>
    <NoteCard
      v-for="note in latestNotes"
      :key="note.id"
      :note="note"
      @click="goToNote(note.id)"
    />

    <!-- ❓ 인기 질문 -->
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
const pinnedNote = ref(null)
const latestNotes = ref([])
const latestQuestions = ref([])

// 고정할 note의 ID
const PINNED_NOTE_ID = 5

onMounted(async () => {
  // 🔹 고정된 note(id=5)
  const { data: fixed, error: pErr } = await supabase
  .from('notes')
  .select('*')
  .eq('id', 5)
  .maybeSingle()

  if (!pErr && fixed) {
    pinnedNote.value = fixed
  } else {
   console.warn('📛 고정 note 불러오기 실패:', pErr, fixed)
  }


  // 🔹 최신 note 2개 (고정글 제외)
  const { data: notes, error: nErr } = await supabase
    .from('notes')
    .select('*')
    .neq('id', PINNED_NOTE_ID)
    .order('created_at', { ascending: false })
    .limit(2)
  if (!nErr) latestNotes.value = notes
  else console.error('최신 note 조회 실패:', nErr)

  // 🔹 질문 목록 + 댓글 수
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('id, title, content, category, created_at')
  if (qError) {
    console.error('질문 불러오기 실패:', qError)
    return
  }

  const { data: comments, error: cError } = await supabase
    .from('comments')
    .select('question_id')
  if (cError) {
    console.error('댓글 불러오기 실패:', cError)
    return
  }

  const countMap = {}
  comments.forEach(c => {
    countMap[c.question_id] = (countMap[c.question_id] || 0) + 1
  })

  latestQuestions.value = questions
    .map(q => ({
      ...q,
      comment_count: countMap[q.id] || 0,
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
.pinned-note {
  background-color: #f9f9f9;
  padding: 1rem;
  border: 1px solid #ccc;
  margin-bottom: 2rem;
}
.note-card {
  cursor: pointer;
  padding: 1rem;
  border: 1px solid #ddd;
  margin-bottom: 1rem;
  transition: background-color 0.2s;
}
.note-card:hover {
  background-color: #eef;
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
