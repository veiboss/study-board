<template>
  <main class="my-posts">
    <h1>📝 내 글 목록</h1>

    <!-- 1) 내 질문 목록 -->
    <section class="my-questions">
      <h2>내가 작성한 질문</h2>
      <ul v-if="myQuestions.length">
        <li v-for="q in myQuestions" :key="q.id">
          <router-link :to="`/ask/${q.id}`">
            {{ q.title }}
            <small>({{ formatDate(q.created_at) }})</small>
          </router-link>
        </li>
      </ul>
      <p v-else>아직 작성한 질문이 없습니다.</p>
    </section>

    <!-- 2) 내 정리글 목록 -->
    <section class="my-notes">
      <h2>내가 작성한 정리글</h2>
      <ul v-if="myNotes.length">
        <li v-for="n in myNotes" :key="n.id">
          <router-link :to="`/notes/${n.id}`">
            {{ n.title }}
            <small>({{ formatDate(n.created_at) }})</small>
          </router-link>
        </li>
      </ul>
      <p v-else>아직 작성한 정리글이 없습니다.</p>
    </section>

    <!-- 3) 내 댓글 목록 -->
    <section class="my-comments">
      <h2>내가 작성한 댓글</h2>
      <ul v-if="myComments.length">
        <li v-for="c in myComments" :key="c.id">
          <router-link :to="`/ask/${c.question_id}`">
            <strong>{{ c.question.title }}</strong>  
            — {{ c.text.slice(0, 30) }}...
            <small>({{ formatDate(c.created_at) }})</small>
          </router-link>
        </li>
      </ul>
      <p v-else>아직 작성한 댓글이 없습니다.</p>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase.js'

const myQuestions = ref([])
const myNotes     = ref([])
const myComments  = ref([])

// localStorage에 담긴 현재 사용자
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
}

onMounted(async () => {
  // 1) 질문
  const { data: qdata, error: qerr } = await supabase
    .from('questions')
    .select('id, title, created_at')
    .eq('author_id', currentUser.id)
    .order('created_at', { ascending: false })
  if (qerr) console.error('내 질문 불러오기 실패:', qerr)
  else         myQuestions.value = qdata

  // 2) 정리글(notes)
  const { data: ndata, error: nerr } = await supabase
    .from('notes')
    .select('id, title, created_at')
    .eq('author_id', currentUser.id)
    .order('created_at', { ascending: false })
  if (nerr) console.error('내 정리글 불러오기 실패:', nerr)
  else      myNotes.value = ndata

  // 3) 댓글 + 질문 제목 조인
  const { data: cdata, error: cerr } = await supabase
    .from('comments')
    .select(`
      id,
      question_id,
      text,
      created_at,
      question:questions!inner ( title )
    `)
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false })
  if (cerr) console.error('내 댓글 불러오기 실패:', cerr)
  else      myComments.value = cdata
})
</script>

<style scoped>
.my-posts {
  padding: 1rem;
}
.my-posts h1 {
  margin-bottom: 1rem;
}
.my-posts section {
  margin-bottom: 2rem;
}
.my-posts ul {
  list-style: none;
  padding: 0;
}
.my-posts li {
  margin-bottom: 0.5rem;
}
.my-posts a {
  color: #0055aa;
  text-decoration: none;
}
.my-posts a:hover {
  text-decoration: underline;
}
</style>
