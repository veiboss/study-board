<template>
  <main v-if="question">
    <h1>{{ question.title }}</h1>
    <p><strong>카테고리:</strong> {{ question.category }}</p>

    <!-- ✏️ 수정 중일 때 Toast UI Editor 표시 -->
    <div v-if="isEditing">
      <EditorComponent ref="editorComponent" :initialValue="question.content" />
      <button @click="saveEdit">💾 저장</button>
      <button @click="cancelEdit">취소</button>
    </div>

    <!-- 👀 보기 전용 Viewer -->
    <div v-else ref="viewerRoot" class="markdown-viewer"></div>

    <p class="date">작성일: {{ formatDate(question.created_at) }}</p>

    <div v-if="isAuthor" class="actions">
      <button @click="startEdit">✏️ 수정</button>
      <button @click="deleteQuestion">🗑️ 삭제</button>
    </div>

    <section class="comments">
      <h2>💬 댓글</h2>
      <ul>
        <li v-for="c in comments" :key="c.id">
          <div v-if="editingCommentId !== c.id">
            <p>{{ c.text }}</p>
            <small>{{ formatDate(c.created_at) }}</small>
            <div v-if="c.user_id === currentUser.id">
              <button @click="startEditing(c.id, c.text)">✏️ 수정</button>
              <button @click="deleteComment(c.id)">🗑️ 삭제</button>
            </div>
          </div>
          <div v-else>
            <input v-model="editedText" />
            <button @click="confirmEdit(c.id)">💾 저장</button>
            <button @click="cancelEdit">취소</button>
          </div>
        </li>
      </ul>


      <textarea v-model="newComment" placeholder="댓글을 입력하세요"></textarea>
      <button @click="addComment">댓글 작성</button>
    </section>
  </main>
  <p v-else class="not-found">❗ 해당 글을 찾을 수 없습니다.</p>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor.css'
import EditorComponent from '@/components/common/ToastEditor.vue'

const route = useRoute()
const router = useRouter()
//const questionId = route.params.id
const questionId = Number(route.params.id)
const question = ref(null)
const comments = ref([])
const newComment = ref('')
const viewerRoot = ref(null)
const editorComponent = ref(null)
const isEditing = ref(false)
const editingCommentId = ref(null)
const editedText = ref('')

const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
const isAuthor = computed(() => question.value?.author_id === currentUser.id?.toString?.())

onMounted(async () => {
  await fetchQuestion()

  const { data: cdata, error: cerr } = await supabase
    .from('comments')
    .select('*')
    .eq('question_id', questionId)
    .order('created_at', { ascending: true })

  if (cerr) {
    console.error('댓글 불러오기 실패:', cerr)
    return
  }
  comments.value = cdata || []

  await nextTick()
  mountViewer()
})

function mountViewer() {
  console.log('📦 Viewer mount 시도:', viewerRoot.value, question.value?.content)

  if (viewerRoot.value && question.value?.content) {
    viewerRoot.value.innerHTML = '' // 🔄 중복 렌더링 방지
    new Viewer({
      el: viewerRoot.value,
      initialValue: question.value.content,
    })
  } else {
    console.warn('⚠️ Viewer mount 실패 - 요소 없음 또는 content 없음')
  }
}



function startEdit() {
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  nextTick(() => mountViewer())
}

function startEditing(id, text) {
  editingCommentId.value = id
  editedText.value = text
}

function cancelEditing() {
  editingCommentId.value = null
  editedText.value = ''
}

async function fetchQuestion() {
  const { data: qdata, error: qerr } = await supabase
    .from('questions')
    .select('*')
    .eq('id', Number(questionId))
    .maybeSingle()

  if (qerr) {
    console.error('질문 조회 실패:', qerr)
    return
  }

  console.log('🔁 fetch된 질문:', qdata.content)
  question.value = qdata
}


async function saveEdit() {
  const updatedContent = editorComponent.value?.getMarkdown()
  if (!updatedContent) return

  const { error } = await supabase
    .from('questions')
    .update({ content: updatedContent })
    .eq('id', questionId)

  if (!error) {
    await fetchQuestion()
    question.value.content = updatedContent
    isEditing.value = false
    await nextTick()
    if (viewerRoot.value) {
      viewerRoot.value.innerHTML = ''  // 기존 내용 초기화
    }
mountViewer()

  } else {
    console.error('질문 수정 실패:', error)
  }
}

async function deleteQuestion() {
  if (!confirm('이 질문을 삭제하시겠습니까?')) return
  const { error } = await supabase.from('questions').delete().eq('id', questionId)
  if (!error) {
    router.push('/ask')
  } else {
    console.error('질문 삭제 실패:', error)
  }
}

async function addComment() {
  if (!newComment.value.trim()) return
  const { data, error } = await supabase.from('comments').insert({
    question_id: questionId,
    text: newComment.value.trim(),
    user_id: currentUser.id,
  }).select().single()

  if (!error && data) {
    comments.value.push(data)
    newComment.value = ''
  } else {
    console.error('댓글 작성 실패:', error)
  }
}
async function confirmEdit(id) {
  const { error } = await supabase
    .from('comments')
    .update({ text: editedText.value })
    .eq('id', id)

  if (!error) {
    const comment = comments.value.find(c => c.id === id)
    if (comment) comment.text = editedText.value
    cancelEditing()
  } else {
    console.error('댓글 수정 실패:', error)
  }
}

async function deleteComment(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)

  if (!error) {
    comments.value = comments.value.filter(c => c.id !== id)
  } else {
    console.error('댓글 삭제 실패:', error)
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
</script>

<style scoped>
.markdown-viewer {
  border: 1px solid #ccc;
  min-height: 200px;
  padding: 1rem;
  margin: 1rem 0 2rem;
  white-space: pre-wrap;
}
.date {
  color: #888;
  font-size: 0.9rem;
}
.actions {
  margin: 1rem 0;
  display: flex;
  gap: 1rem;
}
button {
  padding: 0.5rem 1rem;
  background-color: #0055aa;
  color: white;
  border: none;
  cursor: pointer;
}
.comments textarea {
  width: 100%;
  height: 60px;
  margin: 0.5rem 0;
  padding: 0.5rem;
}
.not-found {
  color: red;
  padding: 2rem;
}
</style>
