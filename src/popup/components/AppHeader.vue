<script setup lang="ts">
const props = defineProps<{
  activeTab: 'save' | 'list'
}>()

const emit = defineEmits<{
  change: [tab: 'save' | 'list']
}>()
</script>

<template>
  <header class="bg-white shadow-sm z-10">
    <div class="px-4 py-3 flex items-center justify-between">
      <h1 class="text-lg font-bold text-blue-600 flex items-center gap-2">
        <span>📚</span> Web Later
      </h1>
      <div class="flex bg-gray-100 rounded-lg p-1 text-sm">
        <button
          @click="emit('change', 'save')"
          class="px-3 py-1 rounded-md transition-colors"
          :class="activeTab === 'save' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'"
        >
          保存
        </button>
        <button
          @click="emit('change', 'list')"
          class="px-3 py-1 rounded-md transition-colors"
          :class="activeTab === 'list' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'"
        >
          列表
        </button>
      </div>
    </div>
  </header>
</template>
