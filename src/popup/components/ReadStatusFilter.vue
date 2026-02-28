<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ReadStatusFilter } from '../../types'

const props = defineProps<{
  modelValue: ReadStatusFilter
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ReadStatusFilter]
}>()

const isOpen = ref(false)

const selectedFilter = ref<ReadStatusFilter>(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  selectedFilter.value = newValue
})

const filterOptions: { value: ReadStatusFilter; label: string; count?: number }[] = [
  { value: 'all', label: '全部' },
  { value: 'unread', label: '未读' },
  { value: 'read', label: '已读' }
]

function selectFilter(filter: ReadStatusFilter) {
  selectedFilter.value = filter
  emit('update:modelValue', filter)
  isOpen.value = false
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span class="text-sm text-gray-700 dark:text-gray-300">
        {{ filterOptions.find(o => o.value === selectedFilter)?.label }}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400" :class="{ 'rotate-180': isOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="isOpen" class="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <button
        v-for="option in filterOptions"
        :key="option.value"
        @click="selectFilter(option.value)"
        class="w-full text-left px-3 py-2 text-sm rounded-md transition-colors"
        :class="[
          selectedFilter === option.value
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
