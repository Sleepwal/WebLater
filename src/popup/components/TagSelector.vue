<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTags } from '../composables/useTags'

const props = defineProps<{
  modelValue: string[]
  bookmarkId?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const { allTags, loadBookmarks, addTagToBookmark, removeTagFromBookmark } = useTags()
const isOpen = ref(false)
const newTag = ref('')

loadBookmarks()

const selectedTags = ref<string[]>([...props.modelValue])

watch(() => props.modelValue, (newValue) => {
  selectedTags.value = [...newValue]
})

function toggleTag(tag: string) {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(index, 1)
  }
  emit('update:modelValue', selectedTags.value)
}

async function addNewTag() {
  const tag = newTag.value.trim()
  if (tag && !selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
    emit('update:modelValue', selectedTags.value)
    if (props.bookmarkId) {
      await addTagToBookmark(props.bookmarkId, tag)
    }
    newTag.value = ''
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    addNewTag()
  }
}

function removeTag(tag: string) {
  const index = selectedTags.value.indexOf(tag)
  if (index !== -1) {
    selectedTags.value.splice(index, 1)
    emit('update:modelValue', selectedTags.value)
    if (props.bookmarkId) {
      removeTagFromBookmark(props.bookmarkId, tag)
    }
  }
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[200px]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
      <span class="text-sm text-gray-700 dark:text-gray-300">
        {{ selectedTags.length > 0 ? `${selectedTags.length} 个标签` : '选择标签' }}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400 ml-auto" :class="{ 'rotate-180': isOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="isOpen" class="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
      <div class="p-3 border-b border-gray-200 dark:border-gray-700">
        <div class="flex gap-2">
          <input
            v-model="newTag"
            type="text"
            placeholder="添加新标签..."
            class="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            @keydown="handleKeyDown"
          >
          <button
            @click="addNewTag"
            class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            添加
          </button>
        </div>
      </div>

      <div class="p-2 max-h-64 overflow-y-auto">
        <div v-if="allTags.length === 0" class="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
          暂无标签
        </div>
        <button
          v-for="tag in allTags"
          :key="tag"
          @click="toggleTag(tag)"
          class="w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between group"
          :class="[
            selectedTags.includes(tag)
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          <span>{{ tag }}</span>
          <svg
            v-if="selectedTags.includes(tag)"
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      <div v-if="selectedTags.length > 0" class="p-3 border-t border-gray-200 dark:border-gray-700">
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">已选标签</div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in selectedTags"
            :key="tag"
            class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-md"
          >
            {{ tag }}
            <button
              @click="removeTag(tag)"
              class="hover:text-blue-900 dark:hover:text-blue-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
