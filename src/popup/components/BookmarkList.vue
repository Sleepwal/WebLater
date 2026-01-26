<script setup lang="ts">
import { useBookmarks } from '../composables/useBookmarks'
import { useGroups } from '../composables/useGroups'
import { ref, computed, watch } from 'vue'
import GroupFilter from './GroupFilter.vue'
import BookmarkItem from './BookmarkItem.vue'
import GroupModal from './GroupModal.vue'

const props = defineProps<{
  filterGroupId: string
}>()

const emit = defineEmits<{
  (e: 'update:filterGroupId', value: string): void
  (e: 'notify', message: string, type: 'success' | 'error'): void
}>()

const { bookmarks: allBookmarks, loadBookmarks, removeBookmark, updateBookmark } = useBookmarks()
const { groups, loadGroups, getGroupName } = useGroups()

const isGroupModalOpen = ref(false)

// 如果当前筛选的分组被删除了，重置筛选到“全部”
watch(groups, (newGroups) => {
  if (props.filterGroupId !== 'all' && !newGroups.find(g => g.id === props.filterGroupId)) {
    emit('update:filterGroupId', 'all')
  }
}, { deep: true })

const filteredBookmarks = computed(() => {
  let list = allBookmarks.value
  if (props.filterGroupId !== 'all') {
    list = list.filter(b => b.groupId === props.filterGroupId)
  }
  return list
})

async function initData() {
  await Promise.all([loadBookmarks(), loadGroups()])
}

initData()

async function handleDelete(id: string) {
  try {
    await removeBookmark(id)
    emit('notify', '删除成功', 'success')
  } catch (error) {
    emit('notify', '删除失败', 'error')
  }
}

async function handleMove(id: string, newGroupId: string) {
  try {
    await updateBookmark(id, { groupId: newGroupId })
    emit('notify', '移动成功', 'success')
  } catch (error) {
    emit('notify', '移动失败', 'error')
  }
}

function openLink(url: string) {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.create({ url })
  } else {
    window.open(url, '_blank')
  }
}
</script>

<template>
  <div class="space-y-4">
    <GroupFilter
      :groups="groups"
      :filterGroupId="filterGroupId"
      @update:filterGroupId="emit('update:filterGroupId', $event)"
      @manage="isGroupModalOpen = true"
    />

    <GroupModal
      v-if="isGroupModalOpen"
      @close="isGroupModalOpen = false"
      @notify="(msg, type) => emit('notify', msg, type)"
    />

    <div v-if="filteredBookmarks.length === 0" class="text-center py-10 text-gray-400">
      <p>暂无链接</p>
    </div>

    <div v-else class="space-y-3">
      <BookmarkItem
        v-for="item in filteredBookmarks"
        :key="item.id"
        :item="item"
        :group-name="getGroupName(item.groupId)"
        :groups="groups"
        @click="openLink"
        @delete="handleDelete"
        @move="handleMove"
      />
    </div>
  </div>
</template>
