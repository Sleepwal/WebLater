/**
 * 当前标签页信息 Composable
 * 
 * 获取浏览器当前活动标签页的 URL 和标题
 * 用于在保存书签时自动填充网页信息
 */
import { ref, onMounted } from 'vue'

export function useCurrentTab() {
  const currentUrl = ref('')
  const currentTitle = ref('')

  onMounted(async () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab) {
        currentUrl.value = tab.url || ''
        currentTitle.value = tab.title || ''
      }
    } else {
      currentUrl.value = 'https://example.com'
      currentTitle.value = 'Example Domain'
    }
  })

  return {
    currentUrl,
    currentTitle
  }
}
