import { ref } from 'vue'
import { storage } from '../../utils/storage'
import type { Bookmark } from '../../types'

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

  async function removeBookmark(id: string) {
    await storage.removeBookmark(id)
    await loadBookmarks()
  }

  return {
    bookmarks,
    loadBookmarks,
    saveBookmark,
    removeBookmark
  }
}
