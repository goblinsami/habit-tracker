<script setup lang="ts">
import { categoryColors } from '@/constants/categoryColors'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="color-grid" role="listbox" aria-label="Colores de categoria">
    <button
      v-for="color in categoryColors"
      :key="color.value"
      class="color-choice"
      :class="{ selected: color.value === modelValue }"
      type="button"
      role="option"
      :aria-label="color.name"
      :aria-selected="color.value === modelValue"
      :title="color.name"
      @click="emit('update:modelValue', color.value)"
    >
      <span class="color-swatch" :style="{ backgroundColor: color.value }" />
    </button>
  </div>
</template>
