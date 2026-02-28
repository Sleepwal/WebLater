<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBookmarks } from './composables/useBookmarks'
import { useCurrentTab } from './composables/useCurrentTab'
import { useTheme } from './composables/useTheme'
import AppHeader from './components/AppHeader.vue'
import SaveForm from './components/SaveForm.vue'
import BookmarkList from './components/BookmarkList.vue'
import Toast from './components/Toast.vue'
import SearchBar from './components/SearchBar.vue'
import ImportExportModal from './components/ImportExportModal.vue'

const activeTab = ref<'save' | 'list'>('save')
const selectedGroupId = ref('default')
const selectedTags = ref<string[]>([])
const filterGroupId = ref('all')
const isSearchOpen = ref(false)
const isImportExportOpen = ref(false)

const toastState = ref<{
  show: boolean
  message: string
  type: 'success' | 'error'
}>({
  show: false,
  message: '',
  type: 'success'
})

const { saveBookmark, bookmarks, loadBookmarks } = useBookmarks()
const { currentUrl, currentTitle } = useCurrentTab()
const { theme, toggleTheme } = useTheme()

onMounted(() => {
  loadBookmarks()
  document.addEventListener('keydown', handleKeyboardShortcut)
})

const isSaved = computed(() => {
  return bookmarks.value.some(b => b.url === currentUrl.value)
})

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toastState.value = { show: true, message, type }
}

async function handleSave() {
  if (!currentUrl.value || !currentTitle.value) return

  try {
    await saveBookmark({
      title: currentTitle.value,
      url: currentUrl.value,
      groupId: selectedGroupId.value,
      tags: selectedTags.value
    })
    showToast('保存成功')
    activeTab.value = 'list'
    selectedTags.value = []
  } catch (error) {
    showToast('保存失败', 'error')
  }
}

function handleKeyboardShortcut(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    isSearchOpen.value = true
  }
}

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboardShortcut)
})
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
    <AppHeader
      :active-tab="activeTab"
      @change="activeTab = $event"
    >
      <template #actions>
        <button
          @click="isSearchOpen = true"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="搜索 (Ctrl+K)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button
          @click="toggleTheme"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          :title="theme === 'light' ? '切换到暗色主题' : '切换到亮色主题'"
        >
          <svg v-if="theme === 'light'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
        <button
          @click="isImportExportOpen = true"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="导入导出"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </button>
      </template>
    </AppHeader>

    <Toast
      v-if="toastState.show"
      :message="toastState.message"
      :type="toastState.type"
      @close="toastState.show = false"
    />

    <main class="flex-1 overflow-y-auto p-4">
      <div v-if="activeTab === 'save'" class="space-y-4">
        <SaveForm
          v-model:selected-group-id="selectedGroupId"
          v-model:selected-tags="selectedTags"
          :is-saved="isSaved"
          @save="handleSave"
        >
          <template #title>
            <input
              v-model="currentTitle"
              type="text"
              class="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all text-sm p-2.5 dark:text-white"
              placeholder="网页标题"
            >
          </template>

          <template #url>
            <textarea
              v-model="currentUrl"
              rows="2"
              class="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all text-sm p-2.5 resize-none dark:text-white"
              placeholder="https://..."
            ></textarea>
          </template>
        </SaveForm>
      </div>

      <BookmarkList
        v-else
        v-model:filter-group-id="filterGroupId"
        @notify="showToast"
      />
    </main>

    <SearchBar
      v-model:is-open="isSearchOpen"
      @search="isSearchOpen = false"
    />

    <ImportExportModal
      v-model:is-open="isImportExportOpen"
      @notify="showToast"
    />
  </div>
</template>
