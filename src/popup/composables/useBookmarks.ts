/**
 * 书签管理 Composable
 * 
 * 提供书签数据的增删查功能
 * 封装与 chrome.storage.local 的交互
 */
import { ref, computed } from 'vue'
import { storage } from '../../utils/storage'
import type { Bookmark, SortOptions, ReadStatusFilter } from '../../types'

export function useBookmarks() {
  const bookmarks = ref<Bookmark[]>([])

  async function loadBookmarks() {
    const data = await storage.get()
    bookmarks.value = data.bookmarks
  }

  async function saveBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>) {
    await storage.addBookmark(bookmark)
    await loadBookmarks()
  }

  async function updateBookmark(id: string, updates: Partial<Omit<Bookmark, 'id' | 'createdAt'>>) {
    await storage.updateBookmark(id, updates)
    await loadBookmarks()
  }

  async function removeBookmark(id: string) {
    await storage.removeBookmark(id)
    await loadBookmarks()
  }

  async function toggleReadStatus(id: string) {
    const bookmark = bookmarks.value.find(b => b.id === id)
    if (bookmark) {
      await updateBookmark(id, { 
        isRead: !bookmark.isRead,
        updatedAt: Date.now()
      })
    }
  }

  async function markAsRead(id: string) {
    await updateBookmark(id, { 
      isRead: true,
      updatedAt: Date.now()
    })
  }

  async function markAsUnread(id: string) {
    await updateBookmark(id, { 
      isRead: false,
      updatedAt: Date.now()
    })
  }

  async function batchMarkAsRead(ids: string[]) {
    await Promise.all(ids.map(id => markAsRead(id)))
  }

  async function batchMarkAsUnread(ids: string[]) {
    await Promise.all(ids.map(id => markAsUnread(id)))
  }

  function sortBookmarks(bookmarkList: Bookmark[], options: SortOptions): Bookmark[] {
    const sorted = [...bookmarkList]
    
    sorted.sort((a, b) => {
      let comparison = 0
      
      switch (options.type) {
        case 'createdAt':
          comparison = a.createdAt - b.createdAt
          break
        case 'updatedAt':
          comparison = (a.updatedAt || a.createdAt) - (b.updatedAt || b.createdAt)
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'order':
          comparison = (a.order || 0) - (b.order || 0)
          break
      }
      
      return options.order === 'desc' ? -comparison : comparison
    })
    
    return sorted
  }

  function filterByReadStatus(bookmarkList: Bookmark[], filter: ReadStatusFilter): Bookmark[] {
    if (filter === 'all') return bookmarkList
    
    return bookmarkList.filter(b => {
      if (filter === 'read') return b.isRead
      if (filter === 'unread') return !b.isRead
      return true
    })
  }

  const readCount = computed(() => bookmarks.value.filter(b => b.isRead).length)
  const unreadCount = computed(() => bookmarks.value.filter(b => !b.isRead).length)

  return {
    bookmarks,
    readCount,
    unreadCount,
    loadBookmarks,
    saveBookmark,
    updateBookmark,
    removeBookmark,
    toggleReadStatus,
    markAsRead,
    markAsUnread,
    batchMarkAsRead,
    batchMarkAsUnread,
    sortBookmarks,
    filterByReadStatus
  }
}
