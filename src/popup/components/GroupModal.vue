<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGroups } from '../composables/useGroups'
import type { Group } from '../../types'

const emit = defineEmits<{
  close: []
  notify: [message: string, type: 'success' | 'error']
}>()

const { groups, loadGroups, createGroup, removeGroup, updateGroup } = useGroups()

const newGroupName = ref('')
const editingGroupId = ref<string | null>(null)
const editingName = ref('')

onMounted(() => {
  loadGroups()
})

async function handleAddGroup() {
  if (!newGroupName.value.trim()) return
  try {
    await createGroup(newGroupName.value.trim())
    newGroupName.value = ''
    emit('notify', '创建分组成功', 'success')
  } catch (error) {
    emit('notify', '创建分组失败', 'error')
  }
}

async function handleDeleteGroup(id: string) {
  if (id === 'default') return
  try {
    await removeGroup(id)
    emit('notify', '删除分组成功', 'success')
  } catch (error) {
    emit('notify', '删除分组失败', 'error')
  }
}

function startEditing(group: Group) {
  if (group.id === 'default') return
  editingGroupId.value = group.id
  editingName.value = group.name
}

async function saveEdit() {
  if (!editingGroupId.value || !editingName.value.trim()) {
    editingGroupId.value = null
    return
  }
  try {
    await updateGroup(editingGroupId.value, { name: editingName.value.trim() })
    editingGroupId.value = null
    emit('notify', '重命名成功', 'success')
  } catch (error) {
    emit('notify', '重命名失败', 'error')
  }
}

function cancelEdit() {
  editingGroupId.value = null
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col max-h-[80vh]">
      <div class="p-4 border-b flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-800">管理分组</h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="p-4 flex-1 overflow-y-auto space-y-4">
        <!-- Add Group -->
        <div class="flex gap-2">
          <input
            v-model="newGroupName"
            @keyup.enter="handleAddGroup"
            type="text"
            placeholder="新分组名称..."
            class="flex-1 rounded-lg border-gray-200 text-sm p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          />
          <button
            @click="handleAddGroup"
            class="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            添加
          </button>
        </div>

        <!-- Group List -->
        <div class="space-y-2">
          <div
            v-for="g in groups"
            :key="g.id"
            class="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 group"
          >
            <div v-if="editingGroupId === g.id" class="flex-1 flex gap-2">
              <input
                v-model="editingName"
                v-focus
                @keyup.enter="saveEdit"
                @keyup.esc="cancelEdit"
                @blur="saveEdit"
                type="text"
                class="flex-1 rounded border-gray-200 text-sm px-2 py-1 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div v-else class="flex-1 flex items-center gap-2">
              <span class="text-sm font-medium text-gray-700">{{ g.name }}</span>
              <span v-if="g.id === 'default'" class="text-[10px] bg-gray-200 text-gray-500 px-1 rounded">系统</span>
            </div>

            <div class="flex items-center gap-1" v-if="g.id !== 'default'">
              <button
                v-if="editingGroupId !== g.id"
                @click="startEditing(g)"
                class="p-1 text-gray-400 hover:text-blue-500 rounded hover:bg-blue-50 transition-colors"
                title="重命名"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button
                v-if="editingGroupId !== g.id"
                @click="handleDeleteGroup(g.id)"
                class="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                title="删除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 border-t text-center">
        <p class="text-[10px] text-gray-400">删除分组后，该组下的书签将自动归入“默认”分组</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// Custom directive for focusing input
const vFocus = {
  mounted: (el: HTMLElement) => el.focus()
}
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
</style>
