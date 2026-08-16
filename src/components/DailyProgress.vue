<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  completed: number
  total: number
}>()

const percentage = computed(() =>
  props.total === 0 ? 0 : Math.round((props.completed / props.total) * 100),
)
</script>

<template>
  <section class="daily-progress" aria-label="Progreso diario">
    <div class="progress-stat">
      <CheckCircle2 :size="20" aria-hidden="true" />
      <span>{{ completed }} / {{ total }}</span>
    </div>
    <div class="progress-meta">
      <strong>{{ percentage }}%</strong>
      <span>completado</span>
    </div>
    <div class="progress-bar" aria-hidden="true">
      <span :style="{ width: `${percentage}%` }" />
    </div>
  </section>
</template>
