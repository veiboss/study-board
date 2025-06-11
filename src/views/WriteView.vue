<template>
  <main>
    <h1>✏️ 글쓰기 - {{ type === 'note' ? '정리글' : '질문' }}</h1>

    <input v-model="title" placeholder="제목 입력" />
    <select v-model="category">
      <option disabled value="">카테고리 선택</option>
      <option>자바 문법</option>
      <option>자료구조</option>
      <option>알고리즘</option>
    </select>

    <!-- Toast UI Editor -->
    <div ref="editorRoot"></div>

    <button @click="saveContent">저장</button>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Editor from '@toast-ui/editor'
import { supabase } from '@/supabase.js'

const route = useRoute()
const router = useRouter()

const type = ref('note')
const title = ref('')
const category = ref('')
const editorInstance = ref(null)
const editorRoot = ref(null)
const user = ref(null)

onMounted(async () => {
  // 글 유형 결정
  const t = route.query.type
  if (t === 'note' || t === 'question') {
    type.value = t
  }

  // 사용자 정보 가져오기
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    alert('로그인이 필요합니다.')
    return
  }
  user.value = data.user

  // Editor 초기화
  editorInstance.value = new Editor({
    el: editorRoot.value,
    height: '400px',
    initialEditType: 'markdown',
    previewStyle: 'vertical',
    placeholder: '내용을 입력하세요...'
  })
})

onBeforeUnmount(() => {
  editorInstance.value?.destroy()
})

async function saveContent() {
  const content = editorInstance.value?.getMarkdown() || ''

  if (!title.value.trim() || !content.trim() || !category.value) {
    alert('❗ 제목, 내용, 카테고리를 모두 입력해주세요.')
    return
  }

  const table = type.value === 'note' ? 'notes' : 'questions'

  const { data, error } = await supabase.from(table).insert({
    title: title.value.trim(),
    content: content.trim(),
    category: category.value,
    author_id: user.value.id,  // ✅ 수정된 부분
    created_at: new Date().toISOString()
  })

  if (error) {
    console.error('저장 실패:', error)
    alert('저장 중 오류가 발생했습니다.')
    return
  }

  alert('✅ 저장 완료!')
  router.push(type.value === 'note' ? '/notes' : '/ask')
}
</script>

<style scoped>
input, select {
  display: block;
  width: 100%;
  padding: 0.6rem;
  margin: 0.5rem 0;
  font-size: 1rem;
}
button {
  padding: 0.6rem 1.2rem;
  background-color: #0055aa;
  color: white;
  border: none;
  margin-top: 1rem;
}
</style>
