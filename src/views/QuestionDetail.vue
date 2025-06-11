<template>
  <main v-if="question">
    <h1>{{ question.title }}</h1>
    <p><strong>카테고리:</strong> {{ question.category }}</p>

    <!-- ✏️ 질문 수정 모드 -->
    <div v-if="isEditingQuestion">
      <EditorComponent ref="editorRef" :initialValue="question.content" />
      <button @click="saveQuestionEdit">저장</button>
      <button @click="cancelQuestionEdit">취소</button>
    </div>
    <div v-else ref="viewerRoot" class="markdown-viewer"></div>

    <p class="date">작성일: {{ formatDate(question.created_at) }}</p>

    <div v-if="isAuthor" class="actions">
      <button @click="editQuestion">수정</button>
      <button @click="deleteQuestion">삭제</button>
    </div>

    <section class="comments">
      <h2>💬 답변</h2>
      <ul>
        <li v-for="(a, i) in answers" :key="i">
          <div v-if="a.editing">
            <textarea v-model="a.temp" />
            <button @click="saveAnswerEdit(i)">저장</button>
            <button @click="cancelAnswerEdit(i)">취소</button>
          </div>
          <div v-else>
            <p>{{ a.text }}</p>
            <small>{{ formatDate(a.date) }}</small>
            <div v-if="currentUser.id === a.userId">
              <button @click="startAnswerEdit(i)">수정</button>
              <button @click="deleteAnswer(i)">삭제</button>
            </div>
          </div>
        </li>
      </ul>

      <textarea v-model="newAnswer" placeholder="답변을 입력하세요" />
      <button @click="addAnswer">답변 작성</button>
    </section>
  </main>
  <p v-else class="not-found">❗ 해당 질문을 찾을 수 없습니다.</p>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor.css'
import EditorComponent from '@/components/common/ToastEditor.vue'

const route = useRoute()
const router = useRouter()
const questionId = route.params.id
const question = ref(null)
const answers = ref([])
const newAnswer = ref('')
const viewerRoot = ref(null)
const editorRef = ref(null)
const isEditingQuestion = ref(false)

const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
const isAuthor = computed(() => question.value?.authorId === currentUser.id)

onMounted(async () => {
  const qRaw = localStorage.getItem('questions')
  const questions = qRaw ? JSON.parse(qRaw) : []
  question.value = questions.find(q => String(q.id) === String(questionId))
  if (!question.value) return

  answers.value = JSON.parse(localStorage.getItem(`answers_${questionId}`) || '[]')
  await nextTick()
  mountViewer()
})

function mountViewer() {
  if (viewerRoot.value && question.value?.content) {
    new Viewer({
      el: viewerRoot.value,
      initialValue: question.value.content,
    })
  }
}

function editQuestion() {
  isEditingQuestion.value = true
}
function cancelQuestionEdit() {
  isEditingQuestion.value = false
  nextTick(() => mountViewer())
}
function saveQuestionEdit() {
  const updated = editorRef.value?.getMarkdown()
  if (!updated) return

  const raw = localStorage.getItem('questions')
  const questions = raw ? JSON.parse(raw) : []
  const idx = questions.findIndex(q => String(q.id) === String(questionId))
  if (idx !== -1) {
    questions[idx].content = updated
    localStorage.setItem('questions', JSON.stringify(questions))
    question.value.content = updated
  }
  isEditingQuestion.value = false
  nextTick(() => mountViewer())
}

function deleteQuestion() {
  if (!confirm('정말 삭제하시겠습니까?')) return
  const raw = localStorage.getItem('questions')
  const questions = raw ? JSON.parse(raw) : []
  const updated = questions.filter(q => String(q.id) !== String(questionId))
  localStorage.setItem('questions', JSON.stringify(updated))
  router.push('/ask')
}

function addAnswer() {
  if (!newAnswer.value.trim()) return
  const a = {
    text: newAnswer.value.trim(),
    date: new Date().toISOString(),
    userId: currentUser.id,
    editing: false,
    temp: '',
  }
  answers.value.push(a)
  localStorage.setItem(`answers_${questionId}`, JSON.stringify(answers.value))
  newAnswer.value = ''
}

function startAnswerEdit(i) {
  answers.value[i].editing = true
  answers.value[i].temp = answers.value[i].text
}
function cancelAnswerEdit(i) {
  answers.value[i].editing = false
  answers.value[i].temp = ''
}
function saveAnswerEdit(i) {
  if (!answers.value[i].temp.trim()) return
  answers.value[i].text = answers.value[i].temp.trim()
  answers.value[i].editing = false
  answers.value[i].temp = ''
  localStorage.setItem(`answers_${questionId}`, JSON.stringify(answers.value))
}
function deleteAnswer(i) {
  if (!confirm('답변을 삭제하시겠습니까?')) return
  answers.value.splice(i, 1)
  localStorage.setItem(`answers_${questionId}`, JSON.stringify(answers.value))
}

function formatDate(dstr) {
  const d = new Date(dstr)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
</script>

<style scoped>
.markdown-viewer {
  border: 1px solid #ccc;
  padding: 1rem;
  margin: 1rem 0;
}
.date {
  font-size: 0.9rem;
  color: #888;
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}
textarea {
  width: 100%;
  height: 80px;
  margin: 0.5rem 0;
  padding: 0.5rem;
}
button {
  margin-right: 0.5rem;
  background-color: #0055aa;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>
