console.log('Background service worker started')

// 监听安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('Web Later installed')
})
