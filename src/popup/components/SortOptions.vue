<script setup lang="ts">
import { ref } from 'vue'
import type { SortOptions, SortType, SortOrder } from '../../types'

const props = defineProps<{
  sortOptions: SortOptions
}>()

const emit = defineEmits<{
  'update:sortOptions': [value: SortOptions]
}>()

const isOpen = ref(false)

const sortTypeOptions: { value: SortType; label: string }[] = [
  { value: 'createdAt', label: '创建时间' },
  { value: 'title', label: '标题' },
  { value: 'updatedAt', label: '更新时间' },
  { value: 'order', label: '自定义' }
]

const sortOrderOptions: { value: SortOrder; label: string }[] = [
  { value: 'desc', label: '降序' },
  { value: 'asc', label: '升序' }
]

function handleSortTypeChange(type: SortType) {
  emit('update:sortOptions', { ...props.sortOptions, type })
  isOpen.value = false
}

function handleSortOrderChange(order: SortOrder) {
  emit('update:sortOptions', { ...props.sortOptions, order })
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
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
      <span class="text-sm text-gray-700 dark:text-gray-300">
        {{ sortTypeOptions.find(o => o.value === sortOptions.type)?.label }}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400" :class="{ 'rotate-180': isOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="isOpen" class="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <div class="p-2 border-b border-gray-200 dark:border-gray-700">
        <div class="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5 mb-1">排序方式</div>
        <button
          v-for="option in sortTypeOptions"
          :key="option.value"
          @click="handleSortTypeChange(option.value)"
          class="w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors"
          :class="[
            sortOptions.type === option.value
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          {{ option.label }}
        </button>
      </div>

      <div class="p-2">
        <div class="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5 mb-1">排序顺序</div>
        <button
          v-for="option in sortOrderOptions"
          :key="option.value"
          @click="handleSortOrderChange(option.value)"
          class="w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors"
          :class="[
            sortOptions.order === option.value
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>
