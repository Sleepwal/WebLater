<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useSearch } from '../composables/useSearch'

const props = defineProps<{
  isOpen?: boolean
}>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  search: [query: string]
}>()

const { searchQuery, searchHistory, loadSearchHistory, saveSearchHistory, clearSearchHistory } = useSearch()
const showHistory = ref(false)
const searchInput = ref<HTMLInputElement>()

loadSearchHistory()

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})

function handleSearch() {
  if (searchQuery.value.trim()) {
    saveSearchHistory(searchQuery.value)
    emit('search', searchQuery.value)
    showHistory.value = false
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    handleSearch()
  } else if (e.key === 'Escape') {
    emit('update:isOpen', false)
  }
}

function selectHistory(query: string) {
  searchQuery.value = query
  handleSearch()
}

function clearHistory() {
  clearSearchHistory()
  showHistory.value = false
}

function toggleHistory() {
  if (searchHistory.value.length > 0) {
    showHistory.value = !showHistory.value
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50" @click.self="emit('update:isOpen', false)">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="搜索书签..."
            class="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            @keydown="handleKeyDown"
            @focus="toggleHistory"
          >
          <kbd class="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 rounded">ESC</kbd>
        </div>
      </div>

      <div v-if="showHistory && searchHistory.length > 0" class="max-h-64 overflow-y-auto">
        <div class="px-4 py-2 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
          <span class="text-xs text-gray-500 dark:text-gray-400">搜索历史</span>
          <button
            @click="clearHistory"
            class="text-xs text-red-500 hover:text-red-700"
          >
            清空
          </button>
        </div>
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <button
            v-for="item in searchHistory"
            :key="item.query"
            @click="selectHistory(item.query)"
            class="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-gray-700 dark:text-gray-300">{{ item.query }}</span>
          </button>
        </div>
      </div>

      <div v-if="searchQuery && !showHistory" class="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="handleSearch"
          class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          搜索
        </button>
      </div>
    </div>
  </div>
</template>
