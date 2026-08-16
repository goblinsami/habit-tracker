<script setup lang="ts">
import { computed, ref } from 'vue'

import CategoryIcon from '@/components/CategoryIcon.vue'
import { categoryIconOptions } from '@/constants/categoryIcons'

const props = defineProps<{
  modelValue: string
  color: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const search = ref('')

const filteredIcons = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) {
    return categoryIconOptions
  }

  return categoryIconOptions.filter((option) => {
    const searchableText = [option.name, option.label, ...option.keywords].join(' ').toLowerCase()
    return searchableText.includes(query)
  })
})
</script>

<template>
  <div class="picker">
    <input v-model="search" type="search" placeholder="Buscar icono" aria-label="Buscar icono" />

    <div class="icon-grid" role="listbox" aria-label="Iconos de categoria">
      <button
        v-for="option in filteredIcons"
        :key="option.name"
        class="icon-choice"
        :class="{ selected: option.name === props.modelValue }"
        type="button"
        role="option"
        :aria-selected="option.name === props.modelValue"
        :title="option.label"
        @click="emit('update:modelValue', option.name)"
      >
        <CategoryIcon :icon="option.name" :color="props.color" :size="20" />
        <span>{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>
