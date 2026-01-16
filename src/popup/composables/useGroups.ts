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

  function getGroupName(id: string) {
    const g: Group | undefined = groups.value.find(g => g.id === id)
    return g ? g.name : 'Unknown'
  }

  return {
    groups,
    loadGroups,
    createGroup,
    getGroupName
  }
}
