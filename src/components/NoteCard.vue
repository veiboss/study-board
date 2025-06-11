<!-- src/components/NoteCard.vue -->
<template>
  <div class="note-card" @click="$emit('click')">
    <h3>{{ note.title }}</h3>
    <p><strong>카테고리:</strong> {{ note.category }}</p>
    <p>{{ note.content.slice(0, 40) }}...</p>
    <p class="date">작성일: {{ formatDate(note.created_at) }}</p>
  </div>
</template>

<script setup>
defineProps({ note: Object })

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
</script>

<style scoped>
.note-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
}
.note-card:hover {
  background-color: #f7f7f7;
}
.date {
  font-size: 0.8rem;
  color: gray;
}
</style>
