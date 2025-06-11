<template>
  <div ref="editorRoot" class="editor-wrapper" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'

const props = defineProps({
  initialValue: String
})

const editorRoot = ref(null)
const editorInstance = ref(null)

onMounted(() => {
  editorInstance.value = new Editor({
    el: editorRoot.value,
    height: '400px',
    initialEditType: 'markdown',
    previewStyle: 'vertical',
    initialValue: props.initialValue || '',
  })
})

function getMarkdown() {
  return editorInstance.value?.getMarkdown() || ''
}

defineExpose({ getMarkdown })
</script>

<style scoped>
.editor-wrapper {
  margin: 1rem 0;
}
</style>
