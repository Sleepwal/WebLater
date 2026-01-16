<script setup lang="ts">
import type { Group } from '../../types'

const props = defineProps<{
  groups: Group[]
  filterGroupId: string
}>()

const emit = defineEmits<{
  'update:filterGroupId': [value: string]
}>()
</script>

<template>
  <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
    <button
      @click="emit('update:filterGroupId', 'all')"
      class="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border"
      :class="filterGroupId === 'all' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
    >
      全部
    </button>
    <button
      v-for="g in groups"
      :key="g.id"
      @click="emit('update:filterGroupId', g.id)"
      class="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border"
      :class="filterGroupId === g.id ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
    >
      {{ g.name }}
    </button>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
