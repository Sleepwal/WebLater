<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storage } from '../utils/storage'
import type { Bookmark, Group } from '../types'
import { format } from 'date-fns'

const activeTab = ref<'save' | 'list'>('save')

// Form Data
const currentUrl = ref('')
const currentTitle = ref('')
const selectedGroupId = ref('default')
const newGroupName = ref('')
const isCreatingGroup = ref(false)

// List Data
const bookmarks = ref<Bookmark[]>([])
const groups = ref<Group[]>([])
const filterGroupId = ref('all')

const sortedBookmarks = computed(() => {
  let list = bookmarks.value
  if (filterGroupId.value !== 'all') {
    list = list.filter(b => b.groupId === filterGroupId.value)
  }
  return list
})



async function loadData() {
  const data = await storage.get()
  bookmarks.value = data.bookmarks
  groups.value = data.groups
}

onMounted(async () => {
  await loadData()

  // 获取当前标签页信息
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab) {
      currentUrl.value = tab.url || ''
      currentTitle.value = tab.title || ''
    }
  } else {
    // 开发环境模拟
    currentUrl.value = 'https://example.com'
    currentTitle.value = 'Example Domain'
  }
})

async function handleSave() {
  if (!currentUrl.value || !currentTitle.value) return
  
  await storage.addBookmark({
    title: currentTitle.value,
    url: currentUrl.value,
    groupId: selectedGroupId.value
  })
  
  // 保存成功提示或跳转
  await loadData()
  activeTab.value = 'list'
  // 重置分组选择？或者保留上次选择？保留比较好。
}

async function handleCreateGroup() {
  if (!newGroupName.value.trim()) return
  const newGroup = await storage.addGroup(newGroupName.value.trim())
  await loadData()
  selectedGroupId.value = newGroup.id
  isCreatingGroup.value = false
  newGroupName.value = ''
}

async function handleDelete(id: string) {
  await storage.removeBookmark(id)
  await loadData()
}

function openLink(url: string) {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.create({ url })
  } else {
    window.open(url, '_blank')
  }
}

function formatDate(ts: number) {
  return format(new Date(ts), 'MM-dd HH:mm')
}

function getGroupName(id: string) {
  const g = groups.value.find(g => g.id === id)
  return g ? g.name : 'Unknown'
}
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50 text-gray-800 font-sans">
    <!-- Header -->
    <header class="bg-white shadow-sm z-10">
      <div class="px-4 py-3 flex items-center justify-between">
        <h1 class="text-lg font-bold text-blue-600 flex items-center gap-2">
          <span>📚</span> Web Later
        </h1>
        <div class="flex bg-gray-100 rounded-lg p-1 text-sm">
          <button 
            @click="activeTab = 'save'"
            class="px-3 py-1 rounded-md transition-colors"
            :class="activeTab === 'save' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'"
          >
            保存
          </button>
          <button 
            @click="activeTab = 'list'"
            class="px-3 py-1 rounded-md transition-colors"
            :class="activeTab === 'list' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'"
          >
            列表
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto p-4">
      
      <!-- Save Tab -->
      <div v-if="activeTab === 'save'" class="space-y-4">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="mb-3">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">标题</label>
            <input 
              v-model="currentTitle" 
              type="text" 
              class="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm p-2.5"
              placeholder="网页标题"
            >
          </div>
          
          <div class="mb-3">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">链接</label>
            <textarea 
              v-model="currentUrl" 
              rows="2"
              class="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm p-2.5 resize-none"
              placeholder="https://..."
            ></textarea>
          </div>

          <div class="mb-4">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">分组</label>
            <div class="flex gap-2">
              <select 
                v-model="selectedGroupId"
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
            
            <!-- Create Group Input -->
            <div v-if="isCreatingGroup" class="mt-2 flex gap-2 animate-fade-in">
              <input 
                v-model="newGroupName"
                type="text"
                class="flex-1 rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm p-2"
                placeholder="新分组名称"
                @keyup.enter="handleCreateGroup"
              >
              <button 
                @click="handleCreateGroup"
                class="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                确认
              </button>
            </div>
          </div>

          <button 
            @click="handleSave"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            保存到稍后阅读
          </button>
        </div>
      </div>

      <!-- List Tab -->
      <div v-else class="space-y-4">
        <!-- Filter -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            @click="filterGroupId = 'all'"
            class="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border"
            :class="filterGroupId === 'all' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
          >
            全部
          </button>
          <button 
            v-for="g in groups" 
            :key="g.id"
            @click="filterGroupId = g.id"
            class="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border"
            :class="filterGroupId === g.id ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
          >
            {{ g.name }}
          </button>
        </div>

        <!-- List -->
        <div v-if="sortedBookmarks.length === 0" class="text-center py-10 text-gray-400">
          <p>暂无链接</p>
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="item in sortedBookmarks" 
            :key="item.id"
            class="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative"
          >
            <div class="pr-8">
              <h3 
                @click="openLink(item.url)"
                class="font-medium text-gray-800 line-clamp-2 cursor-pointer hover:text-blue-600 mb-1"
                :title="item.title"
              >
                {{ item.title }}
              </h3>
              <div class="flex items-center gap-2 text-xs text-gray-400">
                <span class="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                  {{ getGroupName(item.groupId) }}
                </span>
                <span>{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
            
            <button 
              @click.stop="handleDelete(item.id)"
              class="absolute top-3 right-3 text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
              title="删除"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
