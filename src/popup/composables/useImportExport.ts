/**
 * 导入导出 Composable
 * 
 * 提供书签数据的导入导出功能
 * 支持 JSON 和 CSV 格式
 */
import { storage } from '../../utils/storage'
import type { StorageSchema, Bookmark } from '../../types'

export function useImportExport() {
  async function exportAsJSON(): Promise<string> {
    const data = await storage.get()
    const exportData = {
      version: '1.0',
      exportedAt: Date.now(),
      data
    }
    return JSON.stringify(exportData, null, 2)
  }

  async function exportAsCSV(): Promise<string> {
    const data = await storage.get()
    const headers = ['Title', 'URL', 'Group', 'Tags', 'Created At', 'Updated At', 'Is Read', 'Notes']
    const rows = data.bookmarks.map(bookmark => [
      `"${bookmark.title.replace(/"/g, '""')}"`,
      `"${bookmark.url}"`,
      `"${bookmark.groupId}"`,
      `"${(bookmark.tags || []).join(', ')}"`,
      bookmark.createdAt,
      bookmark.updatedAt || '',
      bookmark.isRead ? 'Yes' : 'No',
      `"${(bookmark.notes || '').replace(/"/g, '""')}"`
    ])

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  }

  async function downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function exportJSON() {
    const content = await exportAsJSON()
    const filename = `web-later-export-${new Date().toISOString().split('T')[0]}.json`
    await downloadFile(content, filename, 'application/json')
  }

  async function exportCSV() {
    const content = await exportAsCSV()
    const filename = `web-later-export-${new Date().toISOString().split('T')[0]}.csv`
    await downloadFile(content, filename, 'text/csv')
  }

  function validateImportData(data: any): data is StorageSchema {
    if (!data || typeof data !== 'object') return false
    if (!Array.isArray(data.bookmarks)) return false
    if (!Array.isArray(data.groups)) return false

    for (const bookmark of data.bookmarks) {
      if (!bookmark.id || !bookmark.title || !bookmark.url || !bookmark.groupId) {
        return false
      }
    }

    for (const group of data.groups) {
      if (!group.id || !group.name) {
        return false
      }
    }

    return true
  }

  async function importFromJSON(file: File): Promise<{ success: boolean; message: string; data?: StorageSchema }> {
    try {
      const content = await file.text()
      const parsed = JSON.parse(content)

      let importData: StorageSchema

      if (parsed.version && parsed.data) {
        if (!validateImportData(parsed.data)) {
          return { success: false, message: '数据格式无效' }
        }
        importData = parsed.data
      } else {
        if (!validateImportData(parsed)) {
          return { success: false, message: '数据格式无效' }
        }
        importData = parsed
      }

      return { success: true, message: '导入成功', data: importData }
    } catch (error) {
      return { success: false, message: '解析文件失败' }
    }
  }

  async function importFromCSV(file: File): Promise<{ success: boolean; message: string; data?: StorageSchema }> {
    try {
      const content = await file.text()
      const lines = content.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        return { success: false, message: 'CSV 文件为空或格式错误' }
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const bookmarks: Bookmark[] = []
      const groupNameMap = new Map<string, string>()
      const existingData = await storage.get()
      
      existingData.groups.forEach(g => {
        groupNameMap.set(g.name.toLowerCase(), g.id)
        groupNameMap.set(g.id, g.id)
      })

      const newGroups: { id: string; name: string; order: number }[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        const bookmark: Partial<Bookmark> = {}

        headers.forEach((header, index) => {
          const value = values[index]?.replace(/^"|"$/g, '').replace(/""/g, '"') || ''
          
          if (header.includes('title')) bookmark.title = value
          else if (header.includes('url')) bookmark.url = value
          else if (header.includes('group')) {
            const groupName = value.trim()
            if (groupName) {
              const normalizedName = groupName.toLowerCase()
              if (groupNameMap.has(normalizedName)) {
                bookmark.groupId = groupNameMap.get(normalizedName)!
              } else {
                const newGroupId = crypto.randomUUID()
                groupNameMap.set(normalizedName, newGroupId)
                groupNameMap.set(newGroupId, newGroupId)
                newGroups.push({ id: newGroupId, name: groupName, order: existingData.groups.length + newGroups.length })
                bookmark.groupId = newGroupId
              }
            }
          }
          else if (header.includes('tag')) bookmark.tags = value.split(',').map(t => t.trim()).filter(Boolean)
          else if (header.includes('created')) bookmark.createdAt = parseInt(value) || Date.now()
          else if (header.includes('updated')) bookmark.updatedAt = parseInt(value) || undefined
          else if (header.includes('read')) bookmark.isRead = value.toLowerCase() === 'yes'
          else if (header.includes('note')) bookmark.notes = value
        })

        if (bookmark.title && bookmark.url) {
          if (!bookmark.groupId) {
            bookmark.groupId = 'default'
          }
          bookmarks.push({
            id: crypto.randomUUID(),
            createdAt: bookmark.createdAt || Date.now(),
            ...bookmark
          } as Bookmark)
        }
      }

      const data: StorageSchema = {
        bookmarks,
        groups: [...existingData.groups, ...newGroups]
      }

      return { success: true, message: '导入成功', data }
    } catch (error) {
      return { success: false, message: '解析文件失败' }
    }
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }

    result.push(current)
    return result
  }

  async function applyImportData(data: StorageSchema, merge: boolean = false): Promise<void> {
    if (merge) {
      const currentData = await storage.get()
      
      const mergedBookmarks = [...currentData.bookmarks]
      const existingIds = new Set(currentData.bookmarks.map(b => b.id))

      for (const bookmark of data.bookmarks) {
        if (!existingIds.has(bookmark.id)) {
          mergedBookmarks.push(bookmark)
        }
      }

      const mergedGroups = [...currentData.groups]
      const existingGroupIds = new Set(currentData.groups.map(g => g.id))

      for (const group of data.groups) {
        if (!existingGroupIds.has(group.id)) {
          mergedGroups.push(group)
        }
      }

      await storage.set({
        bookmarks: mergedBookmarks,
        groups: mergedGroups
      })
    } else {
      await storage.set({
        bookmarks: data.bookmarks,
        groups: data.groups
      })
    }
  }

  return {
    exportJSON,
    exportCSV,
    importFromJSON,
    importFromCSV,
    applyImportData
  }
}
