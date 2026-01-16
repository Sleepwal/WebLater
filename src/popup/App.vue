<script setup lang="ts">
import { ref } from 'vue'
import { useBookmarks } from './composables/useBookmarks'
import { useCurrentTab } from './composables/useCurrentTab'
import AppHeader from './components/AppHeader.vue'
import SaveForm from './components/SaveForm.vue'
import BookmarkList from './components/BookmarkList.vue'

const activeTab = ref<'save' | 'list'>('save')
const selectedGroupId = ref('default')
const filterGroupId = ref('all')
const currentUrl = ref('')
const currentTitle = ref('')

const { saveBookmark } = useBookmarks()
useCurrentTab()

async function handleSave() {
  if (!currentUrl.value || !currentTitle.value) return

  await saveBookmark({
    title: currentTitle.value,
    url: currentUrl.value,
    groupId: selectedGroupId.value
  })

  activeTab.value = 'list'
}
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50 text-gray-800 font-sans">
    <AppHeader
      :active-tab="activeTab"
      @change="activeTab = $event"
    />

    <main class="flex-1 overflow-y-auto p-4">
      <div v-if="activeTab === 'save'" class="space-y-4">
        <SaveForm
          v-model:selected-group-id="selectedGroupId"
          @save="handleSave"
        >
          <template #title>
            <input
              v-model="currentTitle"
              type="text"
              class="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm p-2.5"
              placeholder="网页标题"
            >
          </template>

          <template #url>
            <textarea
              v-model="currentUrl"
              rows="2"
              class="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm p-2.5 resize-none"
              placeholder="https://..."
            ></textarea>
          </template>
        </SaveForm>
      </div>

      <BookmarkList
        v-else
        v-model:filter-group-id="filterGroupId"
      />
    </main>
  </div>
</template>
