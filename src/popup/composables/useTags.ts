/**
 * 标签管理 Composable
 * 
 * 提供标签的增删查功能
 * 支持从书签中提取所有标签
 */
import { ref, computed } from 'vue'
import type { Bookmark } from '../../types'
import { storage } from '../../utils/storage'

export function useTags() {
  const bookmarks = ref<Bookmark[]>([])

  async function loadBookmarks() {
    const data = await storage.get()
    bookmarks.value = data.bookmarks
  }

  const allTags = computed(() => {
    const tagSet = new Set<string>()
    bookmarks.value.forEach(bookmark => {
      bookmark.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  })

  async function addTagToBookmark(bookmarkId: string, tag: string) {
    const data = await storage.get()
    const bookmark = data.bookmarks.find(b => b.id === bookmarkId)
    if (bookmark) {
      const tags = bookmark.tags || []
      if (!tags.includes(tag)) {
        tags.push(tag)
        await storage.updateBookmark(bookmarkId, { tags })
        await loadBookmarks()
      }
    }
  }

  async function removeTagFromBookmark(bookmarkId: string, tag: string) {
    const data = await storage.get()
    const bookmark = data.bookmarks.find(b => b.id === bookmarkId)
    if (bookmark && bookmark.tags) {
      const tags = bookmark.tags.filter(t => t !== tag)
      await storage.updateBookmark(bookmarkId, { tags })
      await loadBookmarks()
    }
  }

  async function updateBookmarkTags(bookmarkId: string, tags: string[]) {
    await storage.updateBookmark(bookmarkId, { tags })
    await loadBookmarks()
  }

  function getBookmarksByTag(tag: string): Bookmark[] {
    return bookmarks.value.filter(b => b.tags?.includes(tag))
  }

  return {
    bookmarks,
    allTags,
    loadBookmarks,
    addTagToBookmark,
    removeTagFromBookmark,
    updateBookmarkTags,
    getBookmarksByTag
  }
}
