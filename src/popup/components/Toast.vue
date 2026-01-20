<script setup lang="ts">
import { onMounted } from 'vue'

const props = defineProps<{
  message: string
  type?: 'success' | 'error'
  duration?: number
}>()

const emit = defineEmits<{
  close: []
}>()

onMounted(() => {
  if (props.duration !== 0) {
    setTimeout(() => {
      emit('close')
    }, props.duration || 3000)
  }
})
</script>

<template>
  <div
    class="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-white transition-all z-50 flex items-center gap-2 animate-fade-in-down"
    :class="type === 'error' ? 'bg-red-500' : 'bg-green-600'"
  >
    <span v-if="type === 'error'">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
    </span>
    <span v-else>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    </span>
    {{ message }}
  </div>
</template>

<style scoped>
@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
.animate-fade-in-down {
  animation: fade-in-down 0.3s ease-out forwards;
}
</style>
