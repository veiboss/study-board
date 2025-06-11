<template>
  <main>
    <h1>📚 정리글</h1>
    <div class="note-list">
      <NoteCard
        v-for="note in notes"
        :key="note.id"
        :note="note"
        @click="goToDetail(note.id)"
      />
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import NoteCard from '@/components/NoteCard.vue'

const notes = ref([])
const router = useRouter()

onMounted(async () => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Supabase 오류:', error)
  } else {
    notes.value = data
  }
})

function goToDetail(id) {
  router.push(`/notes/${id}`)
}
</script>

<style scoped>
.note-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
</style>
