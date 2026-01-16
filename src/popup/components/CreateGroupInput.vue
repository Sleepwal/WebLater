<script setup lang="ts">
const props = defineProps<{
  newGroupName: string
  isCreatingGroup: boolean
}>()

const emit = defineEmits<{
  'update:newGroupName': [value: string]
  'update:isCreatingGroup': [value: boolean]
  create: []
}>()

function handleCreate() {
  if (!props.newGroupName.trim()) return
  emit('create')
}
</script>

<template>
  <div v-if="isCreatingGroup" class="mt-2 flex gap-2 animate-fade-in">
    <input
      :value="newGroupName"
      @input="emit('update:newGroupName', ($event.target as HTMLInputElement).value)"
      type="text"
      class="flex-1 rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm p-2"
      placeholder="新分组名称"
      @keyup.enter="handleCreate"
    >
    <button
      @click="handleCreate"
      class="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
    >
      确认
    </button>
  </div>
</template>
