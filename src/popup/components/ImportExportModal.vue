<script setup lang="ts">
import { ref } from 'vue'
import { useImportExport } from '../composables/useImportExport'
import type { StorageSchema } from '../../types'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  notify: [message: string, type: 'success' | 'error']
}>()

const { exportJSON, exportCSV, importFromJSON, importFromCSV, applyImportData } = useImportExport()
const activeTab = ref<'export' | 'import'>('export')
const importFile = ref<File | null>(null)
const importPreview = ref<StorageSchema | null>(null)
const mergeMode = ref(false)
const isProcessing = ref(false)

async function handleExportJSON() {
  try {
    isProcessing.value = true
    await exportJSON()
    emit('notify', '导出成功', 'success')
  } catch (error) {
    emit('notify', '导出失败', 'error')
  } finally {
    isProcessing.value = false
  }
}

async function handleExportCSV() {
  try {
    isProcessing.value = true
    await exportCSV()
    emit('notify', '导出成功', 'success')
  } catch (error) {
    emit('notify', '导出失败', 'error')
  } finally {
    isProcessing.value = false
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    importFile.value = file
    importPreview.value = null
  }
}

async function handleImport() {
  if (!importFile.value) return

  try {
    isProcessing.value = true
    const file = importFile.value
    const extension = file.name.split('.').pop()?.toLowerCase()

    let result
    if (extension === 'json') {
      result = await importFromJSON(file)
    } else if (extension === 'csv') {
      result = await importFromCSV(file)
    } else {
      emit('notify', '不支持的文件格式', 'error')
      return
    }

    if (result.success && result.data) {
      importPreview.value = result.data
    } else {
      emit('notify', result.message, 'error')
    }
  } catch (error) {
    emit('notify', '导入失败', 'error')
  } finally {
    isProcessing.value = false
  }
}

async function handleConfirmImport() {
  if (!importPreview.value) return

  try {
    isProcessing.value = true
    await applyImportData(importPreview.value, mergeMode.value)
    emit('notify', '导入成功', 'success')
    emit('update:isOpen', false)
    resetImport()
  } catch (error) {
    emit('notify', '导入失败', 'error')
  } finally {
    isProcessing.value = false
  }
}

function resetImport() {
  importFile.value = null
  importPreview.value = null
  mergeMode.value = false
}

function handleClose() {
  emit('update:isOpen', false)
  resetImport()
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="handleClose">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">导入导出</h2>
        <button
          @click="handleClose"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-4">
        <div class="flex gap-2 mb-4">
          <button
            @click="activeTab = 'export'"
            class="flex-1 py-2 px-4 rounded-lg font-medium transition-colors"
            :class="[
              activeTab === 'export'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            导出
          </button>
          <button
            @click="activeTab = 'import'"
            class="flex-1 py-2 px-4 rounded-lg font-medium transition-colors"
            :class="[
              activeTab === 'import'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            导入
          </button>
        </div>

        <div v-if="activeTab === 'export'" class="space-y-4">
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">导出格式</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              选择导出格式，导出的文件可以用于备份或迁移数据
            </p>
            <div class="flex gap-3">
              <button
                @click="handleExportJSON"
                :disabled="isProcessing"
                class="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                导出为 JSON
              </button>
              <button
                @click="handleExportCSV"
                :disabled="isProcessing"
                class="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                导出为 CSV
              </button>
            </div>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div v-if="!importPreview" class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">选择文件</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              支持 JSON 和 CSV 格式，JSON 格式保留完整数据，CSV 格式仅包含书签信息
            </p>
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".json,.csv"
                @change="handleFileSelect"
                class="hidden"
                id="import-file"
              >
              <label
                for="import-file"
                class="cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ importFile ? importFile.name : '点击选择文件' }}
                </p>
              </label>
            </div>
            <button
              v-if="importFile"
              @click="handleImport"
              :disabled="isProcessing"
              class="w-full mt-4 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {{ isProcessing ? '导入中...' : '导入' }}
            </button>
          </div>

          <div v-else class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">导入预览</h3>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <div class="text-sm text-gray-500 dark:text-gray-400">书签数量</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ importPreview.bookmarks.length }}</div>
              </div>
              <div class="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <div class="text-sm text-gray-500 dark:text-gray-400">分组数量</div>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ importPreview.groups.length }}</div>
              </div>
            </div>
            <div class="flex items-center gap-2 mb-4">
              <input
                v-model="mergeMode"
                type="checkbox"
                id="merge-mode"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <label for="merge-mode" class="text-sm text-gray-700 dark:text-gray-300">
                合并到现有数据（不覆盖）
              </label>
            </div>
            <div class="flex gap-3">
              <button
                @click="importPreview = null"
                class="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button
                @click="handleConfirmImport"
                :disabled="isProcessing"
                class="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {{ isProcessing ? '导入中...' : '确认导入' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
