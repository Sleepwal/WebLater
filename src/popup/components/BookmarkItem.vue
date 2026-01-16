<script setup lang="ts">
import { format } from 'date-fns'

const props = defineProps<{
  item: {
    id: string
    title: string
    url: string
    groupId: string
    createdAt: number
  }
  groupName: string
}>()

const emit = defineEmits<{
  click: [url: string]
  delete: [id: string]
}>()

function formatDate(ts: number) {
  return format(new Date(ts), 'MM-dd HH:mm')
}

function handleDelete(e: Event) {
  e.stopPropagation()
  emit('delete', props.item.id)
}
</script>

<template>
  <div
    class="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative"
  >
    <div class="pr-8">
      <h3
        @click="emit('click', item.url)"
        class="font-medium text-gray-800 line-clamp-2 cursor-pointer hover:text-blue-600 mb-1"
        :title="item.title"
      >
        {{ item.title }}
      </h3>
      <div class="flex items-center gap-2 text-xs text-gray-400">
        <span class="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
          {{ groupName }}
        </span>
        <span>{{ formatDate(item.createdAt) }}</span>
      </div>
    </div>

    <button
      @click="handleDelete"
      class="absolute top-3 right-3 text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
      title="删除"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
    </button>
  </div>
</template>
