<script setup lang="ts">
import { ref } from 'vue'
import { format } from 'date-fns'
import type { Group } from '../../types'

const props = defineProps<{
  item: {
    id: string
    title: string
    url: string
    groupId: string
    createdAt: number
    tags?: string[]
    isRead?: boolean
    notes?: string
  }
  groupName: string
  groups: Group[]
}>()

const emit = defineEmits<{
  click: [url: string]
  delete: [id: string]
  move: [id: string, newGroupId: string]
  toggleRead: [id: string]
}>()

const isMoving = ref(false)
const selectedGroupId = ref('')

function formatDate(ts: number) {
  return format(new Date(ts), 'MM-dd HH:mm')
}

function handleDelete(e: Event) {
  e.stopPropagation()
  emit('delete', props.item.id)
}

function startMove(e: Event) {
  e.stopPropagation()
  selectedGroupId.value = props.item.groupId
  isMoving.value = true
}

function confirmMove(e: Event) {
  e.stopPropagation()
  if (selectedGroupId.value !== props.item.groupId) {
    emit('move', props.item.id, selectedGroupId.value)
  }
  isMoving.value = false
}

function cancelMove(e: Event) {
  e.stopPropagation()
  isMoving.value = false
}

function handleToggleRead(e: Event) {
  e.stopPropagation()
  emit('toggleRead', props.item.id)
}

function handleClick() {
  emit('click', props.item.url)
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group relative"
    :class="{ 'opacity-60': item.isRead }"
  >
    <div v-if="!isMoving" class="pr-20">
      <div class="flex items-start gap-2 mb-1">
        <button
          @click="handleToggleRead"
          class="mt-0.5 flex-shrink-0"
          :title="item.isRead ? '标记为未读' : '标记为已读'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 transition-colors"
            :class="item.isRead ? 'text-gray-400' : 'text-blue-500'"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="item.isRead ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M5 13l4 4L19 7'"
            />
          </svg>
        </button>
        <h3
          @click="handleClick"
          class="font-medium text-gray-800 dark:text-gray-200 line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex-1"
          :class="{ 'line-through': item.isRead }"
          :title="item.title"
        >
          {{ item.title }}
        </h3>
      </div>

      <div v-if="item.tags && item.tags.length > 0" class="flex flex-wrap gap-1 mb-2">
        <span
          v-for="tag in item.tags"
          :key="tag"
          class="inline-flex items-center px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded"
        >
          {{ tag }}
        </span>
      </div>

      <div class="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <span class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">
          {{ groupName }}
        </span>
        <span class="text-[10px] whitespace-nowrap">{{ formatDate(item.createdAt) }}</span>
        <svg
          v-if="item.notes"
          xmlns="http://www.w3.org/2000/svg"
          class="w-3.5 h-3 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          title="有笔记"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </div>
    </div>

    <div v-else class="pr-2 animate-fade-in">
      <div class="flex items-center gap-2 mb-2">
        <select
          v-model="selectedGroupId"
          class="flex-1 rounded border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm py-1 px-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:text-white"
          @click.stop
        >
          <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
        </select>
      </div>
      <div class="flex justify-end gap-2">
        <button
          @click="cancelMove"
          class="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded"
        >
          取消
        </button>
        <button
          @click="confirmMove"
          class="px-2 py-0.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded"
        >
          确认
        </button>
      </div>
    </div>

    <div v-if="!isMoving" class="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        @click="startMove"
        class="text-gray-300 hover:text-blue-500 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
        title="移动分组"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V7a5 5 0 0 1 10 0v4"/><path d="M16 11V7a5 5 0 0 0-10 0v4"/><path d="M12 11v10"/><path d="M9 21h6"/></svg>
      </button>

      <button
        @click="handleDelete"
        class="text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
        title="删除"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>
    </div>
  </div>
</template>
