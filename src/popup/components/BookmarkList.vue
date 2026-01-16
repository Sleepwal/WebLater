<script setup lang="ts">
import { useBookmarks } from '../composables/useBookmarks'
import { useGroups } from '../composables/useGroups'
import { computed } from 'vue'
import GroupFilter from './GroupFilter.vue'
import BookmarkItem from './BookmarkItem.vue'

const props = defineProps<{
  filterGroupId: string
}>()

const emit = defineEmits<{
  'update:filterGroupId': [value: string]
}>()

const { bookmarks: allBookmarks, loadBookmarks, removeBookmark } = useBookmarks()
const { groups, loadGroups, getGroupName } = useGroups()

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
  await removeBookmark(id)
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
        @click="openLink"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>
