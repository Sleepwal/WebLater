/**
 * 搜索功能 Composable
 * 
 * 提供书签搜索、搜索历史管理功能
 * 支持按标题、URL、标签进行模糊搜索
 */
import { ref } from 'vue'
import type { Bookmark, SearchHistory } from '../../types'
import { storage } from '../../utils/storage'

export function useSearch() {
  const searchQuery = ref('')
  const searchHistory = ref<SearchHistory[]>([])
  const isSearching = ref(false)

  const MAX_HISTORY = 10

  async function loadSearchHistory() {
    const data = await storage.get()
    searchHistory.value = data.searchHistory || []
  }

  async function saveSearchHistory(query: string) {
    if (!query.trim()) return

    const history = searchHistory.value.filter(h => h.query !== query)
    history.unshift({
      query: query.trim(),
      timestamp: Date.now()
    })

    searchHistory.value = history.slice(0, MAX_HISTORY)
    await storage.set({ searchHistory: searchHistory.value })
  }

  async function clearSearchHistory() {
    searchHistory.value = []
    await storage.set({ searchHistory: [] })
  }

  function fuzzyMatch(text: string, query: string): boolean {
    if (!query) return true
    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    
    const queryChars = lowerQuery.split('')
    let textIndex = 0
    
    for (const char of queryChars) {
      textIndex = lowerText.indexOf(char, textIndex)
      if (textIndex === -1) return false
      textIndex++
    }
    
    return true
  }

  function searchBookmarks(bookmarks: Bookmark[], query: string): Bookmark[] {
    if (!query.trim()) return bookmarks

    return bookmarks.filter(bookmark => {
      const matchTitle = fuzzyMatch(bookmark.title, query)
      const matchUrl = fuzzyMatch(bookmark.url, query)
      const matchTags = bookmark.tags?.some(tag => 
        fuzzyMatch(tag, query)
      ) ?? false

      return matchTitle || matchUrl || matchTags
    })
  }

  function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  function escapeHtml(str: string): string {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }
    return str.replace(/[&<>"']/g, char => htmlEntities[char] || char)
  }

  function highlightMatch(text: string, query: string): string {
    if (!query.trim()) return escapeHtml(text)

    const escapedText = escapeHtml(text)
    const escapedQuery = escapeRegExp(query)
    const regex = new RegExp(`(${escapedQuery})`, 'gi')
    return escapedText.replace(regex, (match) => {
      return `<mark class="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">${match}</mark>`
    })
  }

  return {
    searchQuery,
    searchHistory,
    isSearching,
    loadSearchHistory,
    saveSearchHistory,
    clearSearchHistory,
    searchBookmarks,
    highlightMatch
  }
}
