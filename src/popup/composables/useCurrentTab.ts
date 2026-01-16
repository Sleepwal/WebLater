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
