<script setup lang="ts">
import { ref } from 'vue'
import { useGroups } from '../composables/useGroups'
import CreateGroupInput from './CreateGroupInput.vue'

const props = defineProps<{
  selectedGroupId: string
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

    <button
      @click="handleSave"
      class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
    >
      保存到稍后阅读
    </button>
  </div>
</template>
