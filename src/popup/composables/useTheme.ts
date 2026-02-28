/**
 * 主题管理 Composable
 * 
 * 提供主题切换功能
 * 支持亮色/暗色主题
 */
import { ref, watch, onMounted } from 'vue'
import type { Settings } from '../../types'
import { storage } from '../../utils/storage'

export function useTheme() {
  const theme = ref<'light' | 'dark'>('light')

  async function loadTheme() {
    const data = await storage.get()
    if (data.settings?.theme) {
      theme.value = data.settings.theme
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }
    applyTheme()
  }

  function applyTheme() {
    const html = document.documentElement
    if (theme.value === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  async function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    await saveTheme()
    applyTheme()
  }

  async function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
    await saveTheme()
    applyTheme()
  }

  async function saveTheme() {
    const data = await storage.get()
    const settings: Settings = data.settings || {
      theme: 'light',
      defaultGroupId: 'default',
      autoMarkAsRead: false,
      dateFormat: 'MM-dd HH:mm',
      itemsPerPage: 20,
      enableBackup: false,
      backupInterval: 24
    }
    settings.theme = theme.value
    await storage.set({ settings })
  }

  onMounted(async () => {
    await loadTheme()

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', async (e) => {
      const data = await storage.get()
      if (!data.settings?.theme) {
        theme.value = e.matches ? 'dark' : 'light'
        applyTheme()
      }
    })
  })

  watch(theme, () => {
    applyTheme()
  })

  return {
    theme,
    toggleTheme,
    setTheme,
    loadTheme
  }
}
