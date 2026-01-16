import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  name: 'Web Later',
  description: 'Save links for later reading',
  version: '0.0.1',
  manifest_version: 3,
  action: {
    default_popup: 'src/popup/index.html',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  permissions: ['activeTab', 'storage'],
})
