/**
 * 分组管理 Composable
 * 
 * 提供分组数据的增删查功能
 * 封装与 chrome.storage.local 的交互
 */
import { ref } from 'vue'
import { storage } from '../../utils/storage'
import type { Group } from '../../types'

export function useGroups() {
  const groups = ref<Group[]>([])

  async function loadGroups() {
    const data = await storage.get()
    groups.value = data.groups
  }

  async function createGroup(name: string) {
    const newGroup = await storage.addGroup(name)
    await loadGroups()
    return newGroup
  }

  async function removeGroup(id: string) {
    await storage.deleteGroup(id)
    await loadGroups()
  }

  async function updateGroup(id: string, updates: Partial<Omit<Group, 'id'>>) {
    await storage.updateGroup(id, updates)
    await loadGroups()
  }

  function getGroupName(id: string) {
    const g: Group | undefined = groups.value.find(g => g.id === id)
    return g ? g.name : 'Unknown'
  }

  return {
    groups,
    loadGroups,
    createGroup,
    removeGroup,
    updateGroup,
    getGroupName
  }
}
