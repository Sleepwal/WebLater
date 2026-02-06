<script setup lang="ts">
import { ref } from 'vue'
import { useGroups } from '../composables/useGroups'
import CreateGroupInput from './CreateGroupInput.vue'

const props = defineProps<{
  selectedGroupId: string
  isSaved?: boolean
}>()

const emit = defineEmits<{
  'update:selectedGroupId': [value: string]
  save: []
}>()

const { groups, loadGroups, createGroup } = useGroups()
const newGroupName = ref('')
const isCreatingGroup = ref(false)

loadGroups()

async function handleCreateGroup() {
  if (!newGroupName.value.trim()) return
  const newGroup = await createGroup(newGroupName.value.trim())
  emit('update:selectedGroupId', newGroup.id)
  isCreatingGroup.value = false
  newGroupName.value = ''
}

function handleSave() {
  emit('save')
}
</script>

<template>
  <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
    <div class="mb-3">
      <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">标题</label>
      <slot name="title" />
    </div>

    <div class="mb-3">
      <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">链接</label>
      <slot name="url" />
    </div>

    <div class="mb-4">
      <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">分组</label>
      <div class="flex gap-2">
        <select
          :value="selectedGroupId"
          @change="emit('update:selectedGroupId', ($event.target as HTMLSelectElement).value)"
          class="flex-1 rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm p-2.5"
        >
          <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
        </select>
        <button
          @click="isCreatingGroup = !isCreatingGroup"
          class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
          title="新建分组"
        >
          +
        </button>
      </div>

      <CreateGroupInput
        v-model:newGroupName="newGroupName"
        v-model:isCreatingGroup="isCreatingGroup"
        @create="handleCreateGroup"
      />
    </div>

    <div v-if="isSaved" class="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-2 border border-blue-100">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 flex-shrink-0">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      该页面已在列表中
    </div>

    <button
      @click="handleSave"
      :disabled="isSaved"
      class="w-full font-medium py-2.5 rounded-lg transition-all text-white"
      :class="[
        isSaved 
          ? 'bg-gray-300 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.98]'
      ]"
    >
      {{ isSaved ? '已保存' : '保存到稍后阅读' }}
    </button>
  </div>
</template>
