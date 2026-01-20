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
  }
  groupName: string
  groups: Group[]
}>()

const emit = defineEmits<{
  click: [url: string]
  delete: [id: string]
  move: [id: string, newGroupId: string]
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
</script>

<template>
  <div
    class="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative"
  >
    <!-- Normal View -->
    <div v-if="!isMoving" class="pr-16">
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

    <!-- Move View -->
    <div v-else class="pr-2 animate-fade-in">
      <div class="flex items-center gap-2 mb-2">
        <select 
          v-model="selectedGroupId"
          class="flex-1 rounded border-gray-200 bg-gray-50 text-sm py-1 px-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          @click.stop
        >
          <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
        </select>
      </div>
      <div class="flex justify-end gap-2">
        <button 
          @click="cancelMove"
          class="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 rounded"
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

    <!-- Action Buttons (Only visible in Normal View) -->
    <div v-if="!isMoving" class="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        @click="startMove"
        class="text-gray-300 hover:text-blue-500 p-1 rounded-full hover:bg-blue-50 transition-colors"
        title="移动分组"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V7a5 5 0 0 1 10 0v4"/><path d="M16 11V7a5 5 0 0 0-10 0v4"/><path d="M12 11v10"/><path d="M9 21h6"/></svg>
      </button>
      
      <button
        @click="handleDelete"
        class="text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
        title="删除"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>
    </div>
  </div>
</template>
